import React, { useEffect } from "react";
import { Box, Button, Link, Typography } from "@mui/material";
import Image from "next/image";
import NextLink from "next/link";

const monthToVariant: Record<number, string> = {
  12: "winter",
  1: "winter",
  5: "celebration",
  6: "celebration",
}

interface Props {
  size: number;
  variant?: "celebration" | "standard" | "winter";
  subtitle?: boolean;
  horizontal?: boolean;
}
const Logo = (props: Props) => {
  const { size, variant, subtitle, horizontal } = props;
  const date = new Date();

  return (
    <NextLink href="/" passHref legacyBehavior>
      <Link
        sx={{
          display: "flex",
          flexDirection: horizontal ? "row" : "column",
          width: "fit-content",
          height: "fit-content",
          alignItems: "center",
          justifyItems: "center",
          fontSize: size,
          textDecoration: "none",
          color: "#EFEFEF",
          lineHeight: 1.1,
          textShadow: [...Array(8)].map(() => "0px 0px 1px #212121").join(", ")
        }}
        title="Home"
      >
        <Box component="img"
          src={`/res/title/${variant ?? monthToVariant[date.getMonth() + 1] ?? "standard"}.png`}
          alt=""
          sx={{
            width: "11.5em",
            height: "12.5em",
          }}
        />
        <Box sx={{
          marginTop: horizontal ? "" : "-3em",
          marginLeft: horizontal ? "-1em" : "",
          fontSize:  horizontal ? "1.33em" : "1em"
        }}>
          <Box sx={{
            fontSize: "3em",
            fontWeight: 400,
            textTransform: "lowercase",
            height: "min-content",
          }}>
            Krooster
          </Box>
          {subtitle &&
            <Box sx={{
              fontSize: "1.05em",
              letterSpacing: 1,
              fontWeight: 700,
              textTransform: "uppercase",
            }}>
              Arknights Roster
            </Box>
          }
        </Box>
      </Link>
    </NextLink>
  );
}
export default Logo;
