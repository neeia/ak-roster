import { Person, ArrowRight, Description, ExpandLess, ExpandMore, PeopleAlt, PersonSearch, ContactPage, ManageAccounts } from "@mui/icons-material";
import { Box, Button, Collapse, Divider, Drawer, Link, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography } from "@mui/material";
import { getAuth, User } from "firebase/auth";
import NextLink from "next/link";
import React, { useState } from "react";
import config from "../data/config";
import appTheme from "../styles/theme/appTheme";
import initFirebase from "../util/initFirebase";
import LoginButton from "./LoginButton";
import RegisterButton from "./RegisterButton";


const DRAWER_WIDTH_PX = 220;
const ICON_BY_PATH = [
  <Description key="d" />,
  <ManageAccounts key="a" />,
  <PersonSearch key="c" />
];

interface ConfigPage {
  title: string;
  description: string;
  requireLogin?: boolean;
}

const ListItemTab: React.FC<{ tabTitle: string; startOpen: boolean; icon: React.ReactNode; children?: React.ReactNode }> = ({ tabTitle, startOpen, icon, children }) => {
  const [open, setOpen] = React.useState(startOpen);
  return (
    <>
      <ListItemButton
        onClick={() => setOpen(!open)}>
        <ListItemIcon sx={{ minWidth: 0, pr: 1 }}>
          {icon}
        </ListItemIcon>
        <ListItemText primary={tabTitle} />
        {open ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      <Collapse in={open} timeout="auto" unmountOnExit>
        {children}
      </Collapse>
    </>
  )
}

interface Props {
  tab: keyof typeof config.tabs;
  page: string;
  open: boolean;
  onDrawerToggle: () => void;
}

const AppDrawer: React.FC<Props> = React.memo((props) => {
  const { tab, page, open, onDrawerToggle } = props;
  const { siteTitle, siteUrl, tabs } = config;
  const { title: currentTab, pages } = tabs[tab];
  const { title: currentPage } = pages[page as keyof typeof pages] ?? {};

  initFirebase();
  const [user, setUser] = useState<User | null>();
  React.useEffect(() => {
    setUser(getAuth().currentUser)
  });

  const [login, setLogin] = useState(false);
  const [register, setRegister] = useState(false);

  const drawerContent = (
    <>
      <Typography
        component="h1"
        variant="h4"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "start",
          pl: 2,
          minHeight: "48px"
        }}
      >
        <NextLink
          href={siteUrl}
        >
          {siteTitle}
        </NextLink>
        {/*<Offset />*/}
      </Typography>
      <Divider />
      <Box sx={{ display: user ? "none" : "grid", gridTemplateColumns: "1fr 1fr", gap: "4px", m: "4px" }}>
        <Button onClick={() => setLogin(true)}>
          Log In
        </Button>
        <Button onClick={() => setRegister(true)}>
          Register
        </Button>
        <LoginButton open={login} onClose={() => setLogin(false)} />
        <RegisterButton open={register} onClose={() => setRegister(false)} />
      </Box>
      <Box sx={{ display: user ? "flex" : "none", m: "4px", pl: 2 }}>
        お帰り, {user?.displayName}.
      </Box>
      <Divider />
      <List>
        {Object.entries(tabs).map(([tabPath, { title: tabTitle, pages }], i: number) => (
          <ListItemTab
            key={i}
            tabTitle={tabTitle}
            startOpen={tabTitle === currentTab}
            icon={ICON_BY_PATH[i]}
          >
            {Object.entries(pages)
              .map(([pagePath, pg]: [string, ConfigPage]) => (
                <ListItem key={pg.title} sx={{ p: 0 }}>
                  <ListItemIcon sx={{ minWidth: 0, pr: 1, pl: 3, }}>
                    <ArrowRight />
                  </ListItemIcon>
                  <ListItemButton
                    sx={{
                      ...(currentPage === pg.title && {
                        bgcolor: "primary.main",
                        ":hover": {
                          bgcolor: "primary.main",
                          filter: "brightness(110%)"
                        }
                      })
                    }}
                    disabled={pg.requireLogin && !user}
                  >
                    <NextLink
                      href={`${tabPath}${pagePath}`}
                      passHref
                    >
                      <Link
                        sx={{
                          display: "block",
                          width: "100%",
                          py: 0.5,
                          ...(currentPage === pg.title && {
                            color: "background.paper",
                            fontWeight: "bold",
                          })
                        }}
                        variant="body2"
                      >
                        {pg.title}
                      </Link>
                    </NextLink>
                  </ListItemButton>
                </ListItem>
              ))}
          </ListItemTab>
        ))}
      </List>
    </>
  );

  return (
    <Box
      component="nav"
      gridArea="drawer"
      sx={{
        width: {
          xs: 0,
          xl: `${DRAWER_WIDTH_PX}px`,
        },
      }}
    >
      <Drawer
        variant="temporary"
        anchor="left"
        open={open}
        onClose={onDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        PaperProps={{
          sx: {
            width: DRAWER_WIDTH_PX,
            display: {
              xs: "flex",
              xl: "none"
            },
            boxShadow: 6,
            backgroundImage: "none",
          },
        }}
      >
        {drawerContent}
      </Drawer>
      <Drawer
        variant="permanent"
        open
        PaperProps={{
          sx: {
            width: DRAWER_WIDTH_PX,
            display: {
              xs: "none",
              xl: "flex"
            }
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
})
export default AppDrawer;