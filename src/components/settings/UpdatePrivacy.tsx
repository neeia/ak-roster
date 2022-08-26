import { Checkbox, FormControlLabel } from "@mui/material";
import { User } from "firebase/auth";
import { getDatabase, ref, remove, set } from "firebase/database";
import React, { useCallback, useState } from "react";
import { AccountInfo } from "../../types/doctor";
import useLocalStorage from "../../util/useLocalStorage";


interface Props {
  user: User;
}

const UpdatePrivacy = ((props: Props) => {
  const { user } = props;
  const db = getDatabase();
  const [doctor, setDoctor] = useLocalStorage<AccountInfo>("doctor", {});

  const [isPublic, _setPublic] = useState<boolean>(!doctor.private);
  const setSecret = (value: boolean) => {
    const d = { ...doctor };
    _setPublic(value);
    d.private = !value;
    setDoctor(d);
    if (value) {
      remove(ref(db, `users/${user.uid}/info/private/`));
    } else {
      set(ref(db, `users/${user.uid}/info/private/`), value);
    }
  }
  console.log(doctor.private);
  console.log(!doctor.private);
  console.log(isPublic);

  return (
    <FormControlLabel
      control={<Checkbox
        size="small"
        checked={isPublic}
        onChange={(e) => setSecret(e.target.checked)}
        sx={{ mr: 1.5 }}
      />}
      label="Public"
      labelPlacement="start"
    />);
});

export default UpdatePrivacy;