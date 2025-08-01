/**
 * generate-video-placeholders.mjs - Generador de Placeholders para Videos
 * Proyecto: Altamedica Pacientes
 * Descripción: Script para crear archivos placeholder de videos y thumbnails
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración de videos
const VIDEOS_CONFIG = [
  {
    id: 'portal-guide',
    title: 'Cómo usar tu portal de paciente',
    duration: '3:45',
    category: 'salud',
  },
  {
    id: 'appointment-booking',
    title: 'Agendar citas médicas online',
    duration: '2:30',
    category: 'citas',
  },
  {
    id: 'telemedicine-guide',
    title: 'Tu primera consulta de telemedicina',
    duration: '4:15',
    category: 'telemedicina',
  },
  {
    id: 'medical-history',
    title: 'Entendiendo tu historial médico',
    duration: '3:20',
    category: 'historial',
  },
];

// Función para crear directorios si no existen
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✅ Directorio creado: ${dirPath}`);
  }
}

// Función para crear archivo placeholder de video
function createVideoPlaceholder(videoId) {
  const videoPath = path.join(__dirname, '..', 'public', 'videos', `${videoId}.mp4`);
  const videoContent = `# Placeholder para video: ${videoId}
# Este archivo debe ser reemplazado por el video real
# Formato: MP4, duración: ${VIDEOS_CONFIG.find(v => v.id === videoId)?.duration || 'N/A'}
# Resolución recomendada: 1920x1080
# Tamaño máximo: 50MB
# Codec: H.264
# Audio: AAC, 128kbps
# FPS: 30

# En producción, este archivo debe contener el video real
# Para desarrollo, puede ser un video de prueba o un enlace a un CDN

# Ejemplo de URL de CDN:
# https://cdn.altamedica.com/videos/${videoId}.mp4

# Para desarrollo local, puedes usar:
# /videos/${videoId}.mp4

# Nota: Los videos reales deben ser optimizados para web
# y comprimidos para reducir el tiempo de carga
`;

  fs.writeFileSync(videoPath, videoContent);
  console.log(`✅ Video placeholder creado: ${videoPath}`);
}

// Función para crear archivo placeholder de thumbnail
function createThumbnailPlaceholder(videoId) {
  const thumbnailPath = path.join(__dirname, '..', 'public', 'images', 'video-thumbnails', `${videoId}.jpg`);
  const thumbnailContent = `# Placeholder para thumbnail: ${videoId}
# Este archivo debe ser reemplazado por la imagen real
# Formato: JPG
# Resolución recomendada: 1280x720
# Tamaño máximo: 500KB
# Calidad: 85%

# En producción, este archivo debe contener la imagen real
# Para desarrollo, puede ser una imagen de prueba o un enlace a un CDN

# Ejemplo de URL de CDN:
# https://cdn.altamedica.com/thumbnails/${videoId}.jpg

# Para desarrollo local, puedes usar:
# /images/video-thumbnails/${videoId}.jpg

# Nota: Las imágenes reales deben ser optimizadas para web
# y comprimidas para reducir el tiempo de carga

# Dimensiones recomendadas:
# - Desktop: 1280x720
# - Tablet: 960x540
# - Mobile: 640x360
`;

  fs.writeFileSync(thumbnailPath, thumbnailContent);
  console.log(`✅ Thumbnail placeholder creado: ${thumbnailPath}`);
}

// Función para crear archivo de metadatos de video
function createVideoMetadata() {
  const metadataPath = path.join(__dirname, '..', 'public', 'videos', 'metadata.json');
  const metadata = {
    videos: VIDEOS_CONFIG.map(video => ({
      id: video.id,
      title: video.title,
      duration: video.duration,
      category: video.category,
      videoUrl: `/videos/${video.id}.mp4`,
      thumbnailUrl: `/images/video-thumbnails/${video.id}.jpg`,
      description: `Video explicativo sobre ${video.title.toLowerCase()}`,
      isFavorite: false,
      views: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })),
    totalVideos: VIDEOS_CONFIG.length,
    categories: [...new Set(VIDEOS_CONFIG.map(v => v.category))],
    lastUpdated: new Date().toISOString(),
  };

  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
  console.log(`✅ Metadatos de videos creados: ${metadataPath}`);
}

// Función para crear archivo de configuración de video
function createVideoConfig() {
  const configPath = path.join(__dirname, '..', 'src', 'config', 'video-config.ts');
  const configContent = `/**
 * video-config.ts - Configuración de Videos Explicativos
 * Proyecto: Altamedica Pacientes
 * Descripción: Configuración centralizada para videos del dashboard
 */

export interface VideoConfig {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl?: string;
  duration: string;
  category: "salud" | "citas" | "telemedicina" | "historial" | "medicamentos";
  isFavorite?: boolean;
  views?: number;
  createdAt?: string;
  updatedAt?: string;
}

// 🎥 Videos explicativos de Altamedica
export const EXPLANATORY_VIDEOS: VideoConfig[] = [
${VIDEOS_CONFIG.map(video => `  {
    id: "${video.id}",
    title: "${video.title}",
    description: "Video explicativo sobre ${video.title.toLowerCase()}",
    videoUrl: "/videos/${video.id}.mp4",
    thumbnailUrl: "/images/video-thumbnails/${video.id}.jpg",
    duration: "${video.duration}",
    category: "${video.category}" as const,
    isFavorite: false,
    views: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }`).join(',\n')}
];

// 🎯 Categorías de videos disponibles
export const VIDEO_CATEGORIES = [
  "salud",
  "citas", 
  "telemedicina",
  "historial",
  "medicamentos"
] as const;

// 📊 Estadísticas de videos
export const VIDEO_STATS = {
  totalVideos: ${VIDEOS_CONFIG.length},
  categories: ${JSON.stringify([...new Set(VIDEOS_CONFIG.map(v => v.category))])},
  totalDuration: "${VIDEOS_CONFIG.reduce((acc, v) => {
    const [min, sec] = v.duration.split(':').map(Number);
    return acc + min * 60 + sec;
  }, 0)}",
  averageDuration: "${Math.round(VIDEOS_CONFIG.reduce((acc, v) => {
    const [min, sec] = v.duration.split(':').map(Number);
    return acc + min * 60 + sec;
  }, 0) / VIDEOS_CONFIG.length)}",
};

// 🔍 Función para obtener videos por categoría
export const getVideosByCategory = (category: string): VideoConfig[] => {
  return EXPLANATORY_VIDEOS.filter(video => video.category === category);
};

// ⭐ Función para obtener videos favoritos
export const getFavoriteVideos = (): VideoConfig[] => {
  return EXPLANATORY_VIDEOS.filter(video => video.isFavorite);
};

// 📈 Función para obtener videos más vistos
export const getMostViewedVideos = (limit: number = 5): VideoConfig[] => {
  return EXPLANATORY_VIDEOS
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, limit);
};

// 🆕 Función para obtener videos recientes
export const getRecentVideos = (limit: number = 5): VideoConfig[] => {
  return EXPLANATORY_VIDEOS
    .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())
    .slice(0, limit);
};
`;

  fs.writeFileSync(configPath, configContent);
  console.log(`✅ Configuración de videos creada: ${configPath}`);
}

// Función principal
function main() {
  console.log('🎬 Generando placeholders para videos explicativos...\n');

  // Crear directorios necesarios
  const videosDir = path.join(__dirname, '..', 'public', 'videos');
  const thumbnailsDir = path.join(__dirname, '..', 'public', 'images', 'video-thumbnails');
  const configDir = path.join(__dirname, '..', 'src', 'config');

  ensureDirectoryExists(videosDir);
  ensureDirectoryExists(thumbnailsDir);
  ensureDirectoryExists(configDir);

  // Crear placeholders para cada video
  VIDEOS_CONFIG.forEach(video => {
    createVideoPlaceholder(video.id);
    createThumbnailPlaceholder(video.id);
  });

  // Crear archivos de configuración
  createVideoMetadata();
  createVideoConfig();

  console.log('\n✅ Todos los placeholders han sido creados exitosamente!');
  console.log('\n📝 Notas importantes:');
  console.log('1. Los archivos .mp4 y .jpg son placeholders y deben ser reemplazados por contenido real');
  console.log('2. Para desarrollo, puedes usar videos de prueba o enlaces a CDN');
  console.log('3. Los videos reales deben ser optimizados para web (H.264, AAC)');
  console.log('4. Las imágenes deben ser comprimidas para mejor performance');
  console.log('5. Considera usar un CDN para producción');
}

// Ejecutar script
main(); 