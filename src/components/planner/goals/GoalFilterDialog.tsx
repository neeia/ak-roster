import React, { memo, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import Select from "components/data/input/Select/SelectGroup";
import itemsJson from "data/items.json";
import ItemBase from "../depot/ItemBase";
import { OperatorGoalCategory } from "types/goal";
import { GoalFilterHook } from "util/hooks/useGoalFilter";
import { getItemsByIngredient, isMaterial } from "util/fns/depot/itemUtils";
import AddIcon from '@mui/icons-material/Add';

interface Props extends GoalFilterHook {
  open: boolean;
  onClose: () => void;
}

const GoalFilterDialog = memo((props: Props) => {
  const { open, onClose, filters, setFilters, clearFilters } = props;
  const theme = useTheme();
  const fullScreen = !useMediaQuery(theme.breakpoints.up("sm"));

  const [selectedLast, setSelectedLast] = useState<string>();

  const handleMaterialsChange = (_: React.MouseEvent, value: string[]) => {

    setFilters((prevState) => {
      const { materials: prev } = prevState;
      let next = value;

      const clickedId = prev.length < next.length ? next.at(-1)
        : prev.find(id => !next.includes(id));

      if (clickedId && isMaterial(clickedId, undefined, 5)) {
        if (prev.length > next.length) {//on un-select
          if (selectedLast === clickedId) {//second click on same item
            next = getItemsByIngredient(clickedId, next);
          }
          setSelectedLast(""); //reset tracking
        } else {//select - start click tracking
          setSelectedLast(clickedId);
        }
      };
      return { ...prevState, materials: next }
    }
    );
  }

  return (
    <>
      <Dialog open={open} onClose={onClose} fullScreen={fullScreen} keepMounted fullWidth maxWidth="sm">
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            paddingBottom: "12px",
          }}
        >
          <Typography
            component="div"
            variant="h2"
            sx={{
              marginLeft: "8px",
              paddingTop: "12px",
            }}
          >
            Filters
          </Typography>
          <IconButton onClick={onClose} sx={{ display: { sm: "none" } }}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent
          sx={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              "& .MuiToggleButtonGroup-root": {
                display: "flex",
                gap: 1,
                flexWrap: "wrap",
              },
              "& .MuiToggleButton-root": {
                borderRadius: "4px !important",
                textTransform: "none",
                lineHeight: 1.5,
              },
            }}
          >
            <Select title="Completability" nobg>
              <ToggleButtonGroup
                value={[
                  filters.completable ? "Completable" : "",
                  filters.craftable ? "Craftable" : "",
                  filters.uncompletable ? "Uncompletable" : "",
                ]}
              >
                <ToggleButton
                  value="Completable"
                  onClick={() => setFilters((f) => ({ ...filters, completable: !f.completable }))}
                >
                  Can Complete
                </ToggleButton>
                <ToggleButton
                  value="Craftable"
                  onClick={() => setFilters((f) => ({ ...filters, craftable: !f.craftable }))}
                >
                  Can Craft
                </ToggleButton>
                <ToggleButton
                  value="Uncompletable"
                  onClick={() => setFilters((f) => ({ ...filters, uncompletable: !f.uncompletable }))}
                >
                  Lack Materials
                </ToggleButton>
              </ToggleButtonGroup>
            </Select>
            <Select title="Categories" nobg>
              <ToggleButtonGroup
                value={filters.category}
                onChange={(_, value) => setFilters({ ...filters, category: value })}
              >
                {[
                  { name: "Promotion", value: OperatorGoalCategory.Elite },
                  { name: "Level", value: OperatorGoalCategory.Level },
                  { name: "Skill Level", value: OperatorGoalCategory.SkillLevel },
                  { name: "Mastery", value: OperatorGoalCategory.Mastery },
                  { name: "Module", value: OperatorGoalCategory.Module },
                ].map(({ name, value }) => (
                  <ToggleButton key={name} value={value}>
                    {name}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Select>
            <Select title="Uses Material:" nobg label="Clear" onClick={() => {
              setFilters({ ...filters, materials: [] });
              setSelectedLast("");
            }}>
              <ToggleButtonGroup
                value={filters.materials}
                onChange={handleMaterialsChange}
                sx={{ mr: "-1px" }}
              >
                {Object.entries(itemsJson)
                  .filter(([id]) => !["2001", "2002", "2003", "2004"].includes(id))
                  .sort(([_, itemA], [__, itemB]) => itemA.sortId - itemB.sortId)
                  .map(([id, item]) => (
                    <ToggleButton key={id} value={id} sx={{ p: 0.5, position: "relative" }}>
                      {id === selectedLast &&
                        <AddIcon sx={{ position: "absolute", left: "0", top: "0" }} />}
                      <ItemBase itemId={id} size={48} />
                    </ToggleButton>
                  ))}
              </ToggleButtonGroup>
            </Select>
          </Box>
          <Button onClick={() => {
            clearFilters();
            setSelectedLast("");
          }}>Clear Filter</Button>
        </DialogContent>
      </Dialog>
    </>
  );
});
GoalFilterDialog.displayName = "FilterDialog";
export default GoalFilterDialog;
