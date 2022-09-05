import React, { useEffect, useState } from "react";
import type { NextPage } from "next";
import { Box, ButtonGroup, IconButton, InputAdornment, TextField } from "@mui/material";
import Layout from "../../../components/Layout";
import initFirebase from "../../../util/initFirebase";
import { Badge, Search } from "@mui/icons-material";
import { child, get, getDatabase, ref } from "firebase/database";
import { useRouter } from "next/router";
import { isArray } from "util";
import CollectionContainer from "../../../components/view/CollectionContainer";
import { defaultOperatorObject, Operator, OpJsonObj } from "../../../types/operator";
import SearchDialog from "../../../components/collate/SearchDialog";
import FilterDialog from "../../../components/collate/FilterDialog";
import SortDialog from "../../../components/collate/SortDialog";
import { useFilter, useSort } from "../../../util/useSSF";
import operatorJson from "../../../data/operators.json";
import { repair } from "../../../util/useOperators";
import ProfileDialog from "../../../components/lookup/ProfileDialog";
import { AccountInfo } from "../../../types/doctor";
import { SocialInfo } from "../../../types/social";
import HelpDialog from "../../../components/lookup/HelpDialog";


const Lookup: NextPage = () => {
  const { query } = useRouter();
  initFirebase();
  const db = getDatabase();
  const [username, setUsername] = useState<string>("");
  const [roster, setRoster] = useState<Record<string, Operator>>();
  const [doctor, setDoctor] = useState<AccountInfo>();
  const [social, setSocial] = useState<SocialInfo>();

  const search = React.useCallback(() => {
    const checkUser = "phonebook/" + username.toLowerCase();
    get(child(ref(db), checkUser)).then((s1) => {
      if (s1.exists()) {
        const checkUserData = "users/" + s1.val();
        get(child(ref(db), checkUserData)).then((s2) => {
          if (s2.exists()) {
            const v = s2.val();

            setRoster(repair(v.roster));
            setDoctor(v.info);
            setSocial(v.connections);
            console.log(doctor);
            console.log(social);
          }
        })
      }
    })
  }, [db, username]);
  useEffect(() => {
    const searchUser = isArray(query.user) ? query.user[0] : query.user;
    if (searchUser) {
      setUsername(searchUser);
      search();
    }
  }, [query.user])

  const [sortQueue, setSortQueue, sortFunctions, toggleSort, sortFunction] = useSort([
    { key: "Level", desc: true },
    { key: "Rarity", desc: true },
  ]);
  const [, setSearchName, filter, addFilter, removeFilter, clearFilters, filterFunction] = useFilter(
    {
      "owned": { "owned": (op: Operator) => op.owned }
    });

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
                <IconButton type="submit" onClick={e => { e.preventDefault(); search(); }}>
                  <Search />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
      </Box>
      <Box sx={{
        display: "grid",
        gridTemplateAreas: { xs: `"ctrl" "box"`, sm: `"ctrl box"` },
        gridTemplateColumns: { xs: "1fr", sm: "auto 1fr" },
        gap: 2
      }}>
        <ButtonGroup
          sx={{
            gridArea: "ctrl",
            flexDirection: { xs: "row", sm: "column" },
            position: "sticky",
            top: 64,
            zIndex: 10,
            gap: 1,
            "& .MuiIconButton-root": {
              height: "min-content",
            },
            "& .MuiSvgIcon-root": {
              height: { xs: "1.5rem", sm: "2.5rem" },
            },
            justifyContent: "space-around",
            height: "min-content",
            backgroundColor: { xs: "info.main", sm: "transparent" },
            boxShadow: {
              xs: 5,
              sm: 0
            },
          }}>
          <ProfileDialog
            user={doctor}
            social={social}
          />
          <SortDialog
            sortFns={sortFunctions}
            sortQueue={sortQueue}
            setSortQueue={setSortQueue}
            toggleSort={toggleSort}
          />
          <FilterDialog
            filter={filter}
            addFilter={addFilter}
            removeFilter={removeFilter}
            clearFilters={clearFilters}
          />
          <SearchDialog setSearch={setSearchName} />
          <HelpDialog />
        </ButtonGroup>
        {
          roster
            ? <Box sx={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: { xs: "center", sm: "left" },
              gap: "12px 6px",
            }}>
              <CollectionContainer
                operators={roster}
                sort={sortFunction}
                filter={filterFunction}
              />
            </Box>
            : null
        }
      </Box>
    </Layout>
  );
}
export default Lookup;