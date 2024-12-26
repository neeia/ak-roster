import { Checkbox, FormControlLabel } from "@mui/material";
import React, { useCallback, useState } from "react";
import { debounce } from "lodash";
import AccountData from "types/auth/accountData";
import supabase from "supabase/supabaseClient";

interface Props {
  user: AccountData;
}

const UpdatePrivacy = (props: Props) => {
  const { user } = props;

  const [isPublic, _setPublic] = useState<boolean>(!user.private);

  const setPrivate = useCallback(
    (value: boolean) => {
      supabase.from("krooster_accounts").update({ private: value }).eq("id", user.user_id);
    },
    [isPublic, user]
  );

  const setPrivateDebounced = useCallback(debounce(setPrivate, 300), []);
  const setSecret = (value: boolean) => {
    _setPublic(value);
    setPrivateDebounced(!value);
  };

  return (
    <FormControlLabel
      control={
        <Checkbox size="small" checked={isPublic} onChange={(e) => setSecret(e.target.checked)} sx={{ mr: 1.5 }} />
      }
      label="Public"
      labelPlacement="start"
    />
  );
};

export default UpdatePrivacy;
