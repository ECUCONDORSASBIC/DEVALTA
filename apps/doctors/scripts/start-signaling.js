#!/usr/bin/env node

// Script para iniciar el servidor de señalización WebRTC
import { SignalingServer } from '../src/server/signalingServer.ts';

const port = parseInt(process.env.SIGNALING_PORT || '3001');

console.log('🚀 Iniciando servidor de señalización WebRTC...');
console.log(`📍 Puerto: ${port}`);
console.log(`🔗 URL: ws://localhost:${port}`);

const server = new SignalingServer(port);

// Manejo de señales para cierre limpio
process.on('SIGINT', () => {
  console.log('\n🛑 Cerrando servidor de señalización...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Cerrando servidor de señalización...');
  process.exit(0);
});

console.log('✅ Servidor de señalización iniciado correctamente');
console.log('📊 Para ver estadísticas, visita: http://localhost:3001/stats'); 