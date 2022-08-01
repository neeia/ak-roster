import { Button, Link } from "@mui/material";

interface Props {
  href: string;
  label: string;
  children?: React.ReactNode;
}

const ExtLink = (props: Props) => {
  const { href, label, children } = props;
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
      {label}
      {children}
    </Button>
  );
}
export default ExtLink;