import { InputAdornment, TextField } from "@mui/material";
import React, { useCallback, useState } from "react";
import { debounce } from "lodash";
import { AccountMutateProps } from "pages/data/profile";
import { Reddit as RedditIcon } from "@mui/icons-material";

const Reddit = (props: AccountMutateProps) => {
  const { user, setAccount } = props;

  const [redditUsername, _setRedditUsername] = useState<string>(user.reddituser ?? "");

  const setRedditUsername = (s: string) => {
    _setRedditUsername(s);
    setRedditDebounced(s);
  };

  const setRedditDebounced = useCallback(
    debounce(
      (username) =>
        setAccount({
          user_id: user.user_id,
          reddituser: username,
        }),
      500
    ),
    []
  );

  return (
    <TextField
      label="Reddit"
      value={redditUsername}
      onChange={(e) => setRedditUsername(e.target.value)}
      variant="filled"
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <RedditIcon></RedditIcon>
            </InputAdornment>
          ),
        },
      }}
    />
  );
};

export default Reddit;
