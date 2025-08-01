/**
 * 📡 AltaMedica E2E Test - WebRTC en Tiempo Real
 * 
 * Esta suite valida específicamente las funcionalidades de WebRTC
 * para videollamadas médicas en tiempo real:
 * - Establecimiento de conexión P2P
 * - Calidad de video y audio médico-grade
 * - Manejo de errores de conectividad
 * - Métricas de performance en tiempo real  
 * - Grabación y almacenamiento HIPAA compliant
 * - Reconexión automática ante fallos
 */

describe('📡 WebRTC en Tiempo Real', () => {
  
  beforeEach(() => {
    // Verificar servicios de WebRTC disponibles
    cy.task('checkServices').then((services) => {
      const signalingService = services.find(s => s.name.includes('Signaling'));
      if (signalingService?.status !== 'healthy') {
        cy.log('⚠️ Signaling server no disponible - usando mocks');
      }
    });
    
    // Setup inicial para pruebas WebRTC
    cy.loginAsDoctor();
    cy.task('generateMedicalTestData').then((testData) => {
      cy.wrap(testData).as('testData');
    });
  });
  
  it('Debe establecer conexión WebRTC exitosamente', function() {
    cy.logTestStep('🔗 Estableciendo conexión WebRTC médica');
    
    // Crear sesión de telemedicina
    cy.createTelemedicineSession(this.testData.patientId);
    
    // Configurar interceptores para WebRTC
    cy.intercept('POST', '**/api/webrtc/offer', {
      statusCode: 200,
      body: {
        success: true,
        sdp: 'mock-sdp-offer',
        sessionId: this.testData.sessionId
      }
    }).as('webrtcOffer');
    
    cy.intercept('POST', '**/api/webrtc/answer', {
      statusCode: 200,
      body: {
        success: true,
        sdp: 'mock-sdp-answer'
      }
    }).as('webrtcAnswer');
    
    cy.intercept('POST', '**/api/webrtc/ice-candidate', {
      statusCode: 200,
      body: { success: true }
    }).as('iceCandidate');
    
    // Iniciar establecimiento de conexión
    cy.get('[data-cy=video-call-section]')
      .should('be.visible')
      .within(() => {
        // Verificar controles de medios disponibles
        cy.get('[data-cy=media-controls]').should('be.visible');
        
        // Habilitar cámara
        cy.get('[data-cy=enable-camera-button]')
          .should('be.visible')
          .click();
      });
    
    // Verificar solicitud de permisos (simulada)
    cy.get('[data-cy=media-permission-modal]')
      .should('be.visible')
      .within(() => {
        cy.get('[data-cy=grant-camera-permission]').click();
        cy.get('[data-cy=grant-microphone-permission]').click();
      });
    
    // Esperar establecimiento de conexión
    cy.wait('@webrtcOffer');
    
    // Verificar estado de conexión
    cy.get('[data-cy=connection-status]', { 
      timeout: Cypress.env('WEBRTC_CONNECTION_TIMEOUT') 
    })
      .should('be.visible')
      .should('contain.text', 'Conectando...');
    
    // Simular respuesta del paciente
    cy.wait('@webrtcAnswer');
    cy.wait('@iceCandidate');
    
    // Verificar conexión establecida
    cy.get('[data-cy=connection-status]')
      .should('contain.text', 'Conectado')
      .should('have.class', 'connected');
    
    // Verificar streams de video
    cy.get('[data-cy=local-video]')
      .should('be.visible')
      .should('have.prop', 'videoWidth')
      .and('be.greaterThan', 0);
    
    cy.get('[data-cy=remote-video]')
      .should('be.visible')
      .should('have.prop', 'videoWidth') 
      .and('be.greaterThan', 0);
    
    // Verificar controles de audio/video activos
    cy.get('[data-cy=toggle-microphone]')
      .should('be.visible')
      .should('not.have.class', 'muted');
    
    cy.get('[data-cy=toggle-camera]')
      .should('be.visible')
      .should('not.have.class', 'disabled');
    
    cy.takeTestScreenshot('webrtc-connection-established');
  });
  
  it('Debe monitorear calidad de conexión en tiempo real', function() {
    cy.logTestStep('📊 Monitoreando calidad de conexión WebRTC');
    
    // Establecer conexión base
    cy.createTelemedicineSession(this.testData.sessionId);
    cy.establishWebRTCConnection();
    
    // Configurar mock de métricas de calidad
    cy.intercept('GET', '**/api/webrtc/stats/**', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          video: {
            inbound: {
              framesPerSecond: 30,
              frameWidth: 1280,
              frameHeight: 720,
              bytesReceived: 1500000,
              packetsLost: 2,
              jitter: 0.012
            },
            outbound: {
              framesPerSecond: 30,
              frameWidth: 1280, 
              frameHeight: 720,
              bytesSent: 1600000,
              packetsLost: 1
            }
          },
          audio: {
            inbound: {
              audioLevel: 0.8,
              totalAudioEnergy: 2.5,
              packetsLost: 0,
              jitter: 0.008
            },
            outbound: {
              audioLevel: 0.9,
              totalAudioEnergy: 3.2,
              packetsLost: 0
            }
          },
          connection: {
            currentRoundTripTime: 0.045,
            availableOutgoingBitrate: 2000000,
            availableIncomingBitrate: 1800000
          }
        }
      }
    }).as('connectionStats');
    
    // Abrir panel de métricas de calidad
    cy.get('[data-cy=connection-quality-panel]')
      .should('be.visible')
      .click();
    
    // Verificar métricas se actualizan
    cy.wait('@connectionStats');
    
    cy.get('[data-cy=quality-metrics-display]')
      .should('be.visible')
      .within(() => {
        // Verificar métricas de video
        cy.get('[data-cy=video-fps]')
          .should('contain.text', '30 fps');
        
        cy.get('[data-cy=video-resolution]')
          .should('contain.text', '1280x720');
        
        cy.get('[data-cy=video-packets-lost]')
          .should('contain.text', '2');
        
        // Verificar métricas de audio
        cy.get('[data-cy=audio-level]')
          .should('contain.text', '80%');
        
        cy.get('[data-cy=audio-packets-lost]')
          .should('contain.text', '0');
        
        // Verificar métricas de red
        cy.get('[data-cy=network-rtt]')
          .should('contain.text', '45ms');
        
        cy.get('[data-cy=network-bandwidth]')
          .should('contain.text', '2.0 Mbps');
      });
    
    // Verificar indicador de calidad general
    cy.get('[data-cy=overall-quality-indicator]')
      .should('be.visible')
      .should('have.class', 'good') // Based on mock metrics
      .should('contain.text', 'Buena');
    
    cy.takeTestScreenshot('webrtc-quality-monitoring');
  });
  
  it('Debe manejar degradación de calidad graciosamente', function() {
    cy.logTestStep('⚠️ Probando manejo de degradación de calidad');
    
    cy.createTelemedicineSession(this.testData.sessionId);
    cy.establishWebRTCConnection();
    
    // Simular degradación de red
    cy.intercept('GET', '**/api/webrtc/stats/**', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          video: {
            inbound: {
              framesPerSecond: 15, // Reducido
              frameWidth: 640,    // Reducido
              frameHeight: 480,   // Reducido
              packetsLost: 25,    // Alto
              jitter: 0.08       // Alto
            }
          },
          audio: {
            inbound: {
              packetsLost: 5,     // Pérdida de audio
              jitter: 0.05       // Alto jitter
            }
          },
          connection: {
            currentRoundTripTime: 0.200, // Alto RTT
            availableOutgoingBitrate: 500000 // Bajo bandwidth
          }
        }
      }
    }).as('poorConnectionStats');
    
    cy.wait('@poorConnectionStats');
    
    // Verificar alertas de calidad
    cy.get('[data-cy=quality-warning]')
      .should('be.visible')
      .should('contain.text', 'Calidad de conexión degradada');
    
    // Verificar sugerencias automáticas
    cy.get('[data-cy=quality-suggestions]')
      .should('be.visible')
      .within(() => {
        cy.get('[data-cy=suggestion-reduce-video]')
          .should('contain.text', 'Reducir calidad de video');
        
        cy.get('[data-cy=suggestion-audio-only]')
          .should('contain.text', 'Cambiar a solo audio');
      });
    
    // Aplicar sugerencia automática
    cy.get('[data-cy=apply-auto-optimization]').click();
    
    // Verificar que se aplicó optimización
    cy.get('[data-cy=video-quality-indicator]')
      .should('contain.text', 'Calidad reducida');
    
    cy.get('[data-cy=connection-optimization-applied]')
      .should('be.visible')
      .should('contain.text', 'Optimización aplicada');
    
    cy.takeTestScreenshot('webrtc-quality-degradation-handled');
  });
  
  it('Debe permitir grabación HIPAA compliant de sesión', function() {
    cy.logTestStep('🎥 Probando grabación HIPAA compliant');
    
    cy.createTelemedicineSession(this.testData.sessionId);
    cy.establishWebRTCConnection();
    
    // Configurar mock de grabación
    cy.intercept('POST', '**/api/webrtc/recording/start', {
      statusCode: 200,
      body: {
        success: true,
        recordingId: 'recording_' + this.testData.sessionId,
        encryptionEnabled: true,
        retentionPolicy: '7_years',
        hipaaCompliant: true
      }
    }).as('startRecording');
    
    cy.intercept('POST', '**/api/webrtc/recording/stop', {
      statusCode: 200,
      body: {
        success: true,
        recordingUrl: 'https://secure.altamedica.com/recordings/encrypted',
        duration: 1800,
        fileSize: '250MB',
        checksumMD5: 'abc123def456'
      }
    }).as('stopRecording');
    
    // Iniciar grabación
    cy.get('[data-cy=recording-controls]')
      .should('be.visible')
      .within(() => {
        // Verificar advertencia HIPAA
        cy.get('[data-cy=hipaa-recording-warning]')
          .should('be.visible')
          .should('contain.text', 'La grabación será cifrada');
        
        // Consentimiento de grabación
        cy.get('[data-cy=recording-consent-checkbox]').check();
        
        cy.get('[data-cy=start-recording-button]')
          .should('be.enabled')
          .click();
      });
    
    cy.wait('@startRecording');
    
    // Verificar estado de grabación activa
    cy.get('[data-cy=recording-status]')
      .should('be.visible')
      .should('contain.text', 'Grabando')
      .should('have.class', 'recording-active');
    
    // Verificar indicador de tiempo de grabación
    cy.get('[data-cy=recording-timer]')
      .should('be.visible')
      .should('match', /\d{2}:\d{2}/); // Format MM:SS
    
    // Simular duración de grabación
    cy.wait(2000);
    
    // Detener grabación
    cy.get('[data-cy=stop-recording-button]').click();
    
    // Confirmar detención
    cy.get('[data-cy=confirm-stop-recording]')
      .should('be.visible')
      .click();
    
    cy.wait('@stopRecording');
    
    // Verificar resumen de grabación
    cy.get('[data-cy=recording-summary-modal]')
      .should('be.visible')
      .within(() => {
        cy.get('[data-cy=recording-duration]')
          .should('contain.text', '30:00');
        
        cy.get('[data-cy=recording-size]')
          .should('contain.text', '250MB');
        
        cy.get('[data-cy=hipaa-compliance-indicator]')
          .should('be.visible')
          .should('contain.text', 'HIPAA Compliant');
        
        cy.get('[data-cy=encryption-status]')
          .should('contain.text', 'Cifrado AES-256');
      });
    
    cy.takeTestScreenshot('webrtc-hipaa-recording');
  });
  
  it('Debe reconectarse automáticamente ante fallos', function() {
    cy.logTestStep('🔄 Probando reconexión automática WebRTC');
    
    cy.createTelemedicineSession(this.testData.sessionId);
    cy.establishWebRTCConnection();
    
    // Simular desconexión
    cy.intercept('GET', '**/api/webrtc/stats/**', {
      statusCode: 500,
      body: { error: 'Connection lost' }
    }).as('connectionLost');
    
    // Simular reconexión exitosa
    cy.intercept('POST', '**/api/webrtc/reconnect', {
      statusCode: 200,
      body: {
        success: true,
        newSessionId: this.testData.sessionId + '_reconnect',
        connectionRestored: true
      }
    }).as('reconnectSuccess');
    
    // Forzar pérdida de conexión
    cy.wait('@connectionLost');
    
    // Verificar detección de desconexión
    cy.get('[data-cy=connection-status]')
      .should('contain.text', 'Desconectado')
      .should('have.class', 'disconnected');
    
    // Verificar inicio de reconexión automática
    cy.get('[data-cy=reconnection-status]')
      .should('be.visible')
      .should('contain.text', 'Reconectando...');
    
    // Verificar contador de intentos de reconexión
    cy.get('[data-cy=reconnection-attempts]')
      .should('be.visible')
      .should('contain.text', 'Intento 1 de 3');
    
    // Simular reconexión exitosa
    cy.wait('@reconnectSuccess');
    
    // Verificar conexión restaurada
    cy.get('[data-cy=connection-status]')
      .should('contain.text', 'Conectado')
      .should('have.class', 'connected');
    
    // Verificar notificación de reconexión
    cy.get('[data-cy=reconnection-success-message]')
      .should('be.visible')
      .should('contain.text', 'Conexión restaurada exitosamente');
    
    // Verificar que video/audio siguen funcionando
    cy.get('[data-cy=local-video]').should('be.visible');
    cy.get('[data-cy=remote-video]').should('be.visible');
    
    cy.takeTestScreenshot('webrtc-auto-reconnection');
  });
  
  it('Debe manejar múltiples participantes en sesión grupal', function() {
    cy.logTestStep('👥 Probando sesión WebRTC multi-participante');
    
    // Crear sesión grupal
    cy.get('[data-cy=new-telemedicine-session]').click();
    cy.get('[data-cy=session-type-group]').check();
    
    // Agregar múltiples participantes
    cy.get('[data-cy=add-participant-button]').click();
    cy.get('[data-cy=participant-selector]').select('patient_1');
    
    cy.get('[data-cy=add-participant-button]').click();
    cy.get('[data-cy=participant-selector]').select('patient_2');
    
    cy.get('[data-cy=create-group-session-button]').click();
    
    // Mock de conexiones múltiples
    cy.intercept('POST', '**/api/webrtc/group/join', {
      statusCode: 200,
      body: {
        success: true,
        participants: [
          { id: 'doctor_1', role: 'doctor', connected: true },
          { id: 'patient_1', role: 'patient', connected: true }, 
          { id: 'patient_2', role: 'patient', connected: false }
        ]
      }
    }).as('groupJoin');
    
    cy.wait('@groupJoin');
    
    // Verificar vista de múltiples participantes
    cy.get('[data-cy=participants-grid]')
      .should('be.visible')
      .within(() => {
        // Verificar video del doctor (local)
        cy.get('[data-cy=participant-video-doctor_1]')
          .should('be.visible')
          .should('have.class', 'local-video');
        
        // Verificar video del paciente 1
        cy.get('[data-cy=participant-video-patient_1]')
          .should('be.visible')
          .should('have.class', 'connected');
        
        // Verificar estado de paciente 2 (desconectado)
        cy.get('[data-cy=participant-video-patient_2]')
          .should('be.visible')
          .should('have.class', 'waiting-connection');
      });
    
    // Verificar controles de moderación
    cy.get('[data-cy=moderation-controls]')
      .should('be.visible')
      .within(() => {
        cy.get('[data-cy=mute-all-participants]').should('be.visible');
        cy.get('[data-cy=end-session-for-all]').should('be.visible');
      });
    
    cy.takeTestScreenshot('webrtc-multi-participant');
  });
  
  it('Debe compartir pantalla para presentaciones médicas', function() {
    cy.logTestStep('🖥️ Probando compartir pantalla médica');
    
    cy.createTelemedicineSession(this.testData.sessionId);
    cy.establishWebRTCConnection();
    
    // Mock de compartir pantalla
    cy.intercept('POST', '**/api/webrtc/screen-share/start', {
      statusCode: 200,
      body: {
        success: true,
        screenShareId: 'screen_' + this.testData.sessionId,
        resolution: '1920x1080',
        frameRate: 15
      }
    }).as('startScreenShare');
    
    // Iniciar compartir pantalla
    cy.get('[data-cy=screen-share-button]')
      .should('be.visible')
      .click();
    
    // Seleccionar fuente de pantalla (simulado)
    cy.get('[data-cy=screen-source-modal]')
      .should('be.visible')
      .within(() => {
        cy.get('[data-cy=screen-source-entire-screen]').click();
        cy.get('[data-cy=start-sharing-button]').click();
      });
    
    cy.wait('@startScreenShare');
    
    // Verificar que se inició compartir pantalla
    cy.get('[data-cy=screen-share-status]')
      .should('be.visible')
      .should('contain.text', 'Compartiendo pantalla');
    
    // Verificar que el video personal se minimizó
    cy.get('[data-cy=local-video]')
      .should('have.class', 'minimized');
    
    // Verificar stream de pantalla
    cy.get('[data-cy=screen-share-stream]')
      .should('be.visible')
      .should('have.prop', 'videoWidth')
      .and('be.greaterThan', 0);
    
    // Detener compartir pantalla
    cy.get('[data-cy=stop-screen-share-button]').click();
    
    // Verificar que se detuvo correctamente
    cy.get('[data-cy=screen-share-status]')
      .should('not.exist');
    
    cy.get('[data-cy=local-video]')
      .should('not.have.class', 'minimized');
    
    cy.takeTestScreenshot('webrtc-screen-sharing');
  });
  
  afterEach(() => {
    // Limpiar conexiones WebRTC y datos de prueba
    cy.window().then((win) => {
      if (win.rtcConnections) {
        win.rtcConnections.forEach(connection => {
          connection.close();
        });
      }
    });
    
    cy.task('clearTestData');
  });
  
});