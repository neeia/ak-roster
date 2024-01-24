import React from "react";
import { Box, BoxProps, SvgIconProps, Typography } from "@mui/material";

interface Props extends BoxProps {
  title: string;
  color: string;
  src: string;
  backgroundPosition: string;
  backgroundSize: string;
  icon?: React.ReactNode;
  decoration?: (props: SvgIconProps) => React.ReactElement;
}

const HomeNavSection = ((props: Props) => {
  const { children, title, color, src, backgroundPosition, backgroundSize, decoration: Deco } = props;

  return (
    <Box component="li" sx={{
      display: "block",
      position: "relative",
      minHeight: 120,
      borderLeft: `8px solid ${color}`,
      background: `${color}19`,
      padding: "12px",
      "&:after": {
        content: "''",
        position: "absolute",
        top: 0,
        left: 4,
        width: "100%",
        height: "100%",
        background: `url(/img/assets/${src})`,
        backgroundPosition,
        backgroundSize,
        backgroundRepeat: "no-repeat",
        transition: "transform 0.15s",
        pointerEvents: "none",
      },
      "&:hover:after": {
        transform: "scale(1.02)",
        filter: `drop-shadow(-4px -2px 0px ${color}) drop-shadow(2px 4px 0.5px ${color})`
      }
    }}>
      {Deco && <Box sx={{
        position: "absolute",
        width: "100%",
        height: "100%",
        top: 0,
        left: 0,
        overflow: "hidden",
        zIndex: -1
      }}>
        <Deco sx={{
          position: "absolute",
          top: -88,
          left: -71,
          width: 200,
          height: 200,
          opacity: 0.1,
        }} />
      </Box>}
      <Typography variant="h2" sx={{
        fontSize: "32px",
        fontVariant: "small-caps",
        mb: "12px"
      }}>
        {title}
      </Typography>
      <Box component="ul" sx={{
        display: "flex",
        gap: "16px",
        margin: 0,
        padding: 0,
      }}>
        {children}
      </Box>
    </Box >
  );
});
export default HomeNavSection;
