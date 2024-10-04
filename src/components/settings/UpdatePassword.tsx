import { Box, Button, TextField } from "@mui/material";
import { FirebaseError } from "firebase/app";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  User,
} from "firebase/auth";
import React, { useEffect, useState } from "react";
import { authErrors } from "../../util/authErrors";
import PasswordTextField from "../app/PasswordTextField";
import ResetPassword from "../app/ResetPassword";
import { AccountData } from "../../types/auth/accountData";
import supabase from "../../supabase/supabaseClient";
import { useSession } from "@supabase/auth-helpers-react";

interface Props {
  user: AccountData;
}

const UpdatePassword = (props: Props) => {
  const { user } = props;

  const [newPassword, setNewPassword] = useState<string>("");
  const [repeatPassword, setRepeatPassword] = useState<string>("");
  const [errorPassword, setErrorPassword] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const [resetOpen, setResetOpen] = useState<boolean>(false);

  async function tryPassword() {
    if (!newPassword) {
      setErrorPassword("No new password found.");
      return;
    }

    setErrorPassword("Checking...");
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      setErrorPassword(`Something went wrong: ${error.message}`);
      return;
    }
    setErrorPassword("Updated.");
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
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Button onClick={tryPassword}>Change Password</Button>
        {errorPassword}
      </Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Button onClick={() => setResetOpen(true)}>Forgot Password?</Button>
        <ResetPassword open={resetOpen} onClose={() => setResetOpen(false)} />
      </Box>
    </>
  );
};

export default UpdatePassword;
