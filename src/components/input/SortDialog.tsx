import React from "react";
import { Button, Dialog, FormControl, IconButton } from "@mui/material";
import SortBlock from "./SortPieces/SortBlock";
import { Tune } from "@mui/icons-material";
import { SortListItem } from "../../pages/data/input";


interface Props {
  sortKeys: string[]
  sortQueue: SortListItem[];
  handleChange: (key: string, desc?: boolean) => void;
}

const SortDialog = ((props: Props) => {
  const { sortKeys, sortQueue, handleChange } = props;
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <IconButton
        onClick={() => setOpen(true)}
      >
        <Tune fontSize="large" color="primary" />
      </IconButton>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <Button onClick={() => { handleChange("None", true)}}>
          +
        </Button>
        <FormControl>
          {sortQueue.map((sl: SortListItem, index: number) =>
            <SortBlock value={sl.key} values={sortKeys} handleChange={handleChange} />
          )}
        </FormControl>
        <Button>
          Cancel
        </Button>
        <Button >
          Confirm
        </Button>
      </Dialog>
    </>
  )
});

export default SortDialog;