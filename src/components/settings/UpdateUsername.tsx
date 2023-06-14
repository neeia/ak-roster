import { ContentPasteOutlined, InventoryOutlined } from "@mui/icons-material";
import { Box, Button, IconButton, InputAdornment, TextField, Typography } from "@mui/material";
import React, { useState } from "react";
import UpdatePrivacy from "./UpdatePrivacy";
import {AccountData} from "../../types/auth/accountData";
import { useDisplayNameSetMutation } from "../../store/extendAccount";
import supabaseClient from "../../util/supabaseClient";

function isAlphaNumeric(str: string) {
  var code, i, len;

  for (i = 0, len = str.length; i < len; i++) {
    code = str.charCodeAt(i);
    if (!(code > 47 && code < 58) && // numeric (0-9)
      !(code > 64 && code < 91) && // upper alpha (A-Z)
      !(code > 96 && code < 123) && // lower alpha (a-z)
      !(code == 32)) { // space
      return false;
    }
  }
  return true;
};

interface Props {
  user: AccountData;
}

const UpdateUsername = ((props: Props) => {
  const { user } = props;

  const [newDisplayName, setNewDisplayName] = useState<string>("");
  const [errorUsername, setErrorUsername] = useState<string>("");
  const [copyLink, setCopiedLink] = useState<boolean>(false);

  const [setDisplayName, result] = useDisplayNameSetMutation();
  async function tryUsername() {

    let usernameAvailable = false;
    if (!newDisplayName) {
      setErrorUsername("No username found.");
      return;
    }
    if (!isAlphaNumeric(newDisplayName)) {
      setErrorUsername("Use only [a-z], [0-9].");
      return;
    }
    if (newDisplayName.length > 24) {
      setErrorUsername("Use a maximum of 24 characters.");
      return;
    }

    setErrorUsername("Checking...");

    if (newDisplayName.toLowerCase() === user.display_name?.toLowerCase()) {
      usernameAvailable = true
    }
    else
    {
      const username = newDisplayName.toLowerCase().replace(/\s/g, "");
      const {count, error} = await supabaseClient
        .from("krooster_accounts")
        .select('*', { count: "exact", head: true })
        .ilike("username", username);
      usernameAvailable = count == 0;
    }

    if (!usernameAvailable)
    {
      setErrorUsername("That username is taken.")
    }
    else
    {
      setErrorUsername("Saving...");
      setDisplayName(newDisplayName);
      if (result.isError)
      {
        setErrorUsername("An unexpected error occurred.");
        return;
      }
        setErrorUsername("Saved.");
    }
  };

  return (
    <>
      Update Username
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <TextField
          label="Current Username"
          value={user.display_name ?? "No Username Set"}
          variant="standard"
          disabled
        />
        <UpdatePrivacy user={user} />
      </Box>
      <TextField
        label="Share Link"
        value={user.username ? `https://www.krooster.com/u/${user.username}` : "---"}
        variant="standard"
        disabled
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Typography id="copy-label">
                {copyLink ? "Copied!" : "Copy"}
              </Typography>
              <IconButton
                aria-labelledby="copy-label"
                onClick={() => { setCopiedLink(true); navigator.clipboard.writeText(`https://krooster.com/u/${user.display_name}`); }}
              >
                {copyLink
                  ? <InventoryOutlined height="1rem" />
                  : <ContentPasteOutlined height="1rem" />
                }
              </IconButton>
            </InputAdornment>
          )
        }}
      />
      <TextField
        label="New Username"
        value={newDisplayName}
        onChange={(e) => {
          setNewDisplayName(e.target.value);
          setErrorUsername("");
        }}
        variant="filled"
      />
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Button onClick={tryUsername} disabled={newDisplayName === user.display_name}>
          Change Name
        </Button>
        {errorUsername}
      </Box>
    </>);
});

export default UpdateUsername;