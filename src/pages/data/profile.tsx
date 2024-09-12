import React, { useContext, useState } from "react";
import type { NextPage } from "next";
import {Box, Button, Divider, TextField} from "@mui/material";
import Layout from "components/Layout";
import SupportSelection from "components/data/profile/SupportSelection";
import Assistant from "components/data/profile/Assistant";
import FriendID from "components/data/profile/FriendId";
import Level from "components/data/profile/Level";
import Server from "components/data/profile/Server";
import Onboard from "components/data/profile/Onboard";
import Discord from "components/data/profile/Discord";
import Reddit from "components/data/profile/Reddit";
import { useAccountGetQuery, useCurrentAccountGetQuery } from "store/extendAccount";
import {UserData} from "types/arknightsApiTypes/apiTypes";
import GameImport from "components/data/profile/GameImport";
import supabase from "supabase/supabaseClient";
import { skipToken } from "@reduxjs/toolkit/query";
import { SessionContext } from "pages/_app";

const Profile: NextPage = () => {

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [status, setStatus] = useState("");

  const { data: account , isLoading} = useCurrentAccountGetQuery();


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
    <Layout tab="/data" page="/profile">
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
            {/*<Server user={account!} />*/}
          </Box>
          <Box sx={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 1 }}>
            {/*<Level user={account!} />*/}
            {/*<Onboard user={account!} />*/}
          </Box>
          <Divider />
          {/*<Assistant user={account!} />*/}
          {/*<SupportSelection />*/}
          <Divider />
          {/*<GameImport/>*/}
          <Divider />
          <Box sx={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            Connections
            {/*<Discord user={account!} />*/}
            {/*<Reddit user={account!} />*/}
          </Box>
        </Box>}
    </Layout>
  );
}
export default Profile;