import React, { useEffect, useState } from "react";
import type { NextPage } from "next";
import { Box, Divider } from "@mui/material";
import Layout from "../../components/Layout";
import initFirebase from "../../util/initFirebase";
import { getUserStatus } from "../../util/getUserStatus";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import SupportSelection from "../../components/profile/SupportSelection";
import Assistant from "../../components/profile/Assistant";
import FriendID from "../../components/profile/FriendId";
import Level from "../../components/profile/Level";
import Server from "../../components/profile/Server";
import Onboard from "../../components/profile/Onboard";
import Discord from "../../components/profile/Discord";
import Reddit from "../../components/profile/Reddit";

const Profile: NextPage = () => {
  initFirebase();

  const [user, setUser] = useState<User | null>();
  useEffect(() => {
    const auth = getAuth();
    getUserStatus().then((user) => {
      setUser(user);
    })
    onAuthStateChanged(auth, (newUser) => {
      setUser(newUser);
    });
  }, []);

  return (
    <Layout tab="/account" page="/profile">
      {!user ? "" :
        <Box sx={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          maxWidth: "sm",
          justifySelf: "center",
          "& .MuiButtonBase-root": {
            boxShadow: 1,
            backgroundColor: "info.main",
          },
          "& *:before": {
            border: "none",
            borderStyle: "none !important",
          },
          "& .MuiFilledInput-root": {
            borderRadius: "4px",
          },
        }}>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 1 }}>
            <FriendID user={user} />
            <Server user={user} />
          </Box>
          <Box sx={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 1 }}>
            <Level user={user} />
            <Onboard user={user} />
          </Box>
          <Divider />
          <Assistant user={user} />
          <SupportSelection user={user} />
          <Divider />
          <Box sx={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            Connections
            <Discord user={user} />
            <Reddit user={user} />
          </Box>
        </Box>}
    </Layout>
  );
}
export default Profile;