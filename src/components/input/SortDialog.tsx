import React from "react";
import { Operator } from "../../types/operator";
import { Button, Dialog, FormControl, IconButton } from "@mui/material";
import SortBlock from "./SortPieces/SortBlock";
import { Tune } from "@mui/icons-material";
import { SortListItem } from "../../pages/data/input";


const sortFunctions = {
  "None": (): number => 0,
  "Name": (a: Operator, b: Operator): number => b.name.localeCompare(a.name),
  "Level": (a: Operator, b: Operator): number => a.level - b.level,
  "Rarity": (a: Operator, b: Operator): number => a.rarity - b.rarity,
  "Promotion": (a: Operator, b: Operator): number => a.promotion - b.promotion,
  "Potential": (a: Operator, b: Operator): number => a.potential - b.potential,
  "Favorite": (a: Operator, b: Operator): number => +a.favorite - +b.favorite,
  "Modules": (a: Operator, b: Operator): number => a.module.reduce(r => r + 1, 0) - b.module.reduce(r => r + 1, 0),
}

interface Props {
  sortQueue: SortListItem[];
  handleChange: (key: string, value?: (a: Operator, b: Operator) => number, desc?: boolean) => void;
}

const SortDialog = ((props: Props) => {
  const { sortQueue, handleChange } = props;
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <IconButton
        onClick={() => setOpen(true)}
      >
        <Tune fontSize="large" color="primary" />
      </IconButton>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <Button onClick={() => { handleChange("None", sortFunctions.None) }}>
          +
        </Button>
        <FormControl>
          {sortQueue.map((sl: SortListItem, index: number) =>
            <SortBlock value={sl.key} values={Object.keys(sortFunctions)} handleChange={handleChange} />
          )}
        </FormControl>
      </Dialog>
    </>
  )
});

export default SortDialog;