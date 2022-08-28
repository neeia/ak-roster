import { Box, InputAdornment, TextField } from "@mui/material";
import { User } from "firebase/auth";
import { getDatabase, ref, set } from "firebase/database";
import React, { useState } from "react";
import useLocalStorage from "../../util/useLocalStorage";
import { SocialInfo } from "../../types/social";

interface Props {
  user: User;
}

const Discord = ((props: Props) => {
  const { user } = props;
  const [social, setSocial] = useLocalStorage<SocialInfo>("connections", {});

  const db = getDatabase();

  const [friendUsername, _setFriendUsername] = useState<string>(social.discord?.username ?? "");
  const [friendTag, _setFriendTag] = useState<string>(social.discord?.tag?.toString() ?? "");
  const setFriendUsername = (s: string) => {
    const d = { ...social };
    _setFriendUsername(s);
    d.discord = { username: s, tag: friendTag };
    setSocial(d);
    set(ref(db, `users/${user.uid}/connections/discord/username`), s);
  }
  const setFriendTag = (s: string) => {
    const ns = s.replace(/\D/g, "");
    const d = { ...social };
    _setFriendTag(ns);
    d.discord = { username: friendUsername, tag: ns };
    setSocial(d);
    set(ref(db, `users/${user.uid}/connections/discord/tag`), ns);
  }

  return (
    <Box sx={{ display: "grid", gridTemplateColumns: "1fr auto" }}>
      <TextField
        id="Discord Username"
        label="Discord Username"
        value={friendUsername}
        onChange={(e) => {
          const split = e.target.value.split("#")
          setFriendUsername(split[0]);
          if (split[1]) setFriendTag(split[1])
          if (split.length > 1 && document) {
            document.getElementById("Tag")?.focus();
          }
        }}
        sx={{
          "& .MuiFilledInput-root": {
            borderRadius: "2px 0px 0px 2px",
          },
        }}
        variant="filled"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <svg width="1.5rem" height="1.5rem">
                <image xlinkHref="/img/ext/icon_clyde_white_RGB.svg" width="1.5rem" height="1.5rem" />
              </svg>
            </InputAdornment>
          )
        }}
      />
      <TextField
        id="Discord Tag"
        label="Tag"
        value={friendTag}
        onChange={(e) => {
          setFriendTag(e.target.value);
        }}
        variant="filled"
        sx={{
          width: "6rem",
          "& .MuiFilledInput-root": {
            borderRadius: "0px 2px 2px 0px",
          },
        }}
        inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              #
            </InputAdornment>
          )
        }}
      />
    </Box>);
});

export default Discord;