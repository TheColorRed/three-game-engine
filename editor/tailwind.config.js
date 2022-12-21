/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}",],
  theme: {
    extend: {
      spacing: {
        sm: 'var(--spacing-s)',
        md: 'var(--spacing-m)',
        lg: 'var(--spacing-l)',
        xl: 'var(--spacing-xl)'
      },
    },
  },
  plugins: [],
};
