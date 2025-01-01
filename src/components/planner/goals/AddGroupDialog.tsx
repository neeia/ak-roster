import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from "@mui/material";
import React, { useState } from "react";
import { GroupsDataInsert } from "types/groupData";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (groupName: string) => void;
  goalGroups: string[];
}

const AddGroupDialog = (props: Props) => {
  const { open, onClose, onSubmit, goalGroups } = props;

  const [newGroupName, setNewGroupName] = useState<string>("");

  const handleGroupDialogClose = (shouldAddGroup = false) => {
    if (shouldAddGroup) onSubmit(newGroupName);
    setNewGroupName("");
    onClose();
  };

  const isValid = (groupName: string) => {
    return !goalGroups.includes(groupName) && 0 < newGroupName.length && newGroupName.length < 33;
  };

  return (
    <Dialog open={open} onClose={() => handleGroupDialogClose()}>
      <DialogTitle>Add New Group</DialogTitle>
      <DialogContent>
        <TextField
          sx={{ mt: "4px" }}
          value={newGroupName}
          onChange={(event) => setNewGroupName(event.target.value as string)}
          autoFocus
          label="Group name"
          fullWidth
          error={!isValid(newGroupName)}
          helperText={
            !newGroupName
              ? "Group name cannot be empty"
              : newGroupName.length >= 33
              ? "Group name must be shorter than 33 characters"
              : goalGroups.includes(newGroupName)
              ? "Group name already exists"
              : ""
          }
        />
      </DialogContent>
      <DialogActions sx={{ gap: 1 }}>
        <Button onClick={() => handleGroupDialogClose()}>Cancel</Button>
        <Button disabled={!isValid(newGroupName)} onClick={() => handleGroupDialogClose(true)} variant="contained">
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddGroupDialog;
