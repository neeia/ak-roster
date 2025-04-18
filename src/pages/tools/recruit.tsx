﻿import {
  Autocomplete,
  TextField,
  Box,
  Checkbox,
  FormControlLabel,
  Typography,
  Popper,
  Collapse,
  IconButton,
  Alert,
  Divider,
  Popover,
} from "@mui/material";
import { Combination } from "js-combinatorics";
import { NextPage } from "next";
import { useContext, useEffect, useMemo, useState } from "react";

import recruitmentJson from "data/recruitment.json";
import Layout from "components/Layout";
import classList from "data/classList";
import RecruitableOperatorCard from "components/recruit/RecruitableOperatorCard";
import { UserContext } from "pages/_app";
import { changeOwned, changePotential, defaultOperatorObject } from "util/changeOperator";
import Board from "components/base/Board";
import Chip from "components/base/Chip";
import { focused } from "styles/theme/appTheme";
import { Close, Groups, ZoomInMap, ZoomOutMap } from "@mui/icons-material";
import Image from "components/base/Image";
import { RecruitmentResult } from "types/recruit";
import useOperators from "util/hooks/useOperators";
import useSettings from "util/hooks/useSettings";
import imageBase from "util/imageBase";
import Potential from "components/data/input/Select/Potential";

const TAGS_BY_CATEGORY = {
  Rarity: ["Top Operator", "Senior Operator", "Starter", "Robot"],
  Position: ["Melee", "Ranged"],
  Class: ["Caster", "Defender", "Guard", "Medic", "Sniper", "Specialist", "Supporter", "Vanguard"],
  Other: [
    "AoE",
    "Crowd-Control",
    "DP-Recovery",
    "DPS",
    "Debuff",
    "Defense",
    "Fast-Redeploy",
    "Healing",
    "Nuker",
    "Shift",
    "Slow",
    "Summon",
    "Support",
    "Survival",
    "Elemental",
  ],
};

function getTagCombinations(activeTags: string[]) {
  if (activeTags.length === 0) {
    return [];
  }
  const range = Array(activeTags.length)
    .fill(0)
    .map((_, i) => i + 1);
  return range.flatMap((k) => [...new Combination<string>(activeTags, k)].sort());
}

interface Tag {
  type: string;
  value: string;
}

const options: Tag[] = Object.entries(TAGS_BY_CATEGORY).flatMap(([type, tagArray]) =>
  tagArray.flatMap((tag) => ({ type, value: tag }))
);

const Recruit: NextPage = () => {
  const user = useContext(UserContext);
  const [roster, onChange] = useOperators();

  const [activeTags, setActiveTags] = useState<Tag[]>([]);
  const [inputNode, setInputNode] = useState<HTMLInputElement | null>(null);
  useEffect(() => {
    if (inputNode != null) {
      inputNode.focus();
    }
  }, [inputNode]);

  const matchingOperators: RecruitmentResult[] = useMemo(
    () =>
      getTagCombinations([...activeTags].sort((a, b) => a.value.localeCompare(b.value)).map((tag) => tag.value))
        .map((tags) => recruitmentJson[`${tags}` as keyof typeof recruitmentJson])
        .filter((result) => result != null),
    [activeTags]
  );

  const handleTagsChanged = (
    _: unknown,
    selectedOptions: {
      type: string;
      value: string;
    }[]
  ) => {
    if (selectedOptions.length <= 5) {
      setActiveTags(selectedOptions);
    }
  };

  const isServer = () => typeof window === `undefined`;

  const [open, setOpen] = useState(true);

  const [_settings, setSettings] = useSettings();
  const settings = _settings.recruitSettings;

  const [opId, setOpId] = useState<string>();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const handleClick = (event: React.MouseEvent<HTMLElement>, op_id: string) => {
    setAnchorEl(event.currentTarget);
    setOpId(op_id);
    event.currentTarget.id = "active-recruit-button";
  };
  const handleClose = () => {
    if (anchorEl) anchorEl.id = "";
    setAnchorEl(null);
    setOpId(undefined);
  };

  const onChangePotential = (value: number | null) => {
    if (value == null || !opId) return;
    const op = roster[opId] || defaultOperatorObject(opId);
    if (!op.potential) onChange(changePotential(changeOwned(op, true), value));
    else onChange(changePotential(op, value));
  };

  return (
    <Layout tab="/tools" page="/recruit">
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: "32px",
          justifyContent: "center",
        }}
      >
        <Board
          title="Tags"
          TitleAction={
            <IconButton onClick={() => setOpen((o) => !o)}>{open ? <ZoomInMap /> : <ZoomOutMap />}</IconButton>
          }
          sx={{
            width: { xs: "100%", md: open ? "100%" : "320px" },
            height: "min-content",
            transition: "width 0.25s",
            maxWidth: { xs: "100%", md: "sm" },
            "&:focus-within .MuiAutocomplete-option.Mui-focused": {
              ...focused,
            },
          }}
        >
          <Autocomplete
            multiple
            options={options}
            value={activeTags}
            open={open}
            autoHighlight
            disableCloseOnSelect
            disablePortal
            groupBy={(option) => option.type}
            getOptionLabel={(option) => option.value}
            isOptionEqualToValue={(option, value) => option.value === value.value}
            onChange={handleTagsChanged}
            renderInput={(params) => (
              <TextField
                {...params}
                slotProps={{
                  input: {
                    ...params.InputProps,
                    sx: {
                      pr: "48px !important",
                      gap: "4px",
                    },
                    endAdornment: (
                      <IconButton sx={{ position: "absolute", right: 8, top: 8 }} onClick={() => setActiveTags([])}>
                        <Close fontSize="small" />
                      </IconButton>
                    ),
                  },
                }}
                label="Selected tags"
                inputRef={setInputNode}
              />
            )}
            renderGroup={(params) => (
              <Collapse collapsedSize="0px" in={open} key={params.key}>
                <Box component="li">
                  <Typography variant="h3" className="MuiAutocomplete-groupLabel" sx={{ mb: "8px" }}>
                    {params.group}
                  </Typography>
                  <Box
                    component="ul"
                    className="MuiAutocomplete-groupUl"
                    sx={{
                      p: 0,
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "8px 16px",
                    }}
                  >
                    {params.children}
                  </Box>
                </Box>
              </Collapse>
            )}
            renderOption={({ key, ...props }, option) => (
              <Box
                key={key}
                sx={{ "& > img": { filter: "drop-shadow(0px 0px 2px #000000)" } }}
                {...props}
                component="li"
              >
                {classList.includes(option.value) ? (
                  <Image
                    width={24}
                    height={24}
                    src={`${imageBase}/classes/class_${option.value.toLowerCase()}.webp`}
                    alt={option.value}
                  />
                ) : null}
                {option.value}
              </Box>
            )}
            ListboxProps={{
              sx: {
                display: "flex",
                flexDirection: "column",
                gap: "24px",
                padding: 0,
                height: "max-contents",
                maxHeight: "none",
                my: 2,
                "& .MuiAutocomplete-option": {
                  minHeight: "40px",
                  padding: "8px 16px",
                  backgroundColor: "background.light",
                  borderRadius: "9999px",
                  display: "flex",
                  gap: "8px",
                  alignItems: "center",
                  lineHeight: "1",
                },
              },
            }}
            PopperComponent={(props) => (
              <Popper
                {...props}
                sx={{
                  position: "static !important",
                  height: "max-content !important",
                  transform: "none !important",
                  width: "100% !important",
                  zIndex: "0 !important",
                }}
              />
            )}
          />
        </Board>
        <Board
          title="Results"
          sx={{
            maxWidth: "md",
            height: "min-content",
            "&:focus-within .MuiAutocomplete-option.Mui-focused": {
              ...focused,
            },
          }}
        >
          <Box
            sx={{
              display: "flex",
              gap: 2,
              "& span": {
                lineHeight: 1.1,
              },
            }}
          >
            <FormControlLabel
              control={
                <Checkbox
                  checked={settings.showPotential}
                  onChange={(e) => {
                    setSettings((s) => ({
                      ...s,
                      recruitSettings: {
                        ...settings,
                        showPotential: e.target.checked,
                      },
                    }));
                  }}
                  disabled={!user}
                />
              }
              label="Show Potentials"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={settings.showBonuses}
                  onChange={(e) => {
                    setSettings((s) => ({
                      ...s,
                      recruitSettings: {
                        ...settings,
                        showBonuses: e.target.checked,
                      },
                    }));
                  }}
                  disabled={!user}
                />
              }
              label="Next Upgrade"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={settings.hideThreeStarRecruits}
                  onChange={(e) => {
                    setSettings((s) => ({
                      ...s,
                      recruitSettings: {
                        ...settings,
                        hideThreeStarRecruits: e.target.checked,
                      },
                    }));
                  }}
                />
              }
              label="Hide 2/3★ Groups"
            />
          </Box>
          <Divider />
          {activeTags.length === 0 && <Alert severity="info">Select at least one tag to see results.</Alert>}
          {matchingOperators
            .sort(
              ({ tags: tagSetA, operators: opSetA }, { tags: tagSetB, operators: opSetB }) =>
                Math.min(...opSetB.map((op) => (op.rarity === 1 ? 4 : op.rarity))) -
                  Math.min(...opSetA.map((op) => (op.rarity === 1 ? 4 : op.rarity))) || tagSetB.length - tagSetA.length
            )
            .filter(({ guarantees }) => (settings.hideThreeStarRecruits ? guarantees.length > 0 : true))
            .map(({ tags, operators, guarantees }) => (
              <Box
                key={tags.join(",")}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  "& ~ &": {
                    borderTop: "1px solid",
                    borderColor: "background.light",
                    pt: 2,
                  },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    flexWrap: "wrap",
                    ml: 1,
                  }}
                >
                  <Groups /> {operators.length}
                  <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                  {guarantees.map((guaranteedRarity) => (
                    <Chip
                      key={`guaranteed${guaranteedRarity}`}
                      sx={{ backgroundColor: "text.primary", color: "background.paper" }}
                    >
                      {`${guaranteedRarity}★`}
                    </Chip>
                  ))}
                  {tags.map((tag) => (
                    <Chip key={tag}>{tag}</Chip>
                  ))}
                </Box>
                <Box
                  sx={{
                    display: "grid",
                    gridArea: "box",
                    gridTemplateColumns: `repeat(auto-fill, minmax(80px, 1fr))`,
                    gridTemplateRows: "min-content",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: { xs: 0.5, sm: 1 },
                    margin: 0,
                    padding: 0,
                    "& .MuiTypography-root": {
                      display: "flex",
                      lineHeight: "1.25rem",
                      color: "text.primary",
                      letterSpacing: "normal",
                      textTransform: "none",
                      pointerEvents: "none",
                      flexDirection: "column",
                      mx: "-1rem",
                      textAlign: "center",
                    },
                    "& #active-recruit-button": {
                      filter: "brightness(1.05)",
                      backgroundColor: "grey.600",
                      "& img": {
                        filter: "drop-shadow(0px 0px 1px rgba(0,0,0,0.8))",
                        transform: "scale(1.01)",
                      },
                    },
                  }}
                >
                  {!isServer() &&
                    [...operators]
                      .sort(
                        (a, b) => a.rarity - b.rarity || (roster[a.id]?.potential ?? 0) - (roster[b.id]?.potential ?? 0)
                      )
                      .map((operator) => (
                        <RecruitableOperatorCard
                          op={roster?.[operator.id] ?? defaultOperatorObject(operator.id)}
                          key={operator.id}
                          showPotentials={settings.showPotential}
                          showBonus={settings.showBonuses}
                          onClick={handleClick}
                          disabled={!user}
                        />
                      ))}
                </Box>
              </Box>
            ))}
          {matchingOperators.length > 0 && settings.hideThreeStarRecruits ? (
            <>
              <Divider />
              <Box>{matchingOperators.reduce((acc, cur) => acc + 1 - cur.guarantees.length, 0)} group(s) hidden</Box>
            </>
          ) : null}
        </Board>
        <Popover
          id="recruit-potential-popover"
          open={anchorEl != null}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
        >
          <Potential exclusive value={opId ? roster[opId]?.potential ?? 0 : 0} onChange={onChangePotential} />
        </Popover>
      </Box>
    </Layout>
  );
};
export default Recruit;
