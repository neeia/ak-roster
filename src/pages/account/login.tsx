import React, { useEffect, useState } from "react";
import type { NextPage } from "next";
import { Box, Button, ButtonGroup, Dialog, IconButton, InputAdornment, TextField } from "@mui/material";
import { User, getAuth } from "firebase/auth"
import Layout from "../../components/Layout";
import router from "next/router";
import initFirebase from "../../util/initFirebase";

const Login: NextPage = () => {
  initFirebase();
  const [user, setUser] = useState<User | null>(getAuth().currentUser);
  useEffect(() => {
    // redirect to home if already logged in
    if (user) {
      router.push('/' + router.query.returnUrl);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Layout tab="/account" page="/settings">
      <Box sx={{
        display: "flex",
        flexDirection: "column",
        gap: "12px 6px",
      }}>
        Change Email
        <TextField
          id="filled-helperText"
          label="Current Email"
          value={user?.email ?? "Not Logged In"}
          variant="filled"
        />
        <TextField
          id="filled-helperText"
          label="New Email"
          helperText="Some important text"
          variant="filled"
        />
        <TextField
          id="filled-helperText"
          label="Helper text"
          helperText="Some important text"
          variant="filled"
        />
        <TextField
          id="filled-helperText"
          label="Helper text"
          helperText="Some important text"
          variant="filled"
        />
        <TextField
          id="filled-helperText"
          label="Helper text"
          helperText="Some important text"
          variant="filled"
        />
      </Box>
    </Layout>
  );
}
export default Login;