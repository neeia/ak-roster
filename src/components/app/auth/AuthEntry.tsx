import { Box, Button, Typography } from "@mui/material";
import NeutralButton from "components/shared/NeutralButton";


const AuthEntry = () => {

  return (
    <Box>
      <Box sx={{ fontSize: "0.9em", textTransform: "uppercase", mb: "16px" }}>Select One</Box>
      <Box sx={{
        display: "grid",
        gridTemplateColumns: "1fr auto 1fr",
        gap: 1,
        width: "100%",
        maxWidth: "700px",
        alignItems: "center",
        "& > button": {
          p: "20px 32px",
          textTransform: "uppercase",
        }
      }}>
        <NeutralButton>I have an account</NeutralButton>
        <Typography variant="caption2">OR</Typography>
        <NeutralButton>I'm a new user</NeutralButton>
      </Box>
    </Box>
  );
}

export default AuthEntry;