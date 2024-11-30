import { useEffect, useState } from "react";
import type { NextPage } from "next";
import {
  Box,
  ButtonGroup,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import Layout from "components/Layout";
import { ArrowBack, Search } from "@mui/icons-material";
import { child, get, getDatabase, ref } from "firebase/database";
import { useRouter } from "next/router";
import CollectionContainer from "components/data/view/CollectionContainer";
import { Operator } from "types/operators/operator";
import SearchDialog from "components/data/collate/SearchDialog";
import FilterDialog from "components/data/collate/FilterDialog";
import SortDialog from "components/data/collate/SortDialog";
import { useFilter, useSort } from "util/useSSF";
import { repair } from "util/hooks/useOperators";
import ProfileDialog from "components/lookup/ProfileDialog";
import { AccountInfo } from "types/doctor";
import { SocialInfo } from "types/social";

const Lookup: NextPage = () => {
  const { query } = useRouter();
  const db = getDatabase();
  const [username, setUsername] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [roster, setRoster] = useState<Record<string, Operator>>();
  const [doctor, setDoctor] = useState<AccountInfo>();
  const [social, setSocial] = useState<SocialInfo>();

  const search = (s: string) => {
    get(child(ref(db), `phonebook/${s.toLowerCase()}`)).then((s1) => {
      if (s1.exists()) {
        const checkUserData = "users/" + s1.val();
        get(child(ref(db), checkUserData)).then((s2) => {
          if (s2.exists()) {
            const v = s2.val();

            repair(v.roster, setRoster);
            setDoctor(v.info);
            setSocial(v.connections);
          }
        });
      } else {
        setError("User could not be found.");
      }
    });
  };
  useEffect(() => {
    const searchUser = Array.isArray(query.user) ? query.user[0] : query.user;
    if (searchUser) {
      setUsername(searchUser);
      search(searchUser);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.user]);

  const [sortQueue, setSortQueue, sortFunctions, toggleSort, sortFunction] =
    useSort([
      { key: "Favorite", desc: true },
      { key: "Level", desc: true },
      { key: "Rarity", desc: true },
    ]);
  const [
    ,
    setSearchName,
    filter,
    addFilter,
    removeFilter,
    clearFilters,
    filterFunction,
  ] = useFilter({
    owned: { owned: (op: Operator) => !!op },
  });

  return (
    <Layout
      tab="/network"
      page="/lookup"
      header={
        roster ? (
          <>
            <IconButton
              aria-label="Back to lookup"
              edge="start"
              onClick={() => {
                setSocial(undefined);
                setDoctor(undefined);
                setRoster(undefined);
              }}
            >
              <ArrowBack sx={{ color: "background.paper" }} />
            </IconButton>
            <Typography variant="h5" sx={{ lineHeight: "1rem", mr: 1.5 }}>
              {doctor?.displayName ?? username}
            </Typography>
            {doctor ? (
              <ProfileDialog
                roster={roster}
                social={social}
                user={doctor}
                username={username}
              />
            ) : null}
          </>
        ) : null
      }
    >
      {doctor ? null : (
        <Box
          sx={{
            display: "flex",
            maxWidth: "sm",
          }}
          component="form"
        >
          <TextField
            sx={{ width: "100%", display: roster ? "none" : "" }}
            autoFocus
            autoComplete="off"
            placeholder="Find a user..."
            value={username}
            helperText={error}
            onChange={(e) => setUsername(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    type="submit"
                    onClick={(e) => {
                      e.preventDefault();
                      search(username);
                    }}
                  >
                    <Search />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>
      )}
      {roster ? (
        <Box
          sx={{
            display: "grid",
            gridTemplateAreas: { xs: `"ctrl" "box"`, sm: `"ctrl box"` },
            gridTemplateColumns: { xs: "1fr", sm: "auto 1fr" },
            gap: 2,
          }}
        >
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
                sm: 0,
              },
            }}
          >
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
          </ButtonGroup>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: { xs: "center", sm: "left" },
              gap: "12px 6px",
            }}
          >
            <CollectionContainer
              operators={roster}
              sort={sortFunction}
              filter={filterFunction}
            />
          </Box>
        </Box>
      ) : null}
    </Layout>
  );
};
export default Lookup;
