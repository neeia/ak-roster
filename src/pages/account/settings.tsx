import React, { useEffect, useState } from "react";
import type { NextPage } from "next";
import { Box, Divider } from "@mui/material";
import { User, getAuth, onAuthStateChanged } from "firebase/auth";
import Layout from "components/Layout";
import UpdateUsername from "components/settings/UpdateUsername";
import UpdateEmail from "components/settings/UpdateEmail";
import UpdatePassword from "components/settings/UpdatePassword";
import Data from "components/settings/Data";
import useOperators from "util/useOperators";

const Settings: NextPage = () => {

  const [operators, setOperators] = useOperators();

  const [user, setUser] = useState<User | null>();
  useEffect(() => {
    const auth = getAuth();
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
          "& *:before": {
            border: "none",
            borderStyle: "none !important",
          },
          "& .MuiFilledInput-root": {
            borderRadius: "4px",
          },
        }}>
          <UpdateUsername user={user} />
          <Divider />
          <Data user={user} operators={operators} setOperators={setOperators} />
          <Divider />
          <UpdateEmail user={user} />
          <Divider />
          <UpdatePassword user={user} />
        </Box>}
    </Layout>
  );
}
export default Settings;