import React, { useEffect, useState } from "react";
import type { NextPage } from "next";
import { Box, Divider } from "@mui/material";
import Layout from "components/Layout";
import UpdateUsername from "components/settings/UpdateUsername";
import UpdateEmail from "components/settings/UpdateEmail";
import UpdatePassword from "components/settings/UpdatePassword";
import { useAccountGetQuery } from "store/extendAccount";

const Settings: NextPage = () => {

  const { data: account, isLoading } = useAccountGetQuery();

  return (
    <Layout tab="/account" page="/settings">
      {isLoading ? "" :
        <Box sx={{
          display: "flex",
          flexDirection: "column",
          gap: "12px 6px",
          maxWidth: "sm",
          "& *:before": {
            border: "none",
            borderStyle: "none !important",
          },
          "& .MuiFilledInput-root": {
            borderRadius: "4px",
          },
        }}>
          <UpdateUsername user={account!} />
          <Divider />
          {/*<Data user={user} operators={operators} setOperators={setOperators} />*/}
          <Divider />
          <UpdateEmail />
          <Divider />
          <UpdatePassword user={account!} />
        </Box>}
    </Layout>
  );
}
export default Settings;