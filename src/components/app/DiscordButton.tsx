import React from "react";
import { ButtonBase } from "@mui/material";
import { DISCORD_BLURPLE } from "styles/theme/appTheme";
import Image from "components/base/Image";
import imageBase from "util/imageBase";

interface DiscordButtonProps {
  onClick: React.MouseEventHandler;
  children: React.ReactNode;
}
const DiscordButton = (props: DiscordButtonProps) => {
  const {onClick, children} = props;

  return (
    <ButtonBase
      sx={{
        width: "100%",
        fontSize: "1rem",
        backgroundColor: DISCORD_BLURPLE,
        display: "flex",
        gap: 1,
        p: 2,
        borderRadius: 1,
        transition: "filter 0.1s",
        ":hover": { filter: "brightness(110%)" },
      }}
      onClick={onClick}
    >
      <Image src={`${imageBase}/assets/icons/discord.svg`} sx={{ width: "20px", height: "15px" }} alt="" />
      {children}
    </ButtonBase>
  );
};
export default DiscordButton;