import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from "@mui/material";
import React, { useState } from "react";
import { GroupsDataInsert } from "../../types/groupData";

interface Props {
  open: boolean;
  onClose: (groupName: string) => void;
  setGroups: (goalGroupInsert: GroupsDataInsert[]) => void;
  nextGoalSortOrder: number;
}

const AddGroupDialog = (props: Props) => {
  const { open, onClose, setGroups, nextGoalSortOrder } = props;

  const [newGroupName, setNewGroupName] = useState<string>("");

  const handleGroupDialogClose = (shouldAddGroup: boolean) => {
    if (shouldAddGroup) {
      let data = { group_name: newGroupName, sort_order: nextGoalSortOrder };
      setGroups([data]);
    }
    setNewGroupName("");
    onClose(newGroupName);
  };

  return (
    <Dialog open={open} onClose={() => handleGroupDialogClose(false)}>
      <DialogTitle>Add new goal group</DialogTitle>
      <DialogContent>
        <DialogContentText>Select a name for the new goal group</DialogContentText>
        <TextField
          value={newGroupName}
          onChange={(event) => setNewGroupName(event.target.value as string)}
          autoFocus
          label="Group name"
          fullWidth
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => handleGroupDialogClose(false)}>Cancel</Button>
        <Button onClick={() => handleGroupDialogClose(true)}>Add</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddGroupDialog;
