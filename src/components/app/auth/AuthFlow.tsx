import { Box, Button } from "@mui/material";
import AuthEntry from "./AuthEntry";

const AuthFlow = () => {

  return (
    <Box sx={{ display: "flex", flexDirection: "column", m: 8, gap: 4 }}>
      <Box sx={{ fontSize: "2em", "& > p": { margin: 0 } }}>
        <p>Welcome!</p>
        <p>Looks like you're not signed in.</p>
      </Box>
      <AuthEntry />
    </Box>
  );
}

export default AuthFlow;