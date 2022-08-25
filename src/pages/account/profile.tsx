import React, { useEffect, useState } from "react";
import type { NextPage } from "next";
import { Box, Divider } from "@mui/material";
import Layout from "../../components/Layout";
import initFirebase from "../../util/initFirebase";
import { getUserStatus } from "../../util/getUserStatus";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import SupportSelection from "../../components/profile/SupportSelection";
import AssistantSelection from "../../components/profile/AssistantSelection";
import FriendInput from "../../components/profile/FriendInput";
import Level from "../../components/profile/Level";
import Server from "../../components/profile/Server";
import Onboard from "../../components/profile/Onboard";

const Profile: NextPage = () => {
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

  const [level, setLevel] = useState<string>("");
  const [server, setServer] = useState<string>("");


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
          "& .inactive": {
            opacity: 0.75,
          },
          "& .active": {
            opacity: 1,
            borderBottomWidth: "0.25rem",
            borderBottomColor: "primary.main",
            borderBottomStyle: "solid",
            boxShadow: 2,
            backgroundColor: "info.light",
          },
          "& .Mui-disabled": {
            opacity: 0.25,
            boxShadow: 0,
          },
          "& *:before": {
            border: "none",
            borderStyle: "none !important",
          },
          "& .MuiFilledInput-root": {
            borderRadius: "2px",
          },
        }}>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 1 }}>
            <FriendInput user={user} />
            <Server user={user} />
          </Box>
          <Box sx={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 1 }}>
            <Level user={user} />
            <Onboard user={user} />
          </Box>
          <Divider />
          <AssistantSelection user={user} />
          <SupportSelection user={user} />
        </Box>}
    </Layout>
  );
}
export default Profile;