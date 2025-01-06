import { Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Select, TextField } from "@mui/material";
import React, { useState } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (groupName: string) => void;
  goalGroups: string[];
  valid: (groupName: string) => boolean;
}

const ChangeGroupDialog = (props: Props) => {
  const { open, onClose, onSubmit, goalGroups, valid } = props;

  const [newGroup, setNewGroup] = useState<string>("");

  const handleGroupDialogClose = (shouldAddGroup = false) => {
    if (shouldAddGroup) onSubmit(newGroup);
    setNewGroup("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={() => handleGroupDialogClose()}>
      <DialogTitle>Move Goal to Group</DialogTitle>
      <DialogContent>
        <Select value={newGroup} onChange={(e) => setNewGroup(e.target.value as string)} fullWidth>
          {goalGroups.map((group) => (
            <MenuItem key={group} value={group} disabled={!valid(group)}>
              {group}
            </MenuItem>
          ))}
        </Select>
      </DialogContent>
      <DialogActions sx={{ gap: 1 }}>
        <Button onClick={() => handleGroupDialogClose()}>Cancel</Button>
        <Button disabled={!valid(newGroup)} onClick={() => handleGroupDialogClose(true)} variant="contained">
          Move
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ChangeGroupDialog;
