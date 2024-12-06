import { TextField } from "@mui/material";
import React, { useCallback, useState } from "react";
import AccountData from "types/auth/accountData";
import { debounce } from "lodash";
import useAccount from "../../../util/hooks/useAccount";

interface Props {
  user: AccountData;
}

const Onboard = (props: Props) => {
  const { user } = props;

  const [onboard, _setOnboard] = useState<string>(user.onboard ?? "");
    const [_, setAccount] = useAccount();

  const setOnboard = (value: string) => {
    _setOnboard(value);
    if (value) {
      setOnboardDebounced(value);
    }
  };

  const setOnboardDebounced = useCallback(
    debounce(
      (date) =>
        setAccount({
          user_id: user.user_id,
          private: user.private,
          onboard: date,
        }),
      500
    ),
    []
  );

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
    />
  );
};

export default Onboard;
