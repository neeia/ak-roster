import React from "react";
import { Box, BoxProps } from "@mui/material";
import NextImage, { ImageProps } from "next/image";

interface Props extends BoxProps {
  src: string;
  alt: string;
  sizes?: string;
  ImageProps?: ImageProps;
}
const Image = (props: Props) => {
  const { src, alt, sizes, ImageProps, ...rest } = props;

  return (
    <Box position="relative" {...rest}>
      <NextImage src={src} alt={alt} fill
        sizes={sizes}
        style={{
          objectFit: 'contain',
        }}
        {...ImageProps}
      />
    </Box>
  );
}
export default Image;
