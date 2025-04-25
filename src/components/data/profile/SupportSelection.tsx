import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, useMediaQuery, useTheme } from "@mui/material";
import React, { useState } from "react";
import { OperatorData } from "types/operators/operator";
import operatorJson from "data/operators";
import OpSelectionButton from "./OpSelectionButton";
import { OperatorSupport } from "types/operators/supports";
import useOperators from "util/hooks/useOperators";
import OperatorSearch from "components/planner/OperatorSearch";

interface Props {
  supports: OperatorSupport[];
  setSupports: (newSupport: OperatorSupport) => Promise<void>;
}
const SupportSelection = (props: Props) => {
  const { supports, setSupports } = props;

  const [operators] = useOperators();
  const [index, setIndex] = useState<number>(0);
  const [input, setInput] = useState<string>(supports[index]?.op_id);

  const [open, setOpen] = useState<boolean>(false);

  const theme = useTheme();
  const fullScreen = !useMediaQuery(theme.breakpoints.up("sm"));

  const setSupport = (value: string) => {
    const support: OperatorSupport = {
      op_id: value,
      slot: index,
    };
    setSupports(support);
  };

  const filter = (op: OperatorData) =>
    operators![op.id] != null && !supports!.find((v) => !v || v.op_id === op.id) && (index ? true : op.rarity < 6);

  return !operators || !supports ? null : (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: "8px",
      }}
    >
      <Box>Support Units</Box>
      <Box
        sx={{
          display: "flex",
          gap: "16px",
          alignItems: "center",
        }}
      >
        {[...Array(3)].map((_, i) => {
          const support = supports.filter((support) => support.slot === i)[0];
          const opA = operators[support?.op_id];
          const opB = operatorJson[support?.op_id];
          const op = support ? { ...opA, ...opB } : undefined;
          return (
            <OpSelectionButton
              key={i}
              op={op}
              onClick={() => {
                setIndex(i);
                setOpen(true);
                setInput(supports[index]?.op_id);
              }}
            />
          );
        })}
      </Box>
      <Dialog
        open={open}
        onClose={() => {
          setOpen(false);
          setInput(supports[index]?.op_id);
        }}
        fullScreen={fullScreen}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Support</DialogTitle>
        <DialogContent>
          <OperatorSearch
            sx={{ mt: 1 }}
            value={operatorJson[input]}
            onChange={(op: OperatorData | null) => (op ? setInput(op.id) : null)}
            filter={filter}
          />
        </DialogContent>
        <DialogActions sx={{ display: "flex", gap: 1, width: "100%" }}>
          <Button
            variant="neutral"
            onClick={() => {
              setOpen(false);
              setInput(supports[index]?.op_id);
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            onClick={() => {
              if (input in operatorJson) {
                setSupport(input);
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

export default SupportSelection;
