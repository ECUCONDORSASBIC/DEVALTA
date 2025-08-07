const fs = require('fs');
const path = require('path');

/**
 * Script para validar la existencia y legibilidad de archivos.
 * Este script reemplaza a 'validate_file_read.sh' para compatibilidad con Windows.
 * 
 * Uso: node tools/scripts/validate-file-read.js /ruta/al/archivo
 */

const main = () => {
  const filePath = process.argv[2];

  if (!filePath) {
    console.error('❌ Error: No se proporcionó la ruta del archivo a validar.');
    console.error('Uso: node tools/scripts/validate-file-read.js <rutaDelArchivo>');
    process.exit(1);
  }

  const absolutePath = path.resolve(filePath);

  try {
    // 1. Verificar si el archivo existe
    if (!fs.existsSync(absolutePath)) {
      console.error(`❌ Error: El archivo no existe en la ruta: ${absolutePath}`);
      process.exit(1);
    }

    // 2. Verificar permisos de lectura
    fs.accessSync(absolutePath, fs.constants.R_OK);

    console.log(`✅ Archivo validado exitosamente: ${absolutePath}`);
    process.exit(0);

  } catch (err) {
    if (err.code === 'EACCES') {
      console.error(`❌ Error: No se tienen permisos de lectura para el archivo: ${absolutePath}`);
    } else {
      console.error(`❌ Ocurrió un error inesperado al validar el archivo: ${absolutePath}`, err);
    }
    process.exit(1);
  }
};

main();
