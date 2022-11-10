import TrendingFlatIcon from "@mui/icons-material/TrendingFlat";
import {
  Box,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  Paper,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { NextPage } from "next";
import Image from "next/image";
import { useState } from "react";

import { COST_BY_RARITY, MAX_LEVEL_BY_RARITY, minMax } from "util/changeOperator";
import Layout from "components/Layout";
import { rarityColors } from "../../styles/rarityColors";
import { Star } from "@mui/icons-material";

interface LevelingCost {
  exp: number;
  lmd: number;
  levelingLmd: number;
  eliteLmd: number;
}

const levelingCost = (
  rarity: number,
  startingElite: number,
  startingLevel: number,
  targetElite: number,
  targetLevel: number
): LevelingCost => {
  const costsByElite = Array(Math.max(targetElite - startingElite + 1, 0))
    .fill(0)
    .map((_, i) => {
      const elite = startingElite + i;
      const eliteStartingLevel = elite === startingElite ? startingLevel : 1;
      const eliteTargetLevel = elite === targetElite
        ? targetLevel
        : MAX_LEVEL_BY_RARITY[rarity - 1][elite];
      const exp = COST_BY_RARITY.expCostByElite[elite]
        .slice(eliteStartingLevel - 1, eliteTargetLevel - 1)
        .reduce((a, b) => a + b, 0);
      const levelingLmd = COST_BY_RARITY.lmdCostByElite[elite]
        .slice(eliteStartingLevel - 1, eliteTargetLevel - 1)
        .reduce((a, b) => a + b, 0);
      const eliteLmd = elite === startingElite
        ? 0
        : COST_BY_RARITY.eliteLmdCost[rarity - 1][elite - 1];
      return {
        exp,
        lmd: levelingLmd + eliteLmd,
        eliteLmd,
        levelingLmd,
      };
    });
  const initialValue = {
    exp: 0,
    lmd: 0,
    eliteLmd: 0,
    levelingLmd: 0,
  };
  return costsByElite.reduce(
    (a, b) => ({
      exp: a.exp + b.exp,
      lmd: a.lmd + b.lmd,
      eliteLmd: a.eliteLmd + b.eliteLmd,
      levelingLmd: a.levelingLmd + b.levelingLmd,
    }),
    initialValue
  );
};

const maxElite = (rarity: number | undefined) => {
  if (rarity == null) {
    return 0;
  }
  switch (rarity) {
    case 1:
    case 2:
      return 0;
    case 3:
      return 1;
    default:
      return 2;
  }
};

const maxLevel = (rarity: number | undefined, elite: number | undefined) => {
  if (rarity == null || elite == null) {
    return 0;
  }
  return MAX_LEVEL_BY_RARITY[rarity][elite];
};

const br = (index: number) => {
  const r = 4;
  if (index === 0) return `${r}px 0px 0px ${r}px`;
  else if (index === 5) return `0px ${r}px ${r}px 0px`;
  else return "0";
}

const Level: NextPage = () => {
  const [rarity, setRarity] = useState(6);
  const [startingElite, setStartingElite] = useState(0);
  const [startingLevel, setStartingLevel] = useState(1);
  const [_startingLevel, _setStartingLevel] = useState("1");
  const [targetElite, setTargetElite] = useState(0);
  const [targetLevel, setTargetLevel] = useState(1);
  const [_targetLevel, _setTargetLevel] = useState("1");
  const theme = useTheme();
  const isXSmallScreen = useMediaQuery(theme.breakpoints.down("xs"));
  const { exp, lmd, levelingLmd, eliteLmd } = levelingCost(
    rarity,
    startingElite,
    startingLevel,
    targetElite,
    targetLevel
  );
  const maxStartingLevel = maxLevel(rarity, startingElite);
  const maxTargetLevel = maxLevel(rarity, targetElite);
  const startingLevelHelpText = `Between 1 and ${maxStartingLevel}`;
  const targetLevelHelpText = `Between 1 and ${maxTargetLevel}`;

  const handleChange = (rar: number) => {
    setRarity(rar);
    const newMaxElite = maxElite(rar);
    if (startingElite > newMaxElite) {
      setStartingElite(newMaxElite);
      setStartingLevel(1);
      _setStartingLevel("1");
    }
    if (targetElite > newMaxElite) {
      setTargetElite(newMaxElite);
      setTargetLevel(1);
      _setTargetLevel("1");
    }
    const ms = maxLevel(rarity, Math.min(startingElite, newMaxElite));
    if (startingLevel > ms) {
      setStartingLevel(ms);
      _setStartingLevel(ms.toString());
    }
    const mt = maxLevel(rarity, Math.min(targetElite, newMaxElite));
    if (targetLevel > mt) {
      setTargetLevel(mt);
      _setTargetLevel(mt.toString());
    }
  };

  const handleChangeStartingElite = (e: SelectChangeEvent<number>) => {
    const newStartingElite = Number(e.target.value);
    setStartingElite(newStartingElite);
    if (targetElite < newStartingElite) {
      setTargetElite(newStartingElite);
    }
    const ms = maxLevel(rarity, newStartingElite);
    if (startingLevel > ms) {
      setStartingLevel(ms);
      _setStartingLevel(ms.toString());
    }
  };
  const handleChangeTargetElite = (e: SelectChangeEvent<number>) => {
    const newTargetElite = Number(e.target.value);
    setTargetElite(newTargetElite);
    const mt = maxLevel(rarity, newTargetElite);
    if (targetLevel > mt) {
      setTargetLevel(mt);
      _setTargetLevel(mt.toString());
    }
  };
  const handleChangeStartingLevel = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    let toInt = parseInt(e.target.value as string, 10);
    if (isNaN(toInt)) {
      _setStartingLevel("");
    }
    else {
      toInt = minMax(1, parseInt(e.target.value, 10), maxStartingLevel)
      setStartingLevel(toInt);
      _setStartingLevel(toInt.toString());
    }
  };
  const handleChangeTargetLevel = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    let toInt = parseInt(e.target.value as string, 10);
    if (isNaN(toInt)) {
      _setTargetLevel("");
    }
    else {
      toInt = minMax(1, parseInt(e.target.value, 10), maxTargetLevel)
      setTargetLevel(toInt);
      _setTargetLevel(toInt.toString());
    }
  };

  const sectionStyle = {
    px: 2,
    pt: 2,
    pb: 2,
  };

  return (
    <Layout tab="/tools" page="/level">
      <Box display="flex" justifyContent="center">
        <Grid container spacing={2} sx={{ maxWidth: "800px" }}>
          <Grid item xs={12}>
            <Paper
              elevation={2}
              component="section"
              sx={sectionStyle}
            >
              <Typography component="h3" variant="h5" gutterBottom>
                Select Rarity
              </Typography>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(3, 1fr)", sm: "repeat(6, 1fr)" }, width: "100%", rowGap: 1 }}>
                {[...Array(6)].map((_, i) => (
                  <IconButton
                    key={i}
                    className={rarity === i + 1 ? "active" : "inactive"}
                    sx={{
                      borderRadius: br(i),
                      color: rarityColors[i + 1],
                      fontSize: "1rem",
                    }}
                    onClick={() => handleChange(i + 1)}
                  >
                    {i + 1}
                    <Star fontSize="small" />
                  </IconButton>
                ))}
              </Box>
            </Paper>
          </Grid>
          <Grid
            item
            xs={12}
            container
            alignItems="center"
            justifyContent="center"
          >
            <Grid item xs={12} sm={5}>
              <Paper
                elevation={2}
                component="section"
                sx={sectionStyle}
              >
                <Typography component="h3" variant="h5" gutterBottom>
                  Starting Point
                </Typography>
                <Box display="flex" flexDirection="row">
                  <div>
                    <FormControl
                      size="small"
                      fullWidth
                      sx={{
                        mb: 2,
                      }}
                    >
                      <InputLabel htmlFor="starting-elite">
                        Starting elite
                      </InputLabel>
                      <Select<number>
                        native
                        value={startingElite}
                        label="Starting elite"
                        onChange={handleChangeStartingElite}
                        inputProps={{
                          name: "starting-elite",
                          id: "starting-elite",
                        }}
                      >
                        <option value={0}>Elite 0</option>
                        {Array(maxElite(rarity))
                          .fill(0)
                          .map((_, i) => (
                            <option key={i + 1} value={i + 1}>
                              Elite {i + 1}
                            </option>
                          ))}
                      </Select>
                    </FormControl>
                    <TextField
                      size="small"
                      fullWidth
                      id="starting-level"
                      label="Starting level"
                      inputProps={{
                        inputMode: 'numeric',
                        pattern: '[0-9]*'
                      }}
                      value={_startingLevel}
                      onFocus={(e) => e.target.select()}
                      onChange={handleChangeStartingLevel}
                      helperText={startingLevelHelpText}
                    />
                  </div>
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={2}>
              {!isXSmallScreen ? (
                <TrendingFlatIcon
                  sx={{
                    fontSize: "3rem",
                    color: "rgba(255, 255, 255, 0.8)",
                    stroke: "black",
                    strokeWidth: "0.2px",
                    width: "100%",
                  }}
                />
              ) : (
                <>&nbsp;</>
              )}
            </Grid>
            <Grid item xs={12} sm={5}>
              <Paper
                elevation={2}
                component="section"
                sx={sectionStyle}
              >
                <Typography component="h3" variant="h5" gutterBottom>
                  End point
                </Typography>
                <Box display="flex" flexDirection="row">
                  <div>
                    <FormControl size="small" fullWidth sx={{ mb: 2 }}>
                      <InputLabel htmlFor="target-elite">
                        Target elite
                      </InputLabel>
                      <Select
                        native
                        value={targetElite}
                        label="Target elite"
                        onChange={handleChangeTargetElite}
                        inputProps={{
                          name: "target-elite",
                          id: "target-elite",
                        }}
                      >
                        <option value={0}>Elite 0</option>
                        {Array(maxElite(rarity))
                          .fill(0)
                          .map((_, i) => (
                            <option key={i + 1} value={i + 1}>
                              Elite {i + 1}
                            </option>
                          ))}
                      </Select>
                    </FormControl>
                    <TextField
                      size="small"
                      fullWidth
                      id="target-level"
                      label="Target level"
                      type="numeric"
                      value={_targetLevel}
                      onFocus={(e) => e.target.select()}
                      onChange={handleChangeTargetLevel}
                      helperText={targetLevelHelpText}
                    />
                  </div>
                </Box>
              </Paper>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Paper
              elevation={2}
              component="section"
              sx={{ px: 2, pt: 2, pb: 3 }}
            >
              <Typography component="h3" variant="h5" gutterBottom>
                Costs
              </Typography>
              <Box component="ul" sx={{ m: 0, p: 0, listStyle: "none" }}>
                <Typography variant="body1" component="li">
                  Total EXP cost:{" "}
                  <span>
                    <strong>
                      {_startingLevel && _targetLevel ? exp.toLocaleString() : " - "}
                    </strong> EXP
                  </span>
                </Typography>
                <Typography variant="body1" component="li" sx={{ mt: 1 }}>
                  Total LMD cost:{" "}
                  <span>
                    <strong data-cy="lmd" data-lmd={lmd}>
                      {_startingLevel && _targetLevel ? lmd.toLocaleString() : " - "}
                    </strong>{" "}
                    <LmdIcon />
                  </span>
                  <Box
                    component="ul"
                    sx={{
                      mt: 1,
                      "& > li": { display: "list-item", listStyle: "disc" },
                      "& > li ~ li": { mt: 1 },
                    }}
                  >
                    <Typography variant="body1" component="li">
                      LMD cost for leveling:{" "}
                      <span>
                        <span
                          data-cy="levelingLmd"
                          data-leveling-lmd={levelingLmd}
                        >
                          {_startingLevel && _targetLevel ? levelingLmd.toLocaleString() : " - "}
                        </span>{" "}
                        <LmdIcon />
                      </span>
                    </Typography>
                    <Typography variant="body1" component="li">
                      LMD cost for elite promotions:{" "}
                      <span>
                        <span>
                          {_startingLevel && _targetLevel ? eliteLmd.toLocaleString() : " - "}
                        </span>
                        <LmdIcon />
                      </span>
                    </Typography>
                  </Box>
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Layout>
  );
};
export default Level;

const LmdIcon: React.FC = () => {
  return (
    <Box component="span" position="relative" top={3}>
      <Image src="/img/items/GOLD_SHD.webp" width={26} height={18} alt="LMD" />
    </Box>
  );
};
