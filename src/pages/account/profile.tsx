import React, {useState} from "react";
import type { NextPage } from "next";
import {Box, Button, Divider, TextField} from "@mui/material";
import Layout from "components/Layout";
import SupportSelection from "components/profile/SupportSelection";
import Assistant from "components/profile/Assistant";
import FriendID from "components/profile/FriendId";
import Level from "components/profile/Level";
import Server from "components/profile/Server";
import Onboard from "components/profile/Onboard";
import Discord from "components/profile/Discord";
import Reddit from "components/profile/Reddit";
import {useAccountGetQuery} from "../../store/extendAccount";
import {sendTokenToMail} from "../../util/hgApi/yostarAuth";
import {UserData} from "../../types/arknightsApiTypes/apiTypes";
import GameImport from "../../components/profile/GameImport";

const Profile: NextPage = () => {

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [status, setStatus] = useState("");

  const { data: account, isLoading} = useAccountGetQuery();


  const sendCode = async () => {
    const result = await fetch(`/api/arknights/sendAuthMail?mail=${email}`);
    if (result.ok)
    {
      setStatus("Code sent. Check your e-mail.")
    }
    else
    {
      setStatus("Error sending the code.")
    }
  };

  const login = async () => {
    const result = await fetch(`/api/arknights/getData?mail=${email}&code=${code}`);
    if (result.ok)
    {
      setStatus("Data Retrieved. Processing...")
      const userData = await result.json() as UserData;
    }
    else {
      setStatus("Error retrieving data.")
    }
  };

  return (
    <Layout tab="/account" page="/profile">
      {isLoading ? "" :
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
            <FriendID user={account!} />
            <Server user={account!} />
          </Box>
          <Box sx={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 1 }}>
            <Level user={account!} />
            <Onboard user={account!} />
          </Box>
          <Divider />
          <Assistant user={account!} />
          <SupportSelection />
          <Divider />
          <GameImport/>
          <Divider />
          <Box sx={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            Connections
            <Discord user={account!} />
            <Reddit user={account!} />
          </Box>
        </Box>}
    </Layout>
  );
}
export default Profile;