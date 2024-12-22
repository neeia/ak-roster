import { ButtonGroup, ButtonGroupProps } from "@mui/material";

interface Props extends ButtonGroupProps {
  children: React.ReactNode[];
}
const Toolbar = (props: Props) => {
  const { children, sx, ...rest } = props;

  return (
    <ButtonGroup
      sx={{
        display: "grid",
        gridTemplateRows: { xs: "1fr", sm: `repeat(${children.length}, auto)` },
        gridTemplateColumns: { xs: `repeat(${children.length}, 1fr)`, sm: "1fr" },
        position: "sticky",
        top: 64,
        zIndex: 10,
        gap: 1,
        p: 1,
        "& .MuiIconButton-root": {
          aspectRatio: { sm: "1 / 1" },
          borderRadius: "4px",
          p: "4px",
        },
        "& .MuiSvgIcon-root": {
          height: { xs: "1.5rem", sm: "2.5rem" },
        },
        height: "min-content",
        backgroundColor: { xs: "background.light", sm: "background.paper" },
        boxShadow: {
          xs: 1,
          sm: 0,
        },
        ...sx,
      }}
      {...rest}
    >
      {children}
    </ButtonGroup>
  );
};

export default Toolbar;