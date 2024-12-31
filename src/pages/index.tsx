import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  BoxProps,
  Button,
  IconButton,
  InputAdornment,
  Paper,
  SxProps,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import type { NextPage } from "next";
import config from "data/config";
import React, { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { getLogoUrl } from "components/app/Logo";
import HomeNavItem from "components/landing/HomeNavItem";
import HomeNavSection from "components/landing/HomeNavSection";
import { brand, DISCORD_BLURPLE, GITHUB_DARK, KOFI_BLUE } from "styles/theme/appTheme";
import { ExpandMore, LockPerson, Search } from "@mui/icons-material";
import JumpTo from "components/base/JumpTo";
import Link from "components/base/Link";
import Head from "components/app/Head";
import { server } from "util/server";
import AccountWidget from "components/app/AccountWidget";
import useAccount from "util/hooks/useAccount";
import GitHubEmbed from "components/landing/GitHubEmbed";
import DiscordEmbed from "components/landing/DiscordEmbed";

const cons = [
  {
    name: "Neia",
    login: "neeia",
    avatar: "neia.png",
    dark: true,
    color: "#4b444b",
  },
  {
    name: "Samidare☔️",
    login: "iansjk",
    avatar: "samidare.webp",
    dark: false,
    color: "#fff",
  },
  {
    name: "Yesod30",
    login: "yesod30",
    avatar: "yesod.gif",
    dark: true,
    color: "#384c6a",
    // color: "#eeddbb"
  },
  {
    name: "Stinggyray",
    login: "Stinggyray",
    avatar: "stinggyray.png",
    dark: false,
    color: "#FFCD4C",
  },
];

const authFrame: SxProps = {
  display: "flex",
  gap: 2,
  width: "100%",
  maxWidth: "sm",
  minHeight: 80,
  borderRadius: 1,
  p: 2,
};

interface TabPanelProps extends BoxProps {
  index: number;
  value: number;
  component?: string;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, sx, ...rest } = props;

  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      sx={{
        width: "100%",
        maxWidth: "40rem",
        ...sx,
      }}
      {...rest}
    >
      {value === index && children}
    </Box>
  );
}

function a11yProps(index: number) {
  return {
    id: `tab-${index}`,
    "aria-controls": `tabpanel-${index}`,
  };
}

const Home: NextPage = () => {
  const [searchText, setSearchText] = useState<string>("");

  const [errors, setErrors] = useState<string[]>([]);
  const [value, setValue] = React.useState(1);

  const handleChange = (_: any, newValue: number) => {
    setValue(newValue);
  };

  const search = useCallback((s: string) => {
    window.location.href = `/u/${s}`;
  }, []);

  const logoBasePath = useRef(`/assets/title/${getLogoUrl()}`);

  const [account, , { loading }] = useAccount();

  return (
    <Head title="Krooster" url={server} description={config.siteDescription}>
      <Box
        component="main"
        sx={{
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "background.paper",
          alignItems: "center",
          gap: 4,
          p: 2,
        }}
      >
        <JumpTo href="search">jump to search</JumpTo>
        <Box component="h1" display="flex" m={0}>
          <Box
            component="img"
            alt="Krooster - Arknights Roster"
            sx={{
              height: "16rem",
              content: {
                xs: `url(${logoBasePath.current}-v.png)`,
                sm: `url(${logoBasePath.current}-h.png)`,
              },
            }}
          />
        </Box>

        {!loading && !account ? (
          <Paper
            elevation={2}
            sx={{
              ...authFrame,
              alignItems: "center",
            }}
          >
            <Button
              component={Link}
              href="/register"
              variant="contained"
              sx={{
                ":hover": { backgroundColor: "primary.light" },
                width: "100%",
                height: "100%",
                fontSize: "1rem",
              }}
            >
              New User
            </Button>
            <span>or</span>
            <Button
              component={Link}
              href="/login"
              variant="outlined"
              sx={{
                width: "100%",
                height: "100%",
                fontSize: "1rem",
              }}
            >
              Sign In
            </Button>
          </Paper>
        ) : (
          <Paper
            elevation={2}
            sx={{
              ...authFrame,
              flexDirection: "column",
            }}
          >
            <AccountWidget sx={{ p: 0 }} username={account?.username} />
            <Alert severity="info">
              You can now update your information in one click by connecting to Yostar!
              <div>
                <Link sx={{ textDecoration: "1px dotted underline" }} href="/import">
                  See More
                </Link>
              </div>
            </Alert>
            {errors.map((err, i) => (
              <Alert
                key={i}
                severity="error"
                onClose={() => {
                  setErrors([...errors.slice(0, i), ...errors.slice(i + 1)]);
                }}
              >
                {err}
              </Alert>
            ))}
          </Paper>
        )}

        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="tab menu"
          sx={{ mt: 8, ml: 4, width: "100%", maxWidth: "40rem" }}
        >
          <Tab value={1} label="Menu" {...a11yProps(1)}></Tab>
          <Tab value={2} label="About" {...a11yProps(2)}></Tab>
          <Tab value={3} label="Updates" {...a11yProps(3)}></Tab>
        </Tabs>
        <TabPanel index={1} value={value} component="nav">
          <Box
            component="ul"
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
              m: 0,
              p: 0,
            }}
          >
            <HomeNavSection title="Data" color={brand["/data"]} src="data">
              <Alert
                severity="warning"
                variant="outlined"
                icon={<LockPerson />}
                sx={{
                  display: account ? "none" : "flex",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                You must be logged in to access these features.
              </Alert>
              <HomeNavItem disabled={!account} href={"/data/input"}>
                Roster
              </HomeNavItem>
              <HomeNavItem disabled={!account} href={"/data/view"}>
                Collection
              </HomeNavItem>
              <HomeNavItem
                disabled={!account}
                href={"/data/planner"}
                icon={<Image key="p" src="/img/icons/rock.svg" alt="" width={24} height={24} />}
              >
                Planner
              </HomeNavItem>
              <HomeNavItem disabled={!account} href={"/data/profile"}>
                Profile
              </HomeNavItem>
            </HomeNavSection>
            <HomeNavSection title="Network" color={brand["/network"]} src="network">
              <Box component="li" display="flex">
                <TextField
                  id="search"
                  autoComplete="off"
                  label="Find a user..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  size="small"
                  InputProps={{
                    sx: { width: "240px", pr: 0.5 },
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          type="submit"
                          aria-label="search"
                          onClick={(e) => {
                            e.preventDefault();
                            search(searchText);
                          }}
                        >
                          <Search fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
              <HomeNavItem href={"/network/findafriend"}>Support Search</HomeNavItem>
            </HomeNavSection>
            <HomeNavSection title="Tools" color={brand["/tools"]} src="tools">
              <HomeNavItem href={"/tools/recruit"}>Recruitment</HomeNavItem>
              <HomeNavItem href={"/tools/rateup"}>Headhunting</HomeNavItem>
              <HomeNavItem href={"/tools/level"}>Level Costs</HomeNavItem>
            </HomeNavSection>
            <HomeNavSection title="Community" color={brand["/community"]} src="community">
              <HomeNavItem
                external
                href="https://discord.gg/qx8hJGvTwc"
                title="Join our Discord!"
                sx={{
                  backgroundColor: DISCORD_BLURPLE,
                }}
              >
                <Image src="/img/assets/discord.svg" width="20" height="15" alt="" />
                Discord
              </HomeNavItem>
              <HomeNavItem
                external
                href="https://github.com/neeia/ak-roster"
                title="For developers!"
                sx={{
                  backgroundColor: GITHUB_DARK,
                }}
              >
                <Image width="18" height="18" src="/img/assets/github-1.png" alt="" />
                GitHub
              </HomeNavItem>
              <HomeNavItem
                external
                href="https://ko-fi.com/neeia"
                title="Support Krooster!"
                sx={{
                  backgroundColor: KOFI_BLUE,
                }}
              >
                <Image className="icon" width="24" height="16" src="/img/assets/ko-fi.png" alt="Ko-fi" />
                Donations
              </HomeNavItem>
            </HomeNavSection>
          </Box>
        </TabPanel>
        <TabPanel index={2} value={value}>
          <Box component="aside" sx={{ "& h2": { m: 0 } }}>
            <Accordion defaultExpanded slotProps={{ heading: { component: "h2" } }}>
              <AccordionSummary expandIcon={<ExpandMore />}>What is Krooster?</AccordionSummary>
              <AccordionDetails>
                <p>
                  Krooster (Arknights Roster) is a web app that lets you share your roster, plan goals, and find
                  friends. It also includes a number of useful calculators.
                </p>
                <p>
                  This is an open-source project, and the full source code is available on GitHub. It is a fan site and
                  is unaffiliated with Hypergryph or Yostar.
                </p>
              </AccordionDetails>
            </Accordion>
            <Accordion slotProps={{ heading: { component: "h2" } }}>
              <AccordionSummary expandIcon={<ExpandMore />}>Okay, but what is a Krooster?</AccordionSummary>
              <AccordionDetails>
                <p>
                  Krooster is a portmanteau of "Kroos" and "alter" and refers to Kroos the Keen Glint. Because I was
                  working on this project around the time she was released, I decided to name it after her.
                </p>
              </AccordionDetails>
            </Accordion>
            <Accordion slotProps={{ heading: { component: "h2" } }}>
              <AccordionSummary expandIcon={<ExpandMore />}>I found a bug / can you add this feature?</AccordionSummary>
              <AccordionDetails>
                <p>Join the Discord server and let me know! I'm always looking for feedback and suggestions.</p>
                <DiscordEmbed />
              </AccordionDetails>
            </Accordion>
            <Accordion slotProps={{ heading: { component: "h2" } }}>
              <AccordionSummary expandIcon={<ExpandMore />}>How can I contribute?</AccordionSummary>
              <AccordionDetails>
                <p>
                  Donations are welcomed through Ko-fi! Running Krooster costs around $2 a day, and donating helps
                  offset my out-of-pocket costs.
                </p>
                <HomeNavItem
                  external
                  href="https://ko-fi.com/neeia"
                  title="Support Krooster!"
                  sx={{
                    backgroundColor: KOFI_BLUE,
                  }}
                >
                  <Image className="icon" width="24" height="16" src="/img/assets/ko-fi.png" alt="Ko-fi" />
                  Donations
                </HomeNavItem>
                <p>
                  If you're a developer, you can contribute to the project on GitHub. The project is open-source and
                  contributions are welcome. If you're interested, join the Discord server and shoot me a message!
                </p>
                <GitHubEmbed />
              </AccordionDetails>
            </Accordion>
            <Accordion slotProps={{ heading: { component: "h2" } }}>
              <AccordionSummary expandIcon={<ExpandMore />}>Who made this?</AccordionSummary>
              <AccordionDetails>
                <p>
                  Hi, I'm Neia, the primary developer of Krooster. I played Arknights from release, and quit shortly
                  after the third anniversary. However, the website will continue to be actively maintained until the
                  game shuts down.
                </p>
                <p>Special thanks to Samidare, without whom Krooster would not exist.</p>
                <p>
                  This project would not be possible without the help of the community that makes it worth it. Thank
                  you!
                </p>
                <Typography variant="h5" component="h3" sx={{ pt: 3, pb: 1 }}>
                  Contributors:
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {cons.map((c) => (
                    <Link
                      key={c.name}
                      sx={{
                        ":hover": {
                          filter: "brightness(110%)",
                        },
                        transition: "filter 0.1s",
                        boxShadow: 1,
                        width: "max-content",
                        color: c.dark ? "text.primary" : "background.paper",
                        display: "grid",
                        gridTemplateColumns: "1fr 2.5fr",
                        gap: 1.5,
                        textDecoration: "none",
                        padding: 1,
                        borderRadius: "4px",
                        backgroundColor: c.color,
                      }}
                      href={`https://github.com/${c.login}`}
                      component="a"
                      title="Visit GitHub Profile"
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      <Image src={`/img/ext/contributors/${c.avatar}`} alt="" width={48} height={48} />
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 0 }}>
                        <Typography variant="body1">{c.name}</Typography>
                        <Typography variant="caption2">{c.login}</Typography>
                      </Box>
                    </Link>
                  ))}
                </Box>
              </AccordionDetails>
            </Accordion>
          </Box>
        </TabPanel>
        <TabPanel index={3} value={value}>
          <Box component="aside"></Box>
        </TabPanel>
        <Box sx={{ height: "60px" }} />
      </Box>
    </Head>
  );
};

export default Home;
