import {
  Autocomplete,
  TextField,
  Grid,
  SxProps,
  Theme,
  Container,
  Box,
  Paper,
  Checkbox,
  FormControlLabel,
  Typography,
  Popper,
  Collapse,
  IconButton,
} from "@mui/material";
import { Instance } from "@popperjs/core";
import { Combination } from "js-combinatorics";
import { NextPage } from "next";
import { useContext, useEffect, useMemo, useRef, useState } from "react";

import recruitmentJson from "data/recruitment.json";
import Layout from "components/Layout";
import classList from "data/classList";
import useLocalStorage from "util/useLocalStorage";
import RecruitableOperatorCard from "components/recruit/RecruitableOperatorCard";
import { rosterApi, useRosterGetQuery } from "store/extendRoster";
import { SessionContext } from "pages/_app";
import { skipToken } from "@reduxjs/toolkit/query";
import { defaultOperatorObject } from "util/changeOperator";
import Board from "components/base/Board";
import Chip from "components/base/Chip";
import Image from "components/base/Image";
import { focused } from "styles/theme/appTheme";
import { ZoomOutMap } from "@mui/icons-material";

const TAGS_BY_CATEGORY = {
  Rarity: ["Top Operator", "Senior Operator", "Starter", "Robot"],
  Position: ["Melee", "Ranged"],
  Class: [
    "Caster",
    "Defender",
    "Guard",
    "Medic",
    "Sniper",
    "Specialist",
    "Supporter",
    "Vanguard",
  ],
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
  ],
};

const chipContainerStyles: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 1,
  flexWrap: "wrap",
};

function getTagCombinations(activeTags: string[]) {
  if (activeTags.length === 0) {
    return [];
  }
  const range = Array(activeTags.length)
    .fill(0)
    .map((_, i) => i + 1);
  return range.flatMap((k) =>
    [...new Combination<string>(activeTags, k)].sort()
  );
}

interface Tag {
  type: string;
  value: string;
}

const options: Tag[] = Object.entries(TAGS_BY_CATEGORY).flatMap(([type, tagArray]) =>
  tagArray.flatMap((tag) => ({ type, value: tag }))
);

const Recruit: NextPage = () => {
  const session = useContext(SessionContext);
  const { data: roster } = useRosterGetQuery(session ? { user_id: session.user.id } : skipToken);

  const [activeTags, setActiveTags] = useState<Tag[]>([]);
  const [inputNode, setInputNode] = useState<HTMLInputElement | null>(null);
  useEffect(() => {
    if (inputNode != null) {
      inputNode.focus();
    }
  }, [inputNode]);

  const matchingOperators = useMemo(() => getTagCombinations([...activeTags]
    .sort((a, b) => a.value.localeCompare(b.value))
    .map(tag => tag.value)
  )
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

  const [showPotentials, setShowPotentials] = useState(false);
  const [bonuses, setBonuses] = useState(false);
  const [_showPotentials, _setShowPotentials] = useLocalStorage("recruitShowPotential", false);
  const [_bonuses, _setBonuses] = useLocalStorage("recruitShowBonuses", false);
  useEffect(() => {
    setShowPotentials(_showPotentials);
    setBonuses(_bonuses)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  console.log("asdf")

  return (
    <Layout tab="/tools" page="/recruit">
      <Box sx={{ display: "flex", gap: "32px", justifyContent: "center", }}>
        <Board title="Tags" TitleAction={<IconButton onClick={() => setOpen(o => !o)}><ZoomOutMap /></IconButton>} sx={{
          maxWidth: "sm",
          "&:focus-within .MuiAutocomplete-option.Mui-focused": {
            ...focused
          },
        }}>
          <Collapse collapsedSize="0px" in={open}>
            <Autocomplete multiple options={options} value={activeTags}
              open
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
                  InputProps={{ ...params.InputProps, endAdornment: null }}
                  label="Selected tags"
                  inputRef={setInputNode}
                />
              )}
              renderGroup={(params) =>
                <Box component="li" key={params.key}>
                  <Typography variant="h3" className="MuiAutocomplete-groupLabel" sx={{ mb: "8px" }}>
                    {params.group}
                  </Typography>
                  <Box component="ul"
                    className="MuiAutocomplete-groupUl"
                    sx={{
                      p: 0,
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "8px 16px"
                    }}
                  >
                    {params.children}
                  </Box>
                </Box>
              }
              renderOption={(props, option) =>
                <Box {...props} component="li">
                  {classList.includes(option.value)
                    ? <Image sx={{ width: "1.5rem", height: "1.5rem" }} src={`/img/classes/class_${option.value.toLowerCase()}.png`} alt={option.value}></Image>
                    : null}
                  {option.value}
                </Box>
              }
              ListboxProps={{
                sx: {
                  display: "flex",
                  flexDirection: "column",
                  gap: "24px",
                  padding: 0,
                  height: "max-contents",
                  maxHeight: "none",
                  my: 2,
                }
              }}
              PopperComponent={(props) => (
                <Popper {...props} sx={{
                  position: "static !important",
                  height: "max-content !important",
                  transform: "none !important",
                  width: "100% !important",
                  zIndex: "0 !important",
                }} />
              )}
            />
          </Collapse>
        </Board>
        <Board title="Results" sx={{
          maxWidth: "md",
          "&:focus-within .MuiAutocomplete-option.Mui-focused": {
            ...focused
          },
        }}>
          <Box sx={{
            display: "flex",
            "& span": {
              lineHeight: 1.1,
            }
          }}>
            <FormControlLabel
              control={<Checkbox
                checked={showPotentials}
                onChange={(e) => { setShowPotentials(e.target.checked); _setShowPotentials(e.target.checked); }}
              />}
              label="Show Potentials"
            />
            <FormControlLabel
              control={<Checkbox
                checked={bonuses}
                onChange={(e) => { setBonuses(e.target.checked); _setBonuses(e.target.checked); }}
              />}
              label="Next Upgrade"
            />
          </Box>
          {matchingOperators
            .sort(
              (
                { tags: tagSetA, operators: opSetA },
                { tags: tagSetB, operators: opSetB }
              ) =>
                Math.min(
                  ...opSetB.map((op) => (op.rarity === 1 ? 4 : op.rarity))
                ) -
                Math.min(
                  ...opSetA.map((op) => (op.rarity === 1 ? 4 : op.rarity))
                ) || tagSetB.length - tagSetA.length
            )
            .map(({ tags, operators, guarantees }) => (
              <Box key={tags.join(",")}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  "& ~ &": {
                    borderTop: "1px solid #4d4d4d",
                  },
                }}
              >
                <Box sx={chipContainerStyles}>
                  {guarantees.map((guaranteedRarity) => (
                    <Chip
                      key={`guaranteed${guaranteedRarity}`}
                      sx={{ background: "#fff", color: "#000" }}
                    >
                      {`${guaranteedRarity}★`}
                    </Chip>
                  ))}
                  {tags.map((tag) => (
                    <Chip key={tag}>
                      {tag}
                    </Chip>
                  ))}
                </Box>
                <Grid item xs={12}
                  sx={{
                    ...chipContainerStyles,
                    display: "grid",
                    gridArea: "box",
                    gridTemplateColumns: `repeat(auto-fill, minmax(${showPotentials ? "108px" : "80px"}, 1fr))`,
                    gridTemplateRows: "min-content",
                    justifyContent: "center",
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
                    "& .max-pot": {
                      opacity: 0.75
                    }
                  }}
                >
                  {!isServer() && [...operators]
                    .sort((a, b) => (a.rarity - b.rarity)
                      || (roster
                        ? (a.id in roster ? roster[a.id].potential : 0)
                        - (b.id in roster ? roster[b.id].potential : 0)
                        : 0))
                    .map((operator) => (
                      <RecruitableOperatorCard op={roster?.[operator.id] ?? defaultOperatorObject(operator.id)}
                        key={operator.id}
                        showPotentials={showPotentials}
                        showBonus={bonuses}
                      />
                    ))}
                </Grid>
              </Box>
            ))}
        </Board>
      </Box>
    </Layout>
  );
};
export default Recruit;