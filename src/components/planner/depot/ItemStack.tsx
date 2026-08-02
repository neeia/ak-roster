import { Tooltip, Typography } from "@mui/material";

import itemsJson from "data/items.json";

import ItemBase, { ItemBaseProps } from "./ItemBase";
import { formatNumber } from "util/fns/depot/itemUtils";

export interface ItemStackProps extends ItemBaseProps {
  quantity: number;
  showItemNameTooltip?: boolean;
  upcomingQuantity?: number;
}

const ItemStack: React.FC<ItemStackProps> = (props) => {
  const { quantity: rawQuantity, showItemNameTooltip, upcomingQuantity: upcomingRawQuantity, ...rest } = props;
  const { itemId } = rest;
  const quantity = formatNumber(rawQuantity);
  const upcomingQuantity = formatNumber(upcomingRawQuantity ?? 0);
  const { name } = itemsJson[itemId as keyof typeof itemsJson];
  const fontSize = (rest.size ?? 96) / 24 + 10;
  const itemBase = (
    <ItemBase {...rest}>
      {(upcomingRawQuantity ?? 0) > 0 && (
        <Tooltip arrow placement="top" title={<Typography>Income upto selected event<br/>"added" to owned, decreasing needed</Typography>}>
          <Typography
            component="span"
            sx={{
              display: "inline-block",
              py: 0.25,
              px: 0.5,
              lineHeight: 1,
              mr: `${(rest.size ?? 96) / 16}px`,
              mb: `${(rest.size ?? 96) / 16}px`,
              alignSelf: "start",
              justifySelf: "end",
              backgroundColor: "background.paper",
              zIndex: 2,
              fontSize: `${fontSize}px`,
              position: "relative",
            }}
          >
            {`🎁︎${upcomingQuantity}`}
          </Typography>
        </Tooltip>
      )}
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
