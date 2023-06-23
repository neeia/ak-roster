import { CacheProvider } from "@emotion/react";
import {
  Box, Button,
  Container,
  CssBaseline,
  Divider,
  IconButton,
  InputAdornment,
  Link,
  TextField,
  ThemeProvider,
  Typography,
} from "@mui/material";
import type { NextPage } from "next";
import Head from "next/head";
import NextLink from "next/link";
import config from "data/config";
import appTheme from "styles/theme/appTheme";
import createEmotionCache from "util/createEmotionCache";
import DiscordEmbed from "components/index/DiscordEmbed";
import GitHubEmbed from "components/index/GitHubEmbed";
import React, { useCallback, useEffect, useState } from "react";
import { Search } from "@mui/icons-material";
import Image from "next/image";
import RegisterButton from "components/app/RegisterDialog";
import LoginButton from "components/app/LoginDialog";
import { useRouter } from "next/router";
import supabaseClient from "util/supabaseClient";
import { Session } from "@supabase/supabase-js";

const Home: NextPage = () => {
  const clientSideEmotionCache = createEmotionCache();
  const [session, setSession] = useState<Session | null>(null);
  const [login, setLogin] = useState(false);
  const [register, setRegister] = useState(false);

  const [username, setUsername] = useState<string>("");
  const [error, setError] = useState<string>("");

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

  return (
    <CacheProvider value={clientSideEmotionCache}>
      <ThemeProvider theme={appTheme}>
        <CssBaseline />
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
          <Box
            sx={{
              backgroundColor: "background.paper",
              backgroundImage: "url(/res/kroos2banner.webp)",
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: { xs: "105px", sm: "220px" },
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                position: "relative",
                "::before": {
                  content: '""',
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: 0,
                  bottom: 0,
                  margin: "auto",
                  width: "calc(100% - 0.5rem)",
                  height: "calc(100% - 1rem)",
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                  filter: "blur(2rem)",
                },
              }}
            >
              <Typography
                variant="h1"
                position="relative"
                textAlign="center"
                sx={{ fontSize: { xs: "2rem", sm: "4rem" } }}
              >
                Ar<em>k</em>nights <em>Rooster</em>
              </Typography>
            </Box>
          </Box>
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
                    <TextField
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
                              aria-label="search"
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
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                flexDirection: "column",
                pt: 2.5,
              }}
            >
              <Typography
                variant="h2"
                sx={{ fontSize: { xs: "1.25rem", sm: "1.5rem" } }}
              >
                Tools? Calculators? We got that.
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 2,
                  mt: 1,
                  "& a": {
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "90px",
                    height: "90px",
                    px: 0.5,
                    py: 1,
                    backgroundColor: "#323232",
                    ":hover": {
                      filter: "brightness(120%)",
                    },
                    borderRadius: "4px",
                    fontSize: "1.25rem",
                    textAlign: "center",
                    verticalAlign: "middle",
                    boxShadow: 1,
                    position: "relative",
                  },
                }}
              >
                <NextLink href="/tools/recruit/" passHref legacyBehavior>
                  <Link>
                    <Image
                      src="/img/items/TKT_RECRUIT.png"
                      width="75"
                      height="80"
                      alt="Recruitment"
                    />
                  </Link>
                </NextLink>
                <NextLink href="/tools/rateup/" passHref legacyBehavior>
                  <Link>
                    <Image
                      src="/img/items/TKT_GACHA.png"
                      width="90"
                      height="71"
                      alt="Headhunting"
                    />
                  </Link>
                </NextLink>
                <NextLink href="/tools/level/" passHref legacyBehavior>
                  <Link>
                    <Image
                      src="/img/items/sprite_exp_card_t4.png"
                      width="90"
                      height="71"
                      alt="Leveling"
                    />
                  </Link>
                </NextLink>
              </Box>
            </Box>
            <Divider />
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: "8%",
                "& .block": {
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                  pt: 1,
                },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gridRow: "span 2",
                  gap: 1,
                  pt: 1,
                }}
              >
                <Typography variant="h2">Development</Typography>
                <Typography variant="body1">
                  Krooster is open-source - that means anyone can contribute.
                  Visit the repository below, or check out our contributors.
                </Typography>
                <Box
                  component="dl"
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "auto 1fr",
                    gap: "0px 1rem",
                    m: 0,
                    dd: {
                      m: 0,
                    },
                  }}
                >
                  <dt>Framework</dt>
                  <dd>NextJS</dd>
                  <dt>Interface</dt>
                  <dd>MUI</dd>
                  <dt>DB & Auth</dt>
                  <dd>Supabase Postgres</dd>
                </Box>
                <GitHubEmbed />
              </Box>
              <Box className="block">
                <Typography variant="h2">Discord</Typography>
                <Typography variant="body1">
                  Your feedback is appreciated - every bit helps make Krooster
                  better for everyone. To make requests and keep up with the
                  latest changes, join the Discord server.
                </Typography>
                <DiscordEmbed />
              </Box>
              <Box
                sx={{ display: "flex", flexDirection: "column", gap: 1, pt: 1 }}
              >
                <Typography variant="h2">Support Krooster</Typography>
                <Typography variant="body1">
                  If you like what I do and have money to spare, then you can
                  help contribute to server costs.
                </Typography>
                <Link
                  sx={{
                    backgroundColor: "#FF5E5B",
                    display: "block",
                    width: "30%",
                    minWidth: "min-content",
                    height: "min-content",
                    borderRadius: "4px",
                    boxShadow: 1,
                    position: "relative",
                    mb: 6,
                    mt: 2,
                    pl: 1.5,
                    pr: 2,
                    pt: 1.5,
                    pb: 1,
                    boxSizing: "border-box",
                    ":hover": {
                      filter: "brightness(120%)",
                    },
                  }}
                  onClick={() =>
                    window.open("https://ko-fi.com/neeia", "_blank", "noreferrer noopener")
                  }
                  title="Open Ko-fi"
                  component="button"
                >
                  <Image
                    className="icon"
                    width="131"
                    height="37"
                    src="/img/ext/kofi.png"
                    alt="Ko-fi icon"
                    loading="lazy"
                  />
                </Link>
              </Box>
            </Box>
          </Container>
        </Box>
      </ThemeProvider>
    </CacheProvider>
  );
};

export default Home;
