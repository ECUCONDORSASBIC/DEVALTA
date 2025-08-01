// Configuración generada automáticamente para el Hospital 3D
// Basada en el análisis del modelo hospital-lod0.glb

export const hospitalConfig = {
  camera: {
    position: [138.54850233762903, 69.27425116881452, 138.54850233762903],
    fov: 50,
    near: 0.1,
    far: 692.7425116881452
  },
  controls: {
    minDistance: 6.927425116881452,
    maxDistance: 346.3712558440726,
    enableDamping: true,
    dampingFactor: 0.1
  },
  renderer: {
    antialias: false,
    shadows: false, // Deshabilitado para mejor rendimiento
    pixelRatio: 1.5
  },
  model: {
    meshes: 14,
    materials: 3,
    textures: 3,
    vertices: 784005
  }
};

// Materiales detectados:
// 1. hospital_Material_u1_v1 - rgba(255, 255, 255, 1)
// 2. hospital_Material_u2_v1 - rgba(255, 255, 255, 1)
// 3. hospital_Material_u1_v2 - rgba(255, 255, 255, 1)

// Uso recomendado:
// import { hospitalConfig } from "./three-config.js";
// const camera = new PerspectiveCamera(...hospitalConfig.camera);