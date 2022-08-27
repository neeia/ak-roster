import { TextField } from "@mui/material";
import { User } from "firebase/auth";
import { getDatabase, ref, remove, set } from "firebase/database";
import React, { useCallback, useState } from "react";
import useLocalStorage from "../../util/useLocalStorage";
import { AccountInfo } from "../../types/doctor";

function parse(n: string, min?: number, max?: number): string {
  if (parseInt(n)) {
    const num = parseInt(n);
    return Math.max(Math.min(num, max ?? num), min ?? num).toString();
  }
  else {
    return "";
  }
};

interface Props {
  user: User;
}

const Level = ((props: Props) => {
  const { user } = props;
  const [doctor, setDoctor] = useLocalStorage<AccountInfo>("doctor", {});

  const db = getDatabase();

  const [level, _setLevel] = useState<string>(doctor.level?.toString() ?? "");
  const setLevel = (value: string) => {
    const d = { ...doctor };
    _setLevel(value);
    if (value === "") {
      delete d.level
      setDoctor(d);
      remove(ref(db, `users/${user.uid}/info/level/`));
    } else {
      const l = parseInt(value);
      d.level = l;
      setDoctor(d);
      set(ref(db, `users/${user.uid}/info/level/`), l);
    }
  };

  return (
    <TextField
      id="Level"
      label="Level"
      variant="filled"
      value={level}
      onChange={(e) => {
        setLevel(parse(e.target.value, 1, 120));
      }}
      sx={{
        width: "6rem",
      }}
      inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
    />);
});

export default Level;