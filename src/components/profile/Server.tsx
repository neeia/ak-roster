import { MenuItem, TextField } from "@mui/material";
import { User } from "firebase/auth";
import { getDatabase, ref, set } from "firebase/database";
import React, { useCallback, useState } from "react";
import useLocalStorage from "../../util/useLocalStorage";
import { AccountInfo, servers } from "../../types/doctor";

interface Props {
  user: User;
}

const Server = ((props: Props) => {
  const { user } = props;
  const [doctor, setDoctor] = useLocalStorage<AccountInfo>("doctor", {});

  const db = getDatabase();

  const [server, _setServer] = useState<string>(doctor.server ?? "");
  const setServer = useCallback((value: string) => {
    const d = { ...doctor };
    _setServer(value);
    d.server = value;
    setDoctor(d);
    set(ref(db, `users/${user.uid}/info/server/`), value);
  }, []);

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