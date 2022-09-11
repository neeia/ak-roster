import React from "react";
import { Operator, OpJsonObj } from '../../types/operator';
import { Box, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Typography, useMediaQuery, useTheme } from "@mui/material";
import { CloseOutlined } from "@mui/icons-material";
import OperatorSelector from "../input/OperatorSelector";

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  onClick: (opId: string) => void;
  operators: Record<string, Operator>;
  filter?: (opInfo: OpJsonObj, op: Operator) => boolean;
  sort?: (opA: Operator, opB: Operator) => number;
  toggleGroup?: string[];
  sticky?: boolean;
  children?: React.ReactNode;
}

const PopOp = (props: Props) => {
  const { operators, open, onClose, title, onClick, filter, sort, toggleGroup, sticky, children } = props;
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

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
          <IconButton onClick={onClose} aria-label="Close">
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
              "& .untoggled": {
                opacity: 0.5
              },
              "& .toggled": {
              },
            }}>
            <OperatorSelector
              operators={operators}
              onClick={(opId: string) => {
                onClick(opId);
                if (!sticky) onClose();
              }}
              sort={sort}
              filter={filter}
              toggleGroup={toggleGroup}
            />
          </Box>
        </DialogContent>
        {children
          ? <DialogActions>
            {children}
          </DialogActions>
          : null
        }
      </Dialog>
    </>
  );
}
export default PopOp;
