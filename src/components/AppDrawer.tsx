import {
  ArrowRight,
  Description,
  ExpandLess,
  ExpandMore,
  PersonSearch,
  ManageAccounts,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Collapse,
  Divider,
  Drawer,
  Link,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import NextLink from "next/link";
import React, {useCallback, useEffect, useState} from "react";
import config from "data/config";
import DiscordInvite from "./app/DiscordInvite";
import LoginButton from "./app/LoginDialog";
import PatchNotes from "./app/PatchNotes";
import RegisterButton from "./app/RegisterDialog";
import Image from "next/image";
import supabaseClient from "../util/supabaseClient";
import {Session} from "@supabase/gotrue-js";
import {useRouter} from "next/router";

const DRAWER_WIDTH_PX = 220;
const ICON_BY_PATH = [
  <Description key="d" height="1.5rem" />,
  <ManageAccounts key="a" height="1.5rem" />,
  <PersonSearch key="c" height="1.5rem" />,
  <svg
    key="0"
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
  >
    <path
      fill="currentColor"
      d="M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2
      m0 2v4h10V4H7m0 6v2h2v-2H7m4 0v2h2v-2h-2m4 0v2h2v-2h-2m-8 4v2h2v-2H7
      m4 0v2h2v-2h-2m4 0v2h2v-2h-2m-8 4v2h2v-2H7m4 0v2h2v-2h-2m4 0v2h2v-2h-2Z"
    />
  </svg>,
  <Image key="p" src="/img/icons/rock.svg" alt="" width={24} height={24} />,
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

const AppDrawer: React.FC<Props> = React.memo((props) => {
  const { tab, page, open, onDrawerToggle } = props;
  const { siteTitle, siteUrl, tabs } = config;
  const { title: currentTab, pages } = tabs[tab as keyof typeof tabs];
  const { title: currentPage } = pages[page as keyof typeof pages] ?? {};

  // const [, setDoctor] = useLocalStorage<AccountInfo>("doctor", {});
  // const [, setSocial] = useLocalStorage<AccountInfo>("connections", {});

  //const [user, setUser] = useState<User | null>();
  const router = useRouter();
  const [session, setSession] = useState<Session | null>();

  const getUser = useCallback(async () => {
    const {data} = await supabaseClient.auth.getSession();
    setSession(data.session);
  }, []);

  useEffect(() => {
    getUser().then();
    // const db = getDatabase();
    // getUserStatus().then((user) => {
    //   setUser(user);
    // });
    //const auth = getAuth();

    // supabaseClient.auth.onAuthStateChange((event, session) => {
    //   console.log("event: " + event);
    // });
    // onAuthStateChanged(auth, (user) => {
    //   if (user) {
    //     set(ref(db, `users/${user.uid}/time/`), Date.now());
    //     get(ref(db, `users/${user.uid}/info/`)).then((s1) => {
    //       if (s1.exists()) {
    //         setDoctor(s1.val());
    //       }
    //     });
    //     get(ref(db, `users/${user.uid}/connections/`)).then((s1) => {
    //       if (s1.exists()) {
    //         setSocial(s1.val());
    //       }
    //     });
    //   }
    //   setUser(user);
    // });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getUser]);

  const onLogin = (session: Session) => {
    setSession(session);
  }

  const [login, setLogin] = useState(false);
  const [register, setRegister] = useState(false);

  const drawerContent = (
    <>
      <NextLink href={`/`}>
        <Typography
          component="h1"
          variant="h4"
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            WebkitTextStroke: "1.5px #121212",
            fontWeight: 700,
            fontSize: "2.5rem",
            marginBottom: 1,
            letterSpacing: "-2px",
          }}
        >
          <Box
            sx={{
              display: "block",
              mx: "auto",
              marginBottom: "-1.1em",
              zIndex: -1,
            }}
          >
            <Image
              src="/res/krooster.png"
              width="160"
              height="172"
              alt="Krooster"
            />
          </Box>
          {siteTitle}
        </Typography>
      </NextLink>
      <Divider />
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "4px",
          m: "4px",
        }}
      >
        {!session ? (
          <>
            <Button onClick={() => setLogin(true)}>Log In</Button>
            <Button onClick={() => setRegister(true)}>Register</Button>
          </>
        ) : null}
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
        {session ? (
          <Button
            sx={{ gridColumn: "span 2" }}
            onClick={async () => {
              await supabaseClient.auth.signOut();
              //needed to redirect after logout
              await router.push("/")
            }}
          >
            Log Out
          </Button>
        ) : null}
      </Box>
      <Divider />
      <List>
        {Object.entries(tabs).map(
          ([tabPath, { title: tabTitle, pages }], i: number) => (
            <ListItemTab
              key={i}
              tabTitle={tabTitle}
              startOpen={tabTitle === currentTab}
              icon={ICON_BY_PATH[i]}
            >
              {Object.entries(pages).map(
                ([pagePath, pg]: [string, ConfigPage]) => (
                  <ListItem
                    key={pg.title}
                    sx={{
                      p: 0,
                      "& .Mui-focusVisible": {
                        color: "#fff",
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 0, pr: 1, pl: 3 }}>
                      <ArrowRight height="1.5rem" />
                    </ListItemIcon>
                    <ListItemButton
                      tabIndex={-1}
                      sx={{
                        p: 0,
                        ...(currentPage === pg.title && {
                          bgcolor: "primary.main",
                          ":hover": {
                            bgcolor: "primary.main",
                            filter: "brightness(110%)",
                          },
                        }),
                      }}
                      disabled={pg.requireLogin && !session}
                    >
                      <Link component={NextLink}
                        href={`${tabPath}${pagePath}`}
                        sx={{
                          display: "block",
                          width: "100%",
                          px: 2,
                          py: 1.5,
                          ...(currentPage === pg.title && {
                            color: "background.paper",
                            fontWeight: "bold",
                          }),
                        }}
                        variant="body2"
                      >
                        {pg.title}
                      </Link>
                    </ListItemButton>
                  </ListItem>
                )
              )}
            </ListItemTab>
          )
        )}
      </List>
      <Box
        sx={{
          marginTop: "auto",
          textAlign: "center",
          pb: "4px",
          fontSize: "0.875rem",
          fontStyle: "italic",
        }}
      >
        Title Art from{" "}
        <Link
          href="http://linktr.ee/Jellyfishyu"
          target="_blank"
          rel="noreferrer noopener"
        >
          @Jellyfishyu
        </Link>
      </Box>
      <Divider sx={{ mb: 1 }} />
      <PatchNotes />
      <DiscordInvite />
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
