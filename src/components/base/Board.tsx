import { Paper, PaperProps, styled, Typography, TypographyProps } from "@mui/material";

interface Props extends Omit<PaperProps, "title"> {
  title?: React.ReactNode;
  TitleAction?: React.ReactNode;
  TitleProps?: TypographyProps;
}
const Board = (props: Props) => {
  const { sx, title, TitleAction, TitleProps, ...rest } = props;

  return <Paper component="section" sx={{
    width: "100%",
    padding: 2,
    display: "flex",
    flexDirection: "column",
    gap: 2,
    ...sx
  }} {...rest}>
    {title && <Typography variant="h2"
      sx={{
        m: "16px",
        display: "grid",
        gridTemplateColumns: "1fr auto",
      }}
      gutterBottom
      {...TitleProps}
    >
      {title}
      {TitleAction}
    </Typography>}
    {props.children}
  </Paper>
}

export default Board;