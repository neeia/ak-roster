import {
  Autocomplete,
  TextField,
  Grid,
  Chip,
  SxProps,
  Theme,
  Popper,
  Container,
  Box,
  Paper,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { Instance } from "@popperjs/core";
import { Combination } from "js-combinatorics";
import { NextPage } from "next";
import { useEffect, useMemo, useRef, useState } from "react";

import recruitmentJson from "data/recruitment.json";
import Layout from "components/Layout";
import RecruitableOperatorChip from "components/recruit/RecruitableOperatorChip";
import classList from "data/classList";
import OperatorButton from "components/input/OperatorButton";
import useOperators from "util/useOperators";
import useLocalStorage from "util/useLocalStorage";

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

const Recruit: NextPage = () => {
  const options: Tag[] = Object.entries(TAGS_BY_CATEGORY).flatMap(([type, tagArray]) =>
    tagArray.flatMap((tag) => ({ type, value: tag }))
  );
  const [activeTags, setActiveTags] = useState<Tag[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [inputNode, setInputNode] = useState<HTMLInputElement | null>(null);
  const [resultPaddingTop, setResultPaddingTop] = useState(0);
  const popperRef = useRef<Instance>(null);

  const activeTagCombinations = getTagCombinations([...activeTags]
    .sort((a, b) => a.value.localeCompare(b.value))
    .map(tag => tag.value));
  const matchingOperators = useMemo(
    () =>
      activeTagCombinations
        .map(
          (tags) => recruitmentJson[`${tags}` as keyof typeof recruitmentJson]
        )
        .filter((result) => result != null),
    [activeTagCombinations]
  );
  useEffect(() => {
    if (inputNode != null) {
      inputNode.focus();
    }
  }, [inputNode]);

  useEffect(() => {
    if (!isOpen) {
      setResultPaddingTop(0);
    }
  }, [isOpen]);

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
    setIsOpen(selectedOptions.length !== 5);
  };

  const chipContainerStyles: SxProps<Theme> = {
    display: "flex",
    alignItems: "center",
    gap: (theme) => theme.spacing(1),
    flexWrap: "wrap",
  };

  const isServer = () => typeof window === `undefined`;

  const [roster] = useOperators();
  const [showPotentials, setShowPotentials] = useState(false);
  const [compact, setCompact] = useState(true);
  const [_showPotentials, _setShowPotentials] = useLocalStorage("recruitShowPotential", false);
  const [_compact, _setCompact] = useLocalStorage("recruitCompactMode", true);
  useEffect(() => {
    setShowPotentials(_showPotentials);
    setCompact(_compact);
  }, [])

  return (
    <Layout tab="/tools" page="/recruit">
      <Container maxWidth="md">
        <Autocomplete
          options={options}
          multiple
          autoHighlight
          openOnFocus
          open={isOpen}
          onOpen={() => setIsOpen(true)}
          onClose={() => setIsOpen(false)}
          groupBy={(option) => option.type}
          getOptionLabel={(option) => option.value}
          disableCloseOnSelect
          value={activeTags}
          onChange={handleTagsChanged}
          isOptionEqualToValue={(option, value) => option.value === value.value}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Available recruitment tags"
              inputRef={setInputNode}
            />
          )}
          renderOption={(props, option) =>
            <Box
              {...props}
              component="li"
            >
              {classList.includes(option.value)
                ? <Box component="img" sx={{ width: "2.5rem", height: "2.5rem" }} src={`/img/classes/class_${option.value.toLowerCase()}.png`} alt={option.value} />
                : option.value}
            </Box>
          }
          PaperComponent={(props) => (
            <Paper
              {...props}
              sx={{
                "& .MuiAutocomplete-groupUl": {
                  display: "flex",
                  flexWrap: "wrap",
                },
                "& .MuiAutocomplete-listbox": {
                  padding: 0,
                },
                "& .MuiAutocomplete-option": {
                  px: "16px !important",
                }
              }}
            >
            </Paper>
          )}
          PopperComponent={(props) => (
            <Popper
              {...props}
              popperRef={popperRef}
              modifiers={[
                {
                  name: "sizeObserver",
                  enabled: true,
                  phase: "read",
                  fn: (data) => {
                    setResultPaddingTop(data.state.rects.popper.height);
                  },
                },
              ]}
              sx={{ zIndex: "1000 !important" }}
            />
          )}
        />
        <div style={{ paddingTop: resultPaddingTop }}>
          <Box sx={{ display: "flex" }}>
            <Box sx={{ pt: 1 }}>
              <FormControlLabel
                control={<Checkbox
                  checked={showPotentials}
                  onChange={(e) => { setShowPotentials(e.target.checked); _setShowPotentials(e.target.checked); }}
                />}
                label="Show Potentials"
              />
            </Box>
            <Box sx={{ pt: 1 }}>
              <FormControlLabel
                control={<Checkbox
                  checked={compact}
                  onChange={(e) => { setCompact(e.target.checked); _setCompact(e.target.checked); }}
                />}
                label="Dense Mode"
              />
            </Box>
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
              <Grid
                container
                key={tags.join(",")}
                spacing={2}
                sx={{
                  my: 2,
                  "& ~ &": {
                    pt: 2,
                    borderTop: "1px solid #4d4d4d",
                  },
                }}
              >
                <Grid
                  item
                  xs={12}
                  sm={3}
                  sx={[
                    chipContainerStyles,
                    {
                      justifyContent: {
                        xs: "center",
                        sm: "flex-end",
                      },
                    },
                  ]}
                >
                  {guarantees.map((guaranteedRarity) => (
                    <Chip
                      key={`guaranteed${guaranteedRarity}`}
                      label={`${guaranteedRarity}★`}
                      sx={{ background: "#fff", color: "#000" }}
                    />
                  ))}
                  {tags.map((tag) => (
                    <Chip key={tag} label={tag} />
                  ))}
                </Grid>
                {compact
                  ? <Grid item xs={12} sm={9}
                    sx={{
                      ...chipContainerStyles,
                      fontSize: (theme) => theme.typography.body1.fontSize,
                      "& *": {
                        color: "#000000",
                      },
                      "& img": {
                        borderRadius: "50% 0% 0% 40%",
                      },
                      "& .rarity-6": {
                        backgroundColor: "#F9751A",
                      },
                      "& .rarity-5": {
                        backgroundColor: "#fbae02",
                      },
                      "& .rarity-4": {
                        backgroundColor: "#dbb1db",
                      },
                      "& .rarity-3": {
                        backgroundColor: "#00b2f6",
                      },
                      "& .rarity-2": {
                        backgroundColor: "#dce537",
                      },
                      "& .rarity-1": {
                        backgroundColor: "#9f9f9f",
                      },
                    }}
                  >
                    {!isServer() && operators.map((operator) => (
                      <RecruitableOperatorChip key={operator.id}
                        {...operator}
                        {...roster[operator.id]}
                        img={showPotentials && roster[operator.id].potential
                          ? `/img/potential/${roster[operator.id].potential}.png`
                          : undefined}
                      />
                    ))}
                  </Grid>
                  : <Grid item xs={12} sm={9}
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
                      },
                      "& .MuiButton-root": {
                        display: "grid",
                        boxShadow: 2,
                        backgroundColor: { xs: "info.dark", sm: "info.main" },
                        width: "100%",
                        height: "min-content",
                        justifyContent: "center",
                      },
                    }}
                  >
                    {!isServer() && operators.map((operator) => (
                      <OperatorButton op={roster[operator.id]} onClick={() => { }}
                        key={operator.id}
                        img={showPotentials && roster[operator.id].potential
                          ? `/img/potential/${roster[operator.id].potential}.png`
                          : undefined}
                      />
                    ))}
                  </Grid>
                }
              </Grid>
            ))}
        </div>
      </Container>
    </Layout>
  );
};
export default Recruit;