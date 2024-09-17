import {
  Box,
  Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, Grid,
  IconButton, InputLabel, MenuItem, Select, SelectChangeEvent, SxProps, Typography,
  useMediaQuery, useTheme,
} from "@mui/material";
import React, { useCallback, useState } from "react";
import OperatorSearch from "./OperatorSearch";
import { Operator, OperatorData } from "types/operator";
import { Close } from "@mui/icons-material";
import { useCurrentRosterGetQuery } from "store/extendRoster";
import { useGroupsGetQuery } from "store/extendGroups";
import Chip from "../base/Chip";
import SelectPromotion from "../data/input/EditPieces/Promotion";
import SelectGroup from "../data/input/EditPieces/ClearableComponent";
import SelectLevel from "../data/input/EditPieces/Level";
import SelectSkillLevel from "../data/input/EditPieces/SkillLevel";
import AddGroupDialog from "./AddGroupDialog";
import Mastery from "../data/input/EditPieces/Mastery";
import Module from "../data/input/EditPieces/Module";
import { GoalDataInsert } from "types/goalData";
import { useGoalsUpdateMutation } from "store/extendGoals";
import _ from "lodash";
import { MAX_LEVEL_BY_RARITY, MODULE_REQ_BY_RARITY } from "util/changeOperator";

interface Props {
  open: boolean;
  onClose: () => void;
}

const SHORTCUTS: string[] = ["Nothing", "Everything", "Elite 1", "Elite 2", "Skill level 7", "All Skill Masteries 1 → 3", "Skill 1 Mastery 3", "Skill 2 Mastery 3", "Skill 3 Mastery 3"]
const PlannerGoalAdd = (props: Props) => {
  const { open, onClose } = props;
  const theme = useTheme();
  const fullScreen = !useMediaQuery(theme.breakpoints.up('sm'));

  const { data: roster } = useCurrentRosterGetQuery();
  const { data: goalGroups } = useGroupsGetQuery();
  const [goalsUpdateTrigger] = useGoalsUpdateMutation();


  const [selectedOperatorData, setSelectedOperatorData] = useState<OperatorData | null>(null);
  const [accountOperator, setAccountOperator] = useState<Operator | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<string>("Default");
  const [openGroupDialog, setOpenGroupDialog] = React.useState<boolean>(false);

  const [eliteLevel, setEliteLevel] = React.useState<number | undefined>(undefined);
  const [level, setLevel] = React.useState<number | undefined>(undefined);
  const [skillLevel, setSkillLevel] = React.useState<number | undefined>(undefined);
  const [masteries, setMasteries] = React.useState<number[]>([]);
  const [modules, setModules] = React.useState<Record<string, number> | undefined>(undefined);


  const onGroupChange = (event: SelectChangeEvent) => {
    let groupName = event.target.value as string;
    if (groupName == "Add new...") {
      setOpenGroupDialog(true);
    }
    else {
      setSelectedGroup(groupName);
    }
  };

  const onSelectedOperatorChange = ((newOp: OperatorData | null) => {
    setSelectedOperatorData(newOp)
    if (roster && newOp) {
      const accountOp: Operator | null = roster[newOp.id] ?? null;
      setAccountOperator(accountOp);
      setEliteLevel(accountOp?.elite);
      setLevel(accountOp?.level);
      setSkillLevel(accountOp?.skill_level);
      setMasteries(accountOp?.masteries ?? []);
      setModules(accountOp?.modules)
    }
    else {
      setAccountOperator(null);
      setEliteLevel(undefined);
      setLevel(undefined);
      setSkillLevel(undefined);
      setMasteries([]);
      setModules(undefined);
    }
  });

  const onPromotionChange = (elite: number) => {
    setEliteLevel(elite);
  };

  const onPromotionClearClick = useCallback(() => {
    if (accountOperator) {
      setEliteLevel(accountOperator.elite);
    }
    else {
      setEliteLevel(undefined);
    }
  }, [accountOperator]);

  const onLevelChange = (level: number) => {
    setLevel(level);
  }

  const onLevelClearClick = useCallback(() => {
    if (accountOperator) {
      setLevel(accountOperator.level);
    }
    else {
      setLevel(undefined);
    }
  }, [accountOperator]);

  const onSkillLevelChange = (level: number) => {
    setSkillLevel(level);
  }

  const onSkillLevelClearClick = useCallback(() => {
    if (accountOperator) {
      setSkillLevel(accountOperator.skill_level);
    }
    else {
      setSkillLevel(undefined);
    }
  }, [accountOperator]);

  const onMasteryChange = useCallback((skillNumber: number, newMasteryLevel: number) => {
    const newMasteries = masteries.map((masteryLevel, index) => {
      if (index === skillNumber) {
        return newMasteryLevel;
      }
      else {
        return masteryLevel;
      }
    });
    setMasteries(newMasteries)
  }, [masteries]);

  const onMasteryClearClick = useCallback(() => {
    if (accountOperator) {
      setMasteries(accountOperator.masteries);
    }
    else {
      setMasteries([]);
    }
  }, [accountOperator]);

  const onModuleChange = useCallback((moduleId: string, newModuleLevel: number) => {

    const newModules = { ...modules };
    newModules[moduleId] = newModuleLevel;
    setModules(newModules);
  }, [modules]);

  const onModuleClearClick = useCallback(() => {
    if (accountOperator) {
      setModules(accountOperator.modules);
    }
    else {
      setModules(undefined);
    }
  }, [accountOperator]);

  const handleGoalAddDialogClose = useCallback((shouldAddGoal: boolean) => {
    if (shouldAddGoal && accountOperator) {
      const eliteGoal = (eliteLevel && eliteLevel > accountOperator?.elite) ? eliteLevel : null;
      const levelGoal = (level && level > accountOperator?.level) ? level : null;
      const modulesGoal = !_.isEqual(modules, accountOperator.modules) ? modules : null;
      const masteriesGoal = masteries.toString() != accountOperator.masteries.toString() ? masteries : null;
      const skillLevelGoal = (skillLevel && skillLevel > accountOperator?.skill_level) ? skillLevel : 0;

      if (eliteGoal || levelGoal || modulesGoal || masteriesGoal || skillLevelGoal) {
        const goalData: GoalDataInsert = {
          elite: eliteGoal,
          level: levelGoal,
          modules: modulesGoal,
          masteries: masteriesGoal,
          op_id: accountOperator.op_id,
          skill_level: skillLevelGoal,
          group_name: selectedGroup,
        }
        goalsUpdateTrigger([goalData]);
      }
    }
    onClose();
    setSelectedOperatorData(null)
    setAccountOperator(null);
    setEliteLevel(undefined);
    setLevel(undefined);
    setSkillLevel(undefined);
    setMasteries([]);
    setModules(undefined);
  }, [accountOperator, onClose, eliteLevel, level, modules, masteries, skillLevel, selectedGroup, goalsUpdateTrigger]);

  const handleShortcuts = useCallback((shortcut: string) => {
    let newMasteries = [];
    const moduleLevelRequirement = MODULE_REQ_BY_RARITY[selectedOperatorData!.rarity];
    switch (shortcut) {
      case "Nothing":
        setEliteLevel(accountOperator!.elite);
        setLevel(accountOperator!.level);
        setSkillLevel(accountOperator!.skill_level);
        setMasteries(accountOperator!.masteries);
        setModules(accountOperator!.modules)
        break;
      case "Everything":
        const allModules = selectedOperatorData!.moduleData;
        const allModuleGoals: Record<string, number> = {};
        setEliteLevel(2);
        setSkillLevel(7);
        newMasteries = accountOperator!.masteries.map((_) => {
          return 3;
        });
        setMasteries(newMasteries)
        if (allModules) {
          for (const moduleData of allModules) {
            allModuleGoals[moduleData.moduleId] = 3;
          }
          setModules(allModuleGoals);
          setLevel(moduleLevelRequirement)
        }

        break;
      case "Elite 1":
        setEliteLevel(1);
        break;
      case "Elite 2":
        setEliteLevel(2);
        break;
      case "Skill level 7":
        setEliteLevel(1);
        setSkillLevel(7);
        break;
      case "All Skill Masteries 1 → 3":
        setEliteLevel(2);
        setSkillLevel(7);
        newMasteries = accountOperator!.masteries.map((_) => {
          return 3
        });
        setMasteries(newMasteries)
        break;
      case "Skill 1 Mastery 1 → 3":
        setEliteLevel(2);
        setSkillLevel(7);
        newMasteries = masteries.map((masteryLevel, index) => {
          if (index === 0) {
            return 3;
          }
          else {
            return masteryLevel;
          }
        });
        setMasteries(newMasteries)
        break;
      case "Skill 2 Mastery 1 → 3":
        setEliteLevel(2);
        setSkillLevel(7);
        newMasteries = masteries.map((masteryLevel, index) => {
          if (index === 1) {
            return 3;
          }
          else {
            return masteryLevel;
          }
        });
        setMasteries(newMasteries)
        break;
      case "Skill 3 Mastery 1 → 3":
        setEliteLevel(2);
        setSkillLevel(7);
        newMasteries = masteries.map((masteryLevel, index) => {
          if (index === 2) {
            return 3;
          }
          else {
            return masteryLevel;
          }
        });
        setMasteries(newMasteries)
        break;
    }
  }, [accountOperator, masteries, selectedOperatorData])

  const sectionSx: SxProps = {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    "& h3": {
      width: "100%"
    }
  }

  return (
    <>
      <Dialog
        open={open}
        onClose={() => { onClose(); onSelectedOperatorChange(null); }}
        fullScreen={fullScreen}
        PaperProps={{
          elevation: 1,
          sx: {
            width: "100%",
          }
        }}
      >
        <DialogTitle variant="h2" sx={{
          alignSelf: "start",
          textAlign: "left",
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: 4,
        }}>
          New Goal
          <IconButton onClick={onClose} sx={{ display: { sm: "none" } }}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{
          p: 2,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 2,
          "& .Mui-disabled": {
            opacity: 0.25,
            boxShadow: 0,
          },
        }}>
          <Box sx={{ gridColumn: "1 / -1", display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2, pt: 2 }}>
            <OperatorSearch
              value={selectedOperatorData}
              onChange={(newOp) => onSelectedOperatorChange(newOp)}
            />
            <FormControl>
              <InputLabel>Goal Group</InputLabel>
              <Select
                value={selectedGroup}
                onChange={onGroupChange}
                label={"Goal Group"}
                fullWidth
                sx={selectedGroup === "Default" ? { color: "text.secondary" } : undefined}
              >
                <MenuItem value="Default" sx={{ color: "text.secondary" }}>(none)</MenuItem>
                <MenuItem value={"Add new..."}>Add new...</MenuItem>
                {goalGroups ? goalGroups.map((group) => (
                  <MenuItem value={group} key={group}>{group}</MenuItem>)) : null}
              </Select>
            </FormControl>
          </Box>
          <SelectGroup title="Shortcuts" label="HIDE" sx={{ gridColumn: "1 / -1" }}>
            <Box component="ul" sx={{ display: "flex", flexWrap: "wrap", m: 0, p: 0, gap: 2 }}>
              {SHORTCUTS.map((shortcut) => (
                <Box component="li" key={shortcut} sx={{ display: "contents" }}>
                  <Chip disabled={!selectedOperatorData} onClick={() => handleShortcuts(shortcut)}>{shortcut}</Chip>
                </Box>
              ))}
            </Box>
          </SelectGroup>
          <SelectGroup title={"Promotion"} label="CLEAR"
            onClick={onPromotionClearClick}
          >
            <SelectPromotion
              minPromotion={accountOperator?.elite}
              maxPromotion={selectedOperatorData?.eliteLevels.length}
              value={eliteLevel}
              disabled={!selectedOperatorData}
              onChange={onPromotionChange}
            />
          </SelectGroup>
          <SelectGroup title={"Level"} label="CLEAR"
            onClick={onLevelClearClick}
          >
            <SelectLevel
              disabled={!selectedOperatorData}
              value={level}
              min={accountOperator?.level}
              max={(selectedOperatorData && eliteLevel) ? MAX_LEVEL_BY_RARITY[selectedOperatorData.rarity][eliteLevel] : undefined}
              onChange={onLevelChange}
            />
          </SelectGroup>
          <SelectGroup title={"Skill Rank"} label="CLEAR"
            onClick={onSkillLevelClearClick}
          >
            <SelectSkillLevel
              disabled={!selectedOperatorData}
              skillLevel={skillLevel}
              minSkillLevel={accountOperator?.skill_level}
              maxSkillLevel={[4, 7, 7][eliteLevel ?? 0]}
              onChange={onSkillLevelChange}
            />
          </SelectGroup>
          <Grid container>
            <SelectGroup title={"Mastery"} label="CLEAR"
              onClick={onMasteryClearClick}
            >
              <Mastery
                masteries={masteries}
                opId={accountOperator?.op_id}
                skillLevel={skillLevel}
                eliteLevel={eliteLevel}
                minMasteries={accountOperator?.masteries}
                onChange={onMasteryChange}
              />
            </SelectGroup>

          </Grid>
          <div />
          <SelectGroup title="Module" label="CLEAR"
            onClick={onModuleClearClick}
          >
            <Module
              modules={modules}
              opId={accountOperator?.op_id}
              opLevel={level}
              eliteLevel={eliteLevel}
              minModules={accountOperator?.modules}
              onChange={onModuleChange}
            />
          </SelectGroup>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => handleGoalAddDialogClose(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => handleGoalAddDialogClose(true)}>Add</Button>
        </DialogActions>
      </Dialog >
      <AddGroupDialog open={openGroupDialog} onClose={(newGroupName) => { setSelectedGroup(newGroupName); setOpenGroupDialog(false) }} />
    </>
  );
};

export default PlannerGoalAdd