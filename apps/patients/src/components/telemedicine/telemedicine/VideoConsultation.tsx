import React, { useRef, useEffect, useState } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff } from 'lucide-react';

interface VideoConsultationProps {
  patientId: string;
  doctorId: string;
  onCallEnd?: () => void;
}

const VideoConsultation: React.FC<VideoConsultationProps> = ({
  patientId,
  doctorId,
  onCallEnd
}) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);

  useEffect(() => {
    const initializeMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // Initialize WebRTC peer connection
        const pc = new RTCPeerConnection({
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            // Add your TURN server here for production
          ]
        });

        stream.getTracks().forEach(track => {
          pc.addTrack(track, stream);
        });

        pc.ontrack = (event) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = event.streams[0];
          }
        };

        setPeerConnection(pc);
      } catch (error) {
        console.error('Error accessing media devices:', error);
      }
    };

    initializeMedia();

    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      if (peerConnection) {
        peerConnection.close();
      }
    };
  }, []);

  const startCall = async () => {
    if (!peerConnection) return;

    try {
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      
      // In a real implementation, you would send this offer to the remote peer
      // via your signaling server
      console.log('Call offer created:', offer);
      
      setIsCallActive(true);
    } catch (error) {
      console.error('Error starting call:', error);
    }
  };

  const endCall = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    if (peerConnection) {
      peerConnection.close();
    }
    setIsCallActive(false);
    onCallEnd?.();
  };

  const toggleMute = () => {
    if (localStream) {
      const audioTracks = localStream.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTracks = localStream.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoEnabled(!isVideoEnabled);
    }
  };

  return (
    <div className="video-consultation-container">
      <div className="video-grid">
        <div className="local-video">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="video-element"
          />
          <div className="video-label">You</div>
        </div>
        
        <div className="remote-video">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="video-element"
          />
          <div className="video-label">
            {isCallActive ? 'Patient/Doctor' : 'Waiting...'}
          </div>
        </div>
      </div>

      <div className="controls">
        {!isCallActive ? (
          <button 
            onClick={startCall}
            className="control-btn start-call"
          >
            <Phone size={24} />
            Start Call
          </button>
        ) : (
          <>
            <button 
              onClick={toggleMute}
              className={`control-btn ${isMuted ? 'muted' : ''}`}
            >
              {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
            </button>
            
            <button 
              onClick={toggleVideo}
              className={`control-btn ${!isVideoEnabled ? 'disabled' : ''}`}
            >
              {isVideoEnabled ? <Video size={24} /> : <VideoOff size={24} />}
            </button>
            
            <button 
              onClick={endCall}
              className="control-btn end-call"
            >
              <PhoneOff size={24} />
              End Call
            </button>
          </>
        )}
      </div>

      <div className="session-info">
        <p>Session ID: {patientId}-{doctorId}</p>
        <p>Status: {isCallActive ? 'Connected' : 'Disconnected'}</p>
      </div>

      <style jsx>{`
        .video-consultation-container {
          display: flex;
          flex-direction: column;
          height: 100vh;
          background: #1a1a1a;
        }

        .video-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          flex: 1;
          padding: 1rem;
        }

        .local-video, .remote-video {
          position: relative;
          background: #2a2a2a;
          border-radius: 8px;
          overflow: hidden;
        }

        .video-element {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .video-label {
          position: absolute;
          bottom: 10px;
          left: 10px;
          color: white;
          background: rgba(0, 0, 0, 0.7);
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.8rem;
        }

        .controls {
          display: flex;
          justify-content: center;
          gap: 1rem;
          padding: 1rem;
          background: #2a2a2a;
        }

        .control-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          border: none;
          border-radius: 8px;
          background: #4a5568;
          color: white;
          cursor: pointer;
          transition: background 0.2s;
        }

        .control-btn:hover {
          background: #5a6578;
        }

        .control-btn.start-call {
          background: #38a169;
        }

        .control-btn.start-call:hover {
          background: #48bb78;
        }

        .control-btn.end-call {
          background: #e53e3e;
        }

        .control-btn.end-call:hover {
          background: #f56565;
        }

        .control-btn.muted,
        .control-btn.disabled {
          background: #e53e3e;
        }

        .session-info {
          padding: 1rem;
          background: #2a2a2a;
          color: #a0aec0;
          font-size: 0.8rem;
        }

        .session-info p {
          margin: 0.25rem 0;
        }
      `}</style>
    </div>
  );
};

export default VideoConsultation;
