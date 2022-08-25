import { Box, InputAdornment, TextField } from "@mui/material";
import { User } from "firebase/auth";
import { getDatabase, ref, set } from "firebase/database";
import React, { useState } from "react";
import useLocalStorage from "../../util/useLocalStorage";
import { AccountInfo } from "../../types/doctor";

interface Props {
  user: User;
}

const FriendInput = ((props: Props) => {
  const { user } = props;
  const [doctor, setDoctor] = useLocalStorage<AccountInfo>("doctor", {});

  const db = getDatabase();

  const [friendUsername, _setFriendUsername] = useState<string>(doctor.friendCode?.username ?? "");
  const [friendTag, _setFriendTag] = useState<string>(doctor.friendCode?.tag?.toString() ?? "");
  const setFriendUsername = (s: string) => {
    const d = { ...doctor };
    _setFriendUsername(s);
    d.friendCode = { username: s, tag: friendTag };
    setDoctor(d);
    set(ref(db, `users/${user.uid}/info/friendCode/username`), s);
  }
  const setFriendTag = (s: string) => {
    const ns = s.replace(/\D/g, "");
    const d = { ...doctor };
    _setFriendTag(ns);
    d.friendCode = { username: friendUsername, tag: ns };
    setDoctor(d);
    set(ref(db, `users/${user.uid}/info/friendCode/tag`), ns);
  }

  return (
    <Box sx={{ display: "grid", gridTemplateColumns: "1fr auto" }}>
      <TextField
        id="Friend Code"
        label="Friend Code"
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
      />
      <TextField
        id="Tag"
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

export default FriendInput;