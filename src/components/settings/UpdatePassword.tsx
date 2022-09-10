import { Box, Button, TextField } from "@mui/material";
import { FirebaseError } from "firebase/app";
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword, User } from "firebase/auth";
import React, { useState } from "react";
import { authErrors } from "../../util/authErrors";
import PasswordTextField from "../app/PasswordTextField";
import ResetPassword from "../app/ResetPassword";


interface Props {
  user: User;
}

const UpdatePassword = ((props: Props) => {
  const { user } = props;

  const [newPassword, setNewPassword] = useState<string>("");
  const [repeatPassword, setRepeatPassword] = useState<string>("");
  const [errorPassword, setErrorPassword] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const [resetOpen, setResetOpen] = useState<boolean>(false);

  function tryPassword() {
    if (!user) {
      setErrorPassword("Not logged in.");
      return;
    }
    if (!user.email) {
      setErrorPassword("Critical error - no email found.");
      return;
    }
    if (!newPassword) {
      setErrorPassword("No email found.");
      return;
    }
    reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, password)).then(() => {
      setErrorPassword("Checking...")
      updatePassword(user, newPassword).then(() => {
        setErrorPassword("Updated.")
      }).catch((error: FirebaseError) => {
        setErrorPassword(authErrors[error.code.split("/")[1] as keyof typeof authErrors]);
      })
    }).catch(() => {
      setErrorPassword("Failed to authenticate.");
    })
  }

  return (
    <>
      Update Password
      <PasswordTextField
        label="Current Password"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
          setErrorPassword("");
        }}
        ariaId="upw-cur"
      />
      <PasswordTextField
        label="New Password"
        value={newPassword}
        onChange={(e) => {
          setNewPassword(e.target.value);
          setErrorPassword("");
        }}
        ariaId="upw-ne1"
      />
      <PasswordTextField
        label="Repeat Password"
        value={repeatPassword}
        onChange={(e) => {
          setRepeatPassword(e.target.value);
          setErrorPassword("");
        }}
        ariaId="upw-ne2"
      />
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Button onClick={tryPassword}>
          Change Password
        </Button>
        {errorPassword}
      </Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Button onClick={() => setResetOpen(true)}>
          Forgot Password?
        </Button>
        <ResetPassword open={resetOpen} onClose={() => setResetOpen(false)} email={user?.email ?? ""} />
      </Box>
    </>);
});

export default UpdatePassword;