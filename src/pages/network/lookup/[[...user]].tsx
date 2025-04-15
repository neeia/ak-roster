import { useEffect, useState } from "react";
import type { NextPage } from "next";
import { Box, Button, FormControl, IconButton, InputAdornment, TextField, Tooltip, Typography } from "@mui/material";
import Layout from "components/Layout";
import { ArrowBack, Badge, Search } from "@mui/icons-material";
import { useRouter } from "next/router";
import CollectionContainer from "components/data/view/CollectionContainer";
import SearchDialog from "components/data/collate/SearchDialog";
import FilterDialog from "components/data/collate/FilterDialog";
import SortDialog from "components/data/collate/SortDialog";
import useSort from "util/hooks/useSort";
import useFilter from "util/hooks/useFilter";
import ProfileDialog from "components/lookup/ProfileDialog";
import useLookup from "util/hooks/useLookup";
import Toolbar from "components/data/Toolbar";
import { server } from "util/server";
import Head from "components/app/Head";
import { brand } from "styles/theme/appTheme";

const Lookup: NextPage = () => {
  const { query: routerQuery } = useRouter();
  const [username, setUsername] = useState<string>("");
  const { query, data, loading, clear } = useLookup();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!routerQuery.user) return;
    const queryUser: string = ([] as string[]).concat(routerQuery.user)[0];
    if (!queryUser) return;

    setUsername(queryUser);
    query(queryUser);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routerQuery.user]);

  const { sorts, setSorts, toggleSort, sortFunction, sortFunctions } = useSort([
    { key: "Favorite", desc: true },
    { key: "Level", desc: true },
    { key: "Rarity", desc: true },
  ]);
  const { filters, toggleFilter, clearFilters, filterFunction, setSearch } = useFilter({
    OWNED: new Set([true]),
  });

  return (
    <Layout
      tab="/network"
      page="/lookup"
      header={
        data && (
          <>
            <IconButton aria-label="Back to lookup" edge="start" onClick={clear} sx={{ color: "primary.contrastText" }}>
              <ArrowBack />
            </IconButton>
            <Typography component="h1" variant="h5" sx={{ lineHeight: "1rem", mr: 1.5 }}>
              {data?.account.display_name ?? username}
            </Typography>
          </>
        )
      }
      head={
        <Head
          title={data?.account?.display_name ? `View ${data?.account?.display_name}'s profile` : "Krooster Lookup"}
          url={`${server}/network/lookup/${username.trim().toLocaleLowerCase()}`}
          description={
            data?.account?.friendcode.username && data?.account?.friendcode.tag
              ? [
                  `${data.account.friendcode.username}#${data.account.friendcode.tag}`,
                  data.account.server,
                  data.account.level && `Level ${data.account.level}`,
                  data.account.onboard,
                ]
                  .filter((s) => s)
                  .join(" - ")
              : ""
          }
          themeColor={brand["/network"]}
        >
          <meta property="og:image" content={`${server}/api/og?username=${username.trim().toLocaleLowerCase()}`} />
        </Head>
      }
    >
      {!data ? (
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
          <ProfileDialog open={open} onClose={() => setOpen(false)} data={data} />
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Button onClick={() => setOpen(true)} sx={{ width: "100%", py: 1.5, height: "min-content" }}>
              <Typography variant="caption" sx={{ lineHeight: 1.1 }}>
                View {data.account.display_name}'s profile
              </Typography>
            </Button>
            <CollectionContainer roster={data.roster} sort={sortFunction} filter={filterFunction} />
          </Box>
        </Box>
      )}
    </Layout>
  );
};
export default Lookup;
