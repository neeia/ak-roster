import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  AlertTitle,
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
import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "components/base/Image";
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
import Update from "components/landing/PatchNotes";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import imageBase from "util/imageBase";

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
    name: "Voiddp",
    login: "Voiddp",
    avatar: "voiddp.webp",
    dark: true,
    color: "rgb(51, 53, 50)",
  },
  {
    name: "DipstickPinez",
    login: "DipstickPinez",
    avatar: "dipstickpinez.webp",
    dark: false,
    color: "#5ed6b4",
  },
  {
    name: "Stinggyray",
    login: "Stinggyray",
    avatar: "stinggyray.webp",
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

const ThemeSwitcher = dynamic(() => import("components/app/ThemeSwitcher"), { ssr: false });
const Home: NextPage = () => {
  const [searchText, setSearchText] = useState<string>("");

  const [errors, setErrors] = useState<string[]>([]);
  const [value, setValue] = React.useState(1);

  const handleChange = (_: any, newValue: number) => {
    setValue(newValue);
  };

  const { asPath } = useRouter();
  useEffect(() => {
    const hash = asPath.split("#")[1];
    if (hash?.startsWith("v")) {
      setValue(3);
      window.history.replaceState(null, "", asPath.split("#")[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [asPath]);

  const search = useCallback((s: string) => {
    window.location.href = `/u/${s}`;
  }, []);

  const logoBasePath = useRef(`${imageBase}/title/${getLogoUrl()}`);

  const [account, , { loading }] = useAccount();

  return (
    <>
      <Head title="Krooster" url={server} description={config.siteDescription}></Head>
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
                xs: `url('${logoBasePath.current}-v.webp')`,
                sm: `url('${logoBasePath.current}-h.webp')`,
              },
            }}
          />
        </Box>
        <Typography>
          Sponsored by the{" "}
          <Link href="https://maa.plus/" target="_blank" rel="noreferrer noopener" sx={{ color: "#299764" }}>
            MAA Assistant Arknights
          </Link>{" "}
          team.
        </Typography>
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
              <AlertTitle>Importing is back!</AlertTitle>
              <div>We've fixed the import function, and you can also import from JP and KR servers now.</div>
              <Link sx={{ textDecoration: "1px dotted underline" }} href="/data/import">
                Go to Import
              </Link>
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
        <ThemeSwitcher />
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="tab menu"
          sx={{
            mt: 8,
            ml: 4,
            width: "100%",
            maxWidth: "40rem",
            "& .Mui-selected": {
              fontWeight: "bolder",
            },
          }}
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
              <HomeNavItem disabled={!account} href={"/data/planner"}>
                Planner
              </HomeNavItem>
              <HomeNavItem disabled={!account} href={"/data/profile"}>
                Profile
              </HomeNavItem>
              <HomeNavItem disabled={!account} href={"/data/import"}>
                Import
              </HomeNavItem>
            </HomeNavSection>
            <HomeNavSection title="Network" color={brand["/network"]} src="network">
              <Box component="li" display="flex">
                <Box component="form" display="flex">
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
              </Box>
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
                  color: "#F2F2F2",
                }}
              >
                <Image src={`${imageBase}/assets/icons/discord.svg`} sx={{ width: "20px", height: "15px" }} alt="" />
                Discord
              </HomeNavItem>
              <HomeNavItem
                external
                href="https://github.com/neeia/ak-roster"
                title="For developers!"
                sx={{
                  backgroundColor: GITHUB_DARK,
                  color: "#F2F2F2",
                }}
              >
                <Image src={`${imageBase}/assets/icons/github-1.webp`} sx={{ width: "18px", height: "18px" }} alt="" />
                GitHub
              </HomeNavItem>
              <HomeNavItem
                external
                href="https://ko-fi.com/neeia"
                title="Support Krooster!"
                sx={{
                  backgroundColor: KOFI_BLUE,
                  color: "#F2F2F2",
                }}
              >
                <Image
                  className="icon"
                  sx={{ width: "24px", height: "16px" }}
                  src={`${imageBase}/assets/icons/ko-fi.webp`}
                  alt="Ko-fi"
                />
                Donations
              </HomeNavItem>
              <HomeNavItem
                external
                href="https://maa.plus/"
                sx={{
                  backgroundColor: "#B8B8C0",
                  color: "#101014",
                }}
              >
                <svg width="24" height="24" viewBox="0 0 28 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4.89788 5.7712L4.5614 3.349H7.92624L4.89788 5.7712Z" fill="#484858"></path>
                  <path d="M9.90436 0.158447L8.97258 2.39429H5.86664L9.90436 0.158447Z" fill="#363643"></path>
                  <path d="M13.4007 3.23247L9.93237 2.51914L10.9729 0.0224609L13.4007 3.23247Z" fill="#484858"></path>
                  <path d="M14.6777 3.36406L12.1334 0L17.949 1.86892L14.6777 3.36406Z" fill="#363643"></path>
                  <path d="M15.7828 3.904L19.0627 2.40491L20.8849 5.77787L15.7828 3.904Z" fill="#484858"></path>
                  <path d="M10.6162 7.30546L9.87225 3.48035L13.5918 4.24537L10.6162 7.30546Z" fill="#484858"></path>
                  <path d="M8.97093 3.72363L9.72695 7.61096L5.56885 6.44476L8.97093 3.72363Z" fill="#87879B"></path>
                  <path d="M4.02947 6.28408L1.12329 6.94822L3.70656 3.95959L4.02947 6.28408Z" fill="#363643"></path>
                  <path d="M0.885742 7.9805L4.08552 7.24927V10.5398L0.885742 7.9805Z" fill="#484858"></path>
                  <path d="M9.09586 8.42361L5.01581 10.7122V7.2793L9.09586 8.42361Z" fill="#87879B"></path>
                  <path d="M9.37436 9.35522L8.46425 11.5391L6.03729 11.2271L9.37436 9.35522Z" fill="#E8E8F2"></path>
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M14.097 11.156L9.48358 11.5209L10.5482 8.96631L14.097 11.156Z"
                    fill="#87879B"
                  ></path>
                  <path d="M14.2049 4.96631L14.9862 10.5908L11.0796 8.18029L14.2049 4.96631Z" fill="#87879B"></path>
                  <path d="M15.1032 4.66833L20.9203 6.80479L15.9342 10.6504L15.1032 4.66833Z" fill="#484858"></path>
                  <path d="M20.5312 3.15442L24.7251 5.80851L22.1442 6.14027L20.5312 3.15442Z" fill="#363643"></path>
                  <path d="M22.5993 7.04386L25.3345 6.69226L23.9669 9.85668L22.5993 7.04386Z" fill="#363643"></path>
                  <path d="M17.1057 10.9411L21.723 7.37988L23.2621 10.5454L17.1057 10.9411Z" fill="#484858"></path>
                  <path d="M24.6167 10.7079L26.0314 7.43457L27.446 11.799L24.6167 10.7079Z" fill="#363643"></path>
                  <path d="M27.5 12.8396L25.737 15.7403L24.6793 11.7518L27.5 12.8396Z" fill="#363643"></path>
                  <path d="M17.0881 15.0603L23.6921 11.6647L24.9303 16.3337L17.0881 15.0603Z" fill="#484858"></path>
                  <path d="M16.0499 11.9653L21.7421 11.5995L16.0499 14.5263V11.9653Z" fill="#87879B"></path>
                  <path d="M15.1196 12.0326V14.5528L10.5684 12.3926L15.1196 12.0326Z" fill="#87879B"></path>
                  <path d="M12.6529 17.7603L9.93732 13.1449L14.7994 15.4526L12.6529 17.7603Z" fill="#E8E8F2"></path>
                  <path d="M1.21974 11.9993L0.555847 8.927L3.54335 11.3165L1.21974 11.9993Z" fill="#87879B"></path>
                  <path d="M5.01581 13.8969V12.0579L7.40024 12.3644L5.01581 13.8969Z" fill="#E8E8F2"></path>
                  <path d="M2.05988 12.7453L4.08553 12.1501V13.9357L2.05988 12.7453Z" fill="#87879B"></path>
                  <path d="M0.5 16.527L1.18994 13.3342L3.60473 14.7533L0.5 16.527Z" fill="#87879B"></path>
                  <path d="M6.15032 18.5781L5.0979 14.9705L7.90435 13.1667L6.15032 18.5781Z" fill="#E8E8F2"></path>
                  <path d="M11.8441 18.2325L8.8772 13.1901L4.98877 26L11.8441 18.2325Z" fill="#E8E8F2"></path>
                  <path d="M4.27114 15.4651L5.39967 19.3336L0.885559 17.3993L4.27114 15.4651Z" fill="#E8E8F2"></path>
                </svg>
                Sanity;Gone
              </HomeNavItem>
              <HomeNavItem
                external
                href="https://maa.plus/"
                sx={{
                  backgroundColor: "#299764",
                  color: "#F2F2F2",
                }}
              >
                <Image
                  className="icon"
                  sx={{ width: "24px", height: "24px" }}
                  src={`${imageBase}/assets/icons/maa.webp`}
                  alt="MAA"
                />
                MAA Assistant Arknights
              </HomeNavItem>
              <HomeNavItem
                external
                href="https://hermitzplanner.github.io/skins/#"
                sx={{
                  backgroundColor: "#F2F287",
                  color: "#212121",
                }}
              >
                Skin Planner
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
                  <Image
                    className="icon"
                    sx={{ width: "24px", height: "16px" }}
                    src={`${imageBase}/assets/icons/ko-fi.webp`}
                    alt="Ko-fi"
                  />
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
                  you! And a special thank you to the generous donors who support our work on Ko-fi. Your support is
                  much appreciated, and every dollar goes back into keeping the site running.
                </p>
                <p>
                  Title art by the wonderful{" "}
                  <Link
                    href="https://linktr.ee/Jellyfishyu"
                    title="Linktree"
                    target="_blank"
                    rel="noreferrer noopener"
                    color="primary"
                  >
                    Elise Mosser
                  </Link>
                  .
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
                        color: c.dark ? "#F2F2F2" : "#121212",
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
                      <Image src={`${imageBase}/assets/contributors/${c.avatar}`} alt="" width={48} height={48} />
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
          <Box component="aside">
            <Update />
          </Box>
        </TabPanel>
        <Box sx={{ height: "60px" }} />
      </Box>
    </>
  );
};

export default Home;
