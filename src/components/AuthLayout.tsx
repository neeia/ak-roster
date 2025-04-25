import config from "data/config";
import Head from "./app/Head";
import { alpha, Box, Typography } from "@mui/material";
import Logo from "./app/Logo";
import { server } from "util/server";
import { useEffect, useState } from "react";
import imageBase from "util/imageBase";

interface Props {
  title: string;
  path: string;
  children?: React.ReactNode;
}
const AuthLayout = (props: Props) => {
  const [rng, setRng] = useState(Math.floor(Math.random() * 8));
  useEffect(() => {
    const timeout = setInterval(() => setRng((n) => (n + 1) % 8), 8000);

    return () => clearInterval(timeout);
  }, []);

  return (
    <>
      <Head
        title={props.title}
        url={`${server}${props.path}`}
        description={config.tabs[""].pages[props.path]?.description ?? config.siteDescription}
      />
      <Box
        sx={{
          height: "100dvh",
          backgroundImage: `url('${imageBase}/assets/bg/${rng}.webp')`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          transition: "background-image 0.25s ease-in-out",
          overflowX: "hidden",
        }}
      >
        <Box
          sx={{
            width: "100%",
            height: "100%",
            backdropFilter: "blur(12px) grayscale(10%)",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              height: "100%",
              p: { xs: 4, sm: 8 },
              gap: 4,
              maxWidth: "sm",
              backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.75),
            }}
          >
            <Logo
              full
              LinkProps={{
                sx: {
                  minHeight: "128px",
                  width: "100%",
                  aspectRatio: "2",
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
      </Box>
    </>
  );
};

export default AuthLayout;
