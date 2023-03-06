import { Tooltip, Typography } from "@mui/material";

import itemsJson from "../../data/items.json";

import ItemBase, { ItemBaseProps } from "./ItemBase";

export interface ItemStackProps extends ItemBaseProps {
  quantity: number;
  showItemNameTooltip?: boolean;
}

const ItemStack: React.FC<ItemStackProps> = (props) => {
  const { quantity: rawQuantity, showItemNameTooltip, ...rest } = props;
  const { itemId } = rest;
  const quantity =
    rawQuantity < 1000
      ? rawQuantity
      : `${
          rawQuantity % 1000 === 0
            ? `${rawQuantity / 1000}`
            : (rawQuantity / 1000).toFixed(1)
        }K`;
  const { name } = itemsJson[itemId as keyof typeof itemsJson];
  const itemBase = (
    <ItemBase {...rest}>
      {rawQuantity > 0 && (
        <Typography
          variant="body1"
          component="span"
          boxShadow={3}
          sx={{
            display: "inline-block",
            py: 0.25,
            px: 1,
            mr: 1,
            mb: 1,
            alignSelf: "end",
            justifySelf: "end",
            background: "rgba(0, 0, 0, 0.75)",
            zIndex: 1,
          }}
        >
          {quantity}
        </Typography>
      )}
    </ItemBase>
  );

  return showItemNameTooltip ? (
    <Tooltip arrow title={name}>
      {itemBase}
    </Tooltip>
  ) : (
    itemBase
  );
};
export default ItemStack;
