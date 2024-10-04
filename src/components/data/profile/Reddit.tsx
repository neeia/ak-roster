import { Box, InputAdornment, TextField } from "@mui/material";
import { User } from "firebase/auth";
import { getDatabase, ref, set } from "firebase/database";
import React, { useCallback, useState } from "react";
import useLocalStorage from "../../util/useLocalStorage";
import { SocialInfo } from "../../types/social";
import { Reddit as RedditIcon } from "@mui/icons-material";
import { AccountData } from "../../types/auth/accountData";
import {
  useDiscordSetMutation,
  useRedditSetMutation,
} from "../../store/extendAccount";
import { debounce } from "lodash";

interface Props {
  user: AccountData;
}

const Reddit = (props: Props) => {
  const { user } = props;

  const [redditUsername, _setRedditUsername] = useState<string>(
    user.reddituser ?? ""
  );
  const [setRedditTrigger] = useRedditSetMutation();
  const setUsername = (s: string) => {
    _setRedditUsername(s);
    setRedditDebounced(s);
  };

  const setRedditDebounced = useCallback(
    debounce((username) => setRedditTrigger(username), 300),
    []
  );

  return (
    <Box sx={{ display: "grid", gridTemplateColumns: "1fr auto" }}>
      <TextField
        id="Reddit Username"
        label="Reddit Username"
        value={redditUsername}
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
          ),
        }}
      />
    </Box>
  );
};

export default Reddit;
