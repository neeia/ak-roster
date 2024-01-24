import React, { useEffect, useState } from "react";
import NextLink from "next/link";
import { Box, BoxProps, Link } from "@mui/material";

interface Props extends BoxProps {
  icon?: React.ReactNode;
  href: string;
}

const HomeNavItem = ((props: Props) => {
  const { children, icon, href, ...rest } = props;

  return (
    <Box component="li" sx={{
      display: "flex"
    }}>
      <NextLink href={href} passHref legacyBehavior>
        <Link sx={{
          display: "flex",
          alignItems: "center",
          gap: "4px",
          color: "#fff",
          textDecoration: "none",
          p: "4px",
          border: "1px solid #212121",
          background: "#212121",
          borderRadius: 2,
        }}>
          {icon}
          {children}
        </Link>
      </NextLink>
    </Box>
  );
});
export default HomeNavItem;
