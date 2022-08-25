import React, { useState } from "react";
import { OpJsonObj } from '../../types/operator';
import classList from "../../data/classList";
import { Box, Dialog, DialogContent, DialogTitle, IconButton, Typography, useMediaQuery, useTheme } from "@mui/material";
import { CloseOutlined, PersonAddAlt1 } from "@mui/icons-material";
import OperatorSelector from "../input/OperatorSelector";

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  onClick: (opId: string) => void;
  filter?: (op: OpJsonObj) => boolean;
}

const PopOp = React.memo((props: Props) => {
  const { open, onClose, title, onClick, filter } = props;
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  const [search, setSearch] = useState<String>("");

  const realFilterIn = filter ?? (() => true);
  const filterFunction = React.useCallback((op: OpJsonObj) => {
    return realFilterIn(op) && (op.name.toLowerCase().includes(search.toLowerCase()) || op.cnName.toLowerCase().includes(search.toLowerCase()));
  }, [realFilterIn, search]);

  function sortComparator(a: OpJsonObj, b: OpJsonObj) {
    return b.rarity - a.rarity ||
      classList.indexOf(a.class) - classList.indexOf(b.class) ||
      a.name.localeCompare(b.name)
  }

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        fullScreen={fullScreen}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle sx={{
          paddingBottom: "12px",
          display: "flex",
          justifyContent: "space-between",
          boxShadow: {
            xs: 1,
            md: 0
          },
        }}>
          <Typography variant="h2" component="span">
            {title}
          </Typography>
          <IconButton onClick={onClose}>
            <CloseOutlined />
          </IconButton>
        </DialogTitle>
        <DialogContent
          sx={{
            p: 1,
            paddingTop: "0.5rem !important"
          }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))",
              justifyContent: "center",
              gridGap: "0.5rem",
              overflowX: "hidden",
              "& .MuiTypography-root": {
                display: "flex",
                lineHeight: "1.25rem",
                color: "text.primary",
                letterSpacing: "normal",
                textTransform: "none",
                pointerEvents: "none",
                flexDirection: "column",
                mx: "-1rem",
              },
              "& .MuiButton-root": {
                display: "grid",
                boxShadow: 2,
                backgroundColor: "info.main",
                width: "100%",
                height: "min-content",
              },
            }}>
            <OperatorSelector
              onClick={(opId: string) => { onClick(opId); onClose(); }}
              filter={filterFunction}
            />
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
});
export default PopOp;
