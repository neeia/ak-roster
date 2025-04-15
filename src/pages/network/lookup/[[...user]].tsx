import { useState } from "react";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { Box, Button, IconButton, InputAdornment, TextField, Tooltip, Typography } from "@mui/material";
import Layout from "components/Layout";
import { ArrowBack, Badge, Search } from "@mui/icons-material";
import CollectionContainer from "components/data/view/CollectionContainer";
import SearchDialog from "components/data/collate/SearchDialog";
import FilterDialog from "components/data/collate/FilterDialog";
import SortDialog from "components/data/collate/SortDialog";
import useSort from "util/hooks/useSort";
import useFilter from "util/hooks/useFilter";
import ProfileDialog from "components/lookup/ProfileDialog";
import useLookup, { LookupData } from "util/hooks/useLookup";
import Toolbar from "components/data/Toolbar";
import { server } from "util/server";
import Head from "components/app/Head";
import { brand } from "styles/theme/appTheme";
import _ from "lodash";
import supabase from "supabase/supabaseClient";
import AccountData from "types/auth/accountData";
import Roster from "types/operators/roster";
import { Operator } from "types/operators/operator";

export const getServerSideProps = (async (context) => {
  const username = ([] as string[])
    .concat(context.query.user || "")[0]
    .trim()
    .toLocaleLowerCase();

  if (!username) {
    return { props: { username, data: null } };
  }

  const { data: _account, error } = await supabase
    .from("krooster_accounts")
    .select("*, supports (op_id, slot), operators (*)")
    .eq("username", username.toLocaleLowerCase())
    .limit(1)
    .single();

  const user_id = _account?.user_id;
  if (!user_id || error) {
    return { props: { username, data: null } };
  }

  const { supports, operators, ...account } = _account;

  const roster: Roster = {};
  operators.forEach((op) => (roster[op.op_id] = op as Operator));

  return {
    props: {
      username,
      data: {
        roster,
        account: account as AccountData,
        supports,
      },
    },
  };
}) satisfies GetServerSideProps<{
  username: string;
  data: LookupData | null;
}>;

const Lookup = ({ username: _username, data: _data }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const [username, setUsername] = useState<string>("");
  const { query, data, loading, clear } = useLookup();
  const [open, setOpen] = useState(false);

  const { sorts, setSorts, toggleSort, sortFunction, sortFunctions } = useSort([
    { key: "Favorite", desc: true },
    { key: "Level", desc: true },
    { key: "Rarity", desc: true },
  ]);
  const { filters, toggleFilter, clearFilters, filterFunction, setSearch } = useFilter({
    OWNED: new Set([true]),
  });

  const superdata = data || _data;

  return (
    <Layout
      tab="/network"
      page="/lookup"
      header={
        superdata && (
          <>
            <IconButton aria-label="Back to lookup" edge="start" onClick={clear} sx={{ color: "primary.contrastText" }}>
              <ArrowBack />
            </IconButton>
            <Typography component="h1" variant="h5" sx={{ lineHeight: "1rem", mr: 1.5 }}>
              {superdata?.account.display_name ?? username}
            </Typography>
          </>
        )
      }
      head={
        <Head
          title={
            superdata?.account?.display_name ? `View ${superdata?.account?.display_name}'s profile` : "Krooster Lookup"
          }
          url={`${server}/network/lookup/${username.trim().toLocaleLowerCase()}`}
          description={
            superdata?.account?.friendcode.username && superdata?.account?.friendcode.tag
              ? [
                  `${superdata.account.friendcode.username}#${superdata.account.friendcode.tag}`,
                  superdata.account.server,
                  superdata.account.level && `Level ${superdata.account.level}`,
                  superdata.account.onboard,
                ]
                  .filter((s) => s)
                  .join(" - ")
              : ""
          }
          themeColor={brand["/network"]}
        >
          <meta property="og:image" content={`${server}/api/og/${_username}`} />
        </Head>
      }
    >
      {!superdata ? (
        <Box
          component="form"
          sx={{
            display: "flex",
            maxWidth: "sm",
          }}
        >
          <TextField
            sx={{ width: "100%" }}
            autoFocus
            autoComplete="off"
            label="Find a user..."
            value={username.trim()}
            onChange={(e) => setUsername(e.target.value)}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      type="submit"
                      disabled={loading}
                      onClick={(e) => {
                        e.preventDefault();
                        query(username.trim());
                      }}
                    >
                      <Search />
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateAreas: { xs: `"ctrl" "box"`, sm: `"ctrl box"` },
            gridTemplateColumns: { xs: "1fr", sm: "auto 1fr" },
            gap: 2,
          }}
        >
          <Toolbar>
            <SortDialog sortFns={sortFunctions} sortQueue={sorts} setSortQueue={setSorts} toggleSort={toggleSort} />
            <FilterDialog filter={filters} toggleFilter={toggleFilter} clearFilters={clearFilters} />
            <SearchDialog onChange={setSearch} />
            <Tooltip title="Profile" arrow describeChild>
              <IconButton onClick={() => setOpen(true)} sx={{ display: "flex", flexDirection: "column" }}>
                <Badge fontSize="large" />
                <Typography variant="caption" sx={{ display: { sm: "none" }, lineHeight: 1.1 }}>
                  Profile
                </Typography>
              </IconButton>
            </Tooltip>
          </Toolbar>
          <ProfileDialog open={open} onClose={() => setOpen(false)} data={superdata} />
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Button onClick={() => setOpen(true)} sx={{ width: "100%", py: 1.5, height: "min-content" }}>
              <Typography variant="caption" sx={{ lineHeight: 1.1 }}>
                View {superdata.account.display_name}'s profile
              </Typography>
            </Button>
            <CollectionContainer roster={superdata.roster} sort={sortFunction} filter={filterFunction} />
          </Box>
        </Box>
      )}
    </Layout>
  );
};
export default Lookup;
