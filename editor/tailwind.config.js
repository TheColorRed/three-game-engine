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
      fontSize: {
        xs: 'var(--font-size-xs)',
        sm: 'var(--font-size-s)',
        md: 'var(--font-size-m)',
        lg: 'var(--font-size-l)',
        xl: 'var(--font-size-xl)'
      }
    },
  },
  plugins: [],
};
