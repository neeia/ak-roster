import {
  Box, Button,
  Container,
  Divider,
  IconButton,
  IconProps,
  Input,
  InputAdornment,
  Link,
  SvgIconProps,
  Typography,
} from "@mui/material";
import type { NextPage } from "next";
import Head from "next/head";
import NextLink from "next/link";
import config from "data/config";
import appTheme from "styles/theme/appTheme";
import createEmotionCache from "util/createEmotionCache";
import React, { useCallback, useEffect, useState } from "react";
import { Apps, Badge, Bookmark, BookmarkAdd, Forum, Functions, Groups, Hub, Inventory2, Search } from "@mui/icons-material";
import Image from "next/image";
import RegisterButton from "components/app/RegisterDialog";
import LoginButton from "components/app/LoginDialog";
import { useRouter } from "next/router";
import supabaseClient from "util/supabaseClient";
import { Session } from "@supabase/supabase-js";
import Logo from "components/app/Logo";
import HomeNavItem from "components/index/HomeNavItem";
import HomeNavSection from "components/index/HomeNavSection";
import HomeNavItemExt from "components/index/HomeNavItemExt";

const Home: NextPage = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [login, setLogin] = useState(false);
  const [register, setRegister] = useState(false);

  const [username, setUsername] = useState<string>("");

  const router = useRouter();

  const getUser = useCallback(async () => {
    const { data } = await supabaseClient.auth.getSession();
    setSession(data.session);
  }, []);

  useEffect(() => {
    getUser().then();
  }, [getUser]);

  const search = (s: string) => {
    window.location.href = `/u/${s}`;
  };

  const onLogin = async (session: Session) => {
    if (session) {
      router.push("/data/input/");
    }
  }


  // TODO: are the providers even necessary?
  return (
    <>
      <Head>
        <title>Krooster</title>
        <meta key="url" property="og:url" content={config.siteUrl} />
        <meta key="title" property="og:title" content="Arknights Roster" />
        <meta
          key="description"
          name="description"
          property="og:description"
          content="A collection and progress tracker for Arknights, a game developed by Hypergryph."
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#fbc02d" />
      </Head>
      <Box
        component="main"
        sx={{
          display: "flex",
          flexDirection: "column",
          "& em": {
            color: "primary.main",
            fontStyle: "normal",
          },
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Logo size={24} subtitle horizontal />
        </Box>
        {/* here we have links of all the things people can do with krooster */}
        {/* divided into logged in and not logged in sections */}

        <Container component="nav" sx={{
          
        }}>
          <Box component="ul"
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              m: 0,
              p: 0,
            }}
          >
            <HomeNavSection
              title="Data"
              color="#FFD440"
              src="data.png"
              backgroundPosition="right -230px top -72px"
              backgroundSize="700px"
              decoration={(props: SvgIconProps) => <Groups {...props} />}
            >
              <HomeNavItem href="/data/overview/">
                Overview
              </HomeNavItem>
              <HomeNavItem href="/data/operators/"
                icon={<Apps />}
              >
                Operators
              </HomeNavItem>
              <HomeNavItem href="/data/profile/"
                icon={<Badge />}
              >
                Profile
              </HomeNavItem>
            </HomeNavSection>
            <HomeNavSection
              title="Network" color="#E440FF"
              src="network.png"
              backgroundPosition="right -285px top -125px"
              backgroundSize="875px"
              decoration={(props: SvgIconProps) => <Hub {...props} />}
            >
              <Input
                autoComplete="off"
                placeholder="Lookup"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                sx={{
                  height: "2em",
                  width: "24ch",
                }}
                endAdornment={(
                  <InputAdornment position="end">
                    <IconButton
                      type="submit"
                      aria-label="search"
                      onClick={(e) => {
                        e.preventDefault();
                        search(username);
                      }}
                    >
                      <Search />
                    </IconButton>
                  </InputAdornment>
                )}
              />
              <HomeNavItem href="/network/lookup/">
                Headhunting
              </HomeNavItem>
            </HomeNavSection>
            <HomeNavSection
              title="Tools"
              color="#9F40FF"
              src="tools.png"
              backgroundPosition="right -240px top -46px"
              backgroundSize="720px"
              decoration={(props: SvgIconProps) => <Functions {...props} />}
            >
              <HomeNavItem href="/tools/recruit/"
                icon={
                  <Image
                    src="/img/items/TKT_RECRUIT.png"
                    width="18"
                    height="20"
                    alt="Recruitment"
                  />}
              >
                Recruitment
              </HomeNavItem>
              <HomeNavItem href="/tools/rateup/">
                <Image
                  src="/img/items/TKT_GACHA.png"
                  width="25"
                  height="20"
                  alt="Headhunting"
                />
                Rolling
              </HomeNavItem>
              <HomeNavItem href="/tools/rateup/">
                <Image
                  src="/img/items/sprite_exp_card_t4.png"
                  width="25"
                  height="20"
                  alt="Leveling"
                />
                Level Costs
              </HomeNavItem>
            </HomeNavSection>
            <HomeNavSection
              title="Planner"
              color="#FF6E40"
              src="planner.png"
              backgroundPosition="right -340px top -92px"
              backgroundSize="900px"
              decoration={(props: SvgIconProps) => <Bookmark {...props} />}
            >
              <HomeNavItem href="/planner/goals/"
                icon={<BookmarkAdd />}
              >
                Goals
              </HomeNavItem>
              <HomeNavItem href="/planner/depot/"
                icon={<Inventory2 />}
              >
                Depot
              </HomeNavItem>
            </HomeNavSection>
            <HomeNavSection
              title="Community"
              color="#6640FF"
              src="community.png"
              backgroundPosition="right -300px top -90px"
              backgroundSize="800px"
              decoration={(props: SvgIconProps) => <Forum {...props} />}
            >
              <HomeNavItemExt
                href="https://discord.gg/qx8hJGvTwc"
                target="_blank"
                rel="noreferrer noopener"
                title="Join our Discord!"
                backgroundColor="#5865F2"
              >
                <Image src="/img/assets/discord.svg"
                  width="131"
                  height="25"
                  alt=""
                />
              </HomeNavItemExt>
              <HomeNavItemExt
                href="https://github.com/neeia/ak-roster"
                target="_blank"
                rel="noreferrer noopener"
                title="Help develop Krooster!"
                backgroundColor="#50505A"
              >
                <Image
                  className="icon"
                  width="25"
                  height="25"
                  src="/img/assets/github-1.png"
                  alt=""
                />
                <Image
                  className="icon"
                  width="61"
                  height="25"
                  src="/img/assets/github-2.png"
                  alt=""
                />
              </HomeNavItemExt>
              <HomeNavItemExt
                href="https://ko-fi.com/neeia"
                target="_blank"
                rel="noreferrer noopener"
                title="Support the dev!"
                backgroundColor="#FF5E5B"
              >
                <Image
                  className="icon"
                  width="85"
                  height="25"
                  src="/img/assets/kofi.png"
                  alt="Ko-fi"
                />
              </HomeNavItemExt>
            </HomeNavSection>
          </Box>
        </Container>

        <Container
          sx={{
            height: "100vh",
            display: "flex",
            flexDirection: "column",
            py: { xs: 1, sm: 6 },
            gap: 6,
          }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "2.5fr 3fr" },
              gap: "4%",
            }}
          >
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 1, pt: 1 }}
            >
              <Typography
                variant="h2"
                sx={{ fontSize: { xs: "1.75rem", sm: "2rem" } }}
              >
                Share your entire collection with the world{" "}
                <em>instantly.</em>
              </Typography>
              <Typography
                variant="body1"
                sx={{ display: { xs: "none", sm: "block" } }}
              >
                Want to show off your roster to your friends? Flex on the
                world? Need to find that one support unit to beat CC? Krooster
                lets you do all that, and more.
              </Typography>
              <Typography variant="body1">
                You can get started without even making an account. And the
                best part? It&apos;s totally free. No ads, no paywall, and
                entirely open-source.
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  flexDirection: { xs: "column", sm: "row" },
                  gap: 2,
                  mt: 2,
                }}
              >
                {(session == null) ? (
                  <>
                    <Button
                      color="primary"
                      variant="contained"
                      sx={{
                        height: "100%",
                        pl: 2,
                        fontWeight: "bold",
                        fontSize: "1rem",
                      }}
                      onClick={() => setLogin(true)}
                    >
                      Log In
                    </Button>
                    <Button
                      color="primary"
                      variant="contained"
                      sx={{
                        height: "100%",
                        pl: 2,
                        fontWeight: "bold",
                        fontSize: "1rem",
                      }}
                      onClick={() => setRegister(true)}
                    >
                      Register
                    </Button>

                    <LoginButton open={login} onClose={() => setLogin(false)} onLogin={onLogin}>
                      <Button
                        onClick={() => {
                          setRegister(true);
                          setLogin(false);
                        }}
                        sx={{ color: "text.secondary" }}
                      >
                        Sign Up Instead
                      </Button>
                    </LoginButton>
                    <RegisterButton open={register} onClose={() => setRegister(false)} onLogin={onLogin}>
                      <Button
                        onClick={() => {
                          setRegister(false);
                          setLogin(true);
                        }}
                        sx={{ color: "text.secondary" }}
                      >
                        Log In Instead
                      </Button>
                    </RegisterButton>
                  </>
                )
                  :
                  <NextLink href="/data/input/" passHref legacyBehavior>
                    <Link
                      sx={{
                        backgroundColor: "primary.main",
                        display: "block",
                        width: "100%",
                        maxWidth: "12rem",
                        px: 2,
                        py: 1.5,
                        color: "background.default",
                        ":hover": {
                          bgcolor: "primary.main",
                          filter: "brightness(110%)",
                        },
                        borderRadius: "4px",
                        fontSize: "1.25rem",
                        textAlign: "center",
                        verticalAlign: "middle",
                        boxShadow: 1,
                        alignSelf: { xs: "center", sm: "start" },
                      }}
                      variant="button"
                    >
                      Get Started
                    </Link>
                  </NextLink>
                }
                <Box
                  component="form"
                  sx={{
                    display: { xs: "flex", sm: "contents" },
                    alignItems: "center",
                    flexDirection: { xs: "column", sm: "row" },
                    gap: 1,
                  }}
                >
                  or
                </Box>
              </Box>
            </Box>
            <Box
              boxShadow={2}
              component="img"
              src="/res/CollectionSample.webp"
              width="495"
              sx={{
                maxWidth: "100%",
                maxHeight: "auto",
                order: { xs: -1, sm: -1 },
              }}
              alt="A screenshot of a user's collection."
            />
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default Home;
