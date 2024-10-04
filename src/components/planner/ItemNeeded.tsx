import AddCircleIcon from "@mui/icons-material/AddCircle";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import {
  Box,
  Button,
  ButtonBase,
  ButtonGroup,
  IconButton,
  InputAdornment,
  TextField,
  Tooltip,
} from "@mui/material";
import React, { ElementType, useEffect, useState } from "react";

import items from "../../data/items.json";

import CraftingIcon from "./CraftingIcon";
import ItemStack, { ItemStackProps } from "./ItemStack";
import { Item } from "types/item";

interface Props extends ItemStackProps {
  owned: number;
  isCrafting: boolean;
  canCompleteByCrafting: boolean;
  hideIncrementDecrementButtons: boolean;
  onIncrement: (itemId: string) => void;
  onDecrement: (itemId: string) => void;
  onChange: (itemId: string, newQuantity: number) => void;
  onCraftingToggle: (itemId: string) => void;
  onCraftOne: (itemId: string) => void;
  onClick: (itemId: string) => void;
  component?: ElementType;
}

const ItemNeeded: React.FC<Props> = React.memo((props) => {
  const {
    owned,
    isCrafting,
    canCompleteByCrafting,
    hideIncrementDecrementButtons,
    onIncrement,
    onDecrement,
    onChange,
    onCraftingToggle,
    onCraftOne,
    onClick,
    component,
    ...rest
  } = props;
  const { itemId, quantity } = rest;
  const item: Item = items[itemId as keyof typeof items];
  const isCraftable = Boolean(item.ingredients);
  const isComplete = owned >= quantity;
  const [rawValue, setRawValue] = useState<string>("");

  useEffect(() => {
    setRawValue(`${owned}`);
  }, [owned]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newRawValue = e.target.value;
    setRawValue(newRawValue);
    const numberValue = Number(newRawValue);
    if (!Number.isNaN(numberValue)) {
      onChange(itemId, numberValue);
    }
  };

  const craftOneButton = (
    <Button
      disabled={!isCrafting}
      onClick={() => onCraftOne(itemId)}
      sx={{ width: "auto" }}
    >
      +1
    </Button>
  );

  return (
    <Box display="inline-grid" component={component ?? "div"}>
      <ButtonBase
        data-itemid={itemId}
        onClick={() => onClick(itemId)}
        disableRipple
        sx={{
          display: "inline-grid",
          alignSelf: "center",
          justifySelf: "center",
          "&:focus, &:active": {
            filter: "brightness(0.5)",
          },
          "& > *": {
            gridArea: "1 / -1",
          },
        }}
      >
        <ItemStack
          {...rest}
          sx={
            isComplete || (isCrafting && canCompleteByCrafting)
              ? { opacity: 0.4 }
              : undefined
          }
        />
        {quantity > 0 && isComplete && (
          <CheckCircleIcon
            htmlColor="greenyellow"
            opacity={0.8}
            fontSize="large"
            sx={{
              alignSelf: "center",
              justifySelf: "center",
              zIndex: 1,
            }}
          />
        )}
        {quantity > 0 && !isComplete && isCrafting && canCompleteByCrafting && (
          <Tooltip arrow title="Can be completed by crafting">
            <Box
              alignSelf="center"
              justifySelf="center"
              zIndex={1}
              lineHeight={0}
            >
              <CraftingIcon />
            </Box>
          </Tooltip>
        )}
      </ButtonBase>
      <TextField
        size="small"
        fullWidth
        value={rawValue}
        onFocus={(e) => e.target.select()}
        onChange={handleChange}
        inputProps={{
          type: "number",
          min: 0,
          step: 1,
          "aria-label": "Quantity owned",
          sx: {
            textAlign: "center",
            width: "4ch", // width of 4 "0" characters
            flexGrow: 1,
          },
        }}
        InputProps={
          hideIncrementDecrementButtons
            ? {}
            : {
                startAdornment: (
                  <InputAdornment position="start" sx={{ mr: 0 }}>
                    <IconButton
                      size="small"
                      aria-label="Remove 1 from owned amount"
                      edge="start"
                      disabled={owned === 0}
                      onClick={() => onDecrement(itemId)}
                    >
                      <RemoveCircleIcon />
                    </IconButton>
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end" sx={{ ml: 0 }}>
                    <IconButton
                      size="small"
                      aria-label="Add 1 to owned amount"
                      edge="end"
                      onClick={() => onIncrement(itemId)}
                    >
                      <AddCircleIcon />
                    </IconButton>
                  </InputAdornment>
                ),
                sx: {
                  px: "5px",
                  borderBottomLeftRadius: 0,
                  borderBottomRightRadius: 0,
                  "& input[type=number]": {
                    MozAppearance: "textfield",
                  },
                  "& input[type=,number]::-webkit-outer-spin-button": {
                    WebkitAppearance: "none",
                    margin: 0,
                  },
                  "& input[type=number]::-webkit-inner-spin-button": {
                    WebkitAppearance: "none",
                    margin: 0,
                  },
                },
              }
        }
      />
      <Box minWidth={126} height={31}>
        {isCraftable ? (
          <ButtonGroup
            size="small"
            fullWidth
            sx={{
              gap: "1px",
              "& > button": {
                borderTopLeftRadius: 0,
                borderTopRightRadius: 0,
                boxSizing: "border-box",
              },
              "& > .MuiButtonGroup-grouped:not(:last-of-type)": {
                borderRightColor: "rgba(251, 192, 45, 0.5)",
              },
            }}
          >
            <Button
              variant={isCrafting ? "contained" : "outlined"}
              onClick={() => onCraftingToggle(itemId)}
              aria-label="Toggle crafting"
              aria-pressed={isCrafting}
            >
              {isCrafting ? "Crafting" : "Craft"}
            </Button>
            {isCrafting ? (
              <Tooltip arrow title="Craft one using your materials">
                {craftOneButton}
              </Tooltip>
            ) : (
              craftOneButton
            )}
          </ButtonGroup>
        ) : (
          <Button
            size="small"
            fullWidth
            variant="outlined"
            disabled
            sx={{
              mt: "-1px",
              borderTopLeftRadius: 0,
              borderTopRightRadius: 0,
            }}
          >
            (Uncraftable)
          </Button>
        )}
      </Box>
    </Box>
  );
});
ItemNeeded.displayName = "ItemNeeded";
export default ItemNeeded;
