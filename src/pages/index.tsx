import { CacheProvider } from '@emotion/react'
import { Box, Container, CssBaseline, Divider, Link, ThemeProvider, Typography } from '@mui/material'
import type { NextPage } from 'next'
import Head from 'next/head'
import NextLink from 'next/link'
import config from '../data/config'
import appTheme from '../styles/theme/appTheme'
import createEmotionCache from '../util/createEmotionCache'
import DiscordEmbed from '../components/index/DiscordEmbed'
import GitHubEmbed from '../components/index/GitHubEmbed'
import { useEffect, useState } from 'react'
import { LockClockOutlined } from '@mui/icons-material'

const Home: NextPage = () => {
  const clientSideEmotionCache = createEmotionCache();

  const [seconds, setSeconds] = useState(60);
  useEffect(() => {
    let myInterval = setInterval(() => {
      if (seconds > 0) {
        setSeconds(seconds - 1);
      }
      if (seconds === 0) {
        clearInterval(myInterval)
      }
    }, 1000);
    return () => clearInterval(myInterval);
  }, [seconds]);

  return (
    <CacheProvider value={clientSideEmotionCache}>
      <ThemeProvider theme={appTheme}>
        <CssBaseline />
        <Head>
          <title>Krooster</title>
          <meta
            key="url"
            property="og:url"
            content={config.siteUrl}
          />
          <meta
            key="title"
            property="og:title"
            content="Arknights Roster" />
          <meta
            key="description"
            name="description"
            property="og:description"
            content="A collection and progress tracker for Arknights, a game developed by Hypergryph."
          />
          <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
          <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
          <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
          <link rel="manifest" href="/manifest.json" />
          <meta name="theme-color" content="#fbc02d" />
        </Head>
        <Box component="main" sx={{
          display: "flex",
          flexDirection: "column",
          "& em": {
            color: "primary.main",
            fontStyle: "normal",
          }
        }}>
          <Box sx={{
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
          }}>
            <Box sx={{
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
              }
            }}>
              <Typography variant="h1" position="relative" textAlign="center" sx={{ fontSize: { xs: "2rem", sm: "4rem" } }}>
                Ar<em>k</em>nights <em>Rooster</em>
              </Typography>
            </Box>
          </Box>
          <Container sx={{
            height: "100vh",
            display: "flex",
            flexDirection: "column",
            py: { xs: 1, sm: 6 },
            gap: 6,
          }}>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "2.5fr 3fr" }, gap: "4%" }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1, pt: 1 }} >
                <Typography variant="h2" sx={{ fontSize: { xs: "1.75rem", sm: "2rem" } }}>
                  Share your entire collection with the world <em>instantly.</em>
                </Typography>
                <Typography variant="body1" sx={{ display: { xs: "none", sm: "block" } }}>
                  Want to show off your roster to your friends? Flex on the world? Need to find that one support unit to beat CC? Krooster lets you do all that, and more.
                </Typography>
                <Typography variant="body1" sx={{ fontSize: { xs: "1rem", sm: "1rem" } }}>
                  You can get started without even making an account. And the best part? It&apos;s totally free. No ads, no paywall, and entirely open-source.
                </Typography>
                <NextLink
                  href="/data/input/"
                  passHref
                >
                  <Link
                    sx={{
                      backgroundColor: "primary.main",
                      mt: 2,
                      display: "block",
                      width: "100%",
                      maxWidth: "12rem",
                      px: 2,
                      py: 1.5,
                      color: "background.default",
                      ":hover": {
                        bgcolor: "primary.main",
                        filter: "brightness(110%)"
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
              </Box>
              <Box
                boxShadow={10}
                component="img"
                src="/res/CollectionSample.webp"
                width="495px"
                sx={{ maxWidth: "100%", maxHeight: "auto", order: { xs: -1, sm: -1 } }}
                alt="A screenshot of a user's collection."
              />
            </Box>
            <Divider />
            <Box sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: "8%",
              "& .block": {
                display: "flex",
                flexDirection: "column",
                gap: 1,
                pt: 1
              },
            }}>
              <Box sx={{ display: "flex", flexDirection: "column", gridRow: "span 2", gap: 1, pt: 1 }} >
                <Typography variant="h2">
                  Development
                </Typography>
                <Typography variant="body1">
                  Krooster is open-source - that means anyone can contribute. Visit the repository below, or check out our contributors.
                </Typography>
                <Box component="dl" sx={{
                  display: "grid",
                  gridTemplateColumns: "auto 1fr",
                  gap: "0px 1rem",
                  m: 0,
                  "dd": {
                    m: 0,
                  }
                }}>
                  <dt>Framework</dt>
                  <dd>NextJS, React</dd>
                  <dt>Interface</dt>
                  <dd>MUI v5</dd>
                </Box>
                <GitHubEmbed />
              </Box>
              <Box className="block">
                <Typography variant="h2">
                  Discord
                </Typography>
                <Typography variant="body1">
                  Your feedback is appreciated - every bit helps make Krooster better for everyone.
                  To make requests and keep up with the latest changes, join the Discord server.
                </Typography>
                <DiscordEmbed />
              </Box>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1, pt: 1 }} >
                <Typography variant="h2">
                  Support Krooster
                </Typography>
                <Typography variant="body1">
                  If you like what I do and have money to spare, you should donate it to a charity.
                  But if you really want to, then you can also support the site.
                </Typography>
                <Link
                  sx={{
                    backgroundColor: "#FF5E5B",
                    mt: 2,
                    display: "block",
                    width: "30%",
                    minWidth: "min-content",
                    height: "min-content",
                    borderRadius: "4px",
                    boxShadow: 1,
                    position: "relative",
                    mb: 6,
                  }}
                  onClick={() => window.open("https://ko-fi.com/neeia", "_blank", "noreferrer noopener")}
                  title="Open Ko-fi"
                  component="button"
                  disabled={seconds > 0}
                >
                  {seconds
                    ? <Box sx={{
                      position: "absolute",
                      backgroundColor: "rgba(0,0,0,0.7)",
                      width: "100%",
                      height: "100%",
                      alignItems: "center",
                      justifyContent: "center",
                      display: "flex",
                      gap: 1
                    }}>
                      <LockClockOutlined />
                      <Typography variant="button">
                        {seconds}
                      </Typography>
                    </Box>
                    : null
                  }
                  <Box sx={{
                    ml: 1.5,
                    mr: 2,
                    mt: 1.5,
                    mb: 1,
                    ":hover": {
                      filter: "brightness(120%)"
                    },
                  }} component="img" width="131px" height="37px"
                    src="/img/ext/kofi.png" alt="Ko-fi icon" loading="lazy"
                  />
                </Link>
              </Box>
            </Box>
          </Container>
        </Box>
      </ThemeProvider>
    </CacheProvider>
  )
}

export default Home