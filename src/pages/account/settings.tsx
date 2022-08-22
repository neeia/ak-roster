import React, { useEffect, useState } from "react";
import type { NextPage } from "next";
import { Box, Button, ButtonGroup, Dialog, IconButton, InputAdornment, TextField } from "@mui/material";
import { User, getAuth } from "firebase/auth"
import Layout from "../../components/Layout";
import router from "next/router";
import initFirebase from "../../util/initFirebase";

const Settings: NextPage = () => {
  initFirebase();
  const [user, setUser] = useState<User | null>(getAuth().currentUser);

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
export default Settings;