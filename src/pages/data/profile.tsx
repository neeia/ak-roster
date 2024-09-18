import type { NextPage } from "next";
import {Box, Divider} from "@mui/material";
import Layout from "components/Layout";
import SupportSelection from "components/data/profile/SupportSelection";
import Assistant from "components/data/profile/Assistant";
import FriendID from "components/data/profile/FriendId";
import Level from "components/data/profile/Level";
import Server from "components/data/profile/Server";
import Onboard from "components/data/profile/Onboard";
import {useAccountGetQuery } from "store/extendAccount";
import GameImport from "components/data/profile/GameImport";


const Profile: NextPage = () => {

  const { data: account , isLoading} = useAccountGetQuery();

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
          <GameImport user={account!}/>
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