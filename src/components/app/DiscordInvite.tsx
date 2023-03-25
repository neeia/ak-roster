import React from "react";
import { Box, Button, Typography } from "@mui/material";
import Image from "next/image";


const DiscordInvite = () => {

  return (
    <Button
      sx={{
        boxShadow: 1,
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 1,
        textDecoration: "none",
        padding: "6px 8px",
        mb: 1,
        py: "4px"
      }}
      href="https://discord.gg/qx8hJGvTwc"
      component="a"
      title="Join Krooster"
      target="_blank"
      rel="noreferrer noopener"
    >
      <Image width="20px" height="20px" src="/img/ext/icon_clyde_white_RGB.svg" alt="Discord" loading="lazy" />
      <Typography variant="caption2" sx={{ textAlign: "center" }}>
        Join the Discord!
      </Typography>
    </Button>
  );
}
export default DiscordInvite;
