import { Box, Button, TextField } from "@mui/material";
import { FirebaseError } from "firebase/app";
import { EmailAuthProvider, reauthenticateWithCredential, updateEmail, User } from "firebase/auth";
import React, { useState } from "react";
import { authErrors } from "../../util/authErrors";
import PasswordTextField from "../PasswordTextField";

interface Props {
  user: User;
}

const UpdateEmail = ((props: Props) => {
  const { user } = props;

  const [newEmail, setNewEmail] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  function tryEmail() {
    if (!user) {
      setError("Not logged in.");
      return;
    }
    if (!user.email) {
      setError("Critical error - no email found.");
      return;
    }
    if (!newEmail) {
      setError("No email found.");
      return;
    }
    reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, password)).then(() => {
      setError("Checking...")
      updateEmail(user, newEmail).then(() => {
        setError("Updated.")
      }).catch((error: FirebaseError) => {
        setError(authErrors[error.code.split("/")[1] as keyof typeof authErrors]);
      })
    }).catch(() => {
      setError("Failed to authenticate.");
    })
  }

  return (
    <>
      Update Email
      <TextField
        id="Current Email"
        label="Current Email"
        value={user?.email ?? "Not Logged In"}
        variant="standard"
        disabled
      />
      <TextField
        id="Enter New Email"
        label="New Email"
        value={newEmail}
        onChange={(e) => {
          setNewEmail(e.target.value);
          setError("");
        }}
        variant="filled"
      />
      <PasswordTextField
        id="Enter Password"
        label="Password"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
          setError("");
        }}
      />
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Button onClick={tryEmail}>
          Change Email
        </Button>
        {error}
      </Box>
    </>);
});

export default UpdateEmail;