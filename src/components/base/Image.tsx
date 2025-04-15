import { Box, BoxProps } from "@mui/material";
import React from "react";

interface Props extends Omit<BoxProps, "children"> {
  src: string;
  alt: string;
  width?: string | number;
  height?: string | number;
}
const Image = (props: Props) => {
  const { src, alt, sx, ...rest } = props;

  return (
    <Box
      component="img"
      src={src}
      alt={alt}
      sx={{
        objectFit: "contain",
        ...sx,
      }}
      {...rest}
    />
  );
};
export default Image;
