import { Box, InputAdornment, TextField } from "@mui/material";
import React, { useCallback, useState } from "react";
import { Json } from "types/supabase";
import { debounce } from "lodash";
import { AccountMutateProps } from "pages/data/profile";

const FriendID = (props: AccountMutateProps) => {
  const { user, setAccount } = props;

  const [friendUsername, _setFriendUsername] = useState<string>(
    ((user.friendcode as { [key: string]: Json })?.username as string) ?? ""
  );
  const [friendTag, _setFriendTag] = useState<string>(
    ((user.friendcode as { [key: string]: Json })?.tag as string) ?? ""
  );

  const setFriendUsername = (s: string) => {
    _setFriendUsername(s);
    setFriendCodeDebounced(s, friendTag);
  };
  const setFriendTag = (s: string) => {
    const ns = s.replace(/\D/g, "");
    _setFriendTag(ns);
    setFriendCodeDebounced(friendUsername, ns);
  };

  const setFriendCodeDebounced = useCallback(
    debounce((username, tag) => {
      const friendCode = { username: username, tag: tag };
      setAccount({
        user_id: user.user_id,
        friendcode: friendCode,
      });
    }, 500),
    []
  );

  return (
    <Box sx={{ display: "grid", gridTemplateColumns: "1fr auto" }}>
      <TextField
        id="Friend Code"
        label="Friend Code"
        value={friendUsername}
        onChange={(e) => {
          const split = e.target.value.split("#");
          setFriendUsername(split[0]);
          if (split[1]) setFriendTag(split[1]);
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
        slotProps={{
          htmlInput: {
            inputMode: "numeric",
            pattern: "[0-9]*",
          },
          input: {
            startAdornment: <InputAdornment position="start">#</InputAdornment>,
          },
        }}
      />
    </Box>
  );
};

export default FriendID;
