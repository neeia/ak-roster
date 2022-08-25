import { Box, Button } from "@mui/material";

interface Props {
  href: string;
  label: string;
  title?: string;
  children?: React.ReactNode;
}

const ExtLink = (props: Props) => {
  const { href, label, title, children } = props;
  return (
    <Button
      sx={{
        px: 1,
        py: 0,
        justifyContent: "end",
        gap: 1
      }}
      onClick={() => window.open(href, "_blank", "noreferrer noopener")}
    >
      <Box sx={{ textDecoration: "none" }} component="abbr" title={title}>
        {label}
      </Box>
      {children}
    </Button>
  );
}
export default ExtLink;