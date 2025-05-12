import { Tooltip, Typography } from "@mui/material";

import itemsJson from "data/items.json";

import ItemBase, { ItemBaseProps } from "./ItemBase";
import { formatNumber } from "util/fns/depot/itemUtils";

export interface ItemStackProps extends ItemBaseProps {
  quantity: number;
  showItemNameTooltip?: boolean;
}

const ItemStack: React.FC<ItemStackProps> = (props) => {
  const { quantity: rawQuantity, showItemNameTooltip, ...rest } = props;
  const { itemId } = rest;
  const quantity = formatNumber(rawQuantity);
  const { name } = itemsJson[itemId as keyof typeof itemsJson];
  const fontSize = (rest.size ?? 96) / 24 + 10;
  const itemBase = (
    <ItemBase {...rest}>
      {rawQuantity > 0 && (
        <Typography
          component="span"
          sx={{
            display: "inline-block",
            py: 0.25,
            px: 0.5,
            lineHeight: 1,
            mr: `${(rest.size ?? 96) / 16}px`,
            mb: `${(rest.size ?? 96) / 16}px`,
            alignSelf: "end",
            justifySelf: "end",
            backgroundColor: "background.paper",
            zIndex: 1,
            fontSize: `${fontSize}px`,
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
