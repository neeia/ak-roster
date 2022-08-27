import { CacheProvider } from '@emotion/react'
import { NoteAlt } from '@mui/icons-material'
import { Box, Button, Container, CssBaseline, Divider, IconButton, Link, ThemeProvider, Typography } from '@mui/material'
import type { NextPage } from 'next'
import Head from 'next/head'
import NextLink from 'next/link'
import Image from 'next/image'
import config from '../data/config'
import styles from '../styles/Home.module.css'
import appTheme from '../styles/theme/appTheme'
import createEmotionCache from '../util/createEmotionCache'
import DiscordEmbed from '../components/index/DiscordEmbed'
import GitHubEmbed from '../components/index/GitHubEmbed'

const Home: NextPage = () => {
  const clientSideEmotionCache = createEmotionCache();

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
          <meta key="title"
            property="og:title"
            content="Arknights Roster" />
          <meta
            key="description"
            property="og:description"
            content="A collection and progress tracker for Arknights, a game developed by Hypergryph."
          />
          <link rel="manifest" href="/manifest.json" />
          <meta name="theme-color" content="#fbc02d" />
        </Head>
        <Box component="main" sx={{
          display: "grid",
          gridTemplateRows: "auto 1fr",
          "& em": {
            color: "primary.main",
            fontStyle: "normal",
          }
        }}>
          <Box sx={{
            "::before": {
              content: '""',
              position: "absolute",
              backgroundImage: "url(/res/kroos2banner.png)",
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              width: "100%",
              height: "100%",
              zIndex: -1,
            },
            "::after": {
              content: '""',
              position: "absolute",
              width: "100%",
              height: "100%",
              backgroundColor: "background.paper",
              zIndex: -2,
            },
            backgroundColor: "rgba(0, 0, 0, 0.1)",
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "220px",
            overflow: "hidden"
          }}>
            <Typography variant="h1" sx={{
              textShadow: "1px 0 0 #000, 0 -1px 0 #000, 0 1px 0 #000, -1px 0 0 #000"
            }}>
              Ar<em>k</em>nights <em>Rooster</em>
            </Typography>
          </Box>
          <Container sx={{
            height: "100vh",
            display: "flex",
            flexDirection: "column",
            pt: 6,
            gap: 6,
            pb: 6
          }}>
            <Box sx={{ display: "grid", gridTemplateColumns: "2.5fr 3fr", gap: "4%" }}>
              <Box component="img" src="/res/CollectionSample.png" width="100%" boxShadow={10} />
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1, pt: 1 }} >
                <Typography variant="h2">
                  Share your entire collection with the world <em>instantly.</em>
                </Typography>
                <Typography variant="body1">
                  Want to show off your roster to your friends? Flex on the world? Need to find that one support unit to beat CC? Krooster lets you do all that, and more.
                </Typography>
                <Typography variant="body1">
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
                      width: "30%",
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
                    }}
                    variant="button"
                  >
                    Get Started
                  </Link>
                </NextLink>
              </Box>
            </Box>
            <Divider />
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8%" }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1, pt: 1 }} >
                <Typography variant="h2">
                  Discord
                </Typography>
                <Typography variant="body1">
                  Your feedback is appreciated - every bit helps make Krooster better for everyone.
                  To make requests and keep up with the latest changes, join the Discord server.
                </Typography>
                <DiscordEmbed />
              </Box>
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
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1, pt: 1 }} >
                <Typography variant="h2">
                  Support Krooster
                </Typography>
                <Typography variant="body1">
                  If you like what I do and have money to spare, you should donate it to a charity.
                  But if you really want to, then you can also support the site.
                  <Link
                    sx={{
                      backgroundColor: "#FF5E5B",
                      mt: 2,
                      display: "block",
                      width: "30%",
                      height: "min-content",
                      pl: 1.5,
                      pr: 2,
                      pt: 1.5,
                      pb: 1,
                      ":hover": {
                        filter: "brightness(120%)"
                      },
                      borderRadius: "4px",
                      boxShadow: 1,
                    }}
                    href="https://ko-fi.com/neeia"
                    component="a"
                    title="Open Ko-fi"
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    <Box component="img" width="100%" src="/img/ext/kofi.png" alt="Ko-fi icon" />
                  </Link>
                </Typography>
              </Box>
            </Box>
          </Container>
        </Box>
      </ThemeProvider>
    </CacheProvider>
  )
}

export default Home
