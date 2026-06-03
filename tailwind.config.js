/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy:    '#0A3D62',
        ocean:   '#1565C0',
        sea:     '#1E88E5',
        'sea-light': '#E3F2FD',
        'sea-mid':   '#BBDEFB',
        gold:    '#FFC107',
        'gold-dark': '#F9A825',
        green:   '#43A047',
        coral:   '#EF5350',
        purple:  '#7B1FA2',
        white:   '#FFFFFF',
        dark:    '#0D1B2A',
        muted:   '#546E7A',
        border:  '#BBDEFB',
        surface: '#E3F2FD',
      },
      fontFamily: {
        display: ['var(--font-poppins)', 'system-ui', 'sans-serif'],
        body:    ['var(--font-poppins)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl2: '1.25rem',
        xl3: '1.5rem',
      },
      boxShadow: {
        card:    '0 4px 20px rgba(91,184,245,0.15)',
        'card-hover': '0 8px 30px rgba(91,184,245,0.25)',
        float:   '0 -4px 30px rgba(0,0,0,0.12)',
      },
    },
  },
  plugins: [],
}
