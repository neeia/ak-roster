import React from "react";
import { Box, Link, LinkProps } from "@mui/material";

interface Props extends LinkProps {
  backgroundColor: string;
}

const HomeNavItemExt = ((props: Props) => {
  const { children, backgroundColor, ...rest } = props;

  return (
    <Box component="li" sx={{
      display: "flex"
    }}>
      <Link
        {...rest}
        sx={{
          display: "flex",
          gap: "4px",
          backgroundColor,
          borderRadius: "4px",
          p: "6px 10px 6px 8px",
          boxSizing: "border-box",
          ":hover": {
            filter: "brightness(1.2)",
          },
        }}
      >
        {children}
      </Link>
    </Box>
  );
});
export default HomeNavItemExt;
