const { exec, spawn } = require('child_process');
const path = require('path');

// Navigate to the monorepo root
const monorepoRoot = path.resolve(__dirname, '../../');

console.log('Starting build process for AltaMedica Platform...');
console.log('Monorepo root:', monorepoRoot);
console.log('Current directory:', __dirname);

// Change working directory to monorepo root
process.chdir(monorepoRoot);
console.log('Changed to monorepo root:', process.cwd());

// Function to try different pnpm executables
async function findPnpmExecutable() {
  const possiblePaths = [
    'pnpm',
    'npx pnpm',
    path.join(process.env.APPDATA || '', 'npm', 'pnpm.cmd'),
    path.join(process.env.APPDATA || '', 'npm', 'node_modules', 'pnpm', 'bin', 'pnpm.cjs'),
  ];

  for (const pnpmPath of possiblePaths) {
    try {
      console.log(`Trying: ${pnpmPath}`);
      
      // Try to run pnpm --version to test if it works
      const result = await new Promise((resolve, reject) => {
        exec(`${pnpmPath} --version`, (error, stdout, stderr) => {
          if (error) {
            reject(error);
          } else {
            resolve(stdout.trim());
          }
        });
      });
      
      console.log(`Found working pnpm at ${pnpmPath}, version: ${result}`);
      return pnpmPath;
    } catch (error) {
      console.log(`Failed with ${pnpmPath}: ${error.message}`);
      continue;
    }
  }
  
  throw new Error('No working pnpm executable found');
}

// Function to run build
async function runBuild() {
  try {
    const pnpmExecutable = await findPnpmExecutable();
    
    console.log('\n=== Running pnpm build ===');
    
    const buildProcess = spawn(pnpmExecutable.split(' ')[0], 
      pnpmExecutable.split(' ').slice(1).concat(['build']), 
      {
        cwd: monorepoRoot,
        stdio: 'inherit',
        shell: true
      }
    );

    buildProcess.on('close', (code) => {
      console.log(`\n=== Build process finished with exit code: ${code} ===`);
      if (code === 0) {
        console.log('✅ Build completed successfully!');
      } else {
        console.log('❌ Build failed with errors.');
      }
      process.exit(code);
    });

    buildProcess.on('error', (error) => {
      console.error('Error running build process:', error);
      process.exit(1);
    });

  } catch (error) {
    console.error('Failed to start build process:', error.message);
    
    // Fallback to npm
    console.log('\n=== Falling back to npm run build ===');
    const npmBuild = spawn('npm', ['run', 'build'], {
      cwd: monorepoRoot,
      stdio: 'inherit',
      shell: true
    });

    npmBuild.on('close', (code) => {
      console.log(`\n=== NPM Build process finished with exit code: ${code} ===`);
      process.exit(code);
    });
  }
}

// Handle Ctrl+C
process.on('SIGINT', () => {
  console.log('\n\nBuild process interrupted by user');
  process.exit(1);
});

// Run the build
runBuild().catch(error => {
  console.error('Unexpected error:', error);
  process.exit(1);
});