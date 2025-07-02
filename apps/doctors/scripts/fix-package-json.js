#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function fixPackageJson() {
    const packageJsonPath = path.join(__dirname, '..', 'package.json');

    if (!fs.existsSync(packageJsonPath)) {
        console.log('❌ No se encontró package.json en el directorio raíz');
        return;
    }

    try {
        let content = fs.readFileSync(packageJsonPath, 'utf8');

        // Eliminar todas las líneas que contengan comentarios con #
        const lines = content.split('\n');
        const cleanedLines = lines.filter(line => !line.trim().startsWith('"#'));

        const cleanedContent = cleanedLines.join('\n');

        // Verificar que el JSON es válido
        JSON.parse(cleanedContent);

        // Escribir el archivo limpio
        fs.writeFileSync(packageJsonPath, cleanedContent);

        console.log('✅ package.json limpiado correctamente');
        console.log('✅ Comentarios JSON inválidos eliminados');

    } catch (error) {
        console.error('❌ Error limpiando package.json:', error.message);
    }
}

fixPackageJson(); 