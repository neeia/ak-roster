import {
  Box,
  Container,
  SxProps,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { NextPage } from "next";
import Image from "next/image";
import { memo, useState } from "react";

import { COST_BY_RARITY, MAX_LEVEL_BY_RARITY, minMax } from "util/changeOperator";
import Layout from "components/Layout";
import { rarityColors } from "styles/rarityColors";
import { Star } from "@mui/icons-material";
import PromotionSelector from "components/data/input/EditPieces/PromotionSelector";
import Board from "components/base/Board";

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
        : MAX_LEVEL_BY_RARITY[rarity][elite];
      const exp = COST_BY_RARITY.expCostByElite[elite]
        .slice(eliteStartingLevel - 1, eliteTargetLevel - 1)
        .reduce((a, b) => a + b, 0);
      const levelingLmd = COST_BY_RARITY.lmdCostByElite[elite]
        .slice(eliteStartingLevel - 1, eliteTargetLevel - 1)
        .reduce((a, b) => a + b, 0);
      const eliteLmd = elite === startingElite
        ? 0
        : COST_BY_RARITY.eliteLmdCost[rarity][elite - 1];
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

const Level: NextPage = () => {
  const [rarity, setRarity] = useState(6);
  const [startingElite, setStartingElite] = useState(0);
  const [startingLevel, setStartingLevel] = useState(1);
  const [_startingLevel, _setStartingLevel] = useState("1");
  const [targetElite, setTargetElite] = useState(0);
  const [targetLevel, setTargetLevel] = useState(1);
  const [_targetLevel, _setTargetLevel] = useState("1");
  const { exp, lmd, levelingLmd, eliteLmd } = levelingCost(
    rarity,
    startingElite,
    startingLevel,
    targetElite,
    targetLevel
  );
  const maxStartingLevel = maxLevel(rarity, startingElite);
  const maxTargetLevel = maxLevel(rarity, targetElite);
  const startingLevelHelpText = `Max ${maxStartingLevel}`;
  const targetLevelHelpText = `Max ${maxTargetLevel}`;

  const handleChangeRarity = (_: unknown, rar: number) => {
    if (rar == null) return;
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
    const ms = maxLevel(rar, Math.min(startingElite, newMaxElite));
    if (startingLevel > ms) {
      setStartingLevel(ms);
      _setStartingLevel(ms.toString());
    }
    const mt = maxLevel(rar, Math.min(targetElite, newMaxElite));
    if (targetLevel > mt) {
      setTargetLevel(mt);
      _setTargetLevel(mt.toString());
    }
  };

  const handleChangeStartingElite = (i: number) => {
    setStartingElite(i);
    if (targetElite < i) {
      setTargetElite(i);
    }
    const ms = maxLevel(rarity, i);
    if (startingLevel > ms) {
      setStartingLevel(ms);
      _setStartingLevel(ms.toString());
    }
  };
  const handleChangeTargetElite = (i: number) => {
    setTargetElite(i);
    if (startingElite > i) {
      setStartingElite(i);
    }
    const mt = maxLevel(rarity, i);
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

  const sectionStyle: SxProps = {
    display: "flex",
    flexDirection: "column",
  };

  return (
    <Layout tab="/tools" page="/level">
      <Container maxWidth="sm" sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <Board title="Data">
          {/* Rarity */}
          <Box sx={sectionStyle}>
            <Typography variant="h3" id="rarity" gutterBottom>
              Rarity
            </Typography>
            <ToggleButtonGroup exclusive value={rarity}
              aria-labelledby="rarity"
              onChange={handleChangeRarity}
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(6, 1fr)",
              }}
            >
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <ToggleButton key={i} value={i}
                  sx={{
                    color: rarityColors[i],
                  }}
                >
                  {i} <Star fontSize="small" />
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>
          {/* Elite / Lvl */}
          <Box
            sx={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}
          >
            {/* Start */}
            <Box>
              <Typography variant="h3" gutterBottom>
                Start
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2, width: "min-content" }}>
                <PromotionSelector
                  value={startingElite}
                  maxPromotion={maxElite(rarity)}
                  onChange={handleChangeStartingElite}
                />
                <TextField id="starting-level"
                  value={_startingLevel}
                  label="Level"
                  inputProps={{
                    inputMode: 'numeric',
                    pattern: '[0-9]*'
                  }}
                  onFocus={(e) => e.target.select()}
                  onChange={handleChangeStartingLevel}
                  helperText={startingLevelHelpText}
                  size="small"
                />
              </Box>
            </Box>
            {/* End */}
            <Box>
              <Typography variant="h3" gutterBottom>
                End
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2, width: "min-content" }}>
                <PromotionSelector
                  value={targetElite}
                  maxPromotion={maxElite(rarity)}
                  onChange={handleChangeTargetElite}
                />
                <TextField id="target-level"
                  value={_targetLevel}
                  label="Target level"
                  inputProps={{
                    inputMode: 'numeric',
                    pattern: '[0-9]*'
                  }}
                  onFocus={(e) => e.target.select()}
                  onChange={handleChangeTargetLevel}
                  helperText={targetLevelHelpText}
                  size="small"
                />
              </Box>
            </Box>
          </Box>
        </Board>
        <Board title="Result">
          <Box component="ul" sx={{ m: 0, p: 0, listStyle: "none" }}>
            <Typography variant="body1" component="li">
              Total EXP cost:{" "}
              <strong>
                {_startingLevel && _targetLevel ? exp.toLocaleString() : " - "}
              </strong> EXP
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
                    <span>
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
                    </span>{" "}
                    <LmdIcon />
                  </span>
                </Typography>
              </Box>
            </Typography>
          </Box>
        </Board>
      </Container>
    </Layout>
  );
};
export default Level;

const LmdIcon = memo(() => (
  <Box component="span" position="relative" top={3}>
    <Image src="/img/items/GOLD_SHD.webp" width={26} height={18} alt="LMD" />
  </Box>
));
