import { Box, Divider, styled, Typography } from "@mui/material";

interface Props {
  heading: string;
}

const ItemInfoDivider = styled(Divider)`
  position: absolute;
  width: 100%;
  margin: 0;
  left: 0;
  top: 11px;
  background-color: #888;
`;

const ItemInfoSection: React.FC<React.PropsWithChildren<Props>> = (props) => {
  const { heading, children } = props;
  return (
    <Box mt={2}>
      <Box position="relative" mb={1}>
        <ItemInfoDivider />
        <Typography
          component="h2"
          sx={{
            display: "inline-block",
            position: "relative",
            backgroundColor: "#888",
            color: "#fff",
            borderRadius: (theme) => theme.spacing(0.5),
            px: 0.5,
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
