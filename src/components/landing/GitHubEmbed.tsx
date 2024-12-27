import React from "react";
import { Box, Link, Typography } from "@mui/material";
import { OpenInNew } from "@mui/icons-material";
import manifest from "data/manifest";

const GITH_COLOR = "#50505A";
const repo = "https://github.com/neeia/ak-roster-next";
const GitHubEmbed = () => {
  return (
    <Box>
      <Link
        sx={{
          mt: 2,
          ":hover": {
            filter: "brightness(110%)",
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
        <Box
          sx={{ borderRadius: "50%", width: "3rem", height: "3rem" }}
          component="img"
          src="/img/ext/gh-light.png"
          alt="GitHub"
        />
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0 }}>
          <Typography variant="body1">
            AK Roster
            <Typography variant="caption2" pl="0.5rem">
              v{manifest.version}
            </Typography>
          </Typography>
          <Typography variant="caption2">{repo.substring(19)}</Typography>
        </Box>
        <OpenInNew fontSize="small" />
      </Link>
    </Box>
  );
};
export default GitHubEmbed;
