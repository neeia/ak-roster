import { MenuItem, TextField } from "@mui/material";
import { User } from "firebase/auth";
import { getDatabase, ref, set } from "firebase/database";
import React, { useCallback, useState } from "react";
import useLocalStorage from "../../util/useLocalStorage";
import { AccountInfo, servers } from "../../types/doctor";

interface Props {
  user: User;
}

const Onboard = ((props: Props) => {
  const { user } = props;
  const [doctor, setDoctor] = useLocalStorage<AccountInfo>("doctor", {});

  const db = getDatabase();

  const [onboard, _setOnboard] = useState<Date | undefined>(doctor.onboard);
  const setServer = useCallback((value: string) => {
    const d = { ...doctor };
    const date = value as unknown as Date;
    _setOnboard(date);
    d.onboard = date;
    setDoctor(d);
    set(ref(db, `users/${user.uid}/info/onboard/`), date);
  }, []);

  return (
    <TextField
      id="Onboarding Date"
      label="Onboarding Date"
      type="date"
      variant="filled"
      value={onboard}
      onChange={(e) => {
        setServer(e.target.value);
      }}
      sx={{ colorScheme: "dark" }}
      InputLabelProps={{ shrink: true }}
    />);
});

export default Onboard;