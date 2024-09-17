import React from "react";
import { Link, LinkProps as MuiLinkProps } from "@mui/material";

export interface LinkProps extends MuiLinkProps {
  component?: string;
}
const JumpTo = (props: LinkProps) => {
  const { href, children, ...rest } = props;

  return (
    <Link onClick={(e) => {
      e.preventDefault();
      if (href) document.getElementById(href)?.focus();
    }} sx={{
      position: "absolute",
      top: 8,
      left: 8,
      opacity: 0,
      pointerEvents: "none",
      userSelect: "none",
      "&:focus": {
        opacity: 0.9,
        pointerEvents: "auto",
      }
    }} {...rest}>
      {children}
    </Link>
  );
}
export default JumpTo;
