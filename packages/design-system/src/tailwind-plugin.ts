import plugin from 'tailwindcss/plugin';

export const withAltamedicaDS = plugin(({ addBase }) => {
  addBase({
    ':root': {
      '--am-primary-50': '#eff6ff',
      '--am-primary-100': '#dbeafe',
      '--am-primary-500': '#3b82f6',
      '--am-primary-600': '#2563eb',
      '--am-primary-700': '#1d4ed8',
      '--am-primary-900': '#1e3a8a',
      '--am-secondary-50': '#ecfdf5',
      '--am-secondary-100': '#d1fae5',
      '--am-secondary-500': '#10b981',
      '--am-secondary-600': '#059669',
      '--am-secondary-700': '#047857',
      '--am-secondary-900': '#064e3b',
      '--am-success': '#10b981',
      '--am-warning': '#f59e0b',
      '--am-danger': '#ef4444',
      '--am-info': '#3b82f6',
      '--am-radius-sm': '4px',
      '--am-radius-md': '6px',
      '--am-radius-lg': '8px',
    },
  });
});