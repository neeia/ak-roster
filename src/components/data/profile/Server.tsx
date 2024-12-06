import { MenuItem, TextField } from "@mui/material";
import React, { useState } from "react";
import { servers } from "types/doctor";
import AccountData from "types/auth/accountData";
import useAccount from "../../../util/hooks/useAccount";

interface Props {
  user: AccountData;
}

const Server = (props: Props) => {
  const { user } = props;

  const [server, _setServer] = useState<string>(user.server ?? "");

  const [_, setAccount] = useAccount();

  const setServer = (value: string) => {
    _setServer(value);
    setAccount({
      user_id: user.user_id,
      server: value,
      private: user.private,
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
