import React, { useEffect, useState } from "react";
import type { NextPage } from "next";
import { Box, Button, ButtonGroup, Dialog, Divider, IconButton, InputAdornment, TextField, Typography } from "@mui/material";
import { User, getAuth, updateProfile, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, onValue, remove, set } from "firebase/database";
import Layout from "../../components/Layout";
import initFirebase from "../../util/initFirebase";
import { getUserStatus } from "../../util/getUserStatus";
import { ContentPasteOutlined, InventoryOutlined } from "@mui/icons-material";
import UpdateUsername from "../../components/settings/UpdateUsername";
import UpdateEmail from "../../components/settings/UpdateEmail";
import UpdatePassword from "../../components/settings/UpdatePassword";

const Settings: NextPage = () => {
  initFirebase();

  const [user, setUser] = useState<User | null>();
  useEffect(() => {
    const auth = getAuth();
    getUserStatus().then((user) => {
      setUser(user);
    })
    onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
  }, []);

  return (
    <Layout tab="/account" page="/settings">
      {!user ? "" :
        <Box sx={{
          display: "flex",
          flexDirection: "column",
          gap: "12px 6px",
          maxWidth: "sm",
          justifySelf: "center",
          "& *:before": {
            border: "none",
            borderStyle: "none !important",
          },
          "& .MuiFilledInput-root": {
            borderRadius: "2px",
          },
        }}>
          <UpdateUsername user={user} />
          <Divider />
          <UpdateEmail user={user} />
          <Divider />
          <UpdatePassword user={user} />
        </Box>}
    </Layout>
  );
}
export default Settings;