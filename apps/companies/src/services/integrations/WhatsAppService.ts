/**
 * 📱 WHATSAPP BUSINESS INTEGRATION SERVICE
 * Integración con WhatsApp Business API para reporte rápido de datos hospitalarios
 */

import type { HospitalMetrics } from '../HospitalDataIntegrationService';

// Mock interfaces para compatibilidad con Next.js
interface MockClient {
  on: (event: string, callback: (...args: any[]) => void) => void;
  initialize: () => Promise<void>;
  sendMessage: (chatId: string, message: string) => Promise<void>;
}

interface MockMessage {
  body: string;
  hasMedia: boolean;
  reply: (message: string) => Promise<void>;
  getContact: () => Promise<{ number: string }>;
}

interface MockLocalAuth {
  constructor: (options: { clientId: string }) => MockLocalAuth;
}

export interface WhatsAppConfig {
  enabled: boolean;
  phoneNumber: string;
  apiKey: string;
  twilioAccountSid?: string;
  twilioAuthToken?: string;
}

export interface WhatsAppMessage {
  from: string;
  hospitalId: string;
  text: string;
  image?: string;
  audio?: string;
  timestamp: Date;
}

export class WhatsAppClient {
  private client: MockClient | null = null;
  private messageHandlers: Map<string, (message: WhatsAppMessage) => void> = new Map();
  private commandPatterns: Map<string, RegExp>;
  private hospitalContacts: Map<string, string> = new Map([
    ['+57123456789', 'HOSP-DEMO-001'],
    ['+57987654321', 'HOSP-DEMO-002']
  ]);
  
  constructor(private config: WhatsAppConfig) {
    this.commandPatterns = new Map([
      ['camas', /^\/camas\s+(\d+)\s*\/\s*(\d+)$/i],
      ['espera', /^\/espera\s+(\d+)\s*(?:min(?:utos?)?)?\s*(\d+)?$/i],
      ['medicos', /^\/medicos\s+(\w+)\s+(\d+)$/i],
      ['urgencia', /^\/urgencia\s+(\d+)\s+criticos\s*(\d+)?$/i],
      ['ayuda', /^\/ayuda$/i],
      ['estado', /^\/estado$/i]
    ]);
    
    if (config.enabled) {
      this.initialize();
    }
  }

  /**
   * 🚀 Inicializar cliente WhatsApp
   */
  private async initialize() {
    try {
      // Mock client para desarrollo
      this.client = {
        on: (event: string, callback: (...args: any[]) => void) => {
          if (event === 'ready') {
            setTimeout(() => {
              callback();
              console.log('✅ WhatsApp Client is ready! (Mock)');
              this.sendWelcomeMessage();
            }, 2000);
          } else if (event === 'qr') {
            setTimeout(() => {
              const mockQR = 'mock-qr-code-for-development';
              callback(mockQR);
              console.log('📱 WhatsApp QR Code: (Mock)', mockQR);
            }, 1000);
          } else if (event === 'message') {
            // Simular mensajes de prueba
            setTimeout(() => {
              this.simulateIncomingMessages((msg) => {
                this.handleIncomingMessage(msg);
              });
            }, 5000);
          }
        },
        initialize: async () => {
          console.log('🚀 WhatsApp Client initialized (Mock)');
          // Simular eventos
          setTimeout(() => {
            this.client!.on('qr', () => {});
            this.client!.on('ready', () => {});
            this.client!.on('message', () => {});
          }, 100);
        },
        sendMessage: async (chatId: string, message: string) => {
          console.log('📤 WhatsApp Message Sent (Mock):', { chatId, message });
        }
      };

      await this.client.initialize();
    } catch (error) {
      console.error('❌ WhatsApp initialization error:', error);
    }
  }

  /**
   * 🧪 Simular mensajes entrantes para desarrollo
   */
  private simulateIncomingMessages(callback: (msg: MockMessage) => void) {
    const mockMessages = [
      { body: '/camas 45/50', hospitalId: 'HOSP-001' },
      { body: '/espera 35 min 12', hospitalId: 'HOSP-001' },
      { body: '/urgencia 8 criticos 3', hospitalId: 'HOSP-002' },
      { body: '/medicos cardiologia 2', hospitalId: 'HOSP-001' }
    ];

    let index = 0;
    const interval = setInterval(() => {
      if (index < mockMessages.length) {
        const mockMsg: MockMessage = {
          body: mockMessages[index].body,
          hasMedia: false,
          reply: async (message: string) => {
            console.log('📩 WhatsApp Reply (Mock):', message);
          },
          getContact: async () => ({ number: '+57123456789' })
        };
        callback(mockMsg);
        index++;
      } else {
        clearInterval(interval);
      }
    }, 10000); // Enviar un mensaje cada 10 segundos
  }

  /**
   * 📨 Procesar mensajes entrantes
   */
  private async handleIncomingMessage(msg: MockMessage) {
    const contact = await msg.getContact();
    const hospitalId = await this.getHospitalIdFromContact(contact.number);
    
    if (!hospitalId) {
      await msg.reply('❌ Hospital no registrado. Contacte soporte.');
      return;
    }

    // Parsear comando
    const command = this.parseCommand(msg.body);
    
    if (!command) {
      await msg.reply(this.getHelpMessage());
      return;
    }

    // Procesar según tipo de comando
    switch (command.type) {
      case 'camas':
        await this.handleBedsUpdate(msg, hospitalId, command.data);
        break;
      case 'espera':
        await this.handleWaitingUpdate(msg, hospitalId, command.data);
        break;
      case 'medicos':
        await this.handleStaffUpdate(msg, hospitalId, command.data);
        break;
      case 'urgencia':
        await this.handleEmergencyUpdate(msg, hospitalId, command.data);
        break;
      case 'estado':
        await this.sendCurrentStatus(msg, hospitalId);
        break;
      case 'ayuda':
        await msg.reply(this.getHelpMessage());
        break;
    }

    // Notificar a listeners
    const whatsappMessage: WhatsAppMessage = {
      from: contact.number,
      hospitalId,
      text: msg.body,
      image: msg.hasMedia ? await this.extractMediaUrl(msg) : undefined,
      timestamp: new Date()
    };

    const handler = this.messageHandlers.get(hospitalId);
    if (handler) {
      handler(whatsappMessage);
    }
  }

  /**
   * 🏥 Actualizar estado de camas
   */
  private async handleBedsUpdate(msg: Message, hospitalId: string, data: any) {
    const { occupied, total } = data;
    const percentage = Math.round((occupied / total) * 100);
    
    // Guardar en base de datos
    await this.saveUpdate(hospitalId, {
      beds: { occupied, total, available: total - occupied }
    });

    // Responder con confirmación
    await msg.reply(`
✅ *Camas Actualizadas*
🏥 ${hospitalId}
🛏️ Ocupadas: ${occupied}/${total} (${percentage}%)
⏰ ${new Date().toLocaleTimeString()}
    `.trim());

    // Alerta si está crítico
    if (percentage > 90) {
      await msg.reply(`
⚠️ *ALERTA: Ocupación Crítica*
Considere activar protocolo de redistribución
      `.trim());
    }
  }

  /**
   * ⏱️ Actualizar tiempos de espera
   */
  private async handleWaitingUpdate(msg: Message, hospitalId: string, data: any) {
    const { patients, avgTime } = data;
    
    await this.saveUpdate(hospitalId, {
      emergency: { waiting: patients, averageWaitTime: avgTime || 45 }
    });

    await msg.reply(`
✅ *Sala de Espera Actualizada*
👥 Pacientes esperando: ${patients}
⏱️ Tiempo promedio: ${avgTime || 45} minutos
${patients > 20 ? '⚠️ Considere solicitar refuerzos' : ''}
    `.trim());
  }

  /**
   * 👨‍⚕️ Actualizar personal médico
   */
  private async handleStaffUpdate(msg: Message, hospitalId: string, data: any) {
    const { specialty, count } = data;
    
    await this.saveUpdate(hospitalId, {
      staff: { [specialty]: count }
    });

    await msg.reply(`
✅ *Personal Actualizado*
👨‍⚕️ ${specialty}: ${count} médicos activos
${count < 3 ? '⚠️ Personal bajo, considere refuerzos' : ''}
    `.trim());
  }

  /**
   * 🚨 Manejo de urgencias
   */
  private async handleEmergencyUpdate(msg: Message, hospitalId: string, data: any) {
    const { total, critical } = data;
    
    await this.saveUpdate(hospitalId, {
      emergency: { waiting: total, critical: critical || 0 }
    });

    // Respuesta urgente
    await msg.reply(`
🚨 *URGENCIAS ACTUALIZADO*
Total esperando: ${total}
Críticos: ${critical || 0}
${critical > 5 ? '🔴 ACTIVANDO PROTOCOLO DE EMERGENCIA' : ''}
    `.trim());

    // Si es crítico, notificar a la red
    if (critical > 5) {
      await this.notifyNetwork(hospitalId, 'emergency', { total, critical });
    }
  }

  /**
   * 📊 Enviar estado actual
   */
  private async sendCurrentStatus(msg: Message, hospitalId: string) {
    const status = await this.getCurrentStatus(hospitalId);
    
    await msg.reply(`
📊 *ESTADO ACTUAL - ${hospitalId}*
━━━━━━━━━━━━━━━━
🛏️ *Camas:* ${status.beds.occupied}/${status.beds.total} (${status.beds.percentage}%)
👥 *Esperando:* ${status.emergency.waiting} pacientes
⏱️ *Tiempo espera:* ${status.emergency.avgWait} min
👨‍⚕️ *Médicos activos:* ${status.staff.total}

🔄 Última actualización: ${status.lastUpdate}
━━━━━━━━━━━━━━━━
💡 Envíe /ayuda para ver comandos
    `.trim());
  }

  /**
   * 📋 Mensaje de ayuda
   */
  private getHelpMessage(): string {
    return `
🏥 *COMANDOS ALTAMEDICA*
━━━━━━━━━━━━━━━━
📝 *Reportar datos:*
• /camas 85/100 - Camas ocupadas/total
• /espera 25 - Pacientes esperando
• /medicos cardiologia 3 - Médicos por especialidad
• /urgencia 15 criticos 3 - Urgencias

📊 *Consultas:*
• /estado - Ver estado actual
• /ayuda - Este mensaje

💡 *Tips:*
• Puede enviar fotos de sala de espera
• Use audio para reportes rápidos
━━━━━━━━━━━━━━━━
    `.trim();
  }

  /**
   * 🎙️ Procesar mensajes de audio
   */
  async processAudioMessage(msg: Message): Promise<any> {
    // Implementar transcripción de audio
    // Usar servicio como Google Speech-to-Text o Whisper API
    const transcript = await this.transcribeAudio(msg);
    return this.parseNaturalLanguage(transcript);
  }

  /**
   * 🖼️ Procesar imágenes
   */
  async processImageMessage(msg: Message): Promise<any> {
    // Implementar análisis de imagen con AI
    // Contar personas en sala de espera
    const imageAnalysis = await this.analyzeImage(msg);
    return {
      estimatedPeople: imageAnalysis.peopleCount,
      crowdLevel: imageAnalysis.density
    };
  }

  /**
   * 🔄 Listeners públicos
   */
  onMessage(hospitalId: string, callback: (message: WhatsAppMessage) => void) {
    this.messageHandlers.set(hospitalId, callback);
  }

  /**
   * 📤 Enviar mensaje proactivo
   */
  async sendMessage(phoneNumber: string, message: string): Promise<void> {
    if (!this.client) return;
    
    const chatId = phoneNumber.includes('@c.us') ? phoneNumber : `${phoneNumber}@c.us`;
    await this.client.sendMessage(chatId, message);
  }

  /**
   * 🔔 Notificaciones automáticas
   */
  async sendAlert(hospitalId: string, alert: any): Promise<void> {
    const contacts = await this.getHospitalContacts(hospitalId);
    
    const message = `
🚨 *ALERTA AUTOMÁTICA*
${alert.type === 'saturation' ? '🔴 Saturación detectada' : ''}
${alert.type === 'shortage' ? '⚠️ Escasez de personal' : ''}

${alert.message}

Responda con /estado para más información
    `.trim();

    for (const contact of contacts) {
      await this.sendMessage(contact, message);
    }
  }

  // Métodos auxiliares privados
  private async getHospitalIdFromContact(phoneNumber: string): Promise<string | null> {
    return this.hospitalContacts.get(phoneNumber) || null;
  }

  private async sendWelcomeMessage(): Promise<void> {
    console.log('📱 WhatsApp Service Ready - Send /ayuda to any registered number');
  }

  async getLatestUpdate(hospitalId: string): Promise<any> {
    // Mock implementation
    return {
      source: 'whatsapp',
      hospitalId,
      timestamp: new Date(),
      data: {}
    };
  }

  private async getHospitalContacts(hospitalId: string): Promise<string[]> {
    // En producción, esto vendría de la base de datos
    const contacts: string[] = [];
    this.hospitalContacts.forEach((id, phone) => {
      if (id === hospitalId) contacts.push(phone);
    });
    return contacts;
  }

  private async transcribeAudio(msg: any): Promise<string> {
    // Mock implementation - en producción usar speech-to-text API
    return "urgencias 15 pacientes esperando";
  }

  private async analyzeImage(msg: any): Promise<any> {
    // Mock implementation - en producción usar computer vision API
    return {
      peopleCount: 12,
      density: 'medium'
    };
  }

  private parseNaturalLanguage(text: string): any {
    // Mock implementation - en producción usar NLP
    return {
      intent: 'report_waiting',
      entities: { count: 15 }
    };
  }

  private parseCommand(text: string): any {
    for (const [type, pattern] of this.commandPatterns) {
      const match = text.match(pattern);
      if (match) {
        return { type, data: this.extractCommandData(type, match) };
      }
    }
    return null;
  }

  private extractCommandData(type: string, match: RegExpMatchArray): any {
    switch (type) {
      case 'camas':
        return { occupied: parseInt(match[1]), total: parseInt(match[2]) };
      case 'espera':
        return { waiting: parseInt(match[1]), time: match[2] ? parseInt(match[2]) : null };
      case 'medicos':
        return { specialty: match[1], count: parseInt(match[2]) };
      case 'urgencia':
        return { total: parseInt(match[1]), critical: match[2] ? parseInt(match[2]) : 0 };
      default:
        return {};
    }
  }

  private async handleBedsUpdate(msg: MockMessage, hospitalId: string, data: any): Promise<void> {
    const message = `✅ Actualización registrada:
🛏️ Camas: ${data.occupied}/${data.total} (${Math.round((data.occupied/data.total)*100)}% ocupación)`;
    await msg.reply(message);
    
    // Notificar a handlers
    const handler = this.messageHandlers.get(hospitalId);
    if (handler) {
      handler({
        from: await msg.getContact().then(c => c.number),
        hospitalId,
        text: msg.body,
        timestamp: new Date()
      });
    }
  }

  private async handleWaitingUpdate(msg: MockMessage, hospitalId: string, data: any): Promise<void> {
    const message = `✅ Actualización registrada:
👥 Pacientes esperando: ${data.waiting}
${data.time ? `⏱️ Tiempo promedio: ${data.time} minutos` : ''}`;
    await msg.reply(message);
  }

  private async handleStaffUpdate(msg: MockMessage, hospitalId: string, data: any): Promise<void> {
    const message = `✅ Actualización registrada:
👨‍⚕️ ${data.specialty}: ${data.count} médicos disponibles`;
    await msg.reply(message);
  }

  private async handleEmergencyUpdate(msg: MockMessage, hospitalId: string, data: any): Promise<void> {
    const message = `✅ Actualización registrada:
🚨 Urgencias: ${data.total} pacientes
${data.critical > 0 ? `🔴 Críticos: ${data.critical}` : ''}`;
    await msg.reply(message);
  }

  private async sendCurrentStatus(msg: MockMessage, hospitalId: string): Promise<void> {
    // En producción, obtener datos reales de Firebase
    const status = {
      beds: { occupied: 78, total: 100, percentage: 78 },
      emergency: { waiting: 15, avgWait: 45 },
      staff: { total: 42 },
      lastUpdate: new Date().toLocaleTimeString()
    };
    
    const message = `
🏥 *ESTADO ACTUAL*
━━━━━━━━━━━━━━━━
🛏️ *Camas:* ${status.beds.occupied}/${status.beds.total} (${status.beds.percentage}%)
👥 *Esperando:* ${status.emergency.waiting} pacientes
⏱️ *Tiempo espera:* ${status.emergency.avgWait} min
👨‍⚕️ *Médicos activos:* ${status.staff.total}

🔄 Última actualización: ${status.lastUpdate}
━━━━━━━━━━━━━━━━
💡 Envíe /ayuda para ver comandos
    `.trim();
    
    await msg.reply(message);
  }
}