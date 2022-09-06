import React from "react";
import { AppBar, Box, Container, CssBaseline, IconButton, ThemeProvider, Toolbar, Typography } from "@mui/material";
import Head from "next/head";
import config from "../data/config";
import MenuIcon from '@mui/icons-material/Menu';
import AppDrawer from "./AppDrawer";
import appTheme from "../styles/theme/appTheme";
import { CacheProvider } from '@emotion/react';
import createEmotionCache from '../util/createEmotionCache';
interface Props {
  tab: keyof typeof config.tabs;
  page: string;
  header?: React.ReactNode;
  children?: React.ReactNode;
}
const Layout = (props: Props) => {
  const { children, header, tab, page } = props;
  const { siteTitle, tabs } = config;
  const { title: tabTitle, description: tabDescription, pages } = tabs[tab];
  const { title: pageTitle, description: pageDescription } = pages[page as keyof typeof pages] ?? {};
  const title = `${pageTitle} - ${siteTitle}`

  const clientSideEmotionCache = createEmotionCache();
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const handleDrawerToggle = React.useCallback(() => {
    setDrawerOpen((open) => !open);
  }, []);

  return (
    <CacheProvider value={clientSideEmotionCache}>
      <ThemeProvider theme={appTheme}>
        <CssBaseline />
        <Head>
          <title>{title}</title>
          <meta
            key="url"
            property="og:url"
            content={`${config.siteUrl}${page}`}
          />
          <meta key="title"
            property="og:title"
            content={pageTitle} />
          <meta
            key="description"
            name="description"
            property="og:description"
            content={pageDescription}
          />
          <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
          <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
          <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
          <link rel="manifest" href="/manifest.json" />
          <meta name="theme-color" content="#fbc02d" />
        </Head>
        <Box
          display="grid"
          height="100%"
          gridTemplateAreas={'"drawer header" "drawer main"'}
          gridTemplateRows="auto 1fr auto"
          sx={{
            gridTemplateColumns: {
              xs: "0px 1fr",
              xl: "220px 1fr"
            }
          }}
        >
          <AppDrawer
            tab={tab}
            page={page}
            open={drawerOpen}
            onDrawerToggle={handleDrawerToggle}
          />
          <AppBar
            position="sticky"
            enableColorOnDark
            sx={{ gridArea: "header" }}
          >
            <Toolbar
              variant="dense"
            >
              {header
                ??
                <>
                  <IconButton
                    aria-label="toggle navbar"
                    edge="start"
                    onClick={handleDrawerToggle}
                    sx={{
                      display: {
                        xl: "none",
                      },
                    }}
                  >
                    <MenuIcon sx={{ color: "background.paper" }} />
                  </IconButton>
                  <Box component="span" sx={{ verticalAlign: "bottom" }}>
                    <Typography component="h2" variant="h5" noWrap sx={{ display: "inline", verticalAlign: "baseline", }}>
                      {pageTitle}
                    </Typography>
                  </Box>
                </>
              }
            </Toolbar>
          </AppBar>
          <Container
            component="main"
            maxWidth="xl"
            sx={{ gridArea: "main", p: { xs: 1, sm: 2 }, position: "relative" }}
          >
            {children}
          </Container>
        </Box>
      </ThemeProvider>
    </CacheProvider>
  )
}
export default Layout;