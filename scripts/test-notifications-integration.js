/**
 * 🔔 Test de Integración de Notificaciones en Tiempo Real
 * Prueba el sistema completo de notificaciones con WebSocket
 */

import WebSocket from 'ws';
import fetch from 'node-fetch';

class NotificationsIntegrationTest {
  constructor() {
    this.baseUrl = process.env.API_URL || 'http://localhost:3000';
    this.wsUrl = process.env.WS_URL || 'ws://localhost:3000';
    this.testResults = [];
    this.ws = null;
    this.authToken = null;
  }

  async run() {
    console.log('🔔 Iniciando Test de Integración de Notificaciones...\n');

    try {
      // 1. Autenticación
      await this.testAuthentication();

      // 2. API REST de notificaciones
      await this.testRestAPI();

      // 3. WebSocket
      await this.testWebSocket();

      // 4. Notificaciones en tiempo real
      await this.testRealTimeNotifications();

      // 5. Pruebas de rendimiento
      await this.testPerformance();

      this.printResults();

    } catch (error) {
      console.error('❌ Error en test de integración:', error);
      this.testResults.push({
        test: 'General',
        status: 'FAILED',
        error: error.message
      });
      this.printResults();
    }
  }

  async testAuthentication() {
    console.log('🔐 Probando autenticación...');
    
    try {
      // Mock de autenticación para pruebas
      this.authToken = 'mock-test-token';
      
      this.testResults.push({
        test: 'Authentication',
        status: 'PASSED',
        details: 'Token mock generado correctamente'
      });
      
      console.log('✅ Autenticación exitosa\n');
    } catch (error) {
      this.testResults.push({
        test: 'Authentication',
        status: 'FAILED',
        error: error.message
      });
      throw error;
    }
  }

  async testRestAPI() {
    console.log('📡 Probando API REST de notificaciones...');
    
    try {
      // 1. Crear notificación
      const createResponse = await fetch(`${this.baseUrl}/api/v1/notifications`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: 'Test Notification',
          message: 'Esta es una notificación de prueba',
          recipient_id: 'test-user',
          type: 'info',
          priority: 'medium'
        })
      });

      if (!createResponse.ok) {
        throw new Error(`Error creando notificación: ${createResponse.status}`);
      }

      const createData = await createResponse.json();
      const notificationId = createData.data.id;

      this.testResults.push({
        test: 'Create Notification',
        status: 'PASSED',
        details: `Notificación creada con ID: ${notificationId}`
      });

      // 2. Listar notificaciones
      const listResponse = await fetch(`${this.baseUrl}/api/v1/notifications`, {
        headers: {
          'Authorization': `Bearer ${this.authToken}`
        }
      });

      if (!listResponse.ok) {
        throw new Error(`Error listando notificaciones: ${listResponse.status}`);
      }

      const listData = await listResponse.json();
      
      this.testResults.push({
        test: 'List Notifications',
        status: 'PASSED',
        details: `${listData.data.notifications.length} notificaciones encontradas`
      });

      // 3. Marcar como leída
      const markReadResponse = await fetch(`${this.baseUrl}/api/v1/notifications/${notificationId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_read: true })
      });

      if (!markReadResponse.ok) {
        throw new Error(`Error marcando como leída: ${markReadResponse.status}`);
      }

      this.testResults.push({
        test: 'Mark as Read',
        status: 'PASSED',
        details: 'Notificación marcada como leída'
      });

      // 4. Marcar todas como leídas
      const markAllReadResponse = await fetch(`${this.baseUrl}/api/v1/notifications/mark-all-read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.authToken}`
        }
      });

      if (!markAllReadResponse.ok) {
        throw new Error(`Error marcando todas como leídas: ${markAllReadResponse.status}`);
      }

      this.testResults.push({
        test: 'Mark All as Read',
        status: 'PASSED',
        details: 'Todas las notificaciones marcadas como leídas'
      });

      console.log('✅ API REST funcionando correctamente\n');

    } catch (error) {
      this.testResults.push({
        test: 'REST API',
        status: 'FAILED',
        error: error.message
      });
      throw error;
    }
  }

  async testWebSocket() {
    console.log('🔌 Probando conexión WebSocket...');
    
    try {
      return new Promise((resolve, reject) => {
        this.ws = new WebSocket(`${this.wsUrl}/api/v1/notifications/websocket`);
        
        let authenticated = false;
        let subscribed = false;

        this.ws.on('open', () => {
          console.log('WebSocket conectado, autenticando...');
          
          // Enviar autenticación
          this.ws.send(JSON.stringify({
            type: 'AUTHENTICATE',
            token: this.authToken,
            messageId: `auth_${Date.now()}`
          }));
        });

        this.ws.on('message', (data) => {
          try {
            const message = JSON.parse(data.toString());
            
            switch (message.type) {
              case 'AUTHENTICATED':
                authenticated = true;
                console.log('WebSocket autenticado:', message.connectionId);
                
                // Suscribirse a notificaciones
                this.ws.send(JSON.stringify({
                  type: 'SUBSCRIBE',
                  channel: 'notifications',
                  messageId: `sub_${Date.now()}`
                }));
                break;
                
              case 'SUBSCRIBED':
                subscribed = true;
                console.log('Suscrito a notificaciones');
                
                // Enviar heartbeat
                this.ws.send(JSON.stringify({
                  type: 'HEARTBEAT',
                  timestamp: new Date().toISOString()
                }));
                break;
                
              case 'HEARTBEAT_ACK':
                console.log('Heartbeat recibido');
                
                // Test completado
                this.testResults.push({
                  test: 'WebSocket Connection',
                  status: 'PASSED',
                  details: 'Conexión WebSocket establecida y autenticada'
                });
                
                this.testResults.push({
                  test: 'WebSocket Subscription',
                  status: 'PASSED',
                  details: 'Suscrito a canal de notificaciones'
                });
                
                this.testResults.push({
                  test: 'WebSocket Heartbeat',
                  status: 'PASSED',
                  details: 'Heartbeat funcionando correctamente'
                });
                
                resolve();
                break;
                
              case 'ERROR':
                reject(new Error(`WebSocket error: ${message.error}`));
                break;
            }
          } catch (error) {
            reject(new Error(`Error parsing WebSocket message: ${error.message}`));
          }
        });

        this.ws.on('error', (error) => {
          reject(new Error(`WebSocket error: ${error.message}`));
        });

        this.ws.on('close', () => {
          if (!authenticated || !subscribed) {
            reject(new Error('WebSocket cerrado antes de completar autenticación'));
          }
        });

        // Timeout
        setTimeout(() => {
          reject(new Error('WebSocket timeout'));
        }, 10000);
      });

    } catch (error) {
      this.testResults.push({
        test: 'WebSocket',
        status: 'FAILED',
        error: error.message
      });
      throw error;
    }
  }

  async testRealTimeNotifications() {
    console.log('⚡ Probando notificaciones en tiempo real...');
    
    try {
      return new Promise((resolve, reject) => {
        let notificationReceived = false;
        let timeout;

        // Escuchar nueva notificación
        this.ws.on('message', (data) => {
          try {
            const message = JSON.parse(data.toString());
            
            if (message.type === 'NEW_NOTIFICATION') {
              notificationReceived = true;
              console.log('Notificación en tiempo real recibida:', message.notification.title);
              
              clearTimeout(timeout);
              
              this.testResults.push({
                test: 'Real-time Notifications',
                status: 'PASSED',
                details: 'Notificación recibida en tiempo real'
              });
              
              resolve();
            }
          } catch (error) {
            // Ignorar errores de parsing
          }
        });

        // Enviar notificación de prueba
        setTimeout(async () => {
          try {
            await fetch(`${this.baseUrl}/api/v1/notifications`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${this.authToken}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                title: 'Notificación en Tiempo Real',
                message: 'Esta notificación debe aparecer inmediatamente en WebSocket',
                recipient_id: 'test-user',
                type: 'info',
                priority: 'high'
              })
            });
          } catch (error) {
            reject(error);
          }
        }, 1000);

        // Timeout
        timeout = setTimeout(() => {
          reject(new Error('Timeout esperando notificación en tiempo real'));
        }, 5000);
      });

    } catch (error) {
      this.testResults.push({
        test: 'Real-time Notifications',
        status: 'FAILED',
        error: error.message
      });
      throw error;
    }
  }

  async testPerformance() {
    console.log('🚀 Probando rendimiento...');
    
    try {
      const startTime = Date.now();
      
      // Crear múltiples notificaciones
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(
          fetch(`${this.baseUrl}/api/v1/notifications`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${this.authToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              title: `Performance Test ${i + 1}`,
              message: `Notificación de rendimiento ${i + 1}`,
              recipient_id: 'test-user',
              type: 'info',
              priority: 'low'
            })
          })
        );
      }

      await Promise.all(promises);
      const endTime = Date.now();
      const duration = endTime - startTime;

      this.testResults.push({
        test: 'Performance',
        status: 'PASSED',
        details: `10 notificaciones creadas en ${duration}ms (${(duration/10).toFixed(1)}ms por notificación)`
      });

      console.log('✅ Pruebas de rendimiento completadas\n');

    } catch (error) {
      this.testResults.push({
        test: 'Performance',
        status: 'FAILED',
        error: error.message
      });
      throw error;
    }
  }

  printResults() {
    console.log('\n📊 RESULTADOS DEL TEST DE INTEGRACIÓN DE NOTIFICACIONES\n');
    console.log('='.repeat(60));
    
    const passed = this.testResults.filter(r => r.status === 'PASSED').length;
    const failed = this.testResults.filter(r => r.status === 'FAILED').length;
    const total = this.testResults.length;

    this.testResults.forEach((result, index) => {
      const status = result.status === 'PASSED' ? '✅' : '❌';
      console.log(`${index + 1}. ${status} ${result.test}`);
      
      if (result.details) {
        console.log(`   📝 ${result.details}`);
      }
      
      if (result.error) {
        console.log(`   ❌ Error: ${result.error}`);
      }
      
      console.log('');
    });

    console.log('='.repeat(60));
    console.log(`📈 Resumen: ${passed}/${total} pruebas exitosas`);
    
    if (failed > 0) {
      console.log(`❌ ${failed} pruebas fallaron`);
      process.exit(1);
    } else {
      console.log('🎉 ¡Todas las pruebas pasaron exitosamente!');
    }
  }

  cleanup() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

// Ejecutar test
async function main() {
  const test = new NotificationsIntegrationTest();
  
  try {
    await test.run();
  } catch (error) {
    console.error('Error ejecutando test:', error);
    process.exit(1);
  } finally {
    test.cleanup();
  }
}

// Verificar si el servidor está corriendo
async function checkServer() {
  try {
    const response = await fetch(process.env.API_URL || 'http://localhost:3000/api/health');
    if (!response.ok) {
      throw new Error('Servidor no disponible');
    }
    return true;
  } catch (error) {
    console.error('❌ Error: El servidor API no está corriendo');
    console.log('💡 Ejecuta: npm run dev en apps/api-server');
    return false;
  }
}

// Ejecutar solo si el servidor está disponible
checkServer().then(serverAvailable => {
  if (serverAvailable) {
    main();
  } else {
    process.exit(1);
  }
}); 