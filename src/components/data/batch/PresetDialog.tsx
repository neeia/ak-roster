import { Close } from "@mui/icons-material";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import SelectGroup, { DisabledContext } from "../input/Select/SelectGroup";
import Promotion from "../input/Select/Promotion";
import Mastery from "../input/Select/Mastery";
import Level from "../input/Select/Level";
import SkillLevel from "../input/Select/SkillLevel";
import Module from "../input/Select/Module";
import Preset from "types/operators/presets";
import { clamp, MAX_LEVEL_BY_RARITY } from "util/changeOperator";
import Potential from "../input/Select/Potential";

export const modTypes = ["X", "Y", "D", "A"];
const isNumber = (value: any) => typeof value === "number";

interface Props {
  open: boolean;
  onClose: () => void;
  preset?: Preset;
  onSubmit: (preset: Preset) => void;
  onDelete: () => void;
  add?: boolean;
}

const PresetDialog = (props: Props) => {
  const { open, onClose, preset, onSubmit, onDelete, add = false } = props;
  const theme = useTheme();
  const fullScreen = !useMediaQuery(theme.breakpoints.up("sm"));

  const [presetBuilder, setPresetBuilder] = useState<Preset>({ index: 0, name: "" });

  useEffect(() => {
    if (preset) setPresetBuilder(preset);
  }, [preset]);

  const toggleSection = (section: string) => {
    const _preset = { ...presetBuilder };

    switch (section) {
      case "elite":
        if (!isNumber(presetBuilder.elite)) {
          _preset.elite = 0;
        } else {
          delete _preset.elite;
          if ((_preset.skill_level ?? 0) > 4) _preset.skill_level = 4;
          delete _preset.masteries;
          delete _preset.modules;
        }
        break;
      case "level":
        if (!isNumber(presetBuilder.level)) {
          _preset.level = 1;
        } else {
          delete _preset.level;
        }
        break;
      case "skill":
        if (!isNumber(presetBuilder.skill_level)) {
          _preset.skill_level = 1;
        } else {
          delete _preset.skill_level;
          delete _preset.masteries;
        }
        break;
      case "mastery":
        if (!presetBuilder.masteries) {
          _preset.masteries = [-1, -1, -1];
          _preset.elite = 2;
          _preset.skill_level = 7;
        } else {
          delete _preset.masteries;
        }
        break;
      case "potential":
        if (!isNumber(presetBuilder.potential)) {
          _preset.potential = 1;
        } else {
          delete _preset.potential;
        }
        break;
      case "module":
        if (!presetBuilder.modules) {
          _preset.modules = {};
          _preset.elite = 2;
        } else {
          delete _preset.modules;
        }
        break;
    }

    setPresetBuilder(_preset);
  };

  const onPromotionChange = (elite: number) => {
    if (!isNumber(presetBuilder.elite)) return;
    const maxLevel = MAX_LEVEL_BY_RARITY[6][elite];
    const _preset = { ...presetBuilder };
    _preset.elite = elite;
    if (_preset.level && _preset.level > maxLevel) {
      _preset.level = maxLevel;
    }
    setPresetBuilder(_preset);
  };

  const onLevelChange = (level: number) => {
    if (!isNumber(presetBuilder.level)) return;
    const _preset = { ...presetBuilder };
    const maxLevel = MAX_LEVEL_BY_RARITY[6][_preset.elite ?? 2];
    _preset.level = clamp(1, level, maxLevel);
    setPresetBuilder(_preset);
  };

  const onSkillLevelChange = (skill_level: number) => {
    if (!isNumber(presetBuilder.skill_level)) return;
    const _preset = { ...presetBuilder };
    const maxLevel = [4, 7, 7][_preset.elite ?? 2];
    _preset.skill_level = clamp(1, skill_level, maxLevel);
    if (skill_level > 4) _preset.elite ??= 1;
    setPresetBuilder(_preset);
  };

  const onMasteryChange = (index: number, value: number) => {
    if (!presetBuilder.masteries || !isNumber(presetBuilder.masteries[index])) return;
    const masteries = presetBuilder.masteries;
    masteries[index] = masteries[index] === value ? -1 : value;
    setPresetBuilder({ ...presetBuilder, masteries });
  };

  const onPotentialChange = (potential: number) => {
    if (!isNumber(presetBuilder.potential)) return;
    const _preset = { ...presetBuilder };
    _preset.potential = clamp(1, potential, 6);
    setPresetBuilder(_preset);
  };

  const onModuleChange = (index: string, value: number) => {
    if (!presetBuilder.modules) return;
    const modules = presetBuilder.modules;
    modules[index] = modules[index] === value ? -1 : value;
    setPresetBuilder({ ...presetBuilder, modules });
  };

  const handleClose = () => {
    onClose();
    setPresetBuilder(preset || { index: 0, name: "" });
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} fullScreen={fullScreen}>
        <DialogTitle>
          {add ? "Create" : "Edit"} {presetBuilder.name || "Preset"}
          <IconButton onClick={onClose} sx={{ display: { sm: "none" } }}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent
          sx={{
            display: { xs: "flex", sm: "grid" },
            flexDirection: "column",
            gridTemplateColumns: "1fr 1fr",
            gap: 2,
          }}
        >
          <TextField
            label="Preset Name"
            size="small"
            variant="filled"
            onChange={(e) => setPresetBuilder({ ...presetBuilder, name: e.target.value })}
            value={presetBuilder.name}
            sx={{ gridColumn: "1 / -1" }}
          />
          <DisabledContext.Provider value={false}>
            <SelectGroup.Toggle
              title="Promotion"
              open={isNumber(presetBuilder.elite)}
              toggleOpen={() => toggleSection("elite")}
            >
              <Promotion
                exclusive
                value={presetBuilder.elite}
                min={
                  presetBuilder.masteries || presetBuilder.modules ? 2 : (presetBuilder.skill_level ?? 1) > 4 ? 1 : 0
                }
                onChange={onPromotionChange}
              />
            </SelectGroup.Toggle>
            <SelectGroup.Toggle
              title="Level"
              open={isNumber(presetBuilder.level)}
              toggleOpen={() => toggleSection("level")}
            >
              <Level
                value={presetBuilder.level ?? undefined}
                max={MAX_LEVEL_BY_RARITY[6][presetBuilder.elite ?? 2]}
                onChange={onLevelChange}
              />
            </SelectGroup.Toggle>
            <SelectGroup.Toggle
              title="Skill Rank"
              open={isNumber(presetBuilder.skill_level)}
              toggleOpen={() => toggleSection("skill")}
            >
              <SkillLevel
                exclusive
                value={presetBuilder.skill_level ?? undefined}
                min={presetBuilder.masteries ? 7 : 1}
                max={[4, 7, 7][presetBuilder.elite ?? 2]}
                onChange={onSkillLevelChange}
              />
            </SelectGroup.Toggle>
            <SelectGroup.Toggle
              title="Mastery"
              open={!!presetBuilder.masteries}
              toggleOpen={() => toggleSection("mastery")}
            >
              <Mastery sx={{ gap: 2 }}>
                {[...Array(3)].map((_, i) => (
                  <Mastery.SkillAlt key={i} skillNumber={i + 1} skillName="">
                    <Mastery.Select
                      exclusive
                      value={presetBuilder.masteries?.[i]}
                      onChange={(masteryLevel) => onMasteryChange(i, masteryLevel)}
                    />
                  </Mastery.SkillAlt>
                ))}
              </Mastery>
            </SelectGroup.Toggle>
            <SelectGroup.Toggle
              title="Potential"
              open={isNumber(presetBuilder.potential)}
              toggleOpen={() => toggleSection("potential")}
            >
              <Potential exclusive value={presetBuilder.potential ?? undefined} onChange={onPotentialChange} />
            </SelectGroup.Toggle>
            <SelectGroup.Toggle
              title="Modules"
              open={!!presetBuilder.modules}
              toggleOpen={() => toggleSection("module")}
            >
              <Module sx={{ gap: 2 }}>
                {modTypes.map((s, i) => (
                  <Module.ItemAlt key={i} typeName={`MOD-${s}`} moduleName="">
                    <Module.Select
                      moduleId={s}
                      exclusive
                      value={presetBuilder.modules?.[s]}
                      onChange={onModuleChange}
                    />
                  </Module.ItemAlt>
                ))}
              </Module>
            </SelectGroup.Toggle>
          </DisabledContext.Provider>
        </DialogContent>
        <DialogActions sx={{ display: "flex", gap: 1 }}>
          {!add && (
            <Button
              variant="outlined"
              color="error"
              onClick={() => {
                onDelete();
                handleClose();
              }}
              sx={{ mr: "auto" }}
            >
              Delete
            </Button>
          )}
          <Button variant="outlined" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              onSubmit(presetBuilder);
              setPresetBuilder({ index: 0, name: "" });
              handleClose();
            }}
          >
            {add ? "Add" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PresetDialog;
