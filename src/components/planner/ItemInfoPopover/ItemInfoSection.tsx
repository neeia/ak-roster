import { Box, Typography } from "@mui/material";

interface Props {
  heading: string;
}

const ItemInfoSection: React.FC<React.PropsWithChildren<Props>> = (props) => {
  const { heading, children } = props;
  return (
    <Box mt={2}>
      <Box position="relative" mb={1}>
        <Typography
          component="h2"
          sx={{
            display: "inline-block",
            position: "relative",
            backgroundColor: "background.light",
            px: 1.5,
            py: 0.5,
            borderRadius: 4,
          }}
        >
          {heading}
        </Typography>
      </Box>
      {children}
    </Box>
  );
};
export default ItemInfoSection;
