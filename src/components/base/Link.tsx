import React, { forwardRef } from "react";
import { Link as MuiLink, LinkProps as MuiLinkProps } from "@mui/material";
import NextLink from "next/link";

export interface LinkProps extends MuiLinkProps {
  href: string;
  disabled?: boolean;
  external?: boolean;
}
const Link = forwardRef<HTMLAnchorElement, LinkProps>((props: LinkProps, ref) => {
  const { href, disabled, external, children, ...rest } = props;

  if (external) {
    return (
      <MuiLink
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        target="_blank"
        rel="noreferrer noopener"
        {...rest}
      >
        {children}
      </MuiLink>
    );
  } else {
    return (
      <NextLink href={href} passHref legacyBehavior>
        <MuiLink ref={ref} aria-disabled={disabled} tabIndex={disabled ? -1 : 0} {...rest}>
          {children}
        </MuiLink>
      </NextLink>
    );
  }
});
Link.displayName = "Link";
export default Link;
