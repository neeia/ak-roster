import { Checkbox, FormControlLabel } from "@mui/material";
import React, {useCallback, useState} from "react";
import {AccountData} from "../../types/auth/accountData";
import {useAccountPrivateSetMutation} from "../../store/extendAccount";
import {debounce} from "lodash";


interface Props {
  user: AccountData;
}

const UpdatePrivacy = ((props: Props) => {
  const { user } = props;
  const [setPrivate, ] = useAccountPrivateSetMutation();

  const [isPublic, _setPublic] = useState<boolean>(!user.private);

  const setPrivateDebounced = useCallback(debounce(setPrivate, 300), []);
  const setSecret = (value: boolean) => {
    _setPublic(value);
    setPrivateDebounced(!value);
  }

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