import { createTheme } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Theme {
    status: {
      danger: string;
    };
  }
  // allow configuration using `createTheme`
  interface ThemeOptions {
    status?: {
      danger?: string;
    };
  }
}

const neutral = {
  50: "#F2F2F2",
  100: "#E3E3E3",
  200: "#C7C7C7",
  300: "#ADADAD",
  400: "#919191",
  500: "#707070",
  600: "#595959",
  700: "#303030",
  800: "#212121",
  900: "#121212",
  950: "#0D0D0D"
};

export const DISCORD_BLURPLE = "#5865F2";
export const GITHUB_LIGHT = "#FAFBFC";
export const GITHUB_DARK = "#24292E";
export const KOFI_BLUE = "#29ABE0";

export const brand: Record<string, string> = {
  DEFAULT: "#FFD440",
  "/data": "#FFD440",
  "/network": "#FF8FD1",
  "/tools": "#E399FF",
  "/community": "#949DF9",
  // "0": "#FF6E40",
}

const appTheme = (brandColor: string) => createTheme({
  // breakpoints: {
  //   unit: "rem",
  //   values: {
  //     xs: 0,
  //     sm: 40,
  //     md: 55,
  //     lg: 75,
  //     xl: 96,
  //   },
  // },
  palette: {
    mode: "dark",
    primary: {
      main: brandColor,
    },
    text: {
      primary: neutral[50],
      secondary: neutral[200],
    },
    background: {
      default: neutral[800],
      paper: neutral[900],
      light: neutral[700],
    },
    grey: neutral
  },
  components: {
    MuiAlert: {
      defaultProps: {
        variant: "outlined"
      }
    },
    MuiButton: {
      defaultProps: {
        variant: "neutral"
      },
      styleOverrides: {
        root: {
          textTransform: "none",
          minWidth: 0,
        }
      },
      variants: [
        {
          props: { variant: "neutral" },
          style: {
            color: neutral[50],
            backgroundColor: neutral[700],
            ...interactive,
          }
        }
      ]
    },
    MuiDialog: {
      defaultProps: {
        scroll: "body",
      }
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          paddingRight: "32px",
          paddingLeft: "16px"
        }
      }
    },
    MuiToggleButtonGroup: {
      defaultProps: {
        color: "primary",
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          backgroundColor: neutral[700],
          "&:not(._):not(._):not(._)": {
            border: "none",
            margin: 0,
            "&.Mui-selected": {
              borderBottomStyle: "solid",
              borderBottomWidth: "0.25rem",
              borderBottomColor: brandColor,
            },
          },
        },
      }
    },
    MuiLink: {
      defaultProps: {
        color: "inherit",
        underline: "hover",
        fontFamily: `"Lato", sans-serif`,
      },
      styleOverrides: {
        root: {
          "&[aria-disabled='true']": {
            color: neutral[300],
            opacity: 0.8,
            pointerEvents: "none",
          },
        }
      }
    },
    MuiPaper: {
      defaultProps: {
        elevation: 0
      }
    }
  },
  typography: {
    allVariants: {
      fontFamily: `"Lato", sans-serif`,
    },
    caption: {
      margin: 0,
      fontWeight: 400,
      fontSize: "0.875rem",
      lineHeight: 1.66,
    },
    caption2: {
      margin: 0,
      fontWeight: 400,
      fontSize: "0.675rem",
      lineHeight: 1.66,
    },
    caption3: {
      margin: 0,
      fontWeight: 400,
      fontSize: "0.6rem",
    },
    h1: {
      fontSize: "4rem",
    },
    h2: {
      fontSize: "2rem",
    },
    h3: {
      fontSize: "1rem",
      lineHeight: 1,
      fontWeight: "normal",
      color: neutral[200],
      marginLeft: "8px",
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

  interface TypeBackground {
    light: string;
  }

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

declare module '@mui/material/Button' {
  interface ButtonPropsVariantOverrides {
    neutral: true;
  }
}

// Update the Typography's variant prop options
declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    caption2: true;
    caption3: true;
  }
}

export const interactive = {
  transition: "filter 0.1s, background-color 0.1s",
  ":hover": { filter: "brightness(110%)" },
}

export const focused = {
  boxShadow: "inset 0px 0px 0px 2px white"
}

export const skillBackground = {
  backgroundImage: "url(/img/rank/bg.png)",
  backgroundSize: "contain",
  backgroundRepeat: "no-repeat",
}