import React from "react";
import { Box, BoxProps, LinkProps, Typography } from "@mui/material";
import Link from "components/base/Link";
import Image from "next/image";

export const getLogoUrl = () => {
  const date = new Date();

  switch (date.getMonth()) {
    case 1:
    case 12:
      return "holiday";
    case 5:
    case 6:
      return "celebration";
    default:
      return "default";
  }
}

interface Props extends BoxProps {
  LinkProps?: LinkProps;
  full?: boolean;
  hideSubtitle?: boolean;
  sizes?: string;
}
const Logo = (props: Props) => {
  const { LinkProps, full, hideSubtitle, children, sizes, ...rest } = props;

  const suffix = (full ? "-h" : (hideSubtitle ? "" : "-v"))

  return (
    <Link href="/" title="Krooster"
      {...LinkProps}
    >
      <Box position="relative" {...rest}>
        <Image alt="Krooster - Arknights Roster"
          src={`/assets/title/${getLogoUrl()}${suffix}.png`}
          fill
          sizes={sizes}
        />
      </Box>
      {children}
    </Link>
  );
}
export default Logo;
