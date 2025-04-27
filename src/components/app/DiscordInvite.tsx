import React from "react";
import { Link } from "@mui/material";
import { DISCORD_BLURPLE } from "styles/theme/appTheme";
import Image from "components/base/Image";
import imageBase from "util/imageBase";

const DiscordInvite = () => {
  return (
    <Link
      sx={{
        backgroundColor: DISCORD_BLURPLE,
        borderRadius: 1,
        mx: 2,
        transition: "filter 0.1s",
        ":hover": { filter: "brightness(110%)" },
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        lineHeight: 0,
        gap: 1,
        textDecoration: "none",
        padding: "12px 12px",
        color: "#FAFAFA",
      }}
      href="https://discord.gg/qx8hJGvTwc"
      title="Join Krooster"
      target="_blank"
      rel="noreferrer noopener"
    >
      <Image src={`${imageBase}/assets/icons/discord.svg`} sx={{width: "20px", height: "15px"}} alt="" />
      Join our Discord!
    </Link>
  );
};
export default DiscordInvite;
