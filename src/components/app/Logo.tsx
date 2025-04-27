import React from "react";
import { Box, BoxProps, LinkProps } from "@mui/material";
import Link from "components/base/Link";
import Image from "components/base/Image";
import imageBase from "util/imageBase";

// seasonal logo filenames
export const getLogoUrl = () => {
  const date = new Date();

  switch (date.getMonth() + 1) {
    case 1:
    case 12:
      return "holiday";
    case 5:
    case 6:
      return "celebration";
    default:
      return "default";
  }
};

interface Props extends BoxProps {
  LinkProps?: LinkProps;
  full?: boolean;
  hideSubtitle?: boolean;
}
const Logo = (props: Props) => {
  const { LinkProps, full, hideSubtitle, children, sx, ...rest } = props;

  const suffix = full ? "-h" : hideSubtitle ? "" : "-v";

  return (
    <Link href="/" title="Krooster" {...LinkProps}>
      <Box sx={{ position: "relative", ...sx }} {...rest}>
        <Image
          src={`${imageBase}/title/${getLogoUrl()}${suffix}.webp`}
          sx={{ position: "absolute", width: "100%", height: "100%", objectFit: "contain" }}
          alt="Krooster - Arknights Roster"
        />
      </Box>
      {children}
    </Link>
  );
};
export default Logo;
