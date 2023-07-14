import { TextField } from "@mui/material";
import { User } from "firebase/auth";
import { getDatabase, ref, set } from "firebase/database";
import React, { useCallback, useState } from "react";
import useLocalStorage from "../../util/useLocalStorage";
import { AccountInfo } from "../../types/doctor";
import {AccountData} from "../../types/auth/accountData";
import {debounce} from "lodash";
import {useLevelSetMutation, useOnboardSetMutation} from "../../store/extendAccount";

interface Props {
  user: AccountData;
}

const Onboard = ((props: Props) => {
  const { user } = props;

  const [onboard, _setOnboard] = useState<string>(user.onboard ?? "");
  const [setOnboardTrigger] = useOnboardSetMutation();

  const setOnboard = (value: string) => {
    _setOnboard(value);
    setOnboardDebounced(value);
  };

  const setOnboardDebounced = useCallback(debounce((date) => setOnboardTrigger(date),300), []);

  return (
    <TextField
      id="Onboarding Date"
      label="Onboarding Date"
      type="date"
      variant="filled"
      value={onboard}
      onChange={(e) => {
        setOnboard(e.target.value);
      }}
      sx={{ colorScheme: "dark" }}
      InputLabelProps={{ shrink: true }}
    />);
});

export default Onboard;