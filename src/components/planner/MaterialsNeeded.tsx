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
import { selectGoals } from "store/goalsSlice";

import ItemInfoPopover from "./ItemInfoPopover";
import ItemNeeded from "./ItemNeeded";
import getGoalIngredients from "util/getGoalIngredients";
import { useDepotGetQuery, useDepotUpdateMutation } from "store/extendDepot";
import { DepotDataInsert } from "types/depotData";

const LMD_ITEM_ID = "4001";
const EXCLUDE = ["2001", "2002", "2003", "2004", "4001"];

const MaterialsNeeded: React.FC = React.memo(() => {
  const { data: depot = [] , isLoading: isLoadingDepot} = useDepotGetQuery();
  const [depotUpdateTrigger] = useDepotUpdateMutation();

  const [popoverOpen, setPopoverOpen] = useState(false);
  const [popoverItemId, setPopoverItemId] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const isSettingsMenuOpen = Boolean(anchorEl);

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

  const handleTogglePreference = useCallback(
    () => () => {

    },
    []
  );

  const handleChange = useCallback(
    (itemId: string, newQuantity: number) => {
      var item = depot.find(item => item.material_id == itemId);
      if (item)
      {
        var data : DepotDataInsert = {material_id : itemId, stock: newQuantity};
        depotUpdateTrigger([data]);
      }
    },
    []
  );

  const handleIncrement = useCallback(
    (itemId: string) => {
      var item = depot.find(item => item.material_id == itemId);
      if (item)
      {
        var data : DepotDataInsert = {material_id : itemId, stock: item.stock + 1};
        depotUpdateTrigger([data]);
      }
    },
    []
  );

  const handleDecrement = useCallback(
    (itemId: string) => {
      var item = depot.find(item => item.material_id == itemId);
      if (item)
      {
        var data : DepotDataInsert = {material_id : itemId, stock: Math.min(item.stock - 1, 0)};
        depotUpdateTrigger([data]);
      }
    },
    []
  );

  const handleCraftOne = useCallback(
    (itemId: string) => {

    },
    []
  );

  const handleCraftingToggle = useCallback(
    (itemId: string) => {
      var item = depot.find(item => item.material_id == itemId);
      if (item)
      {
        var data : DepotDataInsert = {material_id: item.material_id, stock: item.stock, crafting: !item.crafting};
        depotUpdateTrigger([data]);
      }
    },
    []
  );

  const allItems: [string, number][] = Object.values(itemsJson)
    .filter(item => !(EXCLUDE.includes(item.id)))
    .map(item => [item.id, 0]);

  const canCompleteByCrafting: { [itemId: string]: boolean } = {};

  const ingredientToCraftedItemsMapping: { [ingredientId: string]: string[] } = {};

  return (
    <Paper component="section" sx={{ p: 2 }}>
      <Box display="grid" gridTemplateColumns="1fr auto">
        <div>
          <Typography component="h2" variant="h5">
            Materials needed
          </Typography>
        </div>
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
        {allItems.map(([itemId, needed]) => (
          <ItemNeeded
            key={itemId}
            component="li"
            itemId={itemId}
            owned={depot.find(item => item.material_id == itemId)?.stock ?? 0}
            quantity={needed}
            canCompleteByCrafting={canCompleteByCrafting[itemId]}
            isCrafting={depot.find(item => item.material_id == itemId)?.crafting ?? false}
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
