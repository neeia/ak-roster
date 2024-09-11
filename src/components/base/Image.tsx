import React from "react";
import { Box, BoxProps } from "@mui/material";
import NextImage from "next/image";

interface Props extends BoxProps {
  src: string;
  alt: string;
  sizes?: string;
}
const Image = (props: Props) => {
  const { src, alt, sizes, ...rest } = props;

  return (
    <Box position="relative" {...rest}>
      <NextImage
        src={src}
        alt={alt}
        fill={true}
        sizes={sizes}
        style={{
          objectFit: 'contain',
        }}
      />
    </Box>
  );
}
export default Image;
