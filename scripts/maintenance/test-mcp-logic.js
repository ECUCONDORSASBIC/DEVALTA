#!/usr/bin/env node

// Test directo de la lógica del MCP
import fsPromises from 'fs/promises';
import path from 'path';

class TestScanner {
  shouldSkipDirectory(name) {
    const skipDirs = [
      'node_modules', '.git', '.svn', '.hg', 'dist', 'build', 
      'coverage', '.nyc_output', 'vendor', '__pycache__', '.pytest_cache'
    ];
    return skipDirs.includes(name) || name.startsWith('.');
  }

  async walkDirectory(dirPath, results, options, depth = 0) {
    console.log(`🔍 Walking directory: ${dirPath} (depth: ${depth})`);
    
    if (depth > (options.maxDepth || 10)) {
      console.log(`❌ Max depth reached: ${depth}`);
      return;
    }
    
    try {
      const entries = await fsPromises.readdir(dirPath, { withFileTypes: true });
      console.log(`📁 Found ${entries.length} entries in ${dirPath}`);
      
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        
        if (entry.isDirectory()) {
          console.log(`📂 Directory: ${entry.name}`);
          if (!this.shouldSkipDirectory(entry.name)) {
            console.log(`✅ Processing directory: ${entry.name}`);
            await this.walkDirectory(fullPath, results, options, depth + 1);
          } else {
            console.log(`⏭️ Skipping directory: ${entry.name}`);
          }
        } else if (entry.isFile()) {
          console.log(`📄 File: ${entry.name}`);
          results.files++;
        }
      }
    } catch (error) {
      console.error(`❌ Error reading directory ${dirPath}: ${error.message}`);
    }
  }

  async scanRepository(rootPath, options = {}) {
    const results = {
      files: 0,
      linesOfCode: 0,
      dependencies: 0,
      patterns: 0
    };

    console.log(`🚀 Starting scan of: ${rootPath}`);
    
    try {
      await this.walkDirectory(rootPath, results, options);
      console.log(`✅ Scan complete. Files found: ${results.files}`);
    } catch (error) {
      console.error(`❌ Scan failed: ${error.message}`);
    }
    
    return results;
  }
}

const scanner = new TestScanner();
scanner.scanRepository('c:\\Users\\Eduardo\\Documents\\altamedicadev', { maxDepth: 2 });
