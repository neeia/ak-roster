import { MenuItem, TextField } from "@mui/material";
import React, { useState } from "react";
import { servers } from "types/doctor";
import useAccount from "util/hooks/useAccount";
import { AccountMutateProps } from "pages/data/profile";

const Server = (props: AccountMutateProps) => {
  const { user, setAccount } = props;

  const [server, _setServer] = useState<string>(user.server ?? "");

  const setServer = (value: string) => {
    _setServer(value);
    setAccount({
      user_id: user.user_id,
      server: value,
    });
  };

  return (
    <TextField
      id="Select Server"
      label="Server"
      variant="filled"
      select
      value={server}
      onChange={(e) => setServer(e.target.value)}
      sx={{ width: "6rem" }}
    >
      {servers.map((s) => (
        <MenuItem key={s} value={s}>
          {s}
        </MenuItem>
      ))}
    </TextField>
  );
};

export default Server;
