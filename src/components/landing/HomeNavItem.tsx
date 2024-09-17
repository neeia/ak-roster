import React from "react";
import Link, { LinkProps } from "components/base/Link";
import Box from "@mui/material/Box";
import { interactive } from "styles/theme/appTheme";

interface Props extends LinkProps {
  href: string;
  external?: boolean;
  icon?: React.ReactNode;
}

const HomeNavItem = ((props: Props) => {
  const { href, external, icon, children, sx, ...rest } = props;

  return (
    <Box component="li" display="flex">
      <Link href={href} sx={{
        ...interactive,
        backgroundColor: "background.light",
        display: "flex",
        alignItems: "center",
        gap: 1,
        px: 2,
        py: 1,
        borderRadius: 1,
        ...sx
      }} {...rest}>
        {icon}
        {children}
      </Link>
    </Box>
  );
});
export default HomeNavItem;
