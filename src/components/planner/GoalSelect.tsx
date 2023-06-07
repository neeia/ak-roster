import AddIcon from "@mui/icons-material/Add";
import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControl,
  InputLabel,
  ListItemText,
  ListSubheader,
  MenuItem,
  Select,
  SelectChangeEvent,
} from "@mui/material";
import { styled } from "@mui/system";
import { useEffect, useMemo, useState } from "react";

import { OperatorGoalCategory, PlannerGoal } from "types/goal";
import { Operator, OperatorData } from "types/operator";

const GoalMenuCheckboxItem = styled(MenuItem)(({ theme }) => ({
  height: "50px",
  "& .MuiCheckbox-root": {
    marginLeft: theme.spacing(-1),
    marginRight: theme.spacing(0.5),
  },
}));

const GoalMenuPlainItem = styled(MenuItem)(() => ({
  paddingLeft: "25px",
  height: "50px",
}));

const masteryGoalRegex = /Skill (?<skillNumber>\d) Mastery (?<masteryLevel>\d)/;
const moduleGoalRegex = /Module (?<typeName>\S+) Stage (?<moduleLevel>\d)/;

interface Props {
  opData: Operator | null;
  operator: OperatorData | null;
  onGoalsAdded: (goals: PlannerGoal[]) => void;
}

const GoalSelect: React.FC<Props> = (props) => {
  const { opData, operator, onGoalsAdded } = props;
  const [selectedGoalNames, setSelectedGoalNames] = useState<string[]>([]);

  useEffect(() => {
    setSelectedGoalNames([]);
  }, [operator]);

  const availablePresets = useMemo(() => {
    if (!operator) {
      return [];
    }
    const presets = [];
    if (operator.eliteLevels.length > 0 && operator.skillLevels.length === 6) {
      if (!opData || (opData.elite < 1 && opData.skill_level < 7))
        presets.push("Elite 1 Skill Level 7");
    }
    operator.skillData.forEach((skill, i) => {
      if (skill.masteries.length === 3) {
        if (!opData || !opData.masteries[i] || opData.masteries[i] < 3)
          presets.push(`Skill ${i + 1} Mastery ${(opData?.masteries[i] ?? 0) + 1} → 3`);
      }
    });
    if (presets.length > 0) {
      presets.unshift("Everything");
    }
    return presets;
  }, [operator, opData]);

  const goalNameToGoal = (goalName: string): PlannerGoal => {
    if (operator == null) {
      throw new Error(
        "Can't convert goal/preset name without an operator selected!"
      );
    }

    if (goalName.startsWith("Elite")) {
      const eliteLevel = Number(goalName.charAt(goalName.length - 1));
      return {
        operatorId: operator.id,
        category: OperatorGoalCategory.Elite,
        eliteLevel,
      };
    } else if (goalName.startsWith("Skill Level")) {
      const skillLevel = Number(goalName.charAt(goalName.length - 1));
      return {
        operatorId: operator.id,
        category: OperatorGoalCategory.SkillLevel,
        skillLevel,
      };
    } else if (masteryGoalRegex.test(goalName)) {
      const match = masteryGoalRegex.exec(goalName);
      const skillNumber = Number(match!.groups!.skillNumber);
      const masteryLevel = Number(match!.groups!.masteryLevel);
      const { skillId } = operator.skillData[skillNumber - 1];
      return {
        operatorId: operator.id,
        category: OperatorGoalCategory.Mastery,
        skillId,
        masteryLevel,
      };
    } else if (moduleGoalRegex.test(goalName)) {
      const match = moduleGoalRegex.exec(goalName);
      const typeName = match!.groups!.typeName;
      const moduleLevel = Number(match!.groups!.moduleLevel);
      const { moduleId } = operator.moduleData.find(
        (module) => module.typeName === typeName
      )!;
      return {
        operatorId: operator.id,
        category: OperatorGoalCategory.Module,
        moduleId,
        moduleLevel,
      };
    } else {
      throw new Error(`Unrecognized goal or preset name: ${goalName}`);
    }
  };

  const handleChange = (e: SelectChangeEvent<string[]>) => {
    const newGoalNames =
      typeof e.target.value === "string" ? [e.target.value] : e.target.value;
    const newSpecificGoals = new Set<string>();
    const newPresets = [];
    for (const goalName of newGoalNames) {
      if (availablePresets.includes(goalName)) {
        newPresets.push(goalName);
      } else {
        newSpecificGoals.add(goalName);
      }
    }
    for (const preset of newPresets) {
      switch (preset) {
        case "Elite 1 Skill Level 7":
          if (
            operator!.eliteLevels?.length > 0 &&
            operator!.skillLevels.length === 6
          ) {
            newSpecificGoals.add("Elite 1");
            newSpecificGoals.add("Skill Level 2");
            newSpecificGoals.add("Skill Level 3");
            newSpecificGoals.add("Skill Level 4");
            newSpecificGoals.add("Skill Level 5");
            newSpecificGoals.add("Skill Level 6");
            newSpecificGoals.add("Skill Level 7");
          }
          break;
        case "Skill 1 Mastery 1 → 3":
          if (
            operator!.skillData.length > 0 &&
            operator!.skillData[0].masteries.length > 0
          ) {
            newSpecificGoals.add("Skill 1 Mastery 1");
            newSpecificGoals.add("Skill 1 Mastery 2");
            newSpecificGoals.add("Skill 1 Mastery 3");
          }
          break;
        case "Skill 2 Mastery 1 → 3":
          if (
            operator!.skillData.length > 1 &&
            operator!.skillData[1].masteries.length > 0
          ) {
            newSpecificGoals.add("Skill 2 Mastery 1");
            newSpecificGoals.add("Skill 2 Mastery 2");
            newSpecificGoals.add("Skill 2 Mastery 3");
          }
          break;
        case "Skill 3 Mastery 1 → 3":
          if (
            operator!.skillData.length > 2 &&
            operator!.skillData[2].masteries.length > 0
          ) {
            newSpecificGoals.add("Skill 3 Mastery 1");
            newSpecificGoals.add("Skill 3 Mastery 2");
            newSpecificGoals.add("Skill 3 Mastery 3");
          }
          break;
        case "Everything": {
          operator!.eliteLevels?.forEach((_, i) => {
            if (!opData || opData.elite < i + 1)
              newSpecificGoals.add(`Elite ${i + 1}`);
          });
          operator!.skillLevels?.forEach((_, i) => {
            if (!opData || opData.skill_level < i + 2)
              newSpecificGoals.add(`Skill Level ${i + 2}`);
          });
          operator!.skillData?.forEach((_, i) => {
            operator!.skillData[i].masteries.forEach((_, j) => {
              if (!opData || !opData.masteries[i] || opData.masteries[i] < j + 1)
                newSpecificGoals.add(`Skill ${i + 1} Mastery ${j + 1}`);
            });
          });
          operator!.moduleData?.forEach((module, i) => {
            module.stages.forEach((_, j) => {
              if (!opData || !opData.modules[i] || opData.modules[i] < j + 1)
              newSpecificGoals.add(`Module ${module.typeName} Stage ${j + 1}`);
            });
          });
          break;
        }
        default:
          console.warn("Unknown preset: ", preset);
          break;
      }
    }
    setSelectedGoalNames([...newSpecificGoals]);
  };

  const handleAddGoals = () => {
    onGoalsAdded(selectedGoalNames.map(goalNameToGoal));
  };

  const renderOptions = () => {
    if (operator == null) {
      return <MenuItem>Please select an operator first.</MenuItem>;
    }

    const elite =
      operator.eliteLevels.length > 0
        ? operator.eliteLevels.filter((_, i) => !opData || opData.elite < i + 1).map((goal) => (
          <GoalMenuCheckboxItem key={goal.name} value={goal.name}>
            <Checkbox
              checked={selectedGoalNames.indexOf(goal.name) > -1}
              size="small"
            />
            <ListItemText primary={goal.name} />
          </GoalMenuCheckboxItem>
        ))
        : null;
    const skillLevel =
      operator.skillLevels.length > 0
        ? operator.skillLevels.filter((_, i) => !opData || opData.skill_level < i + 2).map((goal) => (
          <GoalMenuCheckboxItem key={goal.name} value={goal.name}>
            <Checkbox
              checked={selectedGoalNames.indexOf(goal.name) > -1}
              size="small"
            />
            <ListItemText primary={goal.name} />
          </GoalMenuCheckboxItem>
        ))
        : null;
    const masteryGoals = operator.skillData.flatMap((skill, i) => skill.masteries
      .filter((_, j) => !opData || (opData.masteries[i] ?? 0) < j + 1)
    );
    const mastery =
      masteryGoals.length > 0
        ? masteryGoals.map((goal) => (
          <GoalMenuCheckboxItem key={goal.name} value={goal.name}>
            <Checkbox
              checked={selectedGoalNames.indexOf(goal.name) > -1}
              size="small"
            />
            <ListItemText primary={goal.name} />
          </GoalMenuCheckboxItem>
        ))
        : null;

    const moduleGoals = operator.moduleData.flatMap((module, i) => module.stages
      .filter((_, j) => !opData || (opData.modules[i] ?? 0) < j + 1)
    );
    const mod =
      moduleGoals.length > 0
        ? moduleGoals.map((goal) => (
          <GoalMenuCheckboxItem key={goal.name} value={goal.name}>
            <Checkbox
              checked={selectedGoalNames.indexOf(goal.name) > -1}
              size="small"
            />{" "}
            <ListItemText primary={goal.name} />
          </GoalMenuCheckboxItem>
        ))
        : null;

    const presets =
      availablePresets.length > 0
        ? [
          <ListSubheader key="presets">Shortcuts</ListSubheader>,
          ...availablePresets.map((preset) => (
            <GoalMenuPlainItem key={preset} value={preset}>
              {preset}
            </GoalMenuPlainItem>
          )),
          <ListSubheader key="goals">Goals</ListSubheader>,
        ]
        : [];

    const options = [...presets];
    if (mod != null) {
      options.push(<Divider key="1" />);
      options.push(...mod);
    }
    if (elite?.length) {
      options.push(<Divider key="1" />);
      options.push(...elite);
    }
    if (skillLevel?.length) {
      options.push(<Divider key="2" />);
      options.push(...skillLevel);
    }
    if (mastery?.length) {
      options.push(<Divider key="3" />);
      options.push(...mastery);
    }
    return options;
  };

  return (
    <Box display="grid" gridTemplateColumns="1fr auto" columnGap={2}>
      <FormControl>
        <InputLabel htmlFor="goal-select">Goals</InputLabel>
        <Select
          id="goal-select"
          name="goal-select"
          autoWidth
          multiple
          displayEmpty
          value={selectedGoalNames}
          MenuProps={{
            anchorOrigin: {
              vertical: "bottom",
              horizontal: "left",
            },
            transformOrigin: {
              vertical: "top",
              horizontal: "left",
            },
            sx: { "& .MuiList-root": { mr: "25px", width: "100%" } },
          }}
          renderValue={(selected) =>
            selected.sort((a, b) => a.localeCompare(b)).join(", ")
          }
          onChange={handleChange}
        >
          {renderOptions()}
        </Select>
      </FormControl>
      <Button
        color="primary"
        variant="contained"
        startIcon={<AddIcon />}
        onClick={handleAddGoals}
        sx={{
          height: "100%",
          pl: 2,
        }}
      >
        Add
      </Button>
    </Box>
  );
};
export default GoalSelect;
