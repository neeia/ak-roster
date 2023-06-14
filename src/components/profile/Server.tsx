import { MenuItem, TextField } from "@mui/material";
import { User } from "firebase/auth";
import { getDatabase, ref, set } from "firebase/database";
import React, { useState } from "react";
import useLocalStorage from "util/useLocalStorage";
import { AccountInfo, servers } from "types/doctor";
import {AccountData} from "../../types/auth/accountData";
import {useFriendCodeSetMutation, useServerSetMutation} from "../../store/extendAccount";

interface Props {
  user: AccountData;
}

const Server = ((props: Props) => {
  const { user } = props;

  const [server, _setServer] = useState<string>(user.server ?? "");

  const [setServerTrigger] = useServerSetMutation();

  const setServer = (value: string) => {
    _setServer(value);
    setServerTrigger(value);
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
    </TextField>);
});

export default Server;