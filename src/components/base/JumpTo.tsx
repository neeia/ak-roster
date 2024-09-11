import React from "react";
import { Link, LinkProps as MuiLinkProps } from "@mui/material";

export interface LinkProps extends MuiLinkProps {
  target: string;
}
const JumpTo = (props: LinkProps) => {
  const { target, children } = props;

    return (
      <Link href={target} onClick={(e) => {
        e.preventDefault();
        document.getElementById(target)?.focus();
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
      }}>
        {children}
      </Link>
    );
}
export default JumpTo;
