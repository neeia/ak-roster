import React, { useEffect, useState } from "react";
import { Box, Divider, Link, Typography } from "@mui/material";
import { getLogoUrl } from "components/app/Logo";
import Image from "components/base/Image";
import imageBase from "util/imageBase";

const DISC_BLURPLE = "#5865F2";
const DISC_API = "https://discord.com/api/v10/guilds/970485224624508979/widget.json";

interface Props {}

const DiscordEmbed = (props: Props) => {
  const [name, setName] = useState<string>("Krooster");
  const [users, setUsers] = useState<number>(0);
  useEffect(() => {
    fetch(DISC_API)
      .then((response) => response.json())
      .then((data) => {
        setName(data.name);
        setUsers(parseInt(data.presence_count));
      });
  }, []);

  return (
    <Link
      sx={{
        mt: 2,
        ":hover": {
          filter: "brightness(110%)",
        },
        boxShadow: 1,
        width: "max-content",
        color: "text.primary",
        display: "flex",
        gap: 1,
        textDecoration: "none",
        padding: 1.5,
        borderRadius: "4px",
        backgroundColor: DISC_BLURPLE,
      }}
      href="https://discord.gg/qx8hJGvTwc"
      component="a"
      title="Join Krooster"
      target="_blank"
      rel="noreferrer noopener"
    >
      <Box
        sx={{ width: "4rem", height: "4rem", my: -1 }}
        component="img"
        src={`${imageBase}/title/${getLogoUrl()}-c.png`}
        alt=""
        loading="lazy"
      />
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0 }}>
        <Typography variant="body1">{name}</Typography>
        <Typography variant="caption">{users} online</Typography>
      </Box>
      <Divider orientation="vertical" flexItem />
      <Image
        sx={{ borderRadius: "50%", width: "3rem", height: "3rem", objectFit: "contain" }}
        src={`${imageBase}/assets/icons/discord.svg`}
        width="48"
        height="48"
        alt="Discord"
      />
    </Link>
  );
};
export default DiscordEmbed;
