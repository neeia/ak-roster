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

const Profile: NextPage = () => {

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");

  const { data: account, isLoading} = useAccountGetQuery();


  const sendCode = async () => {
    const result = await fetch(`/api/arknights/sendAuthMail?mail=${email}`);
  };

  const login = async () => {
    const result = await fetch(`/api/arknights/getData?mail=${email}&code=${code}`);

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
          <Box sx={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <TextField id="Mail" sx={{
              "& .MuiFilledInput-root": {
                borderRadius: "2px 0px 0px 2px",
              },
            }}
                       variant="filled" label="Mail" value={email}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => { setEmail(event.target.value);}}/>
            <Button variant="outlined" onClick={event => sendCode()}> Send mail</Button>
            <TextField id="Code" sx={{
              "& .MuiFilledInput-root": {
                borderRadius: "2px 0px 0px 2px",
              },
            }}
                       variant="filled" label="Code" value={code}
                       onChange={(event: React.ChangeEvent<HTMLInputElement>) => { setCode(event.target.value);}}/>
            <Button variant="outlined" onClick={event => login()}> Login</Button>
          </Box>
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