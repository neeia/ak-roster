import { Grid, Typography } from "@mui/material";
import { Item } from "types/item";

import itemsJson from "data/items.json";
import ItemStack from "../depot/ItemStack";

import ItemInfoSection from "./ItemInfoSection";

interface Props {
  item: Item;
}

const CraftingInfo: React.FC<Props> = (props) => {
  const { item } = props;

  if (item.ingredients == null || item.ingredients.length === 0) {
    return null;
  }

  return (
    <ItemInfoSection heading="Crafting recipe">
      <Grid container spacing={1} direction="row" justifyContent="space-evenly">
        {item.ingredients.map((ingredient) => {
          const { name: ingredientName } =
            itemsJson[ingredient.id as keyof typeof itemsJson];
          return (
            <Grid
              item
              xs
              key={ingredient.id}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <ItemStack
                itemId={ingredient.id}
                quantity={ingredient.quantity}
                size={60}
                sx={{
                  color: (theme) => theme.palette.text.primary,
                }}
              />
              <Typography
                component="span"
                variant="body2"
                sx={{
                  wordBreak: "break-word",
                  textAlign: "center",
                }}
              >
                {ingredientName}
              </Typography>
            </Grid>
          );
        })}
      </Grid>
    </ItemInfoSection>
  );
};
export default CraftingInfo;
