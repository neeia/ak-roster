import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from "@mui/material";
import React, { useState } from "react";
import { useGroupsUpdateMutation } from "../../store/extendGroups";

interface Props {
  open : boolean,
  onClose: (groupName: string) => void;
}

const AddGroupDialog = (props : Props) => {
  const {open, onClose} = props;

  const [groupsUpdateTrigger] = useGroupsUpdateMutation();

  const [newGroupName, setNewGroupName] = useState<string>("");

  const handleGroupDialogClose = (shouldAddGroup: boolean) => {
    if (shouldAddGroup)
    {
      let data = {group_name: newGroupName};
      groupsUpdateTrigger([data]);
    }
    setNewGroupName("");
    onClose(newGroupName);
  };

  return (
    <Dialog
      open={open}
      onClose={() => handleGroupDialogClose(false)}
    >
      <DialogTitle>Add new goal group</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Select a name for the new goal group
        </DialogContentText>
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