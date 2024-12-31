import { Box, SxProps, Theme } from "@mui/material";
import Image from "next/image";
import React from "react";
import { Item } from "types/item";

import items from "data/items.json";

const DEFAULT_SIZE = 96;

export interface ItemBaseProps {
  itemId: string;
  size?: number;
  sx?: SxProps<Theme>;
}

const ItemBase = React.forwardRef<HTMLDivElement, React.PropsWithChildren<ItemBaseProps>>((props, ref) => {
  const { itemId, size = DEFAULT_SIZE, sx, children, ...rest } = props;
  const item: Item = items[itemId as keyof typeof items];
  const bgSize = Math.floor(size * (95 / 100));
  return (
    <Box
      ref={ref}
      sx={{
        display: "inline-grid",
        "& > *": {
          gridArea: "1 / -1",
        },
        ...(sx ?? {}),
      }}
      {...rest}
    >
      <Image src={`/img/items/bg/${item.tier}.png`} alt="" width={bgSize} height={bgSize} />
      <Image src={`/img/items/${item.iconId}.png`} alt={item.name} width={size} height={size} />
      {children}
    </Box>
  );
});
ItemBase.displayName = "ItemBase";
export default ItemBase;
