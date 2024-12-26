import React, { useCallback, useContext } from "react";
import { Operator, Skin } from "types/operators/operator";
import skinJson from "data/skins.json";
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  ToggleButton,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Potential from "./Select/Potential";
import Promotion from "./Select/Promotion";
import Mastery from "./Select/Mastery";
import Module from "./Select/Module";
import Level from "./Select/Level";
import SkillLevel from "./Select/SkillLevel";
import { Close, Favorite, FavoriteBorder } from "@mui/icons-material";
import Skins from "./Select/Skins";
import Image from "next/image";
import operatorJson from "data/operators";
import {
  changeFavorite,
  changeLevel,
  changeMastery,
  changeModule,
  changeOwned,
  changePotential,
  changePromotion as changeElite,
  changeSkillLevel,
  changeSkin,
  MAX_PROMOTION_BY_RARITY,
  MODULE_REQ_BY_RARITY,
  getMaxPotentialById,
  MAX_SKILL_LEVEL_BY_PROMOTION,
  MAX_LEVEL_BY_RARITY,
} from "util/changeOperator";
import Select, { DisabledContext } from "./Select/SelectGroup";
import getAvatar from "util/fns/getAvatar";
import supabase from "supabase/supabaseClient";
import { UserContext } from "pages/_app";
import { useSnackbar } from "notistack";
import { PostgrestError } from "@supabase/supabase-js";

interface Props {
  op?: Operator;
  onChange: (op: Operator, callback?: () => void) => void;
  open: boolean;
  onClose: () => void;
}

const EditOperator = React.memo((props: Props) => {
  const { op, onChange, open, onClose } = props;
  const { enqueueSnackbar } = useSnackbar();

  function handleError({ error }: { error: PostgrestError | null }) {
    if (error)
      enqueueSnackbar({
        message: `DB${error.code}: ${error.message}`,
        variant: "error",
      });
  }

  const theme = useTheme();
  const fullScreen = !useMediaQuery(theme.breakpoints.up("sm"));

  const user = useContext(UserContext);

  const onChangeOwned = useCallback(() => {
    if (!op) return;
    const _op = changeOwned(op, !op.potential);
    onChange(_op);

    if (_op.potential) {
      // add operator in
      supabase.from("operators").insert(_op).then(handleError);
    } else {
      // remove op
      supabase.from("operators").delete().eq("op_id", op.op_id).then(handleError);
    }
  }, [op, user]);

  // Applies a change and sends it to the DB
  const _onChange = useCallback(
    (_op: Operator) => {
      if (!op) return;
      onChange(_op);
      if (user) supabase.from("operators").update(_op).match({ user_id: user.id, op_id: op.op_id }).then(handleError);
    },
    [op, user]
  );

  const onChangeFavorite = useCallback(() => {
    if (!op) return;
    _onChange(changeFavorite(op, !op.favorite));
  }, [op, _onChange]);

  const onChangePotential = useCallback(
    (value: number | null) => {
      if (!op || value == null) return;
      _onChange(changePotential(op, value));
    },
    [op, _onChange]
  );

  const onChangeElite = useCallback(
    (value: number | null) => {
      if (!op || value == null) return;
      _onChange(changeElite(op, value));
    },
    [op, _onChange]
  );

  const onChangeLevel = useCallback(
    (value: number | null) => {
      if (!op || value == null) return;
      _onChange(changeLevel(op, value));
    },
    [op, _onChange]
  );

  const onChangeSkillLevel = useCallback(
    (value: number | null) => {
      if (!op || value == null) return;
      _onChange(changeSkillLevel(op, value));
    },
    [op, _onChange]
  );

  const onChangeMastery = useCallback(
    (index: number, value: number | null) => {
      if (!op || value == null) return;
      _onChange(changeMastery(op, index, value));
    },
    [op, _onChange]
  );

  const onChangeModule = useCallback(
    (id: string, value: number | null) => {
      if (!op || value == null) return;
      _onChange(changeModule(op, id, value));
    },
    [op, _onChange]
  );

  const onChangeSkin = useCallback(
    (value: string) => {
      if (!op) return;
      _onChange(changeSkin(op, value));
    },
    [op, _onChange]
  );

  if (!op) return null;

  const opSkins: Skin[] = skinJson[op.op_id as keyof typeof skinJson];
  const opData = operatorJson[op.op_id];
  const opSplit = opData.name.split(" the ");

  return (
    <Dialog open={open} onClose={onClose} fullScreen={fullScreen}>
      <DialogTitle>
        <Box
          sx={{
            mt: -2,
            mb: -1,
            width: {
              xs: "4rem",
              sm: "6rem",
            },
            aspectRatio: "1 / 1",
            position: "relative",
          }}
        >
          <Image src={getAvatar({ ...op, ...opData })} fill sizes="(max-width: 600px) 64px, 96px" alt="" />
        </Box>
        <Typography variant="h2" component="div" sx={{ width: "100%" }}>
          <Typography variant="h2" component="div" sx={{ fontSize: "50%" }}>
            {opSplit[1]}
          </Typography>
          {opSplit[0]}
        </Typography>
        <IconButton onClick={onClose}>
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: {
            xs: "1fr",
            sm: "1fr 320px",
          },
        }}
      >
        <Select title="General">
          <Box
            sx={{
              display: "flex",
              gap: 2,
              "& > *": {
                lineHeight: 0.5,
              },
            }}
          >
            <ToggleButton value="owned" selected={op.potential > 0} onClick={onChangeOwned} sx={{ p: 1.5 }}>
              Owned
            </ToggleButton>
            <ToggleButton
              value="favorite"
              selected={op.favorite}
              onClick={onChangeFavorite}
              disabled={!op.potential}
              aria-label="favorite"
              sx={{ p: 1.5 }}
            >
              {op.favorite ? (
                <Favorite fontSize="small" color="error" sx={{ m: "2px" }} />
              ) : (
                <FavoriteBorder fontSize="small" color="error" sx={{ m: "2px" }} />
              )}
            </ToggleButton>
          </Box>
        </Select>
        <DisabledContext.Provider value={op.potential === 0}>
          <Select title="Potential">
            <Potential
              value={op.potential}
              exclusive
              max={getMaxPotentialById(op.op_id)}
              onChange={onChangePotential}
              size={32}
              bonuses={opData.potentials}
            />
          </Select>
          <Select title="Promotion">
            <Promotion
              value={op.elite}
              exclusive
              max={MAX_PROMOTION_BY_RARITY[opData.rarity]}
              onChange={onChangeElite}
            />
          </Select>
          <Select title="Level">
            <Level value={op.level} max={MAX_LEVEL_BY_RARITY[opData.rarity][op.elite]} onChange={onChangeLevel} />
          </Select>
          {opData?.skillData?.length ? (
            <Select title="Skill Rank">
              <SkillLevel
                value={op.skill_level}
                exclusive
                max={MAX_SKILL_LEVEL_BY_PROMOTION[op.elite]}
                onChange={onChangeSkillLevel}
              />
            </Select>
          ) : undefined}
          {opData.rarity > 3 ? (
            <Select title="Masteries">
              <Mastery sx={{ gap: 2 }}>
                {opData.skillData?.map((data, skillIndex) => (
                  <Mastery.SkillAlt
                    src={data.iconId ?? data.skillId}
                    key={data.skillId}
                    skillName={data.skillName}
                    skillNumber={skillIndex + 1}
                    disabled={op.skill_level < 7 || op.elite < 2}
                  >
                    <Mastery.Select
                      value={op.masteries[skillIndex]}
                      exclusive
                      onChange={(value) => onChangeMastery(skillIndex, value)}
                      disabled={op.skill_level < 7 || op.elite < 2}
                    />
                  </Mastery.SkillAlt>
                ))}
              </Mastery>
            </Select>
          ) : undefined}
          {opSkins.length > 1 ? (
            <Select title="Outfits">
              <Skins value={op.skin} exclusive onChange={onChangeSkin}>
                {opSkins
                  .sort((a, b) => a.sortId - b.sortId)
                  .map((skin: Skin) => {
                    // sortId -1 is the E2 skin, sortId -2 is Amiya's E1 skin
                    const d = (skin.sortId === -1 && op.elite < 2) || (skin.sortId === -2 && op.elite < 1);
                    return <Skins.Select key={skin.skinId} {...skin} disabled={d} />;
                  })}
              </Skins>
            </Select>
          ) : undefined}
          {opData.moduleData?.length ? (
            <Select title="Modules">
              <Module sx={{ gap: 2 }}>
                {opData.moduleData.map((mod) => (
                  <Module.ItemAlt
                    key={mod.moduleId}
                    disabled={op.level < MODULE_REQ_BY_RARITY[opData.rarity] || op.elite < 2}
                    {...mod}
                  >
                    <Module.Select
                      value={op.modules[mod.moduleId]}
                      exclusive
                      moduleId={mod.moduleId}
                      onChange={onChangeModule}
                      disabled={op.level < MODULE_REQ_BY_RARITY[opData.rarity] || op.elite < 2}
                    />
                  </Module.ItemAlt>
                ))}
              </Module>
            </Select>
          ) : undefined}
        </DisabledContext.Provider>
      </DialogContent>
    </Dialog>
  );
});
EditOperator.displayName = "EditOperator";
export default EditOperator;
