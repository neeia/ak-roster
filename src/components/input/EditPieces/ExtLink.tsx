import { Box, Link } from "@mui/material";

interface Props {
  href: string;
  label: string;
  title?: string;
  children?: React.ReactNode;
}

const ExtLink = (props: Props) => {
  const { href, label, title, children } = props;
  return (
    <Link href={href}
      sx={{
        px: 1,
        py: 0,
        justifyContent: "end",
        gap: 1
      }}
      target="_blank"
      rel="noreferrer noopener"
    >
      <Box sx={{ textDecoration: "none" }} component="abbr" title={title}>
        {label}
      </Box>
      {children}
    </Link>
  );
}
export default ExtLink;