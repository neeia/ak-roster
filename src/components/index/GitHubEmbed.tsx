import React from "react";
import { Box, Link, Typography } from "@mui/material";
import manifest from "../../../public/manifest.json"
import { OpenInNew } from "@mui/icons-material";

const GITH_COLOR = "#50505a";
const repo = "https://github.com/neeia/ak-roster-next";
const cons = [
  {
    name: "Neia",
    login: "neeia",
    avatar: "/img/ext/neia.png",
    dark: true,
    color: "#4b444b"
  },
  {
    name: "Samidare☔️",
    login: "iansjk",
    avatar: "/img/ext/samidare.webp",
    dark: false,
    color: "#fff"
  }
];

const GitHubEmbed = (() => {

  return (
    <Box>
      <Link
        sx={{
          mt: 2,
          ":hover": {
            filter: "brightness(110%)"
          },
          boxShadow: 1,
          width: "max-content",
          color: "text.primary",
          display: "grid",
          gridTemplateColumns: "1fr 3fr auto",
          gap: 1.5,
          textDecoration: "none",
          padding: 1.5,
          borderRadius: "4px",
          backgroundColor: GITH_COLOR,
        }}
        component="a"
        title="Visit Repository"
        target="_blank"
        rel="noreferrer noopener"
      >
        <Box sx={{ borderRadius: "50%", width: "3rem", height: "3rem" }} component="img" src="/img/ext/gh-light.png" alt="GitHub" />
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0 }}>
          <Typography variant="body1" >
            AK Roster
            <Typography variant="caption2" pl="0.5rem">
              v{manifest.version}
            </Typography>
          </Typography>
          <Typography variant="caption2" >
            {repo.substring(19)}
          </Typography>
        </Box>
        <OpenInNew fontSize="small" />
      </Link>
      <Typography variant="h5" component="h3" sx={{ pt: 3, pb: 1 }}>
        Contributors:
      </Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
        {cons.map(c =>
          <Link
            key={c.name}
            sx={{
              ":hover": {
                filter: "brightness(110%)"
              },
              boxShadow: 1,
              width: "max-content",
              color: c.dark ? "text.primary" : "background.paper",
              display: "grid",
              gridTemplateColumns: "1fr 2.5fr",
              gap: 1.5,
              textDecoration: "none",
              padding: 1,
              borderRadius: "4px",
              backgroundColor: c.color,
            }}
            href={`https://github.com/${c.login}`}
            component="a"
            title="Visit GitHub Profile"
            target="_blank"
            rel="noreferrer noopener"
          >
            <Box sx={{ borderRadius: "50%", width: "48px", height: "48px" }} component="img" src={c.avatar} alt="" />
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0 }}>
              <Typography variant="body1" >
                {c.name}
              </Typography>
              <Typography variant="caption2" >
                {c.login}
              </Typography>
            </Box>
          </Link>
        )}
      </Box>
    </Box>
  );
});
export default GitHubEmbed;
