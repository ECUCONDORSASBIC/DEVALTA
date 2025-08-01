// Custom build script that disables ESLint
import { execSync } from 'child_process';

console.log('Building Next.js app without ESLint...');

// Set environment variables to disable ESLint
process.env.DISABLE_ESLINT_PLUGIN = 'true';
process.env.ESLINT_NO_DEV_ERRORS = 'true';

try {
  // Run Next.js build
  execSync('next build', {
    stdio: 'inherit',
    env: {
      ...process.env,
      DISABLE_ESLINT_PLUGIN: 'true',
      ESLINT_NO_DEV_ERRORS: 'true'
    }
  });
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}