import config from "data/config";
import Head from "./app/Head";
import { Box, Typography } from "@mui/material";
import Logo from "./app/Logo";
import { server } from "util/server";

interface Props {
  title: string;
  children?: React.ReactNode;
}
const AuthLayout = (props: Props) => {
  return (
    <Head
      title="Krooster"
      url={`${server}/register`}
      description={config.siteDescription}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
          height: "100dvh",
          justifyItems: "center",
        }}
      >
        <Box
          sx={{
            display: { xs: "none", lg: "block" },
            p: 8,
          }}
        >
          <Logo
            full
            sx={{
              height: "16rem",
              width: "32rem",
            }}
          />
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            height: "100%",
            p: { xs: 4, lg: 8 },
            gap: 4,
            maxWidth: "sm",
            backgroundColor: "background.paper",
          }}
        >
          <Logo
            full
            LinkProps={{
              sx: {
                minHeight: "128px",
                width: "100%",
                aspectRatio: "2",
                display: { xs: "", lg: "none" },
              },
            }}
            sx={{
              height: "100%",
              width: "100%",
            }}
          />
          <Typography variant="h2" sx={{ fontSize: "1.5rem" }}>
            {props.title}
          </Typography>
          {props.children}
        </Box>
      </Box>
    </Head>
  );
};

export default AuthLayout;
