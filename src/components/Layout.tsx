import React from "react";
import {
  AppBar,
  Box,
  Container,
  IconButton,
  ThemeProvider,
  Toolbar,
  Typography,
} from "@mui/material";
import config from "data/config";
import MenuIcon from "@mui/icons-material/Menu";
import AppDrawer from "./AppDrawer";
import Head from "./app/Head";
import { server } from "util/server";
import createTheme, { brand } from "styles/theme/appTheme";

interface Props {
  tab: string;
  page: string;
  header?: React.ReactNode;
  children?: React.ReactNode;
}
const Layout = React.memo((props: Props) => {
  const { page, tab, children, header } = props;
  const { siteTitle, siteDescription, tabs } = config;

  const { title, description } = tabs[tab].pages[page];

  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const handleDrawerToggle = React.useCallback(() => {
    setDrawerOpen((open) => !open);
  }, []);

  return (
    <ThemeProvider theme={createTheme(brand[tab])}>
      <Head
        title={title}
        url={`${server}${tab ?? ""}${page}`}
        description={description ?? siteDescription}
      />
      <Box
        display="grid"
        height="100%"
        gridTemplateAreas={'"drawer header" "drawer main"'}
        gridTemplateRows="auto 1fr auto"
        sx={{
          gridTemplateColumns: {
            xs: "0px 1fr",
            xl: "220px 1fr",
          },
        }}
      >
        <AppDrawer
          tab={tab}
          page={page}
          open={drawerOpen}
          onDrawerToggle={handleDrawerToggle}
        />
        <AppBar position="sticky" enableColorOnDark sx={{ gridArea: "header" }}>
          <Toolbar variant="dense">
            {header ?? (
              <>
                <IconButton
                  color="inherit"
                  aria-label="navigation menu"
                  edge="start"
                  onClick={handleDrawerToggle}
                  sx={{
                    mr: 2,
                    display: {
                      xl: "none",
                    },
                  }}
                >
                  <MenuIcon sx={{ color: "background.paper" }} />
                </IconButton>
                <Box component="span" sx={{ verticalAlign: "bottom" }}>
                  <Typography
                    component="h2"
                    variant="h5"
                    noWrap
                    sx={{ display: "inline", verticalAlign: "baseline" }}
                  >
                    {title}
                  </Typography>
                </Box>
              </>
            )}
          </Toolbar>
        </AppBar>
        <Container
          id="app-main"
          component="main"
          maxWidth="xl"
          sx={{ gridArea: "main", p: { xs: 1, sm: 2 }, position: "relative" }}
        >
          {children}
        </Container>
      </Box>
    </ThemeProvider>
  );
});
Layout.displayName = "Layout";
export default Layout;
