import { TextField } from "@mui/material";
import React, { useState } from "react";
import { debounce } from "lodash";
import { AccountMutateProps } from "pages/data/profile";

const Onboard = (props: AccountMutateProps) => {
  const { user, setAccount } = props;

  const [onboard, _setOnboard] = useState<string>(user.onboard ?? "");

  const setOnboard = (value: string) => {
    _setOnboard(value);
    if (value) {
      setOnboardDebounced(value);
    }
  };

  const setOnboardDebounced = debounce(
    (date) =>
      setAccount({
        user_id: user.user_id,
        private: user.private,
        onboard: date,
      }),
    500
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
