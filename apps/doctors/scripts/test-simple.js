#!/usr/bin/env node

console.log('🚀 Script de prueba iniciado');

import fs from 'fs/promises';
import path from 'path';

const APPS_DIR = './apps';

async function main() {
    try {
        console.log('📁 Escaneando directorio de apps...');

        const items = await fs.readdir(APPS_DIR);
        console.log('📱 Apps encontradas:', items);

        for (const item of items) {
            const appPath = path.join(APPS_DIR, item);
            const stat = await fs.stat(appPath);

            if (stat.isDirectory()) {
                console.log(`📂 ${item}: Es un directorio`);

                // Verificar si tiene package.json
                try {
                    const packageJsonPath = path.join(appPath, 'package.json');
                    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));

                    if (packageJson.dependencies?.next) {
                        console.log(`   ✅ ${item}: Es una app Next.js`);

                        // Verificar Tailwind
                        const tailwindVersion = packageJson.devDependencies?.tailwindcss;
                        if (tailwindVersion) {
                            console.log(`   🎨 ${item}: Tailwind ${tailwindVersion}`);
                        }

                        // Verificar PostCSS config
                        try {
                            const postcssConfig = await fs.readFile(path.join(appPath, 'postcss.config.js'), 'utf8');
                            console.log(`   ⚙️ ${item}: Tiene postcss.config.js`);

                            if (postcssConfig.includes('@tailwindcss/postcss')) {
                                console.log(`   ⚠️ ${item}: Usando @tailwindcss/postcss`);
                            } else if (postcssConfig.includes('tailwindcss')) {
                                console.log(`   ✅ ${item}: Usando tailwindcss`);
                            }
                        } catch (error) {
                            console.log(`   ❌ ${item}: No tiene postcss.config.js`);
                        }
                    } else {
                        console.log(`   ⏭️ ${item}: No es una app Next.js`);
                    }
                } catch (error) {
                    console.log(`   ❌ ${item}: Error leyendo package.json`);
                }
            }
        }

        console.log('\n✅ Escaneo completado');

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

main(); 