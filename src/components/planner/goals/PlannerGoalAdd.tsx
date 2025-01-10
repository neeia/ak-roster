import {
  Box,
  Button,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import OperatorSearch from "../OperatorSearch";
import { Operator, OperatorData } from "types/operators/operator";
import { Close } from "@mui/icons-material";
import Chip from "components/base/Chip";
import Promotion from "components/data/input/Select/Promotion";
import SelectGroup, { DisabledContext } from "components/data/input/Select/SelectGroup";
import Level from "components/data/input/Select/Level";
import SkillLevel from "components/data/input/Select/SkillLevel";
import AddGroupDialog from "./AddGroupDialog";
import Mastery from "components/data/input/Select/Mastery";
import Module from "components/data/input/Select/Module";
import GoalData, { GoalDataInsert } from "types/goalData";
import _ from "lodash";
import { clamp, defaultOperatorObject, MAX_LEVEL_BY_RARITY, MAX_SKILL_LEVEL_BY_PROMOTION } from "util/changeOperator";
import { GroupsDataInsert } from "types/groupData";
import Preset from "types/operators/presets";
import usePresets from "util/hooks/usePresets";
import { modTypes } from "components/data/batch/PresetDialog";
import SupportBlock from "components/data/SupportBlock";
import applyGoalsFromOperator from "util/fns/planner/applyGoalsFromOperator";
import applyGoalsToOperator from "util/fns/planner/applyGoalsToOperator";
import operatorJson from "data/operators";
import Roster from "types/operators/roster";

interface Props {
  open: boolean;
  roster: Roster;
  op_id?: string;
  group?: string;
  goals?: GoalData[];
  goalGroups: string[];
  updateGoals: (goalsData: GoalDataInsert[]) => void;
  putGroup: (goalGroupInsert: GroupsDataInsert[]) => void;
  onClose: () => void;
}

type GoalBuilder = Partial<GoalDataInsert>;

const isNumber = (value: any) => typeof value === "number";

const SHORTCUTS: Preset[] = [
  { name: "Nothing", index: -2 },
  {
    name: "Everything",
    index: -1,
    elite: 2,
    level: 90,
    skill_level: 7,
    masteries: [3, 3, 3],
    modules: Object.fromEntries(modTypes.map((s) => [s, 3])),
  },
];
const PlannerGoalAdd = (props: Props) => {
  const { open, roster, op_id, group, goals = [], goalGroups, updateGoals, putGroup, onClose } = props;
  const theme = useTheme();
  const fullScreen = !useMediaQuery(theme.breakpoints.up("sm"));

  const { presets } = usePresets();

  const [opData, setOpData] = useState<OperatorData | null>(null);
  const [currentOp, setCurrentOp] = useState<Operator | null>(null);
  const [selectedGroup, setSelectedGroup] = useState("Default");

  const [isEdit, setIsEdit] = useState(false);

  const [openGroupDialog, setOpenGroupDialog] = useState(false);
  const [goalBuilder, setGoalBuilder] = useState<GoalBuilder>({});

  const [showPreview, setShowPreview] = useState(true);
  const [showPresets, setShowPresets] = useState(true);
  const toggleSection = (section: string) => {
    if (!opData || !currentOp) return;

    switch (section) {
      case "elite":
        setGoalBuilder((prev) => {
          const _goalBuilder = { ...prev };
          const wasOpen = isNumber(_goalBuilder.elite_from) && isNumber(_goalBuilder.elite_to);
          if (wasOpen) {
            delete _goalBuilder.elite_from;
            delete _goalBuilder.elite_to;
            delete _goalBuilder.level_from;
            delete _goalBuilder.level_to;
          } else {
            _goalBuilder.elite_from = currentOp.elite;
            _goalBuilder.elite_to = currentOp.elite;
          }
          return _goalBuilder;
        });
        break;
      case "level":
        setGoalBuilder((prev) => {
          const _goalBuilder = { ...prev };
          const wasOpen = isNumber(_goalBuilder.level_from) && isNumber(_goalBuilder.level_to);
          if (wasOpen) {
            if (_goalBuilder.elite_from === _goalBuilder.elite_to) {
              delete _goalBuilder.elite_from;
              delete _goalBuilder.elite_to;
            }
            delete _goalBuilder.level_from;
            delete _goalBuilder.level_to;
          } else {
            if (!isNumber(_goalBuilder.elite_from) || !isNumber(_goalBuilder.elite_to)) {
              _goalBuilder.elite_from = currentOp.elite;
              _goalBuilder.elite_to = currentOp.elite;
            }
            _goalBuilder.level_from = clamp(
              1,
              currentOp.level,
              MAX_LEVEL_BY_RARITY[opData.rarity][_goalBuilder.elite_from ?? currentOp.elite]
            );
            _goalBuilder.level_to = clamp(
              1,
              currentOp.level,
              MAX_LEVEL_BY_RARITY[opData.rarity][_goalBuilder.elite_to ?? currentOp.elite]
            );
          }
          return _goalBuilder;
        });
        break;
      case "module":
        if (!opData.moduleData?.length) break;
        setGoalBuilder((prev) => {
          const _goalBuilder = { ...prev };
          const wasOpen = _goalBuilder.modules_from && _goalBuilder.modules_from;
          if (wasOpen) {
            delete _goalBuilder.modules_from;
            delete _goalBuilder.modules_to;
          } else {
            _goalBuilder.modules_from = currentOp.modules;
            _goalBuilder.modules_to = currentOp.modules;
          }
          return _goalBuilder;
        });
        break;
      case "skill":
        setGoalBuilder((prev) => {
          const _goalBuilder = { ...prev };
          const wasOpen = isNumber(_goalBuilder.skill_level_from) && isNumber(_goalBuilder.skill_level_to);
          if (wasOpen) {
            delete _goalBuilder.skill_level_from;
            delete _goalBuilder.skill_level_to;
          } else {
            _goalBuilder.skill_level_from = currentOp.skill_level;
            _goalBuilder.skill_level_to = currentOp.skill_level;
          }
          return _goalBuilder;
        });
        break;
      case "mastery":
        if (opData.rarity < 4) break;
        setGoalBuilder((prev) => {
          const _goalBuilder = { ...prev };
          const wasOpen = _goalBuilder.masteries_from && _goalBuilder.masteries_to;
          if (wasOpen) {
            delete _goalBuilder.masteries_from;
            delete _goalBuilder.masteries_to;
          } else {
            _goalBuilder.masteries_from = currentOp.masteries;
            _goalBuilder.masteries_to = currentOp.masteries;
          }
          return _goalBuilder;
        });
        break;
    }
  };

  const onSelectedOperatorChange = useCallback(
    (_opData: OperatorData | null) => {
      if (_opData?.id === opData?.id) return;

      setOpData(_opData);
      if (!_opData) {
        // no operator selected
        setCurrentOp(null);
        setGoalBuilder({});
        return;
      }
      // operator selected, find operator in roster
      const op = roster[_opData.id] ?? defaultOperatorObject(_opData.id, true);
      setCurrentOp(op);
      setGoalBuilder({});

      // if a group is selected, check if there is an existing goal for the selected group
      const existingGoal = goals.find((x) => x.op_id == _opData.id && x.group_name == selectedGroup);
      if (existingGoal) {
        setGoalBuilder(existingGoal);
        setIsEdit(true);
      } else {
        setIsEdit(false);
      }
    },
    [goals, roster, defaultOperatorObject, opData, setOpData, setIsEdit, setCurrentOp, setGoalBuilder, selectedGroup]
  );

  const addGroup = (groupName: string) => {
    putGroup([{ group_name: groupName, sort_order: goalGroups.length }]);
    setSelectedGroup(groupName);
  };

  const onGroupChange = useCallback(
    (groupName: string) => {
      if (!groupName) {
        setOpenGroupDialog(true);
        return;
      }

      // if an op is selected, check if there is an existing goal for the selected group
      if (opData) {
        if (isEdit) {
          setGoalBuilder({});
        }
        const existingGoal = goals.find((goal) => goal.op_id === opData.id && goal.group_name === groupName);
        if (existingGoal) {
          setGoalBuilder(existingGoal);
          setIsEdit(true);
        } else {
          setIsEdit(false);
        }
      }

      setSelectedGroup(groupName);
    },
    [setOpenGroupDialog, opData, isEdit, setGoalBuilder, goals, setIsEdit]
  );

  useEffect(() => {
    if (op_id) {
      onSelectedOperatorChange(operatorJson[op_id]);
    }
    if (opData?.id === op_id && group) {
      onGroupChange(group);
    }
  }, [op_id, opData, group, onSelectedOperatorChange, onGroupChange]);

  // promotion
  const onPromotionFromChange = (elite_from: number) => {
    if (!isNumber(goalBuilder.elite_from) || !isNumber(goalBuilder.elite_to)) return;
    const elite_to = goalBuilder.elite_to ?? currentOp?.elite ?? 0;
    const max_from = MAX_LEVEL_BY_RARITY[opData!.rarity][elite_from];
    const max_to = MAX_LEVEL_BY_RARITY[opData!.rarity][elite_to];
    setGoalBuilder((prev) => ({
      ...prev,
      elite_from,
      elite_to: clamp(elite_from, prev.elite_to!, opData!.eliteLevels.length),
      level_from: prev.level_from ? clamp(1, prev.level_from, max_from) : undefined,
      level_to: prev.level_to ? clamp(1, prev.level_to, max_to) : undefined,
    }));
  };
  const onPromotionToChange = (elite_to: number) => {
    if (!isNumber(goalBuilder.elite_from) || !isNumber(goalBuilder.elite_to)) return;
    const maxLevel = MAX_LEVEL_BY_RARITY[opData!.rarity][elite_to];
    setGoalBuilder((prev) => ({
      ...prev,
      elite_from: clamp(0, prev.elite_from!, elite_to),
      elite_to,
      level_from: prev.level_from ? clamp(1, prev.level_from, maxLevel) : undefined,
      level_to: prev.level_to ? clamp(1, prev.level_to, maxLevel) : undefined,
    }));
  };

  // level
  const onLevelFromChange = (level_from: number) => {
    if (!isNumber(goalBuilder.level_from) || !isNumber(goalBuilder.level_to)) return;
    const elite_from = goalBuilder.elite_from ?? currentOp?.elite ?? 0;
    const elite_to = goalBuilder.elite_to ?? currentOp?.elite ?? 0;
    const max_from = MAX_LEVEL_BY_RARITY[opData!.rarity][elite_from];
    const max_to = MAX_LEVEL_BY_RARITY[opData!.rarity][elite_to];
    setGoalBuilder((prev) => ({
      ...prev,
      level_from: clamp(1, level_from, max_from),
      level_to: clamp(elite_from === elite_to ? level_from : 1, prev.level_to ?? level_from, max_to),
    }));
  };
  const onLevelToChange = (level_to: number) => {
    if (!isNumber(goalBuilder.level_from) || !isNumber(goalBuilder.level_to)) return;
    const elite_from = goalBuilder.elite_from ?? currentOp?.elite ?? 0;
    const elite_to = goalBuilder.elite_to ?? currentOp?.elite ?? 0;
    const max_from = MAX_LEVEL_BY_RARITY[opData!.rarity][elite_from];
    const max_to = MAX_LEVEL_BY_RARITY[opData!.rarity][elite_to];
    setGoalBuilder((prev) => ({
      ...prev,
      level_from: clamp(1, prev.level_from ?? level_to, elite_from === elite_to ? level_to : max_from),
      level_to: clamp(1, level_to, max_to),
    }));
  };

  // skills
  const onSkillLevelFromChange = (skill_level_from: number) => {
    if (!isNumber(goalBuilder.skill_level_from) || !isNumber(goalBuilder.skill_level_to)) return;
    setGoalBuilder((prev) => ({
      ...prev,
      skill_level_from: clamp(1, skill_level_from, 7),
      skill_level_to: clamp(skill_level_from, prev.skill_level_to!, 7),
    }));
  };
  const onSkillLevelToChange = (skill_level_to: number) => {
    if (!isNumber(goalBuilder.skill_level_from) || !isNumber(goalBuilder.skill_level_to)) return;
    setGoalBuilder((prev) => ({
      ...prev,
      skill_level_from: clamp(1, prev.skill_level_from!, skill_level_to),
      skill_level_to: clamp(1, skill_level_to, 7),
    }));
  };

  // mastery
  const onMasteryFromChange = (skillNumber: number, newMasteryLevel: number) => {
    if (!goalBuilder.masteries_from || !goalBuilder.masteries_to) return;
    if (skillNumber >= goalBuilder.masteries_from.length) return;

    const masteries_from = [...goalBuilder.masteries_from];
    masteries_from[skillNumber] = newMasteryLevel;
    const masteries_to = [...goalBuilder.masteries_to];
    masteries_to[skillNumber] = Math.max(newMasteryLevel, masteries_to[skillNumber]);
    setGoalBuilder((prev) => ({
      ...prev,
      masteries_from,
      masteries_to,
    }));
  };
  const onMasteryToChange = (skillNumber: number, newMasteryLevel: number) => {
    if (!goalBuilder.masteries_from || !goalBuilder.masteries_to) return;
    if (skillNumber >= goalBuilder.masteries_to.length) return;

    const masteries_to = [...(goalBuilder.masteries_to ?? [])];
    masteries_to[skillNumber] = newMasteryLevel;
    setGoalBuilder((prev) => ({
      ...prev,
      masteries_from: prev.masteries_from!.map((n, i) => Math.min(n, masteries_to[i])),
      masteries_to,
    }));
  };

  // module
  const onModuleFromChange = (moduleId: string, newModuleLevel: number) => {
    if (!goalBuilder.modules_from || !goalBuilder.modules_to) return;
    if (!opData?.moduleData?.find((mod) => mod.moduleId === moduleId)) return;

    const modules_from = { ...(goalBuilder.modules_from as Record<string, number>) };
    modules_from[moduleId] = clamp(0, newModuleLevel, 3);
    const modules_to = { ...(goalBuilder.modules_to as Record<string, number>) };
    modules_to[moduleId] = clamp(newModuleLevel, modules_to[moduleId], 3);
    setGoalBuilder((prev) => ({
      ...prev,
      modules_from,
      modules_to,
    }));
  };
  const onModuleToChange = (moduleId: string, newModuleLevel: number) => {
    if (!goalBuilder.modules_from || !goalBuilder.modules_to) return;
    if (!opData?.moduleData?.find((mod) => mod.moduleId === moduleId)) return;

    const modules_from = { ...(goalBuilder.modules_from as Record<string, number>) };
    modules_from[moduleId] = clamp(0, modules_from[moduleId], newModuleLevel);
    const modules_to = { ...(goalBuilder.modules_to as Record<string, number>) };
    modules_to[moduleId] = clamp(0, newModuleLevel, 3);
    setGoalBuilder((prev) => ({
      ...prev,
      modules_from,
      modules_to,
    }));
  };

  const handleGoalAddDialogClose = (shouldAddGoal: boolean) => {
    if (shouldAddGoal && currentOp) {
      const goalData: GoalDataInsert = { group_name: selectedGroup, op_id: currentOp.op_id };

      let hasChanged = false;

      if (
        isNumber(goalBuilder.elite_from) &&
        isNumber(goalBuilder.elite_to) &&
        goalBuilder.elite_from !== goalBuilder.elite_to
      ) {
        goalData.elite_from = goalBuilder.elite_from;
        goalData.elite_to = goalBuilder.elite_to;
        hasChanged = true;
      }

      if (
        isNumber(goalBuilder.level_from) &&
        isNumber(goalBuilder.level_to) &&
        (goalBuilder.elite_from !== goalBuilder.elite_to || goalBuilder.level_from < goalBuilder.level_to)
      ) {
        goalData.elite_from = goalBuilder.elite_from ?? currentOp.elite;
        goalData.elite_to = goalBuilder.elite_to ?? currentOp.elite;
        goalData.level_from = goalBuilder.level_from;
        goalData.level_to = goalBuilder.level_to;
        hasChanged = true;
      }

      if (
        isNumber(goalBuilder.skill_level_from) &&
        isNumber(goalBuilder.skill_level_to) &&
        goalBuilder.skill_level_from !== goalBuilder.skill_level_to
      ) {
        goalData.skill_level_from = goalBuilder.skill_level_from;
        goalData.skill_level_to = goalBuilder.skill_level_to;
        hasChanged = true;
      }

      if (
        goalBuilder.masteries_from?.every(isNumber) &&
        goalBuilder.masteries_to?.every(isNumber) &&
        !goalBuilder.masteries_from?.every((x, i) => x === goalBuilder.masteries_to?.[i])
      ) {
        goalData.masteries_from = goalBuilder.masteries_from;
        goalData.masteries_to = goalBuilder.masteries_to;
        hasChanged = true;
      }

      if (
        goalBuilder.modules_from &&
        Object.values(goalBuilder.modules_from).every(isNumber) &&
        goalBuilder.modules_to &&
        Object.values(goalBuilder.modules_to).every(isNumber) &&
        !Object.entries(goalBuilder.modules_from)?.every(
          ([id, n]) => n === (goalBuilder.modules_to as Record<string, number>)?.[id]
        )
      ) {
        goalData.modules_from = goalBuilder.modules_from;
        goalData.modules_to = goalBuilder.modules_to;
        hasChanged = true;
      }
      if (hasChanged) {
        if (!isEdit) {
          const sortOrders = goals.map(({ sort_order }) => sort_order);
          goalData.sort_order = Math.max(0, ...sortOrders) + 1;
        }
        updateGoals([goalData]);
      }
    }
    setOpData(null);
    setCurrentOp(null);
    onClose();
    setGoalBuilder({});
  };

  const handlePreset = (preset: Preset) => {
    if (!opData || !currentOp) return {};
    const skillCount = opData.skillData?.length ?? 0;
    const maxElite = opData.eliteLevels.length ?? 0;
    const maxLevel = MAX_LEVEL_BY_RARITY[opData.rarity];

    const _goalBuilder: GoalBuilder = {};

    const elite_from = Math.min(goalBuilder.elite_from ?? currentOp.elite, maxElite);
    const elite_to = Math.min(preset.elite ?? goalBuilder.elite_to ?? elite_from, maxElite);
    const level_from = Math.min(goalBuilder.level_from ?? currentOp.level, maxLevel[elite_from]);
    const level_to = Math.min(preset.level ?? goalBuilder.level_to ?? level_from, maxLevel[elite_to]);
    const skill_level_from = Math.min(
      goalBuilder.skill_level_from ?? currentOp.skill_level,
      MAX_SKILL_LEVEL_BY_PROMOTION[elite_from]
    );
    const skill_level_to = Math.min(
      preset.skill_level ?? goalBuilder.skill_level_to ?? elite_from,
      MAX_SKILL_LEVEL_BY_PROMOTION[elite_to]
    );
    const masteries_from = goalBuilder.masteries_from ?? currentOp.masteries;
    const _masteries_to = preset.masteries ?? goalBuilder.masteries_to ?? masteries_from;
    const masteries_to = _masteries_to
      .filter((_, i) => i < skillCount)
      .map((mastery, i) => (mastery === -1 ? masteries_from[i] : mastery));

    if (isNumber(preset.elite) && elite_from < elite_to) {
      _goalBuilder.elite_from = elite_from;
      _goalBuilder.elite_to = elite_to;
    }
    if (isNumber(preset.level) && (elite_from < elite_to || level_from < level_to)) {
      _goalBuilder.level_from = level_from;
      _goalBuilder.level_to = level_to;
    }
    if (opData.rarity > 2 && isNumber(preset.skill_level) && skill_level_from < skill_level_to) {
      _goalBuilder.skill_level_from = goalBuilder.skill_level_from ?? currentOp.skill_level;
      _goalBuilder.skill_level_to = preset.skill_level;
    }
    if (
      opData.rarity > 3 &&
      preset.masteries?.every(isNumber) &&
      masteries_from.some((v, i) => v !== masteries_to[i])
    ) {
      _goalBuilder.masteries_from = masteries_from;
      _goalBuilder.masteries_to = masteries_to;
    }
    if (opData.moduleData?.length && preset.modules) {
      const moduleData = opData.moduleData;

      const modules_from = goalBuilder.modules_from ?? currentOp.modules;
      const modules_to = moduleData.reduce((acc, { moduleId, typeName }) => {
        const _acc = { ...acc };
        _acc[moduleId] =
          Object.entries(preset.modules!).find(([type]) => typeName.endsWith(type))?.[1] ??
          currentOp.modules[moduleId] ??
          0;
        return _acc;
      }, {} as Record<string, number>);

      if (Object.entries(modules_from).some(([i, v]) => v < modules_to[i])) {
        _goalBuilder.modules_from = modules_from;
        _goalBuilder.modules_to = modules_to;
      }
    }

    return _goalBuilder;
  };

  const isEqual = (a: GoalBuilder, b: GoalBuilder) => {
    const aKeys = Object.keys(a) as (keyof GoalBuilder)[];
    const bKeys = Object.keys(b) as (keyof GoalBuilder)[];
    if (aKeys.length !== bKeys.length) return false;
    return aKeys.every((key) => _.isEqual(a[key], b[key]));
  };

  return (
    <>
      <Dialog open={open} onClose={() => handleGoalAddDialogClose(false)} fullScreen={fullScreen}>
        <DialogTitle>
          {isEdit ? "Edit" : "New"} Goal
          <IconButton onClick={onClose} sx={{ display: { sm: "none" } }}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <DisabledContext.Provider value={!opData}>
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                gap: 2,
                pt: 2,
              }}
            >
              <OperatorSearch
                sx={{ width: "100%", maxWidth: "40ch" }}
                value={opData}
                onChange={(newOp) => onSelectedOperatorChange(newOp)}
              />
              <FormControl sx={{ flexGrow: 1 }}>
                <InputLabel>Goal Group</InputLabel>
                <Select
                  value={selectedGroup}
                  onChange={(e) => onGroupChange(e.target.value)}
                  label="Goal Group"
                  fullWidth
                  sx={{
                    color: selectedGroup === "Default" ? "text.secondary" : undefined,
                  }}
                >
                  <MenuItem value="Default" sx={{ color: "text.secondary" }} className="no-underline">
                    Default (none)
                  </MenuItem>
                  {goalGroups
                    .filter((s) => s !== "Default")
                    .map((group) => (
                      <MenuItem value={group} key={group} className="no-underline">
                        {group}
                      </MenuItem>
                    ))}
                  <Divider component="li" />
                  <MenuItem>(Add new...)</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <SelectGroup
              title="Preview"
              label={showPreview ? "HIDE" : "SHOW"}
              onClick={() => setShowPreview((s) => !s)}
            >
              <Collapse in={showPreview} sx={{ width: "100%" }}>
                {currentOp && opData && (
                  <SelectGroup.FromTo
                    sx={{ gridTemplateColumns: "1fr 1fr", "& .potential": { display: "none" }, overflow: "hidden" }}
                  >
                    <SupportBlock op={{ ...applyGoalsFromOperator(goalBuilder, currentOp), ...opData }} />
                    <SupportBlock op={{ ...applyGoalsToOperator(goalBuilder, currentOp), ...opData }} />
                  </SelectGroup.FromTo>
                )}
              </Collapse>
            </SelectGroup>
            <SelectGroup
              title="Shortcuts"
              label={showPresets ? "HIDE" : "SHOW"}
              onClick={() => setShowPresets((s) => !s)}
            >
              <Collapse in={showPresets}>
                <Box component="ul" sx={{ display: "flex", flexWrap: "wrap", m: 0, p: 0, gap: 1 }}>
                  {[...SHORTCUTS, ...presets].map((shortcut) => (
                    <Box component="li" key={shortcut.index} sx={{ display: "contents" }}>
                      <Chip
                        disabled={
                          !opData ||
                          isEqual(goalBuilder, handlePreset(shortcut)) ||
                          (shortcut.index >= 0 && isEqual({}, handlePreset(shortcut)))
                        }
                        onClick={() => setGoalBuilder(handlePreset(shortcut))}
                      >
                        {shortcut.name}
                      </Chip>
                    </Box>
                  ))}
                </Box>
              </Collapse>
            </SelectGroup>
            <SelectGroup.Toggle
              title="Promotion"
              open={isNumber(goalBuilder.elite_from) || isNumber(goalBuilder.elite_to)}
              toggleOpen={() => toggleSection("elite")}
              sx={{
                position: "relative",
                "&:after": {
                  content: "''",
                  position: "absolute",
                  bottom: "-16px",
                  left: 0,
                  right: 0,
                  mx: "auto",
                  width: 6,
                  height: isNumber(goalBuilder.level_from) || isNumber(goalBuilder.level_to) ? 16 : 0,
                  borderLeft: "2px solid",
                  borderRight: "2px solid",
                  borderColor: "grey.500",
                  opacity: isNumber(goalBuilder.level_from) || isNumber(goalBuilder.level_to) ? 1 : 0,
                  transition: "height 0.25s, opacity 0.25s",
                },
              }}
            >
              <SelectGroup.FromTo>
                <Promotion
                  exclusive
                  value={goalBuilder.elite_from}
                  max={opData?.eliteLevels.length}
                  onChange={onPromotionFromChange}
                />
                <Promotion
                  exclusive
                  value={goalBuilder.elite_to}
                  max={opData?.eliteLevels.length}
                  onChange={onPromotionToChange}
                />
              </SelectGroup.FromTo>
            </SelectGroup.Toggle>
            <SelectGroup.Toggle
              title="Level"
              open={isNumber(goalBuilder.level_from) || isNumber(goalBuilder.level_to)}
              toggleOpen={() => toggleSection("level")}
            >
              <SelectGroup.FromTo>
                <Level
                  value={goalBuilder.level_from ?? undefined}
                  max={MAX_LEVEL_BY_RARITY[opData?.rarity ?? 0][goalBuilder.elite_from ?? currentOp?.elite ?? 0]}
                  onChange={onLevelFromChange}
                />
                <Level
                  value={goalBuilder.level_to ?? undefined}
                  max={MAX_LEVEL_BY_RARITY[opData?.rarity ?? 0][goalBuilder.elite_to ?? currentOp?.elite ?? 0]}
                  onChange={onLevelToChange}
                />
              </SelectGroup.FromTo>
            </SelectGroup.Toggle>
            <SelectGroup.Toggle
              title="Skill Rank"
              open={isNumber(goalBuilder.skill_level_from) || isNumber(goalBuilder.skill_level_to)}
              toggleOpen={() => toggleSection("skill")}
              disabled={!opData || opData.rarity <= 2}
            >
              <SelectGroup.FromTo>
                <SkillLevel
                  exclusive
                  value={goalBuilder.skill_level_from ?? undefined}
                  onChange={onSkillLevelFromChange}
                />
                <SkillLevel exclusive value={goalBuilder.skill_level_to ?? undefined} onChange={onSkillLevelToChange} />
              </SelectGroup.FromTo>
            </SelectGroup.Toggle>
            <SelectGroup.Toggle
              title="Mastery"
              open={!!goalBuilder.masteries_from || !!goalBuilder.masteries_to}
              toggleOpen={() => toggleSection("mastery")}
              disabled={!opData || opData.rarity <= 3}
            >
              <Mastery>
                {opData
                  ? opData.skillData?.map((data, skillIndex) => (
                      <Mastery.Skill
                        src={data.iconId ?? data.skillId}
                        key={data.skillId}
                        skillName={data.skillName}
                        skillNumber={skillIndex + 1}
                      >
                        <SelectGroup.FromTo>
                          <Mastery.Select
                            exclusive
                            value={goalBuilder.masteries_from?.[skillIndex]}
                            onChange={(masteryLevel) => onMasteryFromChange(skillIndex, masteryLevel)}
                          />
                          <Mastery.Select
                            exclusive
                            value={goalBuilder.masteries_to?.[skillIndex]}
                            onChange={(masteryLevel) => onMasteryToChange(skillIndex, masteryLevel)}
                          />
                        </SelectGroup.FromTo>
                      </Mastery.Skill>
                    ))
                  : null}
              </Mastery>
            </SelectGroup.Toggle>
            <SelectGroup.Toggle
              title="Module"
              open={!!goalBuilder.modules_from || !!goalBuilder.modules_to}
              toggleOpen={() => toggleSection("module")}
              disabled={!opData?.moduleData?.length}
            >
              <Module>
                {opData?.moduleData?.map((mod) => (
                  <Module.Item key={mod.moduleId} {...mod}>
                    <SelectGroup.FromTo>
                      <Module.Select
                        exclusive
                        value={(goalBuilder.modules_from as Record<string, number>)?.[mod.moduleId] ?? 0}
                        moduleId={mod.moduleId}
                        onChange={onModuleFromChange}
                      />
                      <Module.Select
                        exclusive
                        value={(goalBuilder.modules_to as Record<string, number>)?.[mod.moduleId] ?? 0}
                        moduleId={mod.moduleId}
                        onChange={onModuleToChange}
                      />
                    </SelectGroup.FromTo>
                  </Module.Item>
                ))}
              </Module>
            </SelectGroup.Toggle>
          </DisabledContext.Provider>
        </DialogContent>
        <DialogActions sx={{ display: "flex", gap: 1 }}>
          <Button variant="outlined" onClick={() => handleGoalAddDialogClose(false)}>
            Cancel
          </Button>
          <Button variant="contained" onClick={() => handleGoalAddDialogClose(true)} disabled={!opData}>
            {isEdit ? "Save" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
      <AddGroupDialog
        open={openGroupDialog}
        onClose={() => setOpenGroupDialog(false)}
        onSubmit={addGroup}
        goalGroups={goalGroups}
      />
    </>
  );
};

export default PlannerGoalAdd;
