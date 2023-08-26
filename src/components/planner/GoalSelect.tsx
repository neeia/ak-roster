import AddIcon from "@mui/icons-material/Add";
import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  ListItemText,
  ListSubheader,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
} from "@mui/material";
import { styled } from "@mui/system";
import { useEffect, useMemo, useState } from "react";

import { OperatorGoalCategory, PlannerGoal } from "types/goal";
import { Operator, OpJsonObj } from "types/operator";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import AddCircleIcon from "@mui/icons-material/AddCircle";

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
  op: Operator | null;
  opData: OpJsonObj | null;
  onGoalsAdded: (goals: PlannerGoal[]) => void;
}

const GoalSelect: React.FC<Props> = (props) => {
  const { op, opData, onGoalsAdded } = props;
  const [selectedGoalNames, setSelectedGoalNames] = useState<string[]>([]);
  const [goalPriority, setGoalPriority] = useState<number>(1);

  useEffect(() => {
    setSelectedGoalNames([]);
  }, [opData]);

  const availablePresets = useMemo(() => {
    if (!opData) {
      return [];
    }
    const presets = [];
    if (opData.elite.length > 0 && opData.skillLevels.length === 6) {
      if (!op || (op.promotion < 1 && op.skillLevel < 7))
        presets.push("Elite 1 Skill Level 7");
    }
    opData.skills.forEach((skill, i) => {
      if (skill.masteries.length === 3) {
        if (!op || !op.mastery[i] || op.mastery[i] < 3)
          presets.push(`Skill ${i + 1} Mastery 1 → 3`);
      }
    });
    if (presets.length > 0) {
      presets.unshift("Everything");
    }
    return presets;
  }, [opData, opData]);

  const goalNameToGoal = (goalName: string): PlannerGoal => {
    if (opData == null) {
      throw new Error(
        "Can't convert goal/preset name without an operator selected!"
      );
    }

    if (goalName.startsWith("Elite")) {
      const eliteLevel = Number(goalName.charAt(goalName.length - 1));
      return {
        operatorId: opData.id,
        priority: goalPriority.toString(),
        category: OperatorGoalCategory.Elite,
        eliteLevel,
      };
    } else if (goalName.startsWith("Skill Level")) {
      const skillLevel = Number(goalName.charAt(goalName.length - 1));
      return {
        operatorId: opData.id,
        priority: goalPriority.toString(),
        category: OperatorGoalCategory.SkillLevel,
        skillLevel,
      };
    } else if (masteryGoalRegex.test(goalName)) {
      const match = masteryGoalRegex.exec(goalName);
      const skillNumber = Number(match!.groups!.skillNumber);
      const masteryLevel = Number(match!.groups!.masteryLevel);
      const { skillId } = opData.skills[skillNumber - 1];
      return {
        operatorId: opData.id,
        priority: goalPriority.toString(),
        category: OperatorGoalCategory.Mastery,
        skillId,
        masteryLevel,
      };
    } else if (moduleGoalRegex.test(goalName)) {
      const match = moduleGoalRegex.exec(goalName);
      const typeName = match!.groups!.typeName;
      const moduleLevel = Number(match!.groups!.moduleLevel);
      const { moduleId } = opData.modules.find(
        (module) => module.typeName === typeName
      )!;
      return {
        operatorId: opData.id,
        priority: goalPriority.toString(),
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
            opData!.elite?.length > 0 &&
            opData!.skillLevels.length === 6
          ) {
            if (op!.promotion < 1) newSpecificGoals.add("Elite 1");
            let r = op?.skillLevel ?? 1;
            for (let rank = Math.max(r, 2); rank <= 7; rank++) {
              newSpecificGoals.add(`Skill Level ${rank}`);
            }
          }
          break;
        case "Skill 1 Mastery 1 → 3":
          if (
            opData!.skills.length > 0 &&
            opData!.skills[0].masteries.length > 0
          ) {
            for (let i = op?.mastery[0] ?? 0; i < 3; i++) {
              newSpecificGoals.add(`Skill 1 Mastery ${i + 1}`);
            }
          }
          break;
        case "Skill 2 Mastery 1 → 3":
          if (
            opData!.skills.length > 1 &&
            opData!.skills[1].masteries.length > 0
          ) {
            for (let i = op?.mastery[1] ?? 0; i < 3; i++) {
              newSpecificGoals.add(`Skill 2 Mastery ${i + 1}`);
            }
          }
          break;
        case "Skill 3 Mastery 1 → 3":
          if (
            opData!.skills.length > 2 &&
            opData!.skills[2].masteries.length > 0
          ) {
            for (let i = op?.mastery[2] ?? 0; i < 3; i++) {
              newSpecificGoals.add(`Skill 3 Mastery ${i + 1}`);
            }
          }
          break;
        case "Everything": {
          opData!.elite?.forEach((_, i) => {
            if (!op || op.promotion < i + 1)
              newSpecificGoals.add(`Elite ${i + 1}`);
          });
          opData!.skillLevels?.forEach((_, i) => {
            if (!op || op.skillLevel < i + 2)
              newSpecificGoals.add(`Skill Level ${i + 2}`);
          });
          opData!.skills?.forEach((_, i) => {
            opData!.skills[i].masteries.forEach((_, j) => {
              if (!op || !op.mastery[i] || op.mastery[i] < j + 1)
                newSpecificGoals.add(`Skill ${i + 1} Mastery ${j + 1}`);
            });
          });
          opData!.modules?.forEach((module, i) => {
            module.stages.forEach((_, j) => {
              if (!op || !op.module[i] || op.module[i] < j + 1)
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

  const handlePriorityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPriorityValue = e.target.value;
    const numberValue = Number(newPriorityValue);
    if (!Number.isNaN(numberValue)) {
      setGoalPriority(numberValue);
    }
  };

  const handlePriorityButtonClick = (amount: number) =>{
    setGoalPriority(goalPriority + amount);
  };

  const handleAddGoals = () => {
    onGoalsAdded(selectedGoalNames.map(goalNameToGoal));
  };

  const renderOptions = () => {
    if (opData == null) {
      return <MenuItem>Please select an operator first.</MenuItem>;
    }

    const elite =
      opData.elite.length > 0
        ? opData.elite.filter((_, i) => !op || op.promotion < i + 1).map((goal) => (
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
      opData.skillLevels.length > 0
        ? opData.skillLevels.filter((_, i) => !op || op.skillLevel < i + 2).map((goal) => (
          <GoalMenuCheckboxItem key={goal.name} value={goal.name}>
            <Checkbox
              checked={selectedGoalNames.indexOf(goal.name) > -1}
              size="small"
            />
            <ListItemText primary={goal.name} />
          </GoalMenuCheckboxItem>
        ))
        : null;
    const masteryGoals = opData.skills.flatMap((skill, i) => skill.masteries
      .filter((_, j) => !opData || (op?.mastery[i] ?? 0) < j + 1)
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

    const moduleGoals = opData.modules.flatMap((module, i) => module.stages
      .filter((_, j) => !opData || (op?.module[i] ?? 0) < j + 1)
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
    <Box display="grid" gridTemplateColumns="1fr auto auto" columnGap={2}>
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
      <TextField
          size="medium"
          label= "Goal Priority"
          fullWidth
          value={goalPriority}
          onFocus={(e) => e.target.select()}
          onChange={handlePriorityChange}
          inputProps={{
            type: "number",
            min: 0,
            step: 1,
            "aria-label": "Goal priority",
            sx: {
              textAlign: "center",
              width: "4ch", // width of 4 "0" characters
              flexGrow: 1,
            },
          }}
          InputProps={{
            startAdornment: (
                <InputAdornment position="start" sx={{ mr: 0 }}>
                  <IconButton
                      size="small"
                      aria-label="Lowers goal priority by 1"
                      edge="start"
                      disabled={goalPriority === 0}
                      onClick={() => handlePriorityButtonClick(-1)}
                  >
                    <RemoveCircleIcon />
                  </IconButton>
                </InputAdornment>
            ),
            endAdornment: (
                <InputAdornment position="end" sx={{ ml: 0 }}>
                  <IconButton
                      size="small"
                      aria-label="Raise goal priority by 1"
                      edge="end"
                      onClick={() => handlePriorityButtonClick(1)}
                  >
                    <AddCircleIcon />
                  </IconButton>
                </InputAdornment>
            ),
            sx: {
              px: "5px",
              "& input[type=number]": {
                "-moz-appearance": "textfield"
              },
              "& input[type=number]::-webkit-outer-spin-button": {
                "-webkit-appearance": "none",
                margin: 0
              },
              "& input[type=number]::-webkit-inner-spin-button": {
                "-webkit-appearance": "none",
                margin: 0
              }
            },
          }}
      />
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
