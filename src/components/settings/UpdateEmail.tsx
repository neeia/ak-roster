import { Box, Button, TextField } from "@mui/material";
import { FirebaseError } from "firebase/app";
import { EmailAuthProvider, reauthenticateWithCredential, updateEmail, User } from "firebase/auth";
import React, {useEffect, useState} from "react";
import { authErrors } from "../../util/authErrors";
import PasswordTextField from "../app/PasswordTextField";
import {AccountData} from "../../types/auth/accountData";
import supabase from "../../supabase/supabaseClient";
import {useSession, useSessionContext, useUser} from "@supabase/auth-helpers-react";

interface Props {
}

const UpdateEmail = ((props: Props) => {

  const [currentEmail, setCurrentEmail ] = useState<string | undefined>("")
  const [newEmail, setNewEmail] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect( () => {
    const getSession = async () =>
    {
      // refresh session to grab possible new mail
      await supabase.auth.refreshSession();
      const {data, error} = await supabase.auth.getSession();
      if (!error) {
        setCurrentEmail(data.session?.user.email);
      }
    }
    getSession().then();
  });

  async function tryEmail() {
    if (!newEmail) {
      setError("No email found.");
      return;
    }

    setError("Checking...")
    const {data, error} = await supabase.auth.updateUser({email: newEmail});
    if (error) {
      setError(`Something went wrong: ${error.message}`);
      return;
    }
    setError("Check your e-mails to confirm the e-mail change.")
  }

  return (
    <>
      Update Email
      <TextField
        label="Current Email"
        value={currentEmail}
        variant="standard"
        disabled
      />
      <TextField
        label="New Email"
        value={newEmail}
        onChange={(e) => {
          setNewEmail(e.target.value);
          setError("");
        }}
        variant="filled"
      />
      <Box sx={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
        <Button onClick={tryEmail}>
          Change Email
        </Button>
        {error}
      </Box>
    </>);
});

export default UpdateEmail;