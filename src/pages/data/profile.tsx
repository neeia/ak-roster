import type { NextPage } from "next";
import { Box, Divider, Input, Typography } from "@mui/material";
import Layout from "components/Layout";
import SupportSelection from "components/data/profile/SupportSelection";
import Assistant from "components/data/profile/Assistant";
import FriendID from "components/data/profile/FriendId";
import Level from "components/data/profile/Level";
import Server from "components/data/profile/Server";
import Onboard from "components/data/profile/Onboard";
import GameImport from "components/app/GameImport";
import useAccount from "util/hooks/useAccount";
import AccountData, { AccountDataInsert } from "types/auth/accountData";
import Discord from "components/data/profile/Discord";
import Reddit from "components/data/profile/Reddit";

export interface AccountMutateProps {
  user: AccountData;
  setAccount: (accountData: AccountDataInsert) => Promise<void>;
}

const Profile: NextPage = () => {
  const [account, setAccount] = useAccount();

  if (!account) return <Layout tab="/data" page="/profile"></Layout>;

  const accProps = {
    user: account,
    setAccount,
  };

  return (
    <Layout tab="/data" page="/profile">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: { xs: 1, sm: 2 },
          maxWidth: "sm",
          justifySelf: "center",
          "& *:before": {
            border: "none",
            borderStyle: "none !important",
          },
          "& .MuiFilledInput-root": {
            borderRadius: "4px",
          },
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
          Account
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr auto", gap: { xs: 1, sm: 2 } }}>
            <FriendID {...accProps} />
            <Server {...accProps} />
          </Box>
        </Box>
        <Box sx={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: { xs: 1, sm: 2 } }}>
          <Level {...accProps} />
          <Onboard {...accProps} />
        </Box>
        <Divider />
        <Assistant {...accProps} />
        <SupportSelection />
        <Divider />
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
          Connections
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
            <Discord {...accProps} />
            <Reddit {...accProps} />
          </Box>
        </Box>
      </Box>
    </Layout>
  );
};
export default Profile;
