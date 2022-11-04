import { grey, red, yellow } from '@mui/material/colors';
import { createTheme } from '@mui/material/styles';

const appTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: "#ffd440",
      light: "#fed480",
      dark: "#fbc02d",
    },
    secondary: {
      main: yellow[700],
      light: yellow[700],
      dark: yellow[700],
    },
    error: {
      main: red[500],
      light: red[500],
      dark: "#362122",
    },
    warning: {
      main: yellow[700],
      light: yellow[700],
      dark: yellow[700],
    },
    info: {
      main: "#303030",
      light: "#363635",
      dark: "#292928",
    },
    success: {
      main: "#90EE90",
      light: yellow[700],
      dark: yellow[700],
    },
    background: {
      default: "#272727",
      paper: "#121212",
    },
    text: {
      primary: '#fff',
      secondary: grey[400],
    }
  },
  typography: {
    caption: {
      margin: 0,
      fontFamily: `"Roboto","Helvetica","Arial", sans-serif`,
      fontWeight: 400,
      fontSize: "0.875rem",
      lineHeight: 1.66,
    },
    caption2: {
      margin: 0,
      fontFamily: `"Roboto","Helvetica","Arial", sans-serif`,
      fontWeight: 400,
      fontSize: "0.675rem",
      lineHeight: 1.66,
    },
    caption3: {
      margin: 0,
      fontFamily: `"Roboto","Helvetica","Arial", sans-serif`,
      fontWeight: 400,
      fontSize: "0.6rem",
    },
    h1: {
      fontSize: "4rem",
    },
    h2: {
      fontSize: "2.5rem",
    },
    h4: {
      fontWeight: "normal",
      fontSize: "2rem",
      lineHeight: 1,
    },
    h6: {
      fontWeight: "normal",
      fontSize: "0.875rem",
    }
  },
});

export default appTheme;

declare module '@mui/material/styles' {
  interface TypographyVariants {
    caption2: React.CSSProperties;
    caption3: React.CSSProperties;
  }

  // allow configuration using `createTheme`
  interface TypographyVariantsOptions {
    caption2?: React.CSSProperties;
    caption3?: React.CSSProperties;
  }
}

// Update the Typography's variant prop options
declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    caption2: true;
    caption3: true;
  }
}

