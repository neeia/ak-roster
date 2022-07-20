import React from "react";
import { AppBar, Box, Container, IconButton, Toolbar, Typography } from "@mui/material";
import Head from "next/head";
import config from "../data/config";
import MenuIcon from '@mui/icons-material/Menu';

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
  const title = `${tabTitle} « ${pageTitle} » ${siteTitle}`
  return (
    <>
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
      </Head>
      <Box
        display="grid"
        height="100vh"
        gridTemplateAreas={'"drawer header" "drawer main"'}
        gridTemplateRows="auto 1fr auto"
        gridTemplateColumns="auto 1fr"
      >
        <AppDrawer
          mobileOpen={mobileOpen}
          onDrawerToggle={handleDrawerToggle}
        />

        <AppBar enableColorOnDark sx={{ gridArea: "header" }}>
          <Toolbar variant="dense">
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
              <MenuIcon />
            </IconButton>
            <Typography component="h2" variant="h5" noWrap>
              {pageTitle}
            </Typography>
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
    </>
  )
}