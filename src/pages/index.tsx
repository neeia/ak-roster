import { Alert, Box, Button, IconButton, InputAdornment, Paper, SxProps, TextField } from "@mui/material";
import type { NextPage } from "next";
import config from "data/config";
import React, { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { getLogoUrl } from "components/app/Logo";
import HomeNavItem from "components/landing/HomeNavItem";
import HomeNavSection from "components/landing/HomeNavSection";
import { brand, DISCORD_BLURPLE, GITHUB_DARK, KOFI_BLUE } from "styles/theme/appTheme";
import { LockPerson, Search } from "@mui/icons-material";
import JumpTo from "components/base/JumpTo";
import Link from "components/base/Link";
import Head from "components/app/Head";
import { server } from "util/server";
import AccountWidget from "components/app/AccountWidget";
import useAccount from "util/hooks/useAccount";

const authFrame: SxProps = {
  display: "flex",
  gap: 2,
  width: "100%",
  maxWidth: "sm",
  minHeight: 80,
  borderRadius: 1,
  p: 2,
};

const Home: NextPage = () => {
  const [searchText, setSearchText] = useState<string>("");

  const [errors, setErrors] = useState<string[]>([]);

  const search = useCallback((s: string) => {
    window.location.href = `/u/${s}`;
  }, []);

  const logoBasePath = useRef(`/assets/title/${getLogoUrl()}`);

  const [account] = useAccount();

  return (
    <Head title="Krooster" url={server} description={config.siteDescription}>
      <Box
        component="main"
        sx={{
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "background.paper",
          alignItems: "center",
          gap: 4,
          p: 2,
        }}
      >
        <JumpTo href="search">jump to search</JumpTo>
        <Box component="h1" display="flex" m={0}>
          <Box
            component="img"
            alt="Krooster - Arknights Roster"
            sx={{
              height: "16rem",
              content: {
                xs: `url(${logoBasePath.current}-v.png)`,
                sm: `url(${logoBasePath.current}-h.png)`,
              },
            }}
          />
        </Box>

        {account === null ? (
          <Paper
            elevation={2}
            sx={{
              ...authFrame,
              alignItems: "center",
            }}
          >
            <Button
              component={Link}
              href="/register"
              variant="contained"
              sx={{
                ":hover": { backgroundColor: "primary.light" },
                width: "100%",
                height: "100%",
                fontSize: "1rem",
              }}
            >
              New User
            </Button>
            <span>or</span>
            <Button
              component={Link}
              href="/login"
              variant="outlined"
              sx={{
                width: "100%",
                height: "100%",
                fontSize: "1rem",
              }}
            >
              Sign In
            </Button>
          </Paper>
        ) : (
          <Paper
            elevation={2}
            sx={{
              ...authFrame,
              flexDirection: "column",
            }}
          >
            <AccountWidget sx={{ p: 0 }} username={account?.username} />
            <Alert severity="info">
              You can now update your information in one click by connecting to Yostar!
              <div>
                <Link sx={{ textDecoration: "1px dotted underline" }} href="/import">
                  See More
                </Link>
              </div>
            </Alert>
            {errors.map((err, i) => (
              <Alert
                key={i}
                severity="error"
                onClose={() => {
                  setErrors([...errors.slice(0, i), ...errors.slice(i + 1)]);
                }}
              >
                {err}
              </Alert>
            ))}
          </Paper>
        )}

        <Box
          component="nav"
          sx={{
            width: "100%",
            maxWidth: "40rem",
            mt: 8,
          }}
        >
          <Box
            component="ul"
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
              m: 0,
              p: 0,
            }}
          >
            <HomeNavSection title="Data" color={brand["/data"]} src="data">
              <Alert
                severity="warning"
                variant="outlined"
                icon={<LockPerson />}
                sx={{
                  display: account ? "none" : "flex",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                You must be logged in to access these features.
              </Alert>
              <HomeNavItem disabled={!account} href={"/data/input"}>
                Roster
              </HomeNavItem>
              <HomeNavItem disabled={!account} href={"/data/view"}>
                Collection
              </HomeNavItem>
              <HomeNavItem
                disabled={!account}
                href={"/data/planner"}
                icon={<Image key="p" src="/img/icons/rock.svg" alt="" width={24} height={24} />}
              >
                Planner
              </HomeNavItem>
              <HomeNavItem disabled={!account} href={"/data/profile"}>
                Profile
              </HomeNavItem>
            </HomeNavSection>
            <HomeNavSection title="Network" color={brand["/network"]} src="network">
              <Box component="li" display="flex">
                <TextField
                  id="search"
                  autoComplete="off"
                  label="Find a user..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  size="small"
                  InputProps={{
                    sx: { width: "240px", pr: 0.5 },
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          type="submit"
                          aria-label="search"
                          onClick={(e) => {
                            e.preventDefault();
                            search(searchText);
                          }}
                        >
                          <Search fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
              <HomeNavItem href={"/network/findafriend"}>Support Search</HomeNavItem>
            </HomeNavSection>
            <HomeNavSection title="Tools" color={brand["/tools"]} src="tools">
              <HomeNavItem href={"/tools/recruit"}>Recruitment</HomeNavItem>
              <HomeNavItem href={"/tools/rateup"}>Headhunting</HomeNavItem>
              <HomeNavItem href={"/tools/level"}>Level Costs</HomeNavItem>
            </HomeNavSection>
            <HomeNavSection title="Community" color={brand["/community"]} src="community">
              <HomeNavItem
                external
                href="https://discord.gg/qx8hJGvTwc"
                title="Join our Discord!"
                sx={{
                  backgroundColor: DISCORD_BLURPLE,
                }}
              >
                <Image src="/img/assets/discord.svg" width="20" height="15" alt="" />
                Discord
              </HomeNavItem>
              <HomeNavItem
                external
                href="https://github.com/neeia/ak-roster"
                title="For developers!"
                sx={{
                  backgroundColor: GITHUB_DARK,
                }}
              >
                <Image width="18" height="18" src="/img/assets/github-1.png" alt="" />
                GitHub
              </HomeNavItem>
              <HomeNavItem
                external
                href="https://ko-fi.com/neeia"
                title="Support Krooster!"
                sx={{
                  backgroundColor: KOFI_BLUE,
                }}
              >
                <Image className="icon" width="24" height="16" src="/img/assets/ko-fi.png" alt="Ko-fi" />
                Donations
              </HomeNavItem>
            </HomeNavSection>
          </Box>
        </Box>
      </Box>
    </Head>
  );
};

export default Home;
