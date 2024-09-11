import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  IconButton,
  InputAdornment,
  Paper,
  SxProps,
  TextField,
  Typography,
} from "@mui/material";
import type { NextPage } from "next";
import config from "data/config";
import React, { useContext, useEffect, useRef, useState } from "react";
import Image from "next/image";
import supabase from "supabase/supabaseClient";
import { getLogoUrl } from "components/app/Logo";
import HomeNavItem from "components/landing/HomeNavItem";
import HomeNavSection from "components/landing/HomeNavSection";
import { brand, DISCORD_BLURPLE, GITHUB_DARK, KOFI_BLUE } from "styles/theme/appTheme";
import { Edit, LockPerson, Search, Settings } from "@mui/icons-material";
import JumpTo from "components/base/JumpTo";
import { SessionContext } from "pages/_app";
import Link from "components/base/Link";
import Head from "components/app/Head";
import AccountContextMenu from "components/app/AccountContextMenu";
import { useAccountGetQuery, useAccountUpdateMutation } from "store/extendAccount";
import { skipToken } from "@reduxjs/toolkit/query";
import { server } from "util/server";
import randomName from "util/randomName";

const authFrame: SxProps = {
  display: "flex",
  gap: 2,
  width: "100%",
  maxWidth: "sm",
  minHeight: 80,
  borderRadius: 1,
  p: 2,
}

const Home: NextPage = () => {
  const [searchText, setSearchText] = useState<string>("");
  const [username, setUsername] = useState<string | null>();
  const [randomUsername, setRandomUsername] = useState<boolean>(false);

  const [errors, setErrors] = useState<string[]>([]);

  const search = (s: string) => {
    window.location.href = `/u/${s}`;
  };

  const logoBasePath = useRef(`/assets/title/${getLogoUrl()}`);

  const session = useContext(SessionContext);

  const { data: accountData } = useAccountGetQuery(session ? { user_id: session.user.id } : skipToken);

  useEffect(() => {
    if (session && accountData) {
      if (accountData.display_name) {
        setUsername(accountData.display_name);
      }
      else if (!accountData.display_name) {
        const genName = randomName();
        const [trigger, out] = useAccountUpdateMutation();
        trigger({ user_id: session.user.id, username: genName, display_name: genName, private: false, });
      }
    }
  }, [accountData])

  return (
    <Head title="Krooster" url={server} description={config.siteDescription}>
      <Box component="main" sx={{
        minHeight: "100dvh",
        backgroundColor: "background.paper",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        p: 2,
      }}>
        <JumpTo target="search">
          jump to search
        </JumpTo>
        <Box component="h1" display="flex" m={0}>
          <Box component="img"
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

        {(session === null) ? (
          <Paper elevation={2} sx={{
            ...authFrame,
            alignItems: "center",
          }}>
            <Button component={Link} href="/register"
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
            <span>
              or
            </span>
            <Button component={Link} href="/login"
              variant="outlined"
              sx={{
                width: "100%",
                height: "100%",
                fontSize: "1rem",
              }}>
              Sign In
            </Button>
          </Paper>
        )
          :
          <Paper elevation={2} sx={{
            ...authFrame,
            flexDirection: "column",
          }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Box sx={{ display: "flex", flexDirection: "column" }}>
                <Typography sx={{ color: "text.secondary" }}>Signed in as</Typography>
                <Box sx={{ display: "flex", gap: 1 }}>
                  {username ?? <CircularProgress size={24} />}
                </Box>
              </Box>
              <AccountContextMenu />
            </Box>
            {randomUsername && <Alert
              severity="info"
              onClose={() => setRandomUsername(false)}
            >
              You have been assigned a random username. Change it in the settings!
            </Alert>
            }
            {errors.map((err, i) => (
              <Alert key={i}
                severity="error"
                onClose={() => { setErrors([...errors.slice(0, i), ...errors.slice(i + 1)]) }}
              >
                {err}
              </Alert>
            ))}
          </Paper>
        }

        <Box component="nav" sx={{
          width: "100%",
          maxWidth: "40rem",
          mt: 8
        }}>
          <Box component="ul"
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
              m: 0,
              p: 0,
            }}
          >
            <HomeNavSection
              title="Data"
              color={brand["/data"]}
              src="data"
            >
              <Alert severity="warning" variant="outlined"
                icon={
                  <LockPerson />
                }
                sx={{
                  display: session ? "none" : "flex",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                You must be logged in to access these features.
              </Alert>
              <HomeNavItem disabled={!session} href={"/data/input"}>
                Roster
              </HomeNavItem>
              <HomeNavItem disabled={!session} href={"/data/view"}>
                Collection
              </HomeNavItem>
              <HomeNavItem disabled={!session} href={"/data/planner"} icon={
                <Image key="p" src="/img/icons/rock.svg" alt="" width={24} height={24} />
              }>
                Planner
              </HomeNavItem>
              <HomeNavItem disabled={!session} href={"/data/profile"}>
                Profile
              </HomeNavItem>
            </HomeNavSection>
            <HomeNavSection
              title="Network"
              color={brand["/network"]}
              src="network"
            >
              <Box component="li" display="flex">
                <TextField id="search"
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
                    )
                  }}
                />
              </Box>
              <HomeNavItem href={"/network/findafriend"} >
                Support Search
              </HomeNavItem>
            </HomeNavSection>
            <HomeNavSection
              title="Tools"
              color={brand["/tools"]}
              src="tools"
            >
              <HomeNavItem href={"/tools/recruit"} >
                Recruitment
              </HomeNavItem>
              <HomeNavItem href={"/tools/rateup"} >
                Headhunting
              </HomeNavItem>
              <HomeNavItem href={"/tools/level"} >
                Level Costs
              </HomeNavItem>
            </HomeNavSection>
            <HomeNavSection
              title="Community"
              color={brand["/community"]}
              src="community"
            >
              <HomeNavItem external
                href="https://discord.gg/qx8hJGvTwc"
                title="Join our Discord!"
                sx={{
                  backgroundColor: DISCORD_BLURPLE
                }}
              >
                <Image
                  src="/img/assets/discord.svg"
                  width="20"
                  height="15"
                  alt=""
                />
                Discord
              </HomeNavItem>
              <HomeNavItem external
                href="https://github.com/neeia/ak-roster"
                title="For developers!"
                sx={{
                  backgroundColor: GITHUB_DARK
                }}
              >
                <Image
                  width="18"
                  height="18"
                  src="/img/assets/github-1.png"
                  alt=""
                />
                GitHub
              </HomeNavItem>
              <HomeNavItem external
                href="https://ko-fi.com/neeia"
                title="Support Krooster!"
                sx={{
                  backgroundColor: KOFI_BLUE
                }}
              >
                <Image
                  className="icon"
                  width="24"
                  height="16"
                  src="/img/assets/ko-fi.png"
                  alt="Ko-fi"
                />
                Donations
              </HomeNavItem>
            </HomeNavSection>
          </Box>
        </Box>
      </Box >
    </Head>
  );
};

export default Home;
