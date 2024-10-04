import { Box, BoxProps, Skeleton, Typography } from "@mui/material";
import AccountContextMenu from "./AccountContextMenu";

interface Props extends BoxProps {
  username?: string | null;
}
const AccountWidget = (props: Props) => {
  const { username, sx, ...rest } = props;

  return (
    <Box
      sx={{
        width: "100%",
        px: 2,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        ...sx,
      }}
      {...rest}
    >
      <Box sx={{ width: "100%", display: "flex", flexDirection: "column" }}>
        <Typography sx={{ fontSize: "0.875rem", color: "text.secondary" }}>
          Signed in as
        </Typography>
        {username ?? <Skeleton variant="text" />}
      </Box>
      <AccountContextMenu />
    </Box>
  );
};

export default AccountWidget;
