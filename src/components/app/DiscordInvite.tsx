import React from "react";
import { Box, Button, Typography, useMediaQuery, useTheme } from "@mui/material";


const DiscordInvite = () => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [open, setOpen] = React.useState(false);
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
      }}
      href="https://discord.gg/qx8hJGvTwc"
      component="a"
      title="Join Krooster"
      target="_blank"
      rel="noreferrer noopener"
    >
      <Box sx={{ borderRadius: "50%", width: "1.25rem", height: "1.25rem" }} component="img" src="/img/ext/icon_clyde_white_RGB.svg" alt="Discord" loading="lazy" />
      <Typography variant="caption2" sx={{ textAlign: "center" }}>
        Join the Discord!
      </Typography>
    </Button>
  );
}
export default DiscordInvite;
