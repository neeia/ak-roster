import { InputAdornment, TextField } from "@mui/material";
import React, { useState } from "react";
import { debounce } from "lodash";
import { AccountMutateProps } from "pages/data/profile";
import Image from "next/image";

const Discord = (props: AccountMutateProps) => {
  const { user, setAccount } = props;

  const [discordUsername, _setDiscordUsername] = useState<string>(user.discordcode ?? "");

  const setDiscordUsername = (s: string) => {
    _setDiscordUsername(s);
    setDiscordDebounced(s);
  };

  const setDiscordDebounced = debounce(
    (username) =>
      setAccount({
        user_id: user.user_id,
        discordcode: username,
      }),
    500
  );

  return (
    <TextField
      label="Discord"
      value={discordUsername}
      onChange={(e) => setDiscordUsername(e.target.value)}
      variant="filled"
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <Image src="/img/assets/discord.svg" width="20" height="15" alt="" />
            </InputAdornment>
          ),
        },
      }}
    />
  );
};

export default Discord;
