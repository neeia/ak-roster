import CraftingIcon from "./CraftingIcon";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import StorageIcon from '@mui/icons-material/Storage';
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import { Box, Divider, ListItemText, MenuItem, Button, Tooltip, Typography, ListItemIcon } from "@mui/material";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import itemsJson from "data/items.json";
import { Ingredient, Item } from "types/item";
import ItemInfoPopover from "../ItemInfoPopover";
import ItemNeeded from "./ItemNeeded";
import getGoalIngredients from "util/fns/depot/getGoalIngredients";
import DepotItem from "types/depotItem";
import ExportImportDialog from "./ExportImportDialog";
import MaterialsSummaryDialog from "./MaterialsSummaryDialog";
import EventsTrackerDialog from "../events/EventsTrackerDialog";
import Board from "components/base/Board";
import canCompleteByCrafting from "util/fns/depot/canCompleteByCrafting";
import { LocalStorageSettings } from "types/localStorageSettings";
import depotToExp from "util/fns/depot/depotToExp";
import { PlannerGoal } from "types/goal";
import GoalData, { GoalsFilteredCalculatedMap } from "types/goalData";
import { debounce } from "lodash";
import { SettingsMenu, SettingsMenuItem, SettingsButton } from "../SettingsMenu";
import useMenu from "util/hooks/useMenu";
import { EventsHook } from "util/hooks/useEvents";
import { cloneCompleteDepot, EXP, MAX_SAFE_INTEGER } from "util/fns/depot/itemUtils";
import { EventsData, NamedEvent, SubmitEventProps, UpcomingMaterialsData } from "types/events";
import { EventsDefaultsHook } from "util/hooks/useEventsDefaults";
import EventsSelector from "../events/EventsSelector";
import { createEmptyNamedEvent } from "util/fns/eventUtils";

interface Props extends EventsHook, EventsDefaultsHook {
  goals: PlannerGoal[];
  goalData: GoalData[];
  depot: Record<string, DepotItem>;
  putDepot: (depotItem: DepotItem[]) => void;
  resetDepot: () => void;
  depotIsUnsaved: boolean;
  refreshDepotDebounce: () => void;
  settings: LocalStorageSettings;
  setSettings: (settings: LocalStorageSettings | ((settings: LocalStorageSettings) => LocalStorageSettings)) => void;
  upcomingMaterialsData: UpcomingMaterialsData;
  selectedEvent: NamedEvent,
  setSelectedEvent: (namedEvent: NamedEvent) => void;
  groupedGoalsMap: GoalsFilteredCalculatedMap,
}

const MaterialsNeeded = React.memo((props: Props) => {
  const { goals, goalData, depot, putDepot, resetDepot, settings, setSettings, depotIsUnsaved, refreshDepotDebounce,
    eventsData, setEvents, submitEvent, toggleEvent,
    loading, trackerDefaults, fetchDefaults, toggleDefaultsEvent,
    selectedEvent, setSelectedEvent,
    upcomingMaterialsData,
    groupedGoalsMap,
    ...rest } = props;

  const [popoverOpen, setPopoverOpen] = useState<boolean>(false);
  const [popoverItemId, setPopoverItemId] = useState<string | null>(null);

  const [exportImportOpen, setExportImportOpen] = useState<boolean>(false);

  const [summaryOpen, setSummaryOpen] = useState<boolean>(false);
  const [eventsTrackerOpen, setEventsTrackerOpen] = useState<boolean>(false);

  const { setAnchorEl, menuProps, menuButtonProps } = useMenu();

  const craftToggleTooltips = ["Toggle only craftable materials ON\nto use with Goals and Filters", "Toggle all crafting states ON", "Reset all crafting states"];
  const initialCraftToggle = 1;
  const [craftToggle, setCraftToggle] = useState(initialCraftToggle);

  //conditional defaults fetch from api
  useEffect(() => {
    if ((summaryOpen || popoverOpen) && Object.keys(eventsData ?? {}).length === 0) {
      fetchDefaults();
    } else if (eventsTrackerOpen) {
      fetchDefaults();
    }
  }, [summaryOpen, popoverOpen, eventsTrackerOpen, eventsData, fetchDefaults])

  const upcomingEvents = useMemo(() =>
    Object.keys(eventsData ?? {}).length > 0
      ? { source: eventsData, name: "Tracker", toggleFunction: toggleEvent }
      : { source: trackerDefaults?.eventsData ?? {}, name: "Defaults", toggleFunction: toggleDefaultsEvent }
    , [eventsData, trackerDefaults.eventsData, toggleEvent, toggleDefaultsEvent])

  const handleItemClick = useCallback((itemId: string) => {
    setPopoverItemId(itemId);
    setPopoverOpen(true);
  }, []);

  const handlePopoverClose = useCallback(() => {
    setPopoverOpen(false);
  }, []);

  //### MaterialsNeeded element updaded logic ###
  //0. Planner re-renders each action: <=> savedStates + useCallbacks to prevent excess.
  //1. useEffect to calculate page in normal state from changes in depot, goals, ops.
  //  1.1 and not calculcate page when depot isnt fully synced.
  //2. ItemNeeded-s triggers handleValuesChange onChange, onCraftOne props
  //3. handleValuesChange puts changes in rawValues, and triggers debounce 500ms
  //  3.1 rawValues (if exist) are used in place of depot for page logic.
  //  3.2 debouncedOnChange() > onChange (ref.current)
  //  3.3 refresh depot debounce timer in useDepot.
  //4. 500ms later debouncedOnChange triggers:
  //  4.1 putDepot(rawValues) to trigger start of depot change in useDepot
  //  4.2 calculateMaterialsNeeded(), recalc page logic from rawValues => savedStates.
  //5. after useDepot finishes syncing - useEffect() <= from !depotIsUnsaved && depot props
  //  5.1 rawValues are reset to prioritise depot values
  //  5.3 calculateMaterialsNeeded recalc page logic from depot => savedStates

  //state to keep & show  raw changes of ItemNeeded
  const [rawValues, setRawValues] = useState({} as Record<string, DepotItem>);
  //states to keep data beetwen renders
  const [savedStates, setSavedStates] = useState({
    goalsMaterials: {} as Record<string, number>,
    materialsNeeded: {} as Record<string, number>,
    craftableItems: {} as Record<string, boolean>,
    sortedMaterialsNeeded: [] as [string, number][],
    ingredientToCraftedItemsMapping: {} as Record<string, string[]>,
    expOwned: 0,
  });

  //page logic into useCallback function to recalc from changes, not all renders
  const calculateMaterialsNeeded = useCallback(
    (_rawValues?: Record<string, DepotItem>) => {

      let materialsNeeded: Record<string, number> = {};
      // 1. populate the ingredients required for each goal
      goals.flatMap(getGoalIngredients).forEach((ingredient: Ingredient) => {
        materialsNeeded[ingredient.id] = (materialsNeeded[ingredient.id] ?? 0) + ingredient.quantity;
      });
      if (materialsNeeded.EXP) {
        EXP.forEach((exp) => {
          materialsNeeded[exp] = 0;
        });
      }

      const goalsMaterials = { ...materialsNeeded };

      //2. correct: add upcoming to depot to affect full hypotheticall craft
      const completeDepot = cloneCompleteDepot(depot, upcomingMaterialsData.materials);

      // 3. calculate what ingredients can be fulfilled by crafting
      const _depot = { ...completeDepot, ..._rawValues }; // need to hypothetically deduct from stock
      const { craftableItems, ingredientToCraftedItemsMapping } = canCompleteByCrafting(
        materialsNeeded,
        _depot,
        settings.depotSettings.crafting,
        settings.depotSettings.ignoreLmdInCrafting
      );
      //4. decrease needs to showcase results and crafting/completing states
      materialsNeeded = Object.fromEntries(
        Object.entries(materialsNeeded).map(([id, val]) => [id, Math.max(0, val - (upcomingMaterialsData.materials[id] ?? 0))])
      );

      const expOwned = depotToExp(depot);

      const allItems: [string, number][] = Object.values(itemsJson).map((item) => [item.id, materialsNeeded[item.id] ?? 0]);
      //not use RawValues in sort to not jump around while editing.
      const sortedMaterialsNeeded = (
        settings.depotSettings.showInactiveMaterials ? allItems : Object.entries(materialsNeeded)
      ).sort(([itemIdA, neededA], [itemIdB, neededB]) => {
        const itemA = itemsJson[itemIdA as keyof typeof itemsJson];
        const itemB = itemsJson[itemIdB as keyof typeof itemsJson];

        if (!itemA) console.log(itemIdA);
        const compareBySortId = itemA.sortId - itemB.sortId;
        if (settings.depotSettings.sortCompletedToBottom) {
          const getRank = (item: Item, needed: number): number => {
            const stock = (item.id === "EXP") ? expOwned : (depot[item.id]?.stock ?? 0)
            const isCraftable = !!craftableItems[item.id] && item.ingredients;

            const isComplete = stock >= Math.max(0, needed);

            if (!isComplete && !isCraftable) return 0;
            if (isCraftable && !isComplete) return 1;
            return 2;
          };

          const rankA = getRank(itemA, neededA);
          const rankB = getRank(itemB, neededB);

          return rankA - rankB || compareBySortId;
        }
        return compareBySortId;
      });

      setSavedStates({
        goalsMaterials,
        materialsNeeded,
        craftableItems,
        sortedMaterialsNeeded,
        ingredientToCraftedItemsMapping,
        expOwned,
      });

    }, [goals, depot, settings, upcomingMaterialsData.materials]
  );

  //useEffect recals on each render
  //restrict global recalc when input happens: debouncedRecacl is used
  useEffect(() => {
    //reset rawValues, and recalc when depot has current data/synced
    if (!depotIsUnsaved) {
      setRawValues({});
      calculateMaterialsNeeded();
    }
  }, [depotIsUnsaved,
    calculateMaterialsNeeded]);

  //function uses states, and updates on each render
  const onChange = () => {
    calculateMaterialsNeeded(rawValues);
    if (Object.keys(rawValues).length !== 0)
      putDepot(Object.values(rawValues));
  }
  //init ref with onChange
  const ref = useRef(onChange);

  //update ref on rawValues changes to see latest.
  useEffect(() => {
    ref.current = onChange;
  }, [rawValues]);

  //creating debounced callback only once - on mount
  const debouncedOnChange = useMemo(() => {
    const func = () => {
      ref.current?.(); //with access to latest onChange version from ref
    };
    return debounce(func, 500);
  }, []);

  const handleValuesChange = useCallback(
    (items: DepotItem[], isLocal: boolean = true) => {
      if (isLocal) {
        const _rawValues = { ...rawValues };
        items.forEach((item) => {
          _rawValues[item.material_id] = { ...item };
        });
        setRawValues(_rawValues);
        //syncronize depot debounce timer
        refreshDepotDebounce();
        debouncedOnChange();
      } else {
        //direct exposure to children w/o 500ms debounce of MN
        putDepot(items);
      }
    }, [debouncedOnChange, rawValues, refreshDepotDebounce, putDepot]
  );

  const handleChange = useCallback(
    (itemId: string, newQuantity: number) => {
      const data: DepotItem = { material_id: itemId, stock: Math.min(newQuantity, MAX_SAFE_INTEGER) };
      handleValuesChange([data]);
    },
    [handleValuesChange]
  );

  const handleAddItemsToDepot = useCallback(
    (items: [string, number][]) => {
      const updatedItems = items.map(([itemId, quantity]) => {
        const existingItem = rawValues[itemId] ?? depot[itemId] ?? { material_id: itemId, stock: 0 };
        return {
          ...existingItem,
          stock: Math.min(existingItem.stock + quantity, MAX_SAFE_INTEGER)
        };
      });
      handleValuesChange(updatedItems, false); //always non-local from Tracker
    },
    [rawValues, depot, handleValuesChange]
  );

  const handleSubmitEvent = useCallback((submit: SubmitEventProps) => {
    const depotAddon = submitEvent(submit);
    if (depotAddon) {
      handleAddItemsToDepot(depotAddon);
    }
  }, [submitEvent, handleAddItemsToDepot]
  );

  const canCraftOne = useCallback(
    (itemId: string) => {
      const updatedDatas: DepotItem[] = [];
      let canCraft = true;
      const { ingredients } = itemsJson[itemId as keyof typeof itemsJson] as Item;
      if (!ingredients) return false;

      ingredients.forEach((ingr) => {
        //settings: ignore LMD
        if (settings.depotSettings.ignoreLmdInCrafting && ingr.id === "4001") return;
        const ingrData: DepotItem = { ...rawValues[ingr.id] ?? depot[ingr.id] };
        const remaining = (rawValues[ingr.id]?.stock ?? depot[ingr.id]?.stock ?? 0) - ingr.quantity;
        if (remaining < 0) canCraft = false;
        ingrData.stock = remaining;
        updatedDatas.push(ingrData);
      });

      return canCraft;
    },
    [depot, rawValues, settings.depotSettings.ignoreLmdInCrafting]
  );

  const handleCraftOne = useCallback(
    (itemId: string, isLocal: boolean = true) => {
      const { ingredients, yield: itemYield } = itemsJson[itemId as keyof typeof itemsJson] as Item;
      if (!ingredients) return;
      const updatedDatas: DepotItem[] = [];

      ingredients.forEach((ingr) => {
        const ingrData: DepotItem = { ...rawValues[ingr.id] ?? depot[ingr.id] };
        ingrData.stock = Math.max((rawValues[ingr.id]?.stock ?? depot[ingr.id]?.stock ?? 0) - ingr.quantity, 0);
        updatedDatas.push(ingrData);
      });
      const craftedData: DepotItem = { ...rawValues[itemId] ?? depot[itemId] ?? { material_id: itemId, stock: 0 } };
      craftedData.stock = (rawValues[itemId]?.stock ?? depot[itemId]?.stock ?? 0) + (itemYield ?? 1);
      updatedDatas.push(craftedData);
      handleValuesChange(updatedDatas, isLocal);
    },
    [depot, rawValues, handleValuesChange]
  );

  const handleCraftingToggle = useCallback(
    (itemId: string) => {
      const depotSettings = { ...settings.depotSettings };
      const crafting = [...depotSettings.crafting];
      const index = settings.depotSettings.crafting.indexOf(itemId);
      if (index !== -1) {
        crafting.splice(index, 1);
      } else {
        crafting.push(itemId);
      }
      depotSettings.crafting = crafting;
      setSettings((s) => ({
        ...s,
        depotSettings,
      }));
      //switch to default state from manual imput, or to empty
      setCraftToggle(depotSettings.crafting.length === 0 ? 0 : initialCraftToggle);
    },
    [settings, setSettings]
  );

  const handleCraftingToggleAll = useCallback(
    () => {
      const depotSettings = { ...settings.depotSettings };
      const crafting: string[] = [];

      //cycle through crafting states:
      // 0 = reset, 1 = only craftable, 2 = full crafting 
      const nextCraftState = craftToggle < 2 ? craftToggle + 1 : 0;

      //depot with current changes
      const itemPlaceholders = Object.fromEntries(
        Object.values(itemsJson).map((item) => [
          item.id,
          { material_id: item.id, stock: 0 }
        ])
      ) as Record<string, DepotItem>;
      const _depot = { ...itemPlaceholders, ...depot, ...rawValues };

      switch (nextCraftState) {
        case 1:
          //calculate craftable items for all active goals
          const { craftableItems: _crafting } = canCompleteByCrafting(
            savedStates.materialsNeeded,
            _depot,
            Object.keys(_depot),
            settings.depotSettings.ignoreLmdInCrafting
          );
          crafting.push(
            ...Object.keys(_crafting).filter((itemID) => _crafting[itemID] && !crafting.includes(itemID))
          );
          break;
        case 2: //all depot to crafting
          crafting.push(
            ...Object.keys(_depot).filter(
              (itemID) => (itemsJson[itemID as keyof typeof itemsJson] as Item)?.ingredients
              //uncomment to exclude chips.
              //&& (itemsJson[itemID as keyof typeof itemsJson] as Item)?.name.includes(" Chip"))
            )
          );
          break;
      };
      depotSettings.crafting = crafting;
      setCraftToggle(nextCraftState);
      setSettings((s) => ({
        ...s,
        depotSettings,
      }));
    },
    [depot, rawValues, savedStates.materialsNeeded, settings, craftToggle, setSettings]
  );

  const handleResetCrafting = useCallback(() => {
    const depotSettings = { ...settings.depotSettings };
    depotSettings.crafting = [];
    setCraftToggle(0);
    setSettings((s) => ({ ...s, depotSettings }));
    setAnchorEl(null);
  }, [settings, setSettings, setAnchorEl]);

  const handleSortToBottom = useCallback(() => {
    const depotSettings = { ...settings.depotSettings };
    depotSettings.sortCompletedToBottom = !depotSettings.sortCompletedToBottom;

    setSettings((s) => ({ ...s, depotSettings }));
    setAnchorEl(null);
  }, [settings, setSettings, setAnchorEl]);

  const handleShowInactive = useCallback(() => {
    const depotSettings = { ...settings.depotSettings };
    depotSettings.showInactiveMaterials = !depotSettings?.showInactiveMaterials;

    setSettings((s) => ({ ...s, depotSettings }));
    setAnchorEl(null);
  }, [settings, setSettings, setAnchorEl]);

  const handleShowButtons = useCallback(() => {
    const depotSettings = { ...settings.depotSettings };
    depotSettings.showIncrementDecrementButtons = !depotSettings?.showIncrementDecrementButtons;

    setSettings((s) => ({ ...s, depotSettings }));
    setAnchorEl(null);
  }, [settings, setSettings, setAnchorEl]);

  const handleAllowNoLmdCrafting = useCallback(() => {
    const depotSettings = { ...settings.depotSettings };
    depotSettings.ignoreLmdInCrafting = !depotSettings?.ignoreLmdInCrafting;

    setSettings((s) => ({ ...s, depotSettings }));
    setAnchorEl(null);
  }, [settings, setSettings, setAnchorEl]);

  const handleOnChangeEventsTracker = useCallback((eventsData: EventsData) => {
    setEvents(eventsData);
  }, [setEvents]);

  const handleResetStock = useCallback(() => {
    //moved reset to useDepot hook.
    resetDepot();
    setAnchorEl(null);
  }, [resetDepot, setAnchorEl]);

  const handleExportImport = useCallback(() => {
    setExportImportOpen(true);
    setAnchorEl(null);
  }, [setAnchorEl]);

  return (
    <>
      <Board
        title={
          !depotIsUnsaved
            ? <Box display="flex" alignItems="center" height="min-content" paddingRight={1}>
              <Typography variant="h2">Depot</Typography>
            </Box>
            : (<Box display="flex" alignItems="center" height="min-content" paddingRight={1}
              sx={{ flexFlow: "row nowrap", gap: { xs: 1, md: 3 } }}>
              <Typography variant="h2" sx={{ color: { xs: "primary.main", lg: "unset" } }}>Depot</Typography>
              <Tooltip title="on 5s idle: ↑ upload changes to DB ↑">
                <Typography variant="h3"
                  sx={{ color: "primary.main", display: { xs: "none", lg: "unset" } }}>unsaved</Typography>
              </Tooltip>
            </Box>)
        }
        TitleAction={
          <Box display="flex" gap={1}>
            <Button
              onClick={() => setSummaryOpen(true)}
              variant="contained"
              color="primary">
              Summary
            </Button>
            <Tooltip arrow title={<Typography variant="body1" sx={{ whiteSpace: "pre-line" }}>{craftToggleTooltips[craftToggle]}</Typography>}>
              <Button
                onClick={handleCraftingToggleAll}
                variant="contained"
                startIcon={
                  craftToggle === 1 ? (
                    <CraftingIcon />
                  ) : craftToggle === 2 ? (
                    <CheckCircleIcon sx={{ width: "30px", height: "30px" }} />
                  ) : (
                    <RadioButtonUncheckedIcon sx={{ width: "30px", height: "30px" }} />
                  )}
                color="primary">
                Crafting
              </Button>
            </Tooltip>
            <SettingsButton props={menuButtonProps} />
          </Box>
        }
        sx={{ borderRadius: { xs: "0px 0px 4px 4px", md: "4px" } }}
      >
        <SettingsMenu props={menuProps}>
          <SettingsMenuItem onClick={handleSortToBottom} checked={settings.depotSettings.sortCompletedToBottom}>
            Sort completed & inactive to bottom
          </SettingsMenuItem>
          <SettingsMenuItem onClick={handleShowInactive} checked={settings.depotSettings.showInactiveMaterials}>
            Show inactive materials
          </SettingsMenuItem>
          <SettingsMenuItem onClick={handleShowButtons} checked={settings.depotSettings.showIncrementDecrementButtons}>
            Show increment/decrement buttons
          </SettingsMenuItem>
          <SettingsMenuItem onClick={handleAllowNoLmdCrafting} checked={settings.depotSettings.ignoreLmdInCrafting}>
            Ignore LMD & Exp in craft and goals
          </SettingsMenuItem>
          <Divider />
          <MenuItem onClick={() => {
            setAnchorEl(null);
            setEventsTrackerOpen(true)
          }}>
            <ListItemIcon><StorageIcon /></ListItemIcon>
            Events Income Tracker
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleExportImport}>
            <ListItemText inset>Export/Import</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleResetCrafting}>
            <ListItemText inset sx={{ color: "error.light" }}>
              Reset crafting states
            </ListItemText>
          </MenuItem>
          <MenuItem onClick={handleResetStock}>
            <ListItemText inset sx={{ color: "error.light" }}>
              Reset stock
            </ListItemText>
          </MenuItem>
        </SettingsMenu>
        <Box display="flex" flexDirection="column">
          <Box width="calc(max(400px,50%))" alignSelf="flex-end" mt={-2}>
            <EventsSelector
              emptyItem={loading ? "wait, defauls are downloading..." : `Select future event from ${upcomingEvents.name}`}
              dataType={'events'}
              eventsData={upcomingEvents.source}
              selectedEvent={selectedEvent ?? createEmptyNamedEvent()}
              onChange={setSelectedEvent}
              onOpen={() => {
                if (Object.keys(upcomingEvents.source).length === 0) {
                  fetchDefaults();
                }
              }}
              onEventToggle={upcomingEvents.toggleFunction}
            /></Box>
          <Box
            component="ul"
            sx={{
              display: "grid",
              mt: 2,
              mb: 0,
              mx: 0,
              p: 0,
              columnGap: { xs: 1, sm: 2 },
              rowGap: 2,
              gridTemplateColumns: {
                xs: "repeat(auto-fill, minmax(96px, 1fr))",
                sm: "repeat(auto-fill, minmax(108px, 1fr))",
              },
              position: "relative",
            }}
          >
            {savedStates.sortedMaterialsNeeded.map(([itemId, needed]) => (
              <ItemNeeded
                key={itemId}
                component="li"
                itemId={itemId}
                owned={itemId === "EXP" ? savedStates.expOwned : rawValues[itemId]?.stock ?? depot[itemId]?.stock ?? 0}
                quantity={needed}
                canCompleteByCrafting={savedStates.craftableItems[itemId]}
                canCraftOne={canCraftOne(itemId)}
                isCrafting={settings.depotSettings.crafting.includes(itemId) ?? false}
                onChange={handleChange}
                onCraftOne={handleCraftOne}
                onCraftingToggle={handleCraftingToggle}
                onClick={handleItemClick}
                hideIncrementDecrementButtons={
                  (itemId === "4001" || itemId === "EXP" || !settings.depotSettings.showIncrementDecrementButtons) ??
                  false
                }
                upcomingQuantity={upcomingMaterialsData.materials[itemId]}

              />
            ))}
          </Box>
        </Box>
        <ItemInfoPopover
          itemId={popoverItemId}
          ingredientToCraftedItemsMapping={savedStates.ingredientToCraftedItemsMapping}
          open={popoverOpen}
          onClose={handlePopoverClose}
          openEventTracker={() => setEventsTrackerOpen(true)}
          eventsData={upcomingEvents.source}
        />
      </Board>
      <ExportImportDialog
        depot={depot}
        putDepot={putDepot}
        open={exportImportOpen}
        onClose={() => {
          setExportImportOpen(false);
        }}
        goals={goalData}
      />
      <MaterialsSummaryDialog
        depot={depot}
        goalData={goalData}
        expOwned={savedStates.expOwned}
        goalsMaterials={savedStates.goalsMaterials}
        open={summaryOpen}
        onClose={() => {
          setSummaryOpen(false);
        }}
        openEvents={setEventsTrackerOpen}
        eventsSource={upcomingEvents}
        selectedEvent={selectedEvent}
        setSelectedEvent={setSelectedEvent}
        upcomingMaterialsData={upcomingMaterialsData}
        groupedGoalsMap={groupedGoalsMap}
        settings={settings}
        setSettings={setSettings}
        onCraftOne={handleCraftOne}
      />
      <EventsTrackerDialog
        eventsData={eventsData}
        open={eventsTrackerOpen}
        onChange={handleOnChangeEventsTracker}
        onClose={() => {
          setEventsTrackerOpen(false);
        }}
        openSummary={setSummaryOpen}
        submitEvent={handleSubmitEvent}
        trackerDefaults={trackerDefaults}
      />
    </>
  );
});
MaterialsNeeded.displayName = "MaterialsNeeded";
export default MaterialsNeeded;
