import { Box, InputAdornment, TextField } from "@mui/material";
import { User } from "firebase/auth";
import { getDatabase, ref, set } from "firebase/database";
import React, { useState } from "react";
import useLocalStorage from "../../util/useLocalStorage";
import { SocialInfo } from "../../types/social";
import { Reddit as RedditIcon } from "@mui/icons-material";

interface Props {
  user: User;
}

const Reddit = ((props: Props) => {
  const { user } = props;
  const [social, setSocial] = useLocalStorage<SocialInfo>("connections", {});

  const db = getDatabase();

  const [username, _setUsername] = useState<string>(social.reddit ?? "");
  const setUsername = (s: string) => {
    const d = { ...social };
    _setUsername(s);
    d.reddit = s;
    setSocial(d);
    set(ref(db, `users/${user.uid}/connections/reddit`), s);
  }

  return (
    <Box sx={{ display: "grid", gridTemplateColumns: "1fr auto" }}>
      <TextField
        id="Reddit Username"
        label="Reddit Username"
        value={username}
        onChange={(e) => {
          setUsername(e.target.value);
        }}
        sx={{
          "& .MuiFilledInput-root": {
            borderRadius: "2px",
          },
        }}
        variant="filled"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <RedditIcon />
            </InputAdornment>
          )
        }}
      />
    </Box>);
});

export default Reddit;