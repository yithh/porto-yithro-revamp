module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      colors: {
        'dark-bg': '#090C0A',
        'hero-bg': '#181B19',
        'about-bg': '#1A1D1B',
        'box-bg': '#D8D8D8',
        'field-bg': '#F5F5F5',
        'text-color': '#F5F5F5',
        'box-text': '#090C0A',
        'hint-color': '#808080',
        'button-bg': '#181B19',
        'text-color-dark': '#090COA',
        'accent-color': '#D96C06',
      },
      fontFamily: {
        worksans: ['Work Sans', 'sans-serif'],
        overpass: ['Overpass', 'sans-serif'],
        merriweather: ['Merriweather', 'serif'],
      },
      fontWeight: {
        black: 1000,
        regular: 500,
      },
      width: {
        '128': '32rem',
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
