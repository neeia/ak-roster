import { createTheme } from '@mui/material/styles';

const lightTheme = createTheme({
  palette: {
    mode: 'light',
  },
  typography: {
    caption2: {
      margin: 0,
      fontFamily: `"Roboto","Helvetica","Arial", sans-serif`,
      fontWeight: 400,
      fontSize: "0.6rem",
      lineHeight: 1.66,
    },
  },
});

export default lightTheme;

declare module '@mui/material/styles' {
  interface TypographyVariants {
    caption2: React.CSSProperties;
  }

  // allow configuration using `createTheme`
  interface TypographyVariantsOptions {
    caption2?: React.CSSProperties;
  }
}

// Update the Typography's variant prop options
declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    caption2: true;
  }
}
