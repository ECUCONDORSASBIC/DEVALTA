import baseConfig from '../../configs/tailwind/base.config.js';
import { withAltamedicaDS } from './src/tailwind-plugin.js';

/** @type {import('tailwindcss').Config} */
export default {
  ...baseConfig,
  content: [
    './src/**/*.{ts,tsx}',
  ],
  plugins: [
    ...baseConfig.plugins,
    withAltamedicaDS,
  ],
};