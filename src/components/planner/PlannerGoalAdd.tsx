import { Box, Button, Collapse, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, IconButton, InputLabel, MenuItem, Select, SelectChangeEvent, useMediaQuery, useTheme } from "@mui/material";
import React, { useCallback, useState } from "react";
import OperatorSearch from "./OperatorSearch";
import { Operator, OperatorData } from "types/operator";
import { Close } from "@mui/icons-material";
import { useRosterGetQuery } from "store/extendRoster";
import { useGroupsGetQuery } from "store/extendGroups";
import Chip from "../base/Chip";
import Promotion from "../data/input/Select/Promotion";
import SelectGroup, { DisabledContext } from "../data/input/Select/SelectGroup";
import Level from "../data/input/Select/Level";
import SkillLevel from "../data/input/Select/SkillLevel";
import AddGroupDialog from "./AddGroupDialog";
import Mastery from "../data/input/Select/Mastery";
import Module from "../data/input/Select/Module";
import GoalData, { GoalDataInsert } from "types/goalData";
import { useGoalsUpdateMutation } from "store/extendGoals";
import _ from "lodash";
import { MAX_LEVEL_BY_RARITY, MODULE_REQ_BY_RARITY } from "util/changeOperator";

interface Props {
  open: boolean;
  goals: GoalData[] | undefined;
  onClose: () => void;
}

const SHORTCUTS: string[] = ["Nothing", "Everything", "Elite 1", "Elite 2", "Skill level 7", "All Skill Masteries 1 → 3", "Skill 1 Mastery 3", "Skill 2 Mastery 3", "Skill 3 Mastery 3", "Module 1 Lv 3", "Module 2 Lv 3", "Module 3 lv 3"];
const PlannerGoalAdd = (props: Props) => {
  const { open, goals, onClose } = props;
  const theme = useTheme();
  const fullScreen = !useMediaQuery(theme.breakpoints.up("sm"));

  const { data: roster } = useRosterGetQuery();
  const { data: goalGroups } = useGroupsGetQuery();
  const [goalsUpdateTrigger] = useGoalsUpdateMutation();

  const [selectedOperatorData, setSelectedOperatorData] = useState<OperatorData | null>(null);
  const [currentAccountOperator, setCurrentAccountOperator] = useState<Operator | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<string>("Default");
  const [openGroupDialog, setOpenGroupDialog] = React.useState<boolean>(false);
  const [showPresets, setShowPresets] = useState(true);

  const [eliteLevelFrom, setEliteLevelFrom] = React.useState<number | undefined>(undefined);
  const [levelFrom, setLevelFrom] = React.useState<number | undefined>(undefined);
  const [skillLevelFrom, setSkillLevelFrom] = React.useState<number | undefined>(undefined);
  const [masteriesFrom, setMasteriesFrom] = React.useState<number[]>([]);
  const [modulesFrom, setModulesFrom] = React.useState<Record<string, number> | undefined>(undefined);

  const [eliteLevelTo, setEliteLevelTo] = React.useState<number | undefined>(undefined);
  const [levelTo, setLevelTo] = React.useState<number | undefined>(undefined);
  const [skillLevelTo, setSkillLevelTo] = React.useState<number | undefined>(undefined);
  const [masteriesTo, setMasteriesTo] = React.useState<number[]>([]);
  const [modulesTo, setModulesTo] = React.useState<Record<string, number> | undefined>(undefined);

  const onGroupChange = useCallback(
    (event: SelectChangeEvent) => {
      let groupName = event.target.value as string;
      if (groupName == "Add new...") {
        setOpenGroupDialog(true);
      } else {
        setSelectedGroup(groupName);

        if (selectedOperatorData) {
          const defaultMasteries: number[] = selectedOperatorData.skillData?.forEach((_) => 0) ?? [];
          const existingGoal = goals?.find((x) => x.op_id == selectedOperatorData.id && x.group_name == groupName);
          if (existingGoal) {
            setEliteLevelTo(existingGoal.elite_to ?? undefined);
            setLevelTo(existingGoal.level_to ?? undefined);
            setSkillLevelTo(existingGoal.skill_level_to ?? undefined);
            setMasteriesTo(existingGoal.masteries_to ?? defaultMasteries);
            setModulesTo((existingGoal.modules_to as Record<string, number>) ?? undefined);
          } else {
            setEliteLevelTo(undefined);
            setLevelTo(undefined);
            setSkillLevelTo(undefined);
            setMasteriesTo([]);
            setModulesTo(undefined);
          }
        }
      }
    },
    [goals, selectedOperatorData]
  );

  const onSelectedOperatorChange = useCallback(
    (newOp: OperatorData | null) => {
      setSelectedOperatorData(newOp);
      if (!newOp) {
        setCurrentAccountOperator(null);

        setEliteLevelFrom(undefined);
        setLevelFrom(undefined);
        setSkillLevelFrom(undefined);
        setMasteriesFrom([]);
        setModulesFrom(undefined);

        setEliteLevelTo(undefined);
        setLevelTo(undefined);
        setSkillLevelTo(undefined);
        setMasteriesTo([]);
        setModulesTo(undefined);
      } else if (roster) {
        const accountOp: Operator | null = roster[newOp.id] ?? null;
        setCurrentAccountOperator(accountOp);

        setCurrentAccountOperator(accountOp);
        console.log(accountOp);
        setEliteLevelFrom(accountOp?.elite);
        setLevelFrom(accountOp?.level);
        setSkillLevelFrom(accountOp?.skill_level);
        const defaultMasteries: number[] = newOp.skillData?.forEach((_) => 0) ?? [];
        setMasteriesFrom(accountOp?.masteries ?? defaultMasteries);
        setModulesFrom(accountOp?.modules);

        setMasteriesTo(accountOp?.masteries ?? defaultMasteries);

        const existingGoal = goals?.find((x) => x.op_id == newOp.id && x.group_name == selectedGroup);
        if (existingGoal) {
          setEliteLevelTo(existingGoal.elite_to ?? undefined);
          setLevelTo(existingGoal.level_to ?? undefined);
          setSkillLevelTo(existingGoal.skill_level_to ?? undefined);
          setMasteriesTo(existingGoal.masteries_to ?? defaultMasteries);
          setModulesTo((existingGoal.modules_to as Record<string, number>) ?? undefined);
        }
      }
    },
    [goals, roster, selectedGroup]
  );

  const onPromotionFromChange = (elite: number) => {
    setEliteLevelFrom(elite);
    const maxLevel = MAX_LEVEL_BY_RARITY[selectedOperatorData!.rarity][elite];
    if (maxLevel < (levelFrom ?? 0)) {
      onLevelFromChange(maxLevel);
    }
    if (elite == 1) {
      setMasteriesFrom([]);
      setModulesFrom(undefined);
    }
    if (elite == 0) {
      setSkillLevelFrom(4);
      setMasteriesFrom([]);
      setModulesFrom(undefined);
    }
  };

  const onPromotionToChange = useCallback(
    (elite: number) => {
      setEliteLevelTo(elite);
      const maxLevel = MAX_LEVEL_BY_RARITY[selectedOperatorData!.rarity][elite];
      if (levelTo && maxLevel < levelTo) {
        onLevelToChange(maxLevel);
      }
      if (elite == 1) {
        setMasteriesTo([]);
        setModulesTo(undefined);
      }
      if (elite == 0) {
        setSkillLevelTo(4);
        setMasteriesTo([]);
        setModulesTo(undefined);
      }
    },
    [levelTo, selectedOperatorData]
  );

  const onPromotionClearClick = useCallback(() => {
    if (currentAccountOperator) {
      setEliteLevelFrom(currentAccountOperator.elite);
    } else {
      setEliteLevelFrom(undefined);
    }
    setEliteLevelTo(undefined);
  }, [currentAccountOperator]);

  const onLevelFromChange = (level: number) => {
    setLevelFrom(level);
    if (eliteLevelFrom == eliteLevelTo && (levelTo ?? 0) < level) {
      setLevelTo(level);
    }
  };

  const onLevelToChange = (level: number) => {
    setLevelTo(level);
  };

  const onLevelClearClick = useCallback(() => {
    if (currentAccountOperator) {
      setLevelFrom(currentAccountOperator.level);
    } else {
      setLevelFrom(undefined);
    }
    setLevelTo(undefined);
  }, [currentAccountOperator]);

  const onSkillLevelFromChange = (level: number) => {
    if (eliteLevelFrom && eliteLevelFrom < 1) {
      onPromotionFromChange(1);
    }
    setSkillLevelFrom(level);
  };

  const onSkillLevelToChange = useCallback(
    (level: number) => {
      if (!eliteLevelTo || eliteLevelTo < 1) {
        onPromotionToChange(1);
      }
      setSkillLevelTo(level);
    },
    [eliteLevelTo, onPromotionToChange]
  );

  const onSkillLevelClearClick = useCallback(() => {
    if (currentAccountOperator) {
      setSkillLevelFrom(currentAccountOperator.skill_level);
    } else {
      setSkillLevelFrom(undefined);
    }
    setSkillLevelTo(undefined);
  }, [currentAccountOperator]);

  const onMasteryFromChange = useCallback(
    (skillNumber: number, newMasteryLevel: number) => {
      const newMasteries = [...masteriesFrom];
      newMasteries[skillNumber] = newMasteryLevel;
      setMasteriesFrom(newMasteries);
    },
    [masteriesFrom]
  );

  const onMasteryToChange = useCallback(
    (skillNumber: number, newMasteryLevel: number) => {
      const newMasteries = [...masteriesTo];
      newMasteries[skillNumber] = newMasteryLevel;
      setMasteriesTo(newMasteries);
    },
    [masteriesTo]
  );

  const onMasteryClearClick = useCallback(() => {
    if (currentAccountOperator) {
      const defaultMasteries: number[] = selectedOperatorData?.skillData?.forEach((_) => 0) ?? [];
      setMasteriesFrom(currentAccountOperator.masteries ?? defaultMasteries);
      setMasteriesTo(currentAccountOperator.masteries ?? defaultMasteries);
    } else {
      setMasteriesFrom([]);
      setMasteriesTo([]);
    }
  }, [currentAccountOperator, selectedOperatorData]);

  const onModuleFromChange = useCallback(
    (moduleId: string, newModuleLevel: number) => {
      const newModules = { ...modulesFrom };
      newModules[moduleId] = newModuleLevel;
      setModulesFrom(newModules);
    },
    [modulesFrom]
  );

  const onModuleToChange = useCallback(
    (moduleId: string, newModuleLevel: number) => {
      const newModules = { ...modulesTo };
      newModules[moduleId] = newModuleLevel;
      setModulesTo(newModules);
    },
    [modulesTo]
  );

  const onModuleClearClick = useCallback(() => {
    if (currentAccountOperator) {
      setModulesFrom(currentAccountOperator.modules);
      setModulesTo(currentAccountOperator.modules);
    } else {
      setModulesFrom(undefined);
      setModulesTo(undefined);
    }
  }, [currentAccountOperator]);

  const handleGoalAddDialogClose = useCallback(
    (shouldAddGoal: boolean) => {
      if (shouldAddGoal && currentAccountOperator) {
        const goalData: GoalDataInsert = {
          group_name: selectedGroup,
          op_id: currentAccountOperator.op_id,
        };

        let shouldUpsert = false;

        if (eliteLevelFrom != null && eliteLevelTo && eliteLevelFrom != eliteLevelTo) {
          goalData.elite_from = eliteLevelFrom;
          goalData.elite_to = eliteLevelTo;
          shouldUpsert = true;
        }

        if (levelFrom && levelTo && levelFrom != levelTo) {
          goalData.level_from = levelFrom;
          goalData.level_to = levelTo;
          if (eliteLevelFrom != null && eliteLevelTo == null) {
            goalData.elite_from = eliteLevelFrom;
            goalData.elite_to = eliteLevelFrom;
          }
          shouldUpsert = true;
        }

        if (skillLevelFrom && skillLevelTo && skillLevelFrom != skillLevelTo) {
          goalData.skill_level_from = skillLevelFrom;
          goalData.skill_level_to = skillLevelTo;
          shouldUpsert = true;
        }

        if (masteriesFrom && masteriesTo && !_.isEqual(masteriesFrom, masteriesTo)) {
          goalData.masteries_from = masteriesFrom;
          goalData.masteries_to = masteriesTo;
          shouldUpsert = true;
        }

        if (modulesFrom && modulesTo && !_.isEqual(modulesFrom, modulesTo)) {
          goalData.modules_from = modulesFrom;
          goalData.modules_to = modulesTo;
          shouldUpsert = true;
        }
        if (shouldUpsert) {
          goalsUpdateTrigger([goalData]);
        }
      }
      onClose();
      setCurrentAccountOperator(null);
      setSelectedOperatorData(null);

      setEliteLevelFrom(undefined);
      setLevelFrom(undefined);
      setSkillLevelFrom(undefined);
      setMasteriesFrom([]);
      setModulesFrom(undefined);

      setEliteLevelTo(undefined);
      setLevelTo(undefined);
      setSkillLevelTo(undefined);
      setMasteriesTo([]);
      setModulesTo(undefined);
    },
    [currentAccountOperator, eliteLevelFrom, eliteLevelTo, goalsUpdateTrigger, levelFrom, levelTo, masteriesFrom, masteriesTo, modulesFrom, modulesTo, onClose, selectedGroup, skillLevelFrom, skillLevelTo]
  );

  const handleShortcuts = useCallback(
    (shortcut: string) => {
      const moduleLevelRequirement = MODULE_REQ_BY_RARITY[selectedOperatorData!.rarity];
      const moduleCount = selectedOperatorData?.moduleData?.length ?? 0;
      const moduleIds = selectedOperatorData?.moduleData?.map((x) => x.moduleId);
      const skillCount = selectedOperatorData?.skillData?.length ?? 0;
      const maxElite = selectedOperatorData?.eliteLevels.length ?? 0;
      const maxLevel = MAX_LEVEL_BY_RARITY[selectedOperatorData!.rarity];
      const defaultMasteries: number[] = selectedOperatorData?.skillData?.forEach((_) => 0) ?? [];

      //reset the "from" section to current operator stats
      setEliteLevelFrom(currentAccountOperator?.elite);
      setLevelFrom(currentAccountOperator?.level);
      setSkillLevelFrom(currentAccountOperator?.skill_level);
      setMasteriesFrom(currentAccountOperator?.masteries ?? defaultMasteries);
      setModulesFrom(currentAccountOperator?.modules);

      switch (shortcut) {
        case "Nothing":
          setEliteLevelTo(undefined);
          setLevelTo(undefined);
          setSkillLevelTo(undefined);
          setMasteriesTo(currentAccountOperator?.masteries ?? defaultMasteries);
          setModulesTo(undefined);
          break;
        case "Everything":
          if (maxElite == 1) {
            setEliteLevelTo(1);
            setLevelTo(maxLevel[1]);
            setSkillLevelTo(7);
          } else {
            setEliteLevelTo(2);
            setLevelTo(maxLevel[2]);
            setSkillLevelTo(7);
            let newMasteries = masteriesTo.map((_) => 3);
            setMasteriesTo(newMasteries);
            if (moduleIds) {
              const maxedModules: Record<string, number> = {};
              moduleIds.forEach((moduleId) => {
                maxedModules[moduleId] = 3;
              });
              setModulesTo(maxedModules);
            }
          }
          break;
        case "Elite 1":
          if (maxElite >= 1) {
            setEliteLevelTo(1);
            if (levelTo && maxLevel[1] < levelTo) {
              setLevelTo(maxLevel[1]);
            }
          }
          break;
        case "Elite 2":
          if (maxElite == 2) {
            setEliteLevelTo(2);
            if (levelTo && maxLevel[2] < levelTo) {
              setLevelTo(maxLevel[2]);
            }
          }
          break;
        case "Skill level 7":
          if (!eliteLevelTo || eliteLevelTo < 1) {
            setEliteLevelTo(1);
          }
          setSkillLevelTo(7);
          break;
        case "All Skill Masteries 1 → 3":
          if (maxElite == 2) {
            setEliteLevelTo(2);
            if (levelTo && maxLevel[2] < levelTo) {
              setLevelTo(maxLevel[2]);
            }
            setSkillLevelTo(7);
            let newMasteries = masteriesTo.map((_) => 3);
            setMasteriesTo(newMasteries);
          }
          break;
        case "Skill 1 Mastery 3":
          if (maxElite == 2 && skillCount >= 1) {
            setEliteLevelTo(2);
            if (levelTo && maxLevel[2] < levelTo) {
              setLevelTo(maxLevel[2]);
            }
            setSkillLevelTo(7);
            let newMasteries = [...masteriesTo];
            newMasteries[0] = 3;
            setMasteriesTo(newMasteries);
          }
          break;
        case "Skill 2 Mastery 3":
          if (maxElite == 2 && skillCount >= 2) {
            setEliteLevelTo(2);
            if (levelTo && maxLevel[2] < levelTo) {
              setLevelTo(maxLevel[2]);
            }
            setSkillLevelTo(7);
            let newMasteries = [...masteriesTo];
            newMasteries[1] = 3;
            setMasteriesTo(newMasteries);
          }
          break;
        case "Skill 3 Mastery 3":
          if (maxElite == 2 && skillCount >= 3) {
            setEliteLevelTo(2);
            if (maxLevel[2] < (levelTo ?? 0)) {
              setLevelTo(maxLevel[2]);
            }
            setSkillLevelTo(7);
            let newMasteries = [...masteriesTo];
            newMasteries[2] = 3;
            setMasteriesTo(newMasteries);
          }
          break;
        case "Module 1 Lv 3":
          if (maxElite == 2 && moduleCount >= 1) {
            setEliteLevelTo(2);
            if ((levelTo ?? 0) < moduleLevelRequirement) {
              setLevelTo(moduleLevelRequirement);
            }
            const moduleData = { ...modulesTo };
            if (moduleIds) {
              moduleData[moduleIds[0]] = 3;
            }
            setModulesTo(moduleData);
          }
          break;
        case "Module 2 Lv 3":
          if (maxElite == 2 && moduleCount >= 2) {
            setEliteLevelTo(2);
            if ((levelTo ?? 0) < moduleLevelRequirement) {
              setLevelTo(moduleLevelRequirement);
            }
            const moduleData = { ...modulesTo };
            if (moduleIds) {
              moduleData[moduleIds[1]] = 3;
            }
            setModulesTo(moduleData);
          }
          break;
        case "Module 3 lv 3":
          if (maxElite == 2 && moduleCount >= 3) {
            setEliteLevelTo(2);
            if ((levelTo ?? 0) < moduleLevelRequirement) {
              setLevelTo(moduleLevelRequirement);
            }
            const moduleData = { ...modulesTo };
            if (moduleIds) {
              moduleData[moduleIds[2]] = 3;
            }
            setModulesTo(moduleData);
          }
          break;
      }
    },
    [currentAccountOperator, eliteLevelTo, levelTo, masteriesTo, modulesTo, selectedOperatorData]
  );

  return (
    <>
      <Dialog
        open={open}
        onClose={() => {
          onClose();
          onSelectedOperatorChange(null);
        }}
        fullScreen={fullScreen}
        keepMounted
        PaperProps={{
          elevation: 1,
          sx: {
            width: "100%",
          },
        }}
      >
        <DialogTitle
          variant="h2"
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: 4,
          }}
        >
          New Goal
          <IconButton onClick={onClose} sx={{ display: { sm: "none" } }}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent
          sx={{
            p: 2,
            display: "flex",
            flexDirection: "column",
            gap: 2,
            "& .Mui-disabled": {
              opacity: 0.25,
              boxShadow: 0,
            },
            "& .inactive": {
              opacity: 0.75,
            },
            "& .active": {
              opacity: 1,
              boxShadow: 0,
              borderBottomWidth: "0.25rem 0px 0px 0px !important",
              borderBottomColor: "primary.main",
              borderBottomStyle: "solid",
              backgroundColor: "primary.light",
            },
          }}
        >
          <DisabledContext.Provider value={!selectedOperatorData}>
            <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2, pt: 2 }}>
              <OperatorSearch sx={{ width: "100%", maxWidth: "40ch" }} value={selectedOperatorData} onChange={(newOp) => onSelectedOperatorChange(newOp)} />
              <FormControl sx={{ flexGrow: 1 }}>
                <InputLabel>Goal Group</InputLabel>
                <Select variant={"standard"} value={selectedGroup} onChange={onGroupChange} label={"Goal Group"} fullWidth sx={selectedGroup === "Default" ? { color: "text.secondary" } : undefined}>
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
            <SelectGroup title="Shortcuts" label={showPresets ? "HIDE" : "SHOW"} onClick={() => setShowPresets((s) => !s)}>
              <Collapse in={showPresets}>
                <Box component="ul" sx={{ display: "flex", flexWrap: "wrap", m: 0, p: 0, gap: 2 }}>
                  {SHORTCUTS.map((shortcut) => (
                    <Box component="li" key={shortcut} sx={{ display: "contents" }}>
                      <Chip disabled={!selectedOperatorData} onClick={() => handleShortcuts(shortcut)}>
                        {shortcut}
                      </Chip>
                    </Box>
                  ))}
                </Box>
              </Collapse>
            </SelectGroup>
            <SelectGroup.Toggle title="Promotion" onClick={onPromotionClearClick}>
              <SelectGroup.FromTo>
                <Promotion value={eliteLevelFrom} min={currentAccountOperator?.elite} max={eliteLevelTo} onChange={onPromotionFromChange} />
                <Promotion value={eliteLevelTo} min={(eliteLevelFrom ?? 0) + 1} max={selectedOperatorData?.eliteLevels.length} onChange={onPromotionToChange} />
              </SelectGroup.FromTo>
            </SelectGroup.Toggle>
            <SelectGroup.Toggle title="Level" onClick={onLevelClearClick}>
              <SelectGroup.FromTo>
                <Level value={levelFrom} min={currentAccountOperator?.elite && currentAccountOperator?.elite == eliteLevelFrom ? currentAccountOperator.level : 1} max={selectedOperatorData && eliteLevelFrom != undefined ? MAX_LEVEL_BY_RARITY[selectedOperatorData.rarity][eliteLevelFrom] : undefined} onChange={onLevelFromChange} />
                <Level value={levelTo} min={eliteLevelTo == eliteLevelFrom ? levelFrom : 1} max={selectedOperatorData && eliteLevelTo != undefined ? MAX_LEVEL_BY_RARITY[selectedOperatorData.rarity][eliteLevelTo] : selectedOperatorData && eliteLevelFrom != undefined ? MAX_LEVEL_BY_RARITY[selectedOperatorData.rarity][eliteLevelFrom] : undefined} onChange={onLevelToChange} />
              </SelectGroup.FromTo>
            </SelectGroup.Toggle>
            <SelectGroup.Toggle title="Skill Rank" onClick={onSkillLevelClearClick}>
              <SelectGroup.FromTo>
                <SkillLevel value={skillLevelFrom} min={currentAccountOperator?.skill_level} max={[4, 7, 7][eliteLevelFrom ?? 0]} onChange={onSkillLevelFromChange} />
                <SkillLevel value={skillLevelTo} min={skillLevelFrom ? skillLevelFrom + 1 : 1} max={[4, 7, 7][eliteLevelTo ?? 0]} onChange={onSkillLevelToChange} />
              </SelectGroup.FromTo>
            </SelectGroup.Toggle>
            {/*TODO fix min and max*/}
            <SelectGroup.Toggle title="Mastery" onClick={onMasteryClearClick} disabled={!selectedOperatorData || selectedOperatorData.rarity <= 3}>
              <Mastery>
                {selectedOperatorData
                  ? selectedOperatorData.skillData?.map((data, skillIndex) => (
                      <Mastery.Skill src={data.iconId ?? data.skillId} key={data.skillId} skillName={data.skillName} skillNumber={skillIndex + 1}>
                        <SelectGroup.FromTo>
                          <Mastery.Select value={masteriesFrom[skillIndex]} min={currentAccountOperator?.masteries ? currentAccountOperator?.masteries[skillIndex] : 0} max={masteriesTo[skillIndex] ?? 3} onChange={(masteryLevel) => onMasteryFromChange(skillIndex, masteryLevel)} disabled={(eliteLevelFrom ?? 0) < 2} />
                          <Mastery.Select value={masteriesTo[skillIndex]} min={masteriesFrom[skillIndex]} max={3} onChange={(masteryLevel) => onMasteryToChange(skillIndex, masteryLevel)} disabled={(eliteLevelTo ?? eliteLevelFrom ?? 0) < 2} />
                        </SelectGroup.FromTo>
                      </Mastery.Skill>
                    ))
                  : null}
              </Mastery>
            </SelectGroup.Toggle>
            {/*TODO fix min and max*/}
            <SelectGroup.Toggle title="Module" onClick={onModuleClearClick} disabled={!!selectedOperatorData?.moduleData?.length}>
              <Module>
                {selectedOperatorData
                  ? selectedOperatorData.moduleData?.map((mod) => (
                      <Module.Item key={mod.moduleId} {...mod}>
                        <SelectGroup.FromTo>
                          <Module.Select value={modulesFrom && modulesFrom[mod.moduleId] ? modulesFrom[mod.moduleId] : 0} onChange={(n) => onModuleFromChange(mod.moduleId, n)} min={undefined} max={undefined} disabled={(eliteLevelFrom ?? 0) < 2 || MODULE_REQ_BY_RARITY[selectedOperatorData!.rarity] >= (levelFrom ?? 0)} />
                          <Module.Select value={modulesTo && modulesTo[mod.moduleId] ? modulesTo[mod.moduleId] : 0} onChange={(n) => onModuleToChange(mod.moduleId, n)} min={undefined} max={undefined} disabled={(eliteLevelTo ?? eliteLevelFrom ?? 0) < 2 || (levelTo ?? levelFrom ?? 0) < MODULE_REQ_BY_RARITY[selectedOperatorData!.rarity]} />
                        </SelectGroup.FromTo>
                      </Module.Item>
                    ))
                  : null}
              </Module>
            </SelectGroup.Toggle>
          </DisabledContext.Provider>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => handleGoalAddDialogClose(false)}>
            Cancel
          </Button>
          <Button variant="contained" onClick={() => handleGoalAddDialogClose(true)}>
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
      />
    </>
  );
};

export default PlannerGoalAdd;
