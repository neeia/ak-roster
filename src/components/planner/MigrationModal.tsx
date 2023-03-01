import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import { Box, Button, ButtonGroup, Dialog, DialogContent, DialogTitle, TextField } from "@mui/material";
import { useState } from "react";
import * as lz from "util/lz-string";
import { addGoals } from "store/goalsSlice";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (s: string) => void;
}
const MigrationModal: React.FC<Props> = ({ open, onClose, onSubmit }) => {
  const [text, setText] = useState("");

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>
        Migration Helper
      </DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <TextField multiline rows={3}
          sx={{
            "& textarea": {
              overflow: "hidden",
            }
          }}
          placeholder="Paste data to import"
          value={text}
          onChange={e => setText(e.target.value)}
        />
        <Box sx={{ display: "flex", justifyContent: "end", width: "100%", }}>
          <Button onClick={() => { onClose(); }}>Cancel</Button>
          <Button onClick={() => { onSubmit(text); onClose(); }}>Submit</Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};
export default MigrationModal;
