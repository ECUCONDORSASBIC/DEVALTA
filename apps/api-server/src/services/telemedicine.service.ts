import { Server, Socket } from 'socket.io';

export class TelemedicineService {
  private static io: Server;

  public static initialize(io: Server) {
    this.io = io;
    this.io.on('connection', this.handleConnection);
  }

  private static handleConnection = (socket: Socket) => {
    console.log(`Usuario conectado con socket id: ${socket.id}`);

    socket.on('join-room', (roomId: string, userId: string) => {
      socket.join(roomId);
      console.log(`Usuario ${userId} se unió a la sala ${roomId}`);
      // Notificar a los otros en la sala que un nuevo usuario se ha unido
      socket.to(roomId).emit('user-connected', userId);
    });

    socket.on('offer', (roomId: string, offer: any) => {
      // Enviar la oferta al otro participante en la sala
      socket.to(roomId).emit('offer', offer);
    });

    socket.on('answer', (roomId: string, answer: any) => {
      // Enviar la respuesta al otro participante
      socket.to(roomId).emit('answer', answer);
    });

    socket.on('ice-candidate', (roomId: string, candidate: any) => {
      // Enviar el candidato ICE al otro participante
      socket.to(roomId).emit('ice-candidate', candidate);
    });

    socket.on('disconnect', () => {
      console.log(`Usuario desconectado: ${socket.id}`);
      // Aquí se podría notificar a la sala que el usuario se ha desconectado
    });
  }
}
