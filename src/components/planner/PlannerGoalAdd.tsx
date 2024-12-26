import {
  Box,
  Button,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React, { useCallback, useState } from "react";
import OperatorSearch from "./OperatorSearch";
import { Operator, OperatorData } from "types/operators/operator";
import { Close } from "@mui/icons-material";
import Chip from "../base/Chip";
import Promotion from "../data/input/Select/Promotion";
import SelectGroup, { DisabledContext } from "../data/input/Select/SelectGroup";
import Level from "../data/input/Select/Level";
import SkillLevel from "../data/input/Select/SkillLevel";
import AddGroupDialog from "./AddGroupDialog";
import Mastery from "../data/input/Select/Mastery";
import Module from "../data/input/Select/Module";
import GoalData, { GoalDataInsert } from "types/goalData";
import _ from "lodash";
import { clamp, defaultOperatorObject, MAX_LEVEL_BY_RARITY, MODULE_REQ_BY_RARITY } from "util/changeOperator";
import useOperators from "util/hooks/useOperators";
import { GroupsDataInsert } from "types/groupData";

interface Props {
  open: boolean;
  goals?: GoalData[];
  goalGroups: string[];
  updateGoals: (goalsData: GoalDataInsert[]) => void;
  setGroups: (goalGroupInsert: GroupsDataInsert[]) => void;
  onClose: () => void;
}

const isNumber = (value: any) => typeof value === "number";

const SHORTCUTS: string[] = [
  "Nothing",
  "Everything",
  "Elite 1",
  "Elite 2",
  "Skill level 7",
  "All Skill Masteries 1 → 3",
  "Skill 1 Mastery 3",
  "Skill 2 Mastery 3",
  "Skill 3 Mastery 3",
  "Module 1 Lv 3",
  "Module 2 Lv 3",
  "Module 3 lv 3",
];
const PlannerGoalAdd = (props: Props) => {
  const { open, goals = [], goalGroups, updateGoals, setGroups, onClose } = props;
  const theme = useTheme();
  const fullScreen = !useMediaQuery(theme.breakpoints.up("sm"));

  const [roster] = useOperators();

  const [opData, setOpData] = useState<OperatorData | null>(null);
  const [currentOp, setCurrentOp] = useState<Operator | null>(null);

  const [selectedGroup, setSelectedGroup] = useState("Default");
  const [isEdit, setIsEdit] = useState(false);

  const [openGroupDialog, setOpenGroupDialog] = useState(false);

  const [showPresets, setShowPresets] = useState(true);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    elite: false,
    level: false,
    module: false,
    skill: false,
    mastery: false,
  });
  const toggleSection = (section: string) => {
    if (!opData || !currentOp) return;
    const open = !openSections[section];
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));

    switch (section) {
      case "elite":
        setGoalBuilder((prev) => ({
          ...prev,
          elite_from: open ? currentOp.elite : undefined,
          elite_to: open ? currentOp.elite : undefined,
        }));
        break;
      case "level":
        setGoalBuilder((prev) => ({
          ...prev,
          level_from: open ? currentOp.level : undefined,
          level_to: open ? currentOp.level : undefined,
        }));
        break;
      case "module":
        setGoalBuilder((prev) => ({
          ...prev,
          modules_from: open ? currentOp.modules : undefined,
          modules_to: open ? currentOp.modules : undefined,
        }));
        break;
      case "skill":
        setGoalBuilder((prev) => ({
          ...prev,
          skill_level_from: open ? currentOp.skill_level : undefined,
          skill_level_to: open ? currentOp.skill_level : undefined,
        }));
        break;
      case "mastery":
        setGoalBuilder((prev) => ({
          ...prev,
          masteries_from: open ? currentOp.masteries : undefined,
          masteries_to: open ? currentOp.masteries : undefined,
        }));
        break;
    }
  };

  const [goalBuilder, setGoalBuilder] = useState<Partial<GoalDataInsert>>({});

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
      setGoalBuilder({
        op_id: _opData.id,
      });

      // if a group is selected, check if there is an existing goal for the selected group
      const existingGoal = goals.find((x) => x.op_id == _opData.id && x.group_name == selectedGroup);
      if (existingGoal) {
        setGoalBuilder(existingGoal);
        setIsEdit(true);
      }
    },
    [roster, goals, selectedGroup]
  );

  const onGroupChange = useCallback(
    (event: SelectChangeEvent) => {
      const groupName = event.target.value;
      if (groupName == "Add new...") {
        setOpenGroupDialog(true);
        return;
      }

      // if an op is selected, check if there is an existing goal for the selected group
      if (opData) {
        const existingGoal = goals.find((goal) => goal.op_id === opData.id && goal.group_name === groupName);
        if (existingGoal) {
          setGoalBuilder(existingGoal);
          setIsEdit(true);
        }
      }

      setSelectedGroup(groupName);
    },
    [goals, opData]
  );

  // promotion
  const onPromotionFromChange = (elite_from: number) => {
    if (!isNumber(goalBuilder.elite_from) || !isNumber(goalBuilder.elite_to)) return;
    const maxLevel = MAX_LEVEL_BY_RARITY[opData!.rarity][elite_from];
    setGoalBuilder((prev) => ({
      ...prev,
      elite_from,
      elite_to: clamp(elite_from, prev.elite_to!, opData!.eliteLevels.length),
      level_from: prev.level_from ? clamp(1, prev.level_from, maxLevel) : undefined,
      level_to: prev.level_to ? clamp(1, prev.level_to, maxLevel) : undefined,
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
  const onPromotionClearClick = () => {
    setGoalBuilder((prev) => {
      const _prev = { ...prev };
      delete _prev.elite_from;
      delete _prev.elite_to;
      return _prev;
    });
  };

  // level
  const onLevelFromChange = (level_from: number) => {
    if (!isNumber(goalBuilder.level_from) || !isNumber(goalBuilder.level_to)) return;
    const maxLevel = MAX_LEVEL_BY_RARITY[opData!.rarity][goalBuilder.elite_from ?? currentOp?.elite ?? 0];
    setGoalBuilder((prev) => ({
      ...prev,
      level_from: clamp(1, level_from, maxLevel),
    }));
  };
  const onLevelToChange = (level_to: number) => {
    if (!isNumber(goalBuilder.level_from) || !isNumber(goalBuilder.level_to)) return;
    const maxLevel = MAX_LEVEL_BY_RARITY[opData!.rarity][goalBuilder.elite_to ?? currentOp?.elite ?? 0];
    setGoalBuilder((prev) => ({
      ...prev,
      level_to: clamp(1, level_to, maxLevel),
    }));
  };
  const onLevelClearClick = () => {
    setGoalBuilder((prev) => {
      const _prev = { ...prev };
      delete _prev.level_from;
      delete _prev.level_to;
      return _prev;
    });
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
  const onSkillLevelClearClick = () => {
    setGoalBuilder((prev) => {
      const _prev = { ...prev };
      delete _prev.skill_level_from;
      delete _prev.skill_level_to;
      return _prev;
    });
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
    const masteries_to = [...(goalBuilder.masteries_to ?? [])];
    masteries_to[skillNumber] = newMasteryLevel;
    setGoalBuilder((prev) => ({
      ...prev,
      masteries_from: prev.masteries_from!.map((n, i) => Math.min(n, masteries_to[i])),
      masteries_to,
    }));
  };
  const onMasteryClearClick = () => {
    setGoalBuilder((prev) => {
      const _prev = { ...prev };
      delete _prev.masteries_from;
      delete _prev.masteries_to;
      return _prev;
    });
  };

  // module
  const onModuleFromChange = (moduleId: string, newModuleLevel: number) => {
    if (!goalBuilder.modules_from || !goalBuilder.modules_to) return;
    if (!currentOp?.modules?.[moduleId]) return;

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
    if (!currentOp?.modules?.[moduleId]) return;

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
  const onModuleClearClick = () => {
    setGoalBuilder((prev) => {
      const _prev = { ...prev };
      delete _prev.modules_from;
      delete _prev.modules_to;
      return _prev;
    });
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
        goalBuilder.level_from !== goalBuilder.level_to
      ) {
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
      setOpData(null);
      setCurrentOp(null);
    }
    onClose();
    setGoalBuilder({});
    setOpenSections({
      elite: false,
      level: false,
      module: false,
      skill: false,
      mastery: false,
    });
  };

  const handleShortcuts = (shortcut: string) => {
    if (!opData || !currentOp) return;
    const moduleLevelRequirement = MODULE_REQ_BY_RARITY[opData!.rarity];
    const moduleCount = opData?.moduleData?.length ?? 0;
    const moduleIds = opData?.moduleData?.map((x) => x.moduleId);
    const skillCount = opData?.skillData?.length ?? 0;
    const maxElite = opData?.eliteLevels.length ?? 0;
    const maxLevel = MAX_LEVEL_BY_RARITY[opData!.rarity];

    setGoalBuilder({});

    switch (shortcut) {
      case "Nothing":
        setGoalBuilder({});
        break;
      case "Everything":
        if (maxElite === 0) {
          setGoalBuilder({
            level_from: currentOp.level,
            level_to: 30,
          });
        } else if (maxElite === 1) {
          setGoalBuilder({
            level_from: currentOp.level,
            level_to: maxLevel[1],
            skill_level_from: currentOp.skill_level,
            skill_level_to: 7,
          });
        } else if (maxElite === 2) {
          setGoalBuilder({
            elite_from: currentOp.elite,
            elite_to: 2,
            level_from: currentOp.level,
            level_to: maxLevel[2],
            skill_level_from: currentOp.skill_level,
            skill_level_to: 7,
            masteries_from: currentOp.masteries,
            masteries_to: currentOp.masteries.map(() => 3),
            modules_from: moduleCount ? currentOp.modules : undefined,
            modules_to: moduleCount
              ? opData.moduleData?.reduce((acc, { moduleId }) => ({ ...acc, [moduleId]: 3 }), {})
              : undefined,
          });
        }
        break;
      // case "Elite 1":
      //   if (maxElite >= 1) {
      //     setEliteLevelTo(1);
      //     if (levelTo && maxLevel[1] < levelTo) {
      //       setLevelTo(maxLevel[1]);
      //     }
      //   }
      //   break;
      // case "Elite 2":
      //   if (maxElite == 2) {
      //     setEliteLevelTo(2);
      //     if (levelTo && maxLevel[2] < levelTo) {
      //       setLevelTo(maxLevel[2]);
      //     }
      //   }
      //   break;
      // case "Skill level 7":
      //   if (!eliteLevelTo || eliteLevelTo < 1) {
      //     setEliteLevelTo(1);
      //   }
      //   setSkillLevelTo(7);
      //   break;
      // case "All Skill Masteries 1 → 3":
      //   if (maxElite == 2) {
      //     setEliteLevelTo(2);
      //     if (levelTo && maxLevel[2] < levelTo) {
      //       setLevelTo(maxLevel[2]);
      //     }
      //     setSkillLevelTo(7);
      //     setMasteriesTo((opData?.skillData ?? []).map(() => 3));
      //   }
      //   break;
      // case "Skill 1 Mastery 3":
      //   if (maxElite == 2 && skillCount >= 1) {
      //     setEliteLevelTo(2);
      //     if (levelTo && maxLevel[2] < levelTo) {
      //       setLevelTo(maxLevel[2]);
      //     }
      //     setSkillLevelTo(7);
      //     setMasteriesTo((opData?.skillData ?? []).map((_, i) => (i === 0 ? 3 : 0)));
      //   }
      //   break;
      // case "Skill 2 Mastery 3":
      //   if (maxElite == 2 && skillCount >= 2) {
      //     setEliteLevelTo(2);
      //     if (levelTo && maxLevel[2] < levelTo) {
      //       setLevelTo(maxLevel[2]);
      //     }
      //     setSkillLevelTo(7);
      //     setMasteriesTo((opData?.skillData ?? []).map((_, i) => (i === 1 ? 3 : 0)));
      //   }
      //   break;
      // case "Skill 3 Mastery 3":
      //   if (maxElite == 2 && skillCount >= 3) {
      //     setEliteLevelTo(2);
      //     if (maxLevel[2] < (levelTo ?? 0)) {
      //       setLevelTo(maxLevel[2]);
      //     }
      //     setSkillLevelTo(7);
      //     setMasteriesTo((opData?.skillData ?? []).map((_, i) => (i === 2 ? 3 : 0)));
      //   }
      //   break;
      // case "Module 1 Lv 3":
      //   if (maxElite == 2 && moduleCount >= 1) {
      //     setEliteLevelTo(2);
      //     if ((levelTo ?? 0) < moduleLevelRequirement) {
      //       setLevelTo(moduleLevelRequirement);
      //     }
      //     const moduleData = { ...modulesTo };
      //     if (moduleIds) {
      //       moduleData[moduleIds[0]] = 3;
      //     }
      //     setModulesTo(moduleData);
      //   }
      //   break;
      // case "Module 2 Lv 3":
      //   if (maxElite == 2 && moduleCount >= 2) {
      //     setEliteLevelTo(2);
      //     if ((levelTo ?? 0) < moduleLevelRequirement) {
      //       setLevelTo(moduleLevelRequirement);
      //     }
      //     const moduleData = { ...modulesTo };
      //     if (moduleIds) {
      //       moduleData[moduleIds[1]] = 3;
      //     }
      //     setModulesTo(moduleData);
      //   }
      //   break;
      // case "Module 3 lv 3":
      // if (maxElite == 2 && moduleCount >= 3) {
      //   setEliteLevelTo(2);
      //   if ((levelTo ?? 0) < moduleLevelRequirement) {
      //     setLevelTo(moduleLevelRequirement);
      //   }
      //   const moduleData = { ...modulesTo };
      //   if (moduleIds) {
      //     moduleData[moduleIds[2]] = 3;
      //   }
      //   setModulesTo(moduleData);
      // }
      // break;
    }
  };

  return (
    <>
      <Dialog open={open} onClose={() => handleGoalAddDialogClose(false)} fullScreen={fullScreen}>
        <DialogTitle>
          New Goal
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
                  onChange={onGroupChange}
                  label={"Goal Group"}
                  fullWidth
                  sx={selectedGroup === "Default" ? { color: "text.secondary" } : undefined}
                >
                  <MenuItem value="Default" sx={{ color: "text.secondary" }}>
                    Default (none)
                  </MenuItem>
                  <MenuItem value={"Add new..."}>Add new...</MenuItem>
                  {goalGroups
                    ? goalGroups
                        .filter((s) => s !== "Default")
                        .map((group) => (
                          <MenuItem value={group} key={group}>
                            {group}
                          </MenuItem>
                        ))
                    : null}
                </Select>
              </FormControl>
            </Box>
            <SelectGroup
              title="Shortcuts"
              label={showPresets ? "HIDE" : "SHOW"}
              onClick={() => setShowPresets((s) => !s)}
            >
              <Collapse in={showPresets}>
                <Box component="ul" sx={{ display: "flex", flexWrap: "wrap", m: 0, p: 0, gap: 2 }}>
                  {SHORTCUTS.map((shortcut) => (
                    <Box component="li" key={shortcut} sx={{ display: "contents" }}>
                      <Chip disabled={!opData} onClick={() => handleShortcuts(shortcut)}>
                        {shortcut}
                      </Chip>
                    </Box>
                  ))}
                </Box>
              </Collapse>
            </SelectGroup>
            <SelectGroup.Toggle
              title="Promotion"
              onClick={onPromotionClearClick}
              open={openSections.elite}
              toggleOpen={() => toggleSection("elite")}
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
              onClick={onLevelClearClick}
              open={openSections.level}
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
              onClick={onSkillLevelClearClick}
              open={openSections.skill}
              toggleOpen={() => toggleSection("skill")}
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
              onClick={onMasteryClearClick}
              open={openSections.mastery}
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
              onClick={onModuleClearClick}
              open={openSections.module}
              toggleOpen={() => toggleSection("module")}
              disabled={!!opData?.moduleData?.length}
            >
              <Module>
                {opData
                  ? opData.moduleData?.map((mod) => (
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
                    ))
                  : undefined}
              </Module>
            </SelectGroup.Toggle>
          </DisabledContext.Provider>
        </DialogContent>
        <DialogActions sx={{ display: "flex", gap: 1 }}>
          <Button variant="outlined" onClick={() => handleGoalAddDialogClose(false)}>
            Cancel
          </Button>
          <Button variant="contained" onClick={() => handleGoalAddDialogClose(true)} disabled={!opData}>
            Add
          </Button>
        </DialogActions>
      </Dialog>
      <AddGroupDialog
        open={openGroupDialog}
        onClose={(newGroupName) => {
          setSelectedGroup(newGroupName);
          setOpenGroupDialog(false);
        }}
        setGroups={setGroups}
        nextGoalSortOrder={Math.max(0, ...(goals?.map((goal) => goal.sort_order) ?? [0])) + 1}
      />
    </>
  );
};

export default PlannerGoalAdd;
