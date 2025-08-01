// Utilidad para crear el Web Worker de procesamiento de video
export function createVideoWorker() {
  if (typeof window === 'undefined' || !window.Worker) return null;
  try {
    return new Worker('/workers/videoProcessor.worker.js');
  } catch (error) {
    console.error('Error creando Web Worker:', error);
    return null;
  }
} 