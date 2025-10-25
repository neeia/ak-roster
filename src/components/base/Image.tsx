import { Box, BoxProps, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";

interface Props extends Omit<BoxProps, "children"> {
  src: string;
  alt: string;
  width?: string | number;
  height?: string | number;
  hideOnError?: boolean;
  onError?: () => void;
}
const Image = (props: Props) => {
  const { src, alt, hideOnError = false, onError, sx, ...rest } = props;

  //on load error: return same height 0px div
  const [hasError, setHasError] = useState(false);
  const hidden = hideOnError && hasError;
  if (hidden) return (
    <Box component="div" sx={{ ...sx, width: alt === "" ? 0 : "auto", verticalAlign: "middle" }} {...rest}>
      {alt}
    </Box>)

  return (
    <Box
      component="img"
      src={src}
      alt={alt}
      onError={() => {
        setHasError(true)
        onError?.();
      }}
      sx={{
        objectFit: "contain",
        ...sx,
      }}
      {...rest}
    />
  );
};
export default Image;
