const fs = require('fs');
const path = require('path');

function deleteFolderRecursive(folderPath) {
  if (fs.existsSync(folderPath)) {
    fs.readdirSync(folderPath).forEach((file) => {
      const curPath = path.join(folderPath, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        deleteFolderRecursive(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(folderPath);
    console.log(`✅ Eliminado: ${folderPath}`);
  } else {
    console.log(`⚠️ No existe: ${folderPath}`);
  }
}

function cleanProject() {
  console.log('🧹 Limpiando proyecto...');
  
  const foldersToDelete = [
    '.next',
    'node_modules/.cache',
    '.turbo'
  ];
  
  foldersToDelete.forEach(folder => {
    try {
      deleteFolderRecursive(folder);
    } catch (error) {
      console.log(`❌ Error eliminando ${folder}:`, error.message);
    }
  });
  
  console.log('✅ Limpieza completada');
}

cleanProject();
