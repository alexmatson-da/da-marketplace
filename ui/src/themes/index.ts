import lightTheme from './light';
import darkTheme from './dark';

const overrides = {
  typography: {
    h1: {
      fontSize: '3rem',
    },
    h2: {
      fontSize: '2rem',
    },
    h3: {
      fontSize: '1.64rem',
    },
    h4: {
      fontSize: '1.5rem',
    },
    h5: {
      fontSize: '1.285rem',
    },
    h6: {
      fontSize: '1.142rem',
    },
    fontFamily: ['"Noto Sans Condensed"', 'Helvetica', 'Arial', 'sans-serif'].join(','),
  },
};

export default {
  light: { ...lightTheme, ...overrides },
  dark: { ...darkTheme, ...overrides },
};
