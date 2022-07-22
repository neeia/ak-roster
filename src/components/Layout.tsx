import React, { useEffect } from "react";
import { AppBar, Box, Container, IconButton, ThemeProvider, Toolbar, Typography } from "@mui/material";
import Head from "next/head";
import config from "../data/config";
import MenuIcon from '@mui/icons-material/Menu';
import AppDrawer from "./AppDrawer";
import appTheme from "../styles/theme/appTheme";

interface Props {
  tab: keyof typeof config.tabs;
  page: string;
  children?: React.ReactNode;
}
const Layout = (props: Props) => {
  const { children, tab, page } = props;
  const { siteTitle, tabs } = config;
  const { title: tabTitle, description: tabDescription, pages } = tabs[tab];
  const { title: pageTitle, description: pageDescription } = pages[page as keyof typeof pages] ?? {};
  const title = `${tabTitle} . ${pageTitle} . ${siteTitle}`


  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const handleDrawerToggle = React.useCallback(() => {
    setDrawerOpen((open) => !open);
  }, []);

  return (
    <ThemeProvider theme={appTheme}>
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
          property="og:description"
          content={pageDescription}
        />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#fbc02d" />
      </Head>
      <Box
        display="grid"
        height="100vh"
        gridTemplateAreas={'"drawer header" "drawer main"'}
        gridTemplateRows="auto 1fr auto"
        gridTemplateColumns="auto 1fr"
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
            sx={{
            }}
          >
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
              <Typography component="h3" variant="h6" noWrap sx={{ ml: "1.5rem", display: "inline", verticalAlign: "baseline", }}>
                {pageDescription}
              </Typography>
            </Box>
          </Toolbar>
        </AppBar>

        <Container
          component="main"
          maxWidth="xl"
          sx={{ gridArea: "main", p: 2 }}
        >
          {children}
        </Container>
      </Box>
    </ThemeProvider>
  )
}
export default Layout;