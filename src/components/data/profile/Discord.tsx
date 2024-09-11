import { Box, InputAdornment, TextField } from "@mui/material";
import { User } from "firebase/auth";
import { getDatabase, ref, set } from "firebase/database";
import React, {useCallback, useState} from "react";
import useLocalStorage from "../../util/useLocalStorage";
import { SocialInfo } from "../../types/social";
import {AccountData} from "../../types/auth/accountData";
import {useDiscordSetMutation, useOnboardSetMutation} from "../../store/extendAccount";
import {debounce} from "lodash";

interface Props {
  user: AccountData;
}

const Discord = ((props: Props) => {
  const { user } = props;

  const [discordUsername, _setDiscordUsername] = useState<string>(user.discordcode ?? "");
  const [setDiscordTrigger] = useDiscordSetMutation();

  const setDiscordUsername = (s: string) => {
    _setDiscordUsername(s);
    setDiscordDebounced(s);
  }

  const setDiscordDebounced = useCallback(debounce((username) => setDiscordTrigger(username),300), []);


  return (
    <Box sx={{ display: "grid", gridTemplateColumns: "1fr auto" }}>
      <TextField
        id="Discord Username"
        label="Discord Username"
        value={discordUsername}
        onChange={(e) => {
          const username = e.target.value
          setDiscordUsername(username);
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
    </Box>);
});

export default Discord;