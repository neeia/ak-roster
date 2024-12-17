import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, useMediaQuery, useTheme } from "@mui/material";
import React, { useState } from "react";
import { OperatorData } from "types/operators/operator";
import OpSelectionButton from "./OpSelectionButton";
import useOperators from "util/hooks/useOperators";
import operatorJson from "data/operators";
import OperatorSearch from "components/planner/OperatorSearch";
import { AccountMutateProps } from "pages/data/profile";

const Assistant = (props: AccountMutateProps) => {
  const { user, setAccount } = props;

  const [operators] = useOperators();

  const [assistant, _setAssistant] = useState<string>(user?.assistant ?? "");
  const [open, setOpen] = useState<boolean>(false);

  const setAssistant = (value: string) => {
    _setAssistant(value);
    user.assistant = value;
    setAccount(user);
  };

  const theme = useTheme();
  const fullScreen = !useMediaQuery(theme.breakpoints.up("sm"));

  return !operators ? null : (
    <Box
      sx={{
        width: "min-content",
        display: "flex",
        flexDirection: "column",
        gap: "0.25rem",
      }}
    >
      Assistant
      <OpSelectionButton
        op={{ ...operators[assistant], ...operatorJson[assistant] }}
        onClick={() => {
          setOpen(true);
        }}
      />
      <Dialog open={open} onClose={() => setOpen(false)} fullScreen={fullScreen} fullWidth maxWidth="xs">
        <DialogTitle>Assistant</DialogTitle>
        <DialogContent>
          <OperatorSearch
            sx={{ mt: 1 }}
            value={operatorJson[assistant]}
            onChange={(op: OperatorData | null) => (op ? setAssistant(op.id) : null)}
            filter={(op: OperatorData) => !!operators[op.id]}
          />
        </DialogContent>
        <DialogActions sx={{ display: "flex", gap: 1, width: "100%" }}>
          <Button variant="neutral" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              if (assistant in operatorJson) {
                setAssistant(assistant);
                setOpen(false);
              }
            }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Assistant;
