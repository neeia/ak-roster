import React, { useContext } from "react";
import { Box, BoxProps, ThemeProvider, Typography } from "@mui/material";
import createTheme from "styles/theme/appTheme";
import { LightContext } from "pages/_app";
import imageBase from "util/imageBase";

interface Props extends BoxProps {
  title: string;
  color: string;
  src: string;
  icon?: React.ReactNode;
}

const HomeNavSection = (props: Props) => {
  const { children, title, color, src } = props;

  const lightMode = useContext(LightContext)?.[0];

  return (
    <Box
      component="li"
      sx={{
        display: "block",
        borderLeft: `8px solid ${color}`,
        pt: 1,
        "&:hover, &:focus-within": {
          "& .ava-deco": {
            transform: "scale(1.02)",
            filter: `drop-shadow(4px -2px 0px ${color})`,
          },
        },
      }}
    >
      <ThemeProvider theme={createTheme(color, lightMode)}>
        <Typography
          variant="h2"
          sx={{
            position: "relative",
            fontSize: { xs: "1.5em", sm: "2em" },
            background: `${color}19`,
            pl: 2,
            pt: 2,
            pb: 1.5,
          }}
        >
          {title}
          <Box
            className="ava-deco"
            sx={{
              position: "absolute",
              right: 0,
              bottom: 0,
              width: "100%",
              height: { xs: 96, sm: 128 },
              background: `url('${imageBase}/assets/${src}.webp')`,
              backgroundPosition: "right 0px top 0px",
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
              transition: "transform 0.15s, filter 0.15s",
              pointerEvents: "none",
              filter: `drop-shadow(-4px -2px 0px transparent) drop-shadow(2px 4px 0.5px transparent)`,
            }}
          />
        </Typography>
        <Box
          component="ul"
          sx={{
            margin: 0,
            padding: {
              xs: 1,
              sm: 2,
            },
            display: "flex",
            flexWrap: "wrap",
            gap: {
              xs: 1,
              sm: 2,
            },
          }}
        >
          {children}
        </Box>
      </ThemeProvider>
    </Box>
  );
};
export default HomeNavSection;
