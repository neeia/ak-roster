import { ArrowRight, Description, ExpandLess, ExpandMore, PersonSearch } from "@mui/icons-material";
import {
  Alert,
  Box,
  Collapse,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import React, { useEffect } from "react";
import config from "data/config";
import DiscordInvite from "./app/DiscordInvite";
import Logo from "./app/Logo";
import { interactive } from "styles/theme/appTheme";
import JumpTo from "./base/JumpTo";
import AccountWidget from "./app/AccountWidget";
import findFirstFocusableElement from "util/fns/findFirstFocusableElement";
import useAccount from "util/hooks/useAccount";
import Link from "./base/Link";
import manifest from "data/manifest";
import useLocalStorage from "util/hooks/useLocalStorage";
import ThemeSwitcher from "./app/ThemeSwitcher";

const DRAWER_WIDTH_PX = 220;
const ICON_BY_PATH = [
  <Description key="d" height="1.5rem" />,
  <PersonSearch key="c" height="1.5rem" />,
  <svg key="0" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
    <path
      fill="currentColor"
      d="M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2
      m0 2v4h10V4H7m0 6v2h2v-2H7m4 0v2h2v-2h-2m4 0v2h2v-2h-2m-8 4v2h2v-2H7
      m4 0v2h2v-2h-2m4 0v2h2v-2h-2m-8 4v2h2v-2H7m4 0v2h2v-2h-2m4 0v2h2v-2h-2Z"
    />
  </svg>,
];

interface ConfigPage {
  title: string;
  description: string;
  requireLogin?: boolean;
}

const ListItemTab: React.FC<{
  tabTitle: string;
  startOpen: boolean;
  icon: React.ReactNode;
  children?: React.ReactNode;
}> = ({ tabTitle, startOpen, icon, children }) => {
  const [open, setOpen] = React.useState(startOpen);
  return (
    <>
      <ListItemButton onClick={() => setOpen(!open)}>
        <ListItemIcon sx={{ minWidth: 0, pr: 1 }}>{icon}</ListItemIcon>
        <ListItemText primary={tabTitle} />
        {open ? <ExpandLess height="1.5rem" /> : <ExpandMore height="1.5rem" />}
      </ListItemButton>
      <Collapse in={open} timeout="auto" unmountOnExit>
        {children}
      </Collapse>
    </>
  );
};

interface Props {
  tab: string;
  page: string;
  open: boolean;
  onDrawerToggle: () => void;
}

const AppDrawer = React.memo((props: Props) => {
  const { tab, page, open, onDrawerToggle } = props;
  const { tabs } = config;
  const { title: currentTab, pages, requireLogin: r1 } = tabs[tab];
  const { title: currentPage, requireLogin: r2 } = pages[page];

  const [account] = useAccount();
  const [_open, _setOpen] = useLocalStorage("v3_importnotif", true);
  useEffect(() => {
    if (page === "/import") {
      _setOpen(false);
    }
  }, [_open]);

  const drawerContent = (
    <Box
      sx={{
        height: "100%",
        maxHeight: "100%",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        py: "16px",
        overflowY: "auto",
        scrollbarColor: "#6b6b6b transparent",
        scrollbarWidth: "thin",
        "*::-webkit-scrollbar": {
          width: "12px",
        },
        "*::-webkit-scrollbar-track": {
          background: "transparent",
        },
        "*::-webkit-scrollbar-thumb": {
          backgroundColor: "#6b6b6b",
          borderRadius: 4,
          border: "transparent",
          outline: "transparent",
        },
      }}
    >
      <JumpTo
        onClick={() => {
          const main = document.getElementById("app-main");
          if (!main) return;
          const el = findFirstFocusableElement(main);
          if (el) (el as HTMLElement).focus();
        }}
      >
        skip to main content
      </JumpTo>
      <Logo
        hideSubtitle
        sx={{ width: "100%", height: "200px" }}
        LinkProps={{ sx: { position: "relative" } }}
      >
        <Typography
          sx={{
            position: "absolute",
            fontSize: "0.625rem",
            lineHeight: 0,
            bottom: 8,
            right: 10,
          }}
        >
          {manifest.version.split(".").slice(0, 2).join(".")}
        </Typography>
      </Logo>
      <Divider />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "4px",
          alignItems: "center",
        }}
      >
        {!account && (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "8px",
              mx: "8px",
              mb: "16px",
              "& > a": {
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "primary.main",
              },
            }}
          >
            <Link href="/login">Log In</Link>
            <Link href="/register">Register</Link>
          </Box>
        )}
        {account && <AccountWidget username={account.username} />}
        {account && _open && (
          <Alert severity="info" sx={{ m: 1 }}>
            Connect to Yostar to update your data in one click!
            <div>
              <Link sx={{ textDecoration: "1px dotted underline" }} href="/import">
                See More
              </Link>
            </div>
          </Alert>
        )}
        <ThemeSwitcher />
      </Box>
      <Divider />
      <List
        sx={{
          height: "100%",
          p: 0,
        }}
      >
        {Object.entries(tabs)
          .filter(([_, { exclude }]) => !exclude)
          .map(([tabPath, { title: tabTitle, pages }], i: number) => (
            <ListItemTab key={i} tabTitle={tabTitle} startOpen={tabTitle === currentTab} icon={ICON_BY_PATH[i]}>
              {Object.entries(pages).map(([pagePath, pg]: [string, ConfigPage]) => (
                <ListItem
                  key={pg.title}
                  disablePadding
                  sx={{
                    ...(currentPage === pg.title && {
                      borderLeftWidth: "8px",
                      borderLeftStyle: "solid",
                      borderColor: "primary.main",
                      fontWeight: "bold",
                    }),
                  }}
                >
                  <ListItemButton
                    component="a"
                    href={`${tabPath}${pagePath}`}
                    sx={{
                      p: 0,
                      ...(currentPage === pg.title && interactive),
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 0, pr: 1, pl: 3 }}>
                      <ArrowRight height="1.5rem" />
                    </ListItemIcon>
                    <ListItemText
                      sx={{
                        display: "block",
                        width: "100%",
                        px: 1,
                        py: 2,
                        m: 0,
                      }}
                      primaryTypographyProps={{
                        sx: {
                          fontSize: "1rem",
                          lineHeight: 1,
                        },
                      }}
                      primary={pg.title}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </ListItemTab>
          ))}
      </List>
      <Divider />
      <DiscordInvite />
    </Box>
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
              xl: "none",
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
              xl: "flex",
            },
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
});

AppDrawer.displayName = "AppDrawer";
export default AppDrawer;
