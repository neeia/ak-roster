import React, { useEffect, useState } from "react";
import type { NextPage } from "next";
import { Box, Divider, IconButton, InputAdornment, TextField } from "@mui/material";
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
import { Search } from "@mui/icons-material";
import { child, get, getDatabase, ref } from "firebase/database";


const Lookup: NextPage = () => {
  initFirebase();
  const db = getDatabase();

  const [username, setUsername] = useState<string>("");
  const [uid, setUid] = useState<string>("");
  const search = React.useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const checkUser = "phonebook/" + username.toLowerCase();
    get(child(ref(db), checkUser)).then((snapshot) => {
      if (snapshot.exists()) {
        const checkUserData = "users/" + snapshot.val();
        get(child(ref(db), checkUserData)).then((snapshot2) => {
          if (snapshot2.exists()) {
            console.log(snapshot2.val())
          }
        })
      }
    })
  }, [username]);

  return (
    <Layout tab="/network" page="/lookup">
      <Box sx={{
        display: "flex",
        maxWidth: "sm"
      }}
        component="form"
      >
        <TextField
          sx={{ width: "100%" }}
          autoFocus
          autoComplete="off"
          placeholder="Find a user..."
          value={username}
          onChange={e => setUsername(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton type="submit" onClick={search}>
                  <Search />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
      </Box>
    </Layout>
  );
}
export default Lookup;