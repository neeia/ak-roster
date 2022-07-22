import { Person, ArrowRight, Description, ExpandLess, ExpandMore, PeopleAlt, PersonSearch, ContactPage, ManageAccounts } from "@mui/icons-material";
import { Box, Button, Collapse, Divider, Drawer, Link, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography } from "@mui/material";
import NextLink from "next/link";
import React from "react";
import config from "../data/config";
import appTheme from "../styles/theme/appTheme";


const DRAWER_WIDTH_PX = 220;
const ICON_BY_PATH = [
  <Description key="d" />,
  <ManageAccounts key="a" />,
  <PersonSearch key="c" />
];

const ListItemTab: React.FC<{ tabTitle: string; startOpen: boolean; icon: React.ReactNode; children?: React.ReactNode }> = ({ tabTitle, startOpen, icon, children }) => {
  const [open, setOpen] = React.useState(startOpen);
  return (
    <>
      <ListItemButton
        sx={{}}
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
      <List>
        {Object.entries(tabs).map(([tabPath, { title: tabTitle, pages }], i: number) => (
          <ListItemTab
            key={i}
            tabTitle={tabTitle}
            startOpen={tabTitle === currentTab}
            icon={ICON_BY_PATH[i]}
          >
            {Object.entries(pages).map(([pagePath, { title: pageTitle }]) => (
              <ListItem key={pageTitle} sx={{ p: 0 }}>
                <ListItemIcon sx={{ minWidth: 0, pr: 1, pl: 3, }}>
                  <ArrowRight />
                </ListItemIcon>
                <ListItemButton sx={{
                  ...(currentPage === pageTitle && {
                    bgcolor: "primary.main",
                    ":hover": {
                      bgcolor: "primary.main",
                      filter: "brightness(110%)"
                    }
                  })
                }}>
                  <NextLink
                    href={`${tabPath}${pagePath}`}
                    passHref
                  >
                    <Link
                      sx={{
                        display: "block",
                        width: "100%",
                        py: 0.5,
                        ...(currentPage === pageTitle && {
                          color: "background.paper",
                          fontWeight: "bold",
                        })
                      }} variant="body2">
                      {pageTitle}
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