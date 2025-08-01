import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { MediaServer } from 'mediasoup';
import { Worker, Router, Transport, Producer, Consumer } from 'mediasoup/node/lib/types';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

interface Room {
  id: string;
  router: Router;
  peers: Map<string, Peer>;
  createdAt: Date;
}

interface Peer {
  id: string;
  socket: any;
  transports: Map<string, Transport>;
  producers: Map<string, Producer>;
  consumers: Map<string, Consumer>;
  rtpCapabilities?: any;
}

class WebRTCServer {
  private app: express.Application;
  private server: any;
  private io: SocketIOServer;
  private mediaServer: MediaServer;
  private workers: Worker[] = [];
  private rooms: Map<string, Room> = new Map();
  private nextWorkerIndex = 0;

  constructor() {
    this.app = express();
    this.server = createServer(this.app);
    this.io = new SocketIOServer(this.server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    this.setupMiddleware();
    this.setupSocketHandlers();
    this.initializeMediaServer();
  }

  private setupMiddleware() {
    this.app.use(cors());
    this.app.use(express.json());

    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({ 
        status: 'healthy', 
        rooms: this.rooms.size,
        workers: this.workers.length 
      });
    });

    // Room management endpoints
    this.app.post('/api/rooms', (req, res) => {
      const roomId = uuidv4();
      this.createRoom(roomId);
      res.json({ roomId });
    });

    this.app.get('/api/rooms/:roomId', (req, res) => {
      const room = this.rooms.get(req.params.roomId);
      if (room) {
        res.json({
          id: room.id,
          peers: Array.from(room.peers.keys()),
          createdAt: room.createdAt
        });
      } else {
        res.status(404).json({ error: 'Room not found' });
      }
    });

    this.app.delete('/api/rooms/:roomId', (req, res) => {
      const room = this.rooms.get(req.params.roomId);
      if (room) {
        this.closeRoom(req.params.roomId);
        res.json({ message: 'Room closed' });
      } else {
        res.status(404).json({ error: 'Room not found' });
      }
    });
  }

  private async initializeMediaServer() {
    try {
      // Create media server
      this.mediaServer = new MediaServer({
        logLevel: 'warn',
        logTags: ['info', 'ice', 'dtls', 'rtp', 'srtp', 'rtcp']
      });

      // Create workers
      const numWorkers = Math.max(1, require('os').cpus().length);
      
      for (let i = 0; i < numWorkers; i++) {
        const worker = await this.mediaServer.createWorker({
          logLevel: 'warn',
          logTags: ['info', 'ice', 'dtls', 'rtp', 'srtp', 'rtcp'],
          rtcMinPort: 10000,
          rtcMaxPort: 10100
        });

        worker.on('died', () => {
          console.error('MediaSoup worker died, exiting in 2 seconds... [pid:%d]', worker.pid);
          setTimeout(() => process.exit(1), 2000);
        });

        this.workers.push(worker);
        console.log(`MediaSoup worker created [pid:${worker.pid}]`);
      }

      console.log(`WebRTC server initialized with ${this.workers.length} workers`);
    } catch (error) {
      console.error('Failed to initialize MediaServer:', error);
      throw error;
    }
  }

  private getNextWorker(): Worker {
    const worker = this.workers[this.nextWorkerIndex];
    this.nextWorkerIndex = (this.nextWorkerIndex + 1) % this.workers.length;
    return worker;
  }

  private async createRoom(roomId: string): Promise<Room> {
    const worker = this.getNextWorker();
    const router = await worker.createRouter({
      mediaCodecs: [
        {
          kind: 'audio',
          mimeType: 'audio/opus',
          clockRate: 48000,
          channels: 2
        },
        {
          kind: 'video',
          mimeType: 'video/VP8',
          clockRate: 90000,
          parameters: {
            'x-google-start-bitrate': 1000
          }
        },
        {
          kind: 'video',
          mimeType: 'video/H264',
          clockRate: 90000,
          parameters: {
            'packetization-mode': 1,
            'profile-level-id': '42e01f',
            'level-asymmetry-allowed': 1
          }
        }
      ]
    });

    const room: Room = {
      id: roomId,
      router,
      peers: new Map(),
      createdAt: new Date()
    };

    this.rooms.set(roomId, room);
    console.log(`Room created: ${roomId}`);
    return room;
  }

  private closeRoom(roomId: string) {
    const room = this.rooms.get(roomId);
    if (room) {
      // Close all peer connections
      room.peers.forEach(peer => {
        peer.socket.disconnect();
      });

      // Close router
      room.router.close();

      // Remove room
      this.rooms.delete(roomId);
      console.log(`Room closed: ${roomId}`);
    }
  }

  private setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`Client connected: ${socket.id}`);

      // Join room
      socket.on('join-room', async (data: { roomId: string; rtpCapabilities?: any }) => {
        try {
          let room = this.rooms.get(data.roomId);
          
          if (!room) {
            room = await this.createRoom(data.roomId);
          }

          const peer: Peer = {
            id: socket.id,
            socket,
            transports: new Map(),
            producers: new Map(),
            consumers: new Map(),
            rtpCapabilities: data.rtpCapabilities
          };

          room.peers.set(socket.id, peer);

          // Notify other peers about new peer
          socket.to(data.roomId).emit('peer-joined', { peerId: socket.id });

          // Send room info to the new peer
          socket.emit('room-joined', {
            roomId: data.roomId,
            peers: Array.from(room.peers.keys()).filter(id => id !== socket.id)
          });

          console.log(`Peer ${socket.id} joined room ${data.roomId}`);
        } catch (error) {
          console.error('Error joining room:', error);
          socket.emit('error', { message: 'Failed to join room' });
        }
      });

      // Create transport
      socket.on('create-transport', async (data: { roomId: string; direction: 'send' | 'recv' }) => {
        try {
          const room = this.rooms.get(data.roomId);
          if (!room) {
            throw new Error('Room not found');
          }

          const peer = room.peers.get(socket.id);
          if (!peer) {
            throw new Error('Peer not found');
          }

          const transport = await room.router.createWebRtcTransport({
            listenIps: [
              {
                ip: '0.0.0.0',
                announcedIp: process.env.MEDIASOUP_ANNOUNCED_IP || '127.0.0.1'
              }
            ],
            enableUdp: true,
            enableTcp: true,
            preferUdp: true,
            initialAvailableOutgoingBitrate: 1000000
          });

          transport.on('dtlsstatechange', (dtlsState) => {
            console.log(`Transport DTLS state changed: ${dtlsState}`);
          });

          transport.on('close', () => {
            console.log(`Transport closed: ${transport.id}`);
          });

          peer.transports.set(transport.id, transport);

          socket.emit('transport-created', {
            id: transport.id,
            iceParameters: transport.iceParameters,
            iceCandidates: transport.iceCandidates,
            dtlsParameters: transport.dtlsParameters
          });

          console.log(`Transport created: ${transport.id} for peer ${socket.id}`);
        } catch (error) {
          console.error('Error creating transport:', error);
          socket.emit('error', { message: 'Failed to create transport' });
        }
      });

      // Connect transport
      socket.on('connect-transport', async (data: { transportId: string; dtlsParameters: any }) => {
        try {
          const room = this.rooms.get(data.roomId);
          if (!room) {
            throw new Error('Room not found');
          }

          const peer = room.peers.get(socket.id);
          if (!peer) {
            throw new Error('Peer not found');
          }

          const transport = peer.transports.get(data.transportId);
          if (!transport) {
            throw new Error('Transport not found');
          }

          await transport.connect({ dtlsParameters: data.dtlsParameters });
          socket.emit('transport-connected', { transportId: data.transportId });

          console.log(`Transport connected: ${data.transportId}`);
        } catch (error) {
          console.error('Error connecting transport:', error);
          socket.emit('error', { message: 'Failed to connect transport' });
        }
      });

      // Produce
      socket.on('produce', async (data: { transportId: string; kind: string; rtpParameters: any }) => {
        try {
          const room = this.rooms.get(data.roomId);
          if (!room) {
            throw new Error('Room not found');
          }

          const peer = room.peers.get(socket.id);
          if (!peer) {
            throw new Error('Peer not found');
          }

          const transport = peer.transports.get(data.transportId);
          if (!transport) {
            throw new Error('Transport not found');
          }

          const producer = await transport.produce({
            kind: data.kind,
            rtpParameters: data.rtpParameters
          });

          peer.producers.set(producer.id, producer);

          // Notify other peers about new producer
          socket.to(data.roomId).emit('new-producer', {
            producerId: producer.id,
            kind: producer.kind,
            peerId: socket.id
          });

          socket.emit('produced', { id: producer.id });

          console.log(`Producer created: ${producer.id} (${data.kind})`);
        } catch (error) {
          console.error('Error creating producer:', error);
          socket.emit('error', { message: 'Failed to create producer' });
        }
      });

      // Consume
      socket.on('consume', async (data: { producerId: string; rtpCapabilities: any }) => {
        try {
          const room = this.rooms.get(data.roomId);
          if (!room) {
            throw new Error('Room not found');
          }

          const peer = room.peers.get(socket.id);
          if (!peer) {
            throw new Error('Peer not found');
          }

          const producer = room.router.getProducerById(data.producerId);
          if (!producer) {
            throw new Error('Producer not found');
          }

          if (!room.router.canConsume({ producerId: producer.id, rtpCapabilities: data.rtpCapabilities })) {
            throw new Error('Cannot consume this producer');
          }

          // Find a receive transport for this peer
          let receiveTransport: Transport | undefined;
          for (const transport of peer.transports.values()) {
            if (transport.appData.consuming) continue;
            receiveTransport = transport;
            break;
          }

          if (!receiveTransport) {
            throw new Error('No receive transport available');
          }

          const consumer = await receiveTransport.consume({
            producerId: producer.id,
            rtpCapabilities: data.rtpCapabilities,
            paused: false
          });

          peer.consumers.set(consumer.id, consumer);

          socket.emit('consumed', {
            id: consumer.id,
            kind: consumer.kind,
            rtpParameters: consumer.rtpParameters,
            type: consumer.type,
            producerId: producer.id
          });

          console.log(`Consumer created: ${consumer.id}`);
        } catch (error) {
          console.error('Error creating consumer:', error);
          socket.emit('error', { message: 'Failed to create consumer' });
        }
      });

      // Resume consumer
      socket.on('resume-consumer', async (data: { consumerId: string }) => {
        try {
          const room = this.rooms.get(data.roomId);
          if (!room) {
            throw new Error('Room not found');
          }

          const peer = room.peers.get(socket.id);
          if (!peer) {
            throw new Error('Peer not found');
          }

          const consumer = peer.consumers.get(data.consumerId);
          if (!consumer) {
            throw new Error('Consumer not found');
          }

          await consumer.resume();
          socket.emit('consumer-resumed', { consumerId: data.consumerId });

          console.log(`Consumer resumed: ${data.consumerId}`);
        } catch (error) {
          console.error('Error resuming consumer:', error);
          socket.emit('error', { message: 'Failed to resume consumer' });
        }
      });

      // Chat message
      socket.on('chat-message', (data: { roomId: string; message: string; sender: string }) => {
        socket.to(data.roomId).emit('chat-message', {
          message: data.message,
          sender: data.sender,
          timestamp: new Date().toISOString()
        });
      });

      // Disconnect
      socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
        
        // Remove peer from all rooms
        this.rooms.forEach((room, roomId) => {
          const peer = room.peers.get(socket.id);
          if (peer) {
            // Close all transports
            peer.transports.forEach(transport => transport.close());
            
            // Remove peer
            room.peers.delete(socket.id);
            
            // Notify other peers
            socket.to(roomId).emit('peer-left', { peerId: socket.id });
            
            // Close room if empty
            if (room.peers.size === 0) {
              this.closeRoom(roomId);
            }
          }
        });
      });
    });
  }

  public start(port: number = 3001) {
    this.server.listen(port, () => {
      console.log(`WebRTC server running on port ${port}`);
    });
  }

  public stop() {
    this.server.close();
    this.mediaServer.close();
    console.log('WebRTC server stopped');
  }
}

export default WebRTCServer; 