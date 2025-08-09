const { exec } = require('child_process');
const path = require('path');

// Change to the companies directory
process.chdir(path.join(__dirname));

console.log('Starting development server for companies app...');
console.log('Working directory:', process.cwd());

const child = exec('npm run dev', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error}`);
    return;
  }
});

child.stdout.on('data', (data) => {
  console.log(data);
});

child.stderr.on('data', (data) => {
  console.error(data);
});

child.on('close', (code) => {
  console.log(`Development server exited with code ${code}`);
});

// Keep the process running
process.on('SIGINT', () => {
  console.log('\nStopping development server...');
  child.kill();
  process.exit();
});