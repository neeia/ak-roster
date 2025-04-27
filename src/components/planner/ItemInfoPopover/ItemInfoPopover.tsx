import { Paper, Popover, Typography } from "@mui/material";
import React from "react";

import itemsJson from "data/items.json";

import CraftingInfo from "./CraftingInfo";
import NeededToCraft from "./NeededToCraft";
import StageInfo from "./StageInfo";
import { Item } from "types/item";
import Image from "components/base/Image";
import imageBase from "util/imageBase";

interface Props {
  itemId: string | null;
  ingredientToCraftedItemsMapping: { [ingredientId: string]: string[] };
  open: boolean;
  onClose: () => void;
}

const ItemInfoPopover: React.FC<Props> = React.memo((props) => {
  const { itemId, ingredientToCraftedItemsMapping, open, onClose } = props;
  const item: Item | null = itemId != null ? itemsJson[itemId as keyof typeof itemsJson] : null;
  return (
    <Popover
      open={open}
      onClose={onClose}
      anchorEl={() => document.querySelector(`[data-itemid="${itemId}"]`)!}
      keepMounted
      hideBackdrop={false}
      BackdropProps={{
        invisible: false,
      }}
      anchorOrigin={{
        vertical: "center",
        horizontal: "right",
      }}
      transformOrigin={{
        vertical: "center",
        horizontal: "left",
      }}
    >
      {itemId != null && item != null && (
        <Paper
          elevation={1}
          sx={{
            p: 2,
            opacity: 0.9,
          }}
        >
          <Typography
            component="h1"
            variant="h5"
            sx={{
              display: "grid",
              p: 1,
              gridTemplateColumns: "auto 1fr",
              columnGap: 1.5,
              alignItems: "center",
              borderRadius: 4,
            }}
          >
            <Image
              // add key to force remount
              key={item.iconId}
              src={`${imageBase}/items/${item.iconId}.webp`}
              sx={{ width: "48px", height: "48px" }}
              alt=""
            />
            {item.name}
          </Typography>
          <CraftingInfo item={item} />
          <NeededToCraft item={item} ingredientToCraftedItemsMapping={ingredientToCraftedItemsMapping} />
          <StageInfo item={item} />
        </Paper>
      )}
    </Popover>
  );
});
ItemInfoPopover.displayName = "ItemInfoPopover";
export default ItemInfoPopover;
