import CheckIcon from "@mui/icons-material/Check";
import SettingsIcon from "@mui/icons-material/Settings";
import {
  Box,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Typography,
} from "@mui/material";
import Image from "next/image";
import React, { useCallback, useState } from "react";

import itemsJson from "data/items.json";
import { Ingredient, Item } from "types/item";
import {
  resetStock,
  resetCrafting,
  craftOneWithStock,
  subtractStock,
  DepotState,
  addStock,
  selectCrafting,
  selectStock,
  setStock,
  toggleCrafting,
} from "store/depotSlice";
import { selectGoals } from "store/goalsSlice";
import { useAppDispatch, useAppSelector } from "store/hooks";
import {
  selectPreference,
  togglePreference,
  UserPreference,
} from "store/userSlice";

import ItemInfoPopover from "./ItemInfoPopover";
import ItemNeeded from "./ItemNeeded";
import getGoalIngredients from "util/getGoalIngredients";

const LMD_ITEM_ID = "4001";
const EXCLUDE = ["2001", "2002", "2003", "2004", "4001"];

const MaterialsNeeded: React.FC = React.memo(() => {
  const dispatch = useAppDispatch();
  const stock = useAppSelector(selectStock);
  const crafting = useAppSelector(selectCrafting);
  const goals = useAppSelector(selectGoals);
  const sortCompletedToBottom = useAppSelector((state) =>
    selectPreference(
      state,
      UserPreference.PLANNER_SORT_COMPLETE_ITEMS_TO_BOTTOM
    )
  );
  const hideIncrementDecrementButtons = useAppSelector((state) =>
    selectPreference(state, UserPreference.HIDE_INCREMENT_DECREMENT_BUTTONS)
  );
  const showInactiveMaterials = useAppSelector((state) =>
    selectPreference(state, UserPreference.PLANNER_SHOW_INACTIVE_ITEMS)
  );
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [popoverItemId, setPopoverItemId] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const isSettingsMenuOpen = Boolean(anchorEl);

  const handleChange = useCallback(
    (itemId: string, newQuantity: number) => {
      dispatch(setStock({ itemId, newQuantity }));
    },
    [dispatch]
  );

  const handleIncrement = useCallback(
    (itemId: string) => {
      dispatch(addStock({ itemId }));
    },
    [dispatch]
  );

  const handleDecrement = useCallback(
    (itemId: string) => {
      dispatch(subtractStock({ itemId }));
    },
    [dispatch]
  );

  const handleCraftOne = useCallback(
    (itemId: string) => {
      dispatch(craftOneWithStock(itemId));
    },
    [dispatch]
  );

  const handleCraftingToggle = useCallback(
    (itemId: string) => {
      dispatch(toggleCrafting(itemId));
    },
    [dispatch]
  );

  const handleSettingsButtonClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      setAnchorEl(e.currentTarget);
    },
    []
  );

  const handleSettingsMenuClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleItemClick = useCallback((itemId: string) => {
    setPopoverItemId(itemId);
    setPopoverOpen(true);
  }, []);

  const handlePopoverClose = useCallback(() => {
    setPopoverOpen(false);
  }, []);

  const handleResetCrafting = useCallback(() => {
    dispatch(resetCrafting());
  }, [dispatch]);

  const handleResetStock = useCallback(() => {
    dispatch(resetStock());
  }, [dispatch]);

  const handleTogglePreference = useCallback(
    (preference: UserPreference) => () => {
      dispatch(togglePreference(preference));
    },
    [dispatch]
  );

  const materialsNeeded: DepotState["stock"] = {};
  // 1. populate the ingredients required for each goal
  goals.flatMap(getGoalIngredients).forEach((ingredient: Ingredient) => {
    materialsNeeded[ingredient.id] =
      (materialsNeeded[ingredient.id] ?? 0) + ingredient.quantity;
  });
  // 2. populate number of ingredients required for items being crafted
  const ingredientToCraftedItemsMapping: { [ingredientId: string]: string[] } =
    {};
  Object.values(itemsJson)
    .sort((a, b) => b.tier - a.tier)
    .forEach((item) => {
      // n.b. NOT equivalent to filtering the array first,
      // because we will be modifying materialsNeeded during execution
      if (materialsNeeded[item.id] != null) {
        const remaining = Math.max(
          materialsNeeded[item.id] - (stock[item.id] ?? 0),
          0
        );
        if (remaining > 0 && crafting[item.id]) {
          const itemBeingCrafted: Item =
            itemsJson[item.id as keyof typeof itemsJson];
          const { ingredients, yield: itemYield } = itemBeingCrafted;
          if (ingredients != null) {
            const multiplier = Math.ceil(remaining / (itemYield ?? 1));
            ingredients.forEach((ingr) => {
              ingredientToCraftedItemsMapping[ingr.id] = [
                ...(ingredientToCraftedItemsMapping[ingr.id] ?? []),
                item.id,
              ];
              materialsNeeded[ingr.id] =
                (materialsNeeded[ingr.id] ?? 0) + ingr.quantity * multiplier;
            });
          }
        }
      }
    });
  // 3. calculate what ingredients can be fulfilled by crafting
  const stockCopy = { ...stock }; // need to hypothetically deduct from stock
  const canCompleteByCrafting: { [itemId: string]: boolean } = {};
  Object.keys(crafting)
    .filter(
      (craftedItemId) =>
        materialsNeeded[craftedItemId] != null &&
        materialsNeeded[craftedItemId] - (stock[craftedItemId] ?? 0) > 0
    )
    .sort(
      (idA, idB) =>
        itemsJson[idA as keyof typeof itemsJson].tier -
        itemsJson[idB as keyof typeof itemsJson].tier
    )
    .forEach((craftedItemId) => {
      const shortage =
        materialsNeeded[craftedItemId] - (stock[craftedItemId] ?? 0);
      const craftedItem: Item =
        itemsJson[craftedItemId as keyof typeof itemsJson];
      const ingredients = craftedItem.ingredients?.filter(
        (ingr) => ingr.id !== LMD_ITEM_ID
      );
      if (ingredients != null) {
        const itemYield = craftedItem.yield ?? 1;
        // numTimesCraftable: max number of times the formula can be executed
        const numTimesCraftable = Math.min(
          ...ingredients.map((ingr) =>
            Math.floor((stockCopy[ingr.id] ?? 0) / ingr.quantity)
          )
        );
        // numTimesToCraft: how many times we'll actually execute the formula
        const numTimesToCraft = Math.min(
          numTimesCraftable,
          Math.ceil(shortage / itemYield)
        );
        // now deduct from crafting supply
        ingredients.forEach((ingr) => {
          stockCopy[ingr.id] = Math.max(
            (stockCopy[ingr.id] ?? 0) - ingr.quantity * numTimesToCraft
          );
        });
        if (shortage - numTimesToCraft <= 0) {
          canCompleteByCrafting[craftedItemId] = true;
        }
        // even if the crafted item can't be completed, update our hypothetical depot counts
        stockCopy[craftedItemId] =
          (stockCopy[craftedItemId] ?? 0) + numTimesToCraft * itemYield;
      }
    });
  Object.keys(ingredientToCraftedItemsMapping).forEach((ingrId) => {
    if ((materialsNeeded[ingrId] ?? 0) - (stockCopy[ingrId] ?? 0) <= 0) {
      canCompleteByCrafting[ingrId] = true;
    }
  });
  const lmdCost = materialsNeeded[LMD_ITEM_ID] ?? 0;
  delete materialsNeeded[LMD_ITEM_ID];

  const allItems: [string, number][] = Object.values(itemsJson)
    .filter(item => !(EXCLUDE.includes(item.id)))
    .map(item => [item.id, materialsNeeded[item.id] ?? 0]);

  const sortedMaterialsNeeded =
    (showInactiveMaterials ? allItems : Object.entries(materialsNeeded)).sort(
      ([itemIdA, neededA], [itemIdB, neededB]) => {
        const itemA = itemsJson[itemIdA as keyof typeof itemsJson];
        const itemB = itemsJson[itemIdB as keyof typeof itemsJson];
        const compareBySortId = itemA.sortId - itemB.sortId;
        if (sortCompletedToBottom) {
          return (
            (neededA && neededA <= stock[itemIdA] ? 1 : 0) -
            (neededB && neededB <= stock[itemIdB] ? 1 : 0) ||
            (canCompleteByCrafting[itemIdA] ? 1 : 0) -
            (canCompleteByCrafting[itemIdB] ? 1 : 0) ||
            compareBySortId
          );
        }
        return compareBySortId;
      }
    );

  return (
    <Paper component="section" sx={{ p: 2 }}>
      <Box display="grid" gridTemplateColumns="1fr auto">
        <div>
          <Typography component="h2" variant="h5">
            Materials needed
          </Typography>
          <Divider sx={{ mt: 2, mb: 1, width: "90%" }} />
          <Typography component="span" variant="h6">
            Total cost:
            <Box
              component="span"
              display="inline-flex"
              alignItems="center"
              columnGap={0.5}
              ml={1}
            >
              <b>{lmdCost.toLocaleString()}</b>
              <Image
                src="/img/items/GOLD_SHD.webp"
                width={26}
                height={18}
                alt="LMD"
              />
            </Box>
          </Typography>
        </div>
        <IconButton
          id="settings-button"
          onClick={handleSettingsButtonClick}
          sx={{ alignSelf: "start", justifySelf: "end" }}
          // variant="outlined"
          aria-label="Settings"
          aria-haspopup="true"
          aria-expanded={isSettingsMenuOpen ? "true" : undefined}
          aria-controls={isSettingsMenuOpen ? "settings-menu" : undefined}
        >
          <SettingsIcon />
        </IconButton>
        <Menu
          id="settings-menu"
          anchorEl={anchorEl}
          open={isSettingsMenuOpen}
          onClose={handleSettingsMenuClose}
          MenuListProps={{
            "aria-labelledby": "settings-button",
          }}
          hideBackdrop={false}
          BackdropProps={{
            invisible: false,
          }}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
        >
          <SettingsMenuItem
            onClick={handleTogglePreference(
              UserPreference.PLANNER_SORT_COMPLETE_ITEMS_TO_BOTTOM
            )}
            checked={sortCompletedToBottom}
          >
            Sort completed items to bottom
          </SettingsMenuItem>
          <SettingsMenuItem
            onClick={handleTogglePreference(
              UserPreference.PLANNER_SHOW_INACTIVE_ITEMS
            )}
            checked={showInactiveMaterials}
          >
            Show inactive materials
          </SettingsMenuItem>
          <SettingsMenuItem
            onClick={handleTogglePreference(
              UserPreference.HIDE_INCREMENT_DECREMENT_BUTTONS
            )}
            checked={hideIncrementDecrementButtons}
          >
            Hide increment/decrement buttons
          </SettingsMenuItem>
          <Divider />
          <MenuItem onClick={handleResetCrafting}>
            <ListItemText
              inset
              sx={{ color: (theme) => theme.palette.error.light }}
            >
              Reset crafting states
            </ListItemText>
          </MenuItem>
          <MenuItem onClick={handleResetStock}>
            <ListItemText
              inset
              sx={{ color: (theme) => theme.palette.error.light }}
            >
              Reset stock
            </ListItemText>
          </MenuItem>
        </Menu>
      </Box>
      <Box
        component="ul"
        sx={{
          display: "grid",
          mt: 2,
          mb: 0,
          mx: 0,
          p: 0,
          columnGap: 2,
          rowGap: 1.5,
          gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))",
        }}
      >
        {sortedMaterialsNeeded.map(([itemId, needed]) => (
          <ItemNeeded
            key={itemId}
            component="li"
            itemId={itemId}
            owned={stock[itemId] ?? 0}
            quantity={materialsNeeded[itemId] ?? needed}
            canCompleteByCrafting={canCompleteByCrafting[itemId]}
            isCrafting={crafting[itemId] ?? false}
            onChange={handleChange}
            onCraftOne={handleCraftOne}
            onDecrement={handleDecrement}
            onIncrement={handleIncrement}
            onCraftingToggle={handleCraftingToggle}
            onClick={handleItemClick}
          />
        ))}
      </Box>
      <ItemInfoPopover
        itemId={popoverItemId}
        ingredientToCraftedItemsMapping={ingredientToCraftedItemsMapping}
        open={popoverOpen}
        onClose={handlePopoverClose}
      />
    </Paper>
  );
});
MaterialsNeeded.displayName = "MaterialsNeeded";
export default MaterialsNeeded;

const SettingsMenuItem: React.FC<
  React.PropsWithChildren<{
    onClick: () => void;
    checked: boolean;
  }>
> = (props) => {
  const { onClick, checked, children } = props;
  return (
    <MenuItem onClick={onClick}>
      {checked ? (
        <>
          <ListItemIcon>
            <CheckIcon />
          </ListItemIcon>
          {children}
        </>
      ) : (
        <ListItemText inset>{children}</ListItemText>
      )}
    </MenuItem>
  );
};
