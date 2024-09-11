import { TextField } from "@mui/material";
import { User } from "firebase/auth";
import { getDatabase, ref, remove, set } from "firebase/database";
import React, { useCallback, useState } from "react";
import useLocalStorage from "../../util/useLocalStorage";
import { AccountInfo } from "../../types/doctor";
import {AccountData} from "../../types/auth/accountData";
import {debounce} from "lodash";
import {useFriendCodeSetMutation, useLevelSetMutation} from "../../store/extendAccount";

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
  user: AccountData;
}

const Level = ((props: Props) => {
  const { user } = props;

  const [level, _setLevel] = useState<string>(user.level?.toString() ?? "");
  const [setLevelTrigger] = useLevelSetMutation();
  const setLevel = (value: string) => {
    _setLevel(value);
    setLevelDebounced(value);
  };

  const setLevelDebounced = useCallback(debounce((newLevel) => setLevelTrigger(newLevel),300), []);

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