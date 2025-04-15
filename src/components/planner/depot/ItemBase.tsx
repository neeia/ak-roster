import { Box, SxProps, Theme } from "@mui/material";
import Image from "components/base/Image";
import React from "react";
import { Item } from "types/item";
import items from "data/items.json";
import imageBase from "util/imageBase";

const DEFAULT_SIZE = 96;

export interface ItemBaseProps {
  itemId: string;
  size?: number;
  sx?: SxProps<Theme>;
}

const ItemBase = React.forwardRef<HTMLDivElement, React.PropsWithChildren<ItemBaseProps>>((props, ref) => {
  const { itemId, size = DEFAULT_SIZE, sx, children, ...rest } = props;
  const item: Item = items[itemId as keyof typeof items];
  const bgSize = Math.floor(size * (96 / 100));

  return (
    <Box
      ref={ref}
      sx={{
        display: "inline-grid",
        alignItems: "center",
        justifyItems: "center",
        "& > *": {
          gridArea: "1 / -1",
        },
        ...sx,
      }}
      {...rest}
    >
      <Image src={`${imageBase}/items/bg/${item.tier}.webp`} alt="" width={bgSize} height={bgSize} />
      <Image src={`${imageBase}/items/${item.iconId}.webp`} alt={item.name} width={size} height={size} />
      {children}
    </Box>
  );
});
ItemBase.displayName = "ItemBase";
export default ItemBase;
