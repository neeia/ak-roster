import { Box, InputAdornment, TextField } from "@mui/material";
import { User } from "firebase/auth";
import { getDatabase, ref, set } from "firebase/database";
import React, {useCallback, useState} from "react";
import useLocalStorage from "../../util/useLocalStorage";
import { AccountInfo } from "../../types/doctor";
import {AccountData} from "../../types/auth/accountData";
import {Json} from "../../types/supabase";
import {useFriendCodeSetMutation} from "../../store/extendAccount";
import {debounce} from "lodash";

interface Props {
  user: AccountData;
}

const FriendID = ((props: Props) => {
  const { user } = props;

  const [friendUsername, _setFriendUsername] = useState<string>(((user.friendcode as { [key: string]: Json })?.username as string) ?? "");
  const [friendTag, _setFriendTag] = useState<string>(((user.friendcode as { [key: string]: Json })?.tag as string) ?? "");

  const [setFriendCode] = useFriendCodeSetMutation();

  const setFriendUsername = (s: string) => {
    _setFriendUsername(s);
    setFriendCodeDebounced(friendUsername, friendTag);
  }
  const setFriendTag = (s: string) => {
    const ns = s.replace(/\D/g, "");
    _setFriendTag(ns);
    setFriendCodeDebounced(friendUsername, friendTag);
  }

  const setFriendCodeDebounced = useCallback(debounce((username, tag) => {
    const friendCode = {username: username, tag: tag};
    setFriendCode(friendCode);},
    300), []);

  return (
    <Box sx={{ display: "grid", gridTemplateColumns: "1fr auto" }}>
      <TextField
        id="Friend Code"
        label="Friend Code"
        value={friendUsername}
        onChange={(e) => {
          const split = e.target.value.split("#")
          setFriendUsername(split[0]);
          if (split[1]) setFriendTag(split[1])
          if (split.length > 1 && document) {
            document.getElementById("Tag")?.focus();
          }
        }}
        sx={{
          "& .MuiFilledInput-root": {
            borderRadius: "2px 0px 0px 2px",
          },
        }}
        variant="filled"
      />
      <TextField
        id="Tag"
        label="Tag"
        value={friendTag}
        onChange={(e) => {
          setFriendTag(e.target.value);
        }}
        variant="filled"
        sx={{
          width: "6rem",
          "& .MuiFilledInput-root": {
            borderRadius: "0px 2px 2px 0px",
          },
        }}
        inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              #
            </InputAdornment>
          )
        }}
      />
    </Box>);
});

export default FriendID;