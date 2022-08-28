import { ContentPasteOutlined, InventoryOutlined } from "@mui/icons-material";
import { Box, Button, IconButton, InputAdornment, TextField, Typography } from "@mui/material";
import { updateProfile, User } from "firebase/auth";
import { child, get, getDatabase, ref, remove, set } from "firebase/database";
import React, { useState } from "react";
import { AccountInfo } from "../../types/doctor";
import useLocalStorage from "../../util/useLocalStorage";
import UpdatePrivacy from "./UpdatePrivacy";

function isAlphaNumeric(str: string) {
  var code, i, len;

  for (i = 0, len = str.length; i < len; i++) {
    code = str.charCodeAt(i);
    if (!(code > 47 && code < 58) && // numeric (0-9)
      !(code > 64 && code < 91) && // upper alpha (A-Z)
      !(code > 96 && code < 123)) { // lower alpha (a-z)
      return false;
    }
  }
  return true;
};

interface Props {
  user: User;
}

const UpdateUsername = ((props: Props) => {
  const { user } = props;
  const db = getDatabase();
  const [doctor, setDoctor] = useLocalStorage<AccountInfo>("doctor", {});

  const [newUsername, setNewUsername] = useState<string>("");
  const [errorUsername, setErrorUsername] = useState<string>("");
  const [copyLink, setCopiedLink] = useState<boolean>(false);

  function tryUsername() {
    if (!user) {
      setErrorUsername("Not logged in.");
      return;
    }
    if (!newUsername) {
      setErrorUsername("No username found.");
      return;
    }
    if (!isAlphaNumeric(newUsername)) {
      setErrorUsername("Use only [a-z], [0-9].");
      return;
    }
    if (newUsername.length > 24) {
      setErrorUsername("Use a maximum of 24 characters.");
      return;
    }
    if (newUsername.toLowerCase() === user.displayName?.toLowerCase()) {
      updateDisplayName(newUsername);
      return;
    }

    const checkUser = "phonebook/" + newUsername.toLowerCase();
    setErrorUsername("Checking...");
    get(child(ref(db), checkUser)).then((snapshot) => {
      if (snapshot.exists()) {
        setErrorUsername("That username is taken.")
      } else {
        setErrorUsername("Saving...");
        if (user.displayName) {
          remove(ref(db, "phonebook/" + user.displayName));
        }
        set(ref(db, "phonebook/" + newUsername.toLowerCase()), user.uid).then(() => {
          set(ref(db, "users/" + (user.uid) + "/username/"), newUsername.toLowerCase()).then(() => {
            setCopiedLink(false);
            get(child(ref(db), checkUser)).then((newSnapshot) => {
              if (!newSnapshot) {
                setErrorUsername("Something went wrong!");
                return;
              }
              updateDisplayName(newUsername);
            });
          });
        });
      }
    });
  };
  const updateDisplayName = (s: string) => {
    const d = { ...doctor };
    d.displayName = newUsername;
    setDoctor(d);
    set(ref(db, "users/" + (user.uid) + "/info/displayName"), s)
    setErrorUsername("Saved.");
    updateProfile(user, { displayName: s });
    window.location.reload();
  }

  return (
    <>
      Update Username
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <TextField
          id="Current Username"
          label="Current Username"
          value={user?.displayName || "No Username Set"}
          variant="standard"
          disabled
        />
        <UpdatePrivacy user={user} />
      </Box>
      <TextField
        id="Share Link"
        label="Share Link"
        value={`https://krooster.com/u/${user.displayName}`}
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
                onClick={() => { setCopiedLink(true); navigator.clipboard.writeText(`https://krooster.com/u/${user.displayName}`); }}
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
        id="Enter New Username"
        label="New Username"
        value={newUsername}
        onChange={(e) => {
          setNewUsername(e.target.value);
          setErrorUsername("");
        }}
        variant="filled"
      />
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Button onClick={tryUsername}>
          Change Name
        </Button>
        {errorUsername}
      </Box>
    </>);
});

export default UpdateUsername;