import {
  Box,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  Paper,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/system";
import { NextPage } from "next";
import React, { useMemo, useState } from "react";
import { sprintf } from "sprintf-js";

import Layout from "components/Layout";
import { minMax } from "../../util/changeOperator";
import Board from "components/base/Board";

const MAX_PULL_COUNT = 2000;

const initialize2dArray = (): number[][] => {
  const newArray: number[][] = [];
  for (let i = 0; i < 7; i++) {
    newArray[i] = [0, 0, 0, 0, 0, 0, 0];
  }
  return newArray;
};

const initialize3dArray = (): number[][][] => {
  const newArray: number[][][] = [];
  for (let i = 0; i < 99; i++) {
    newArray[i] = initialize2dArray();
  }
  return newArray;
};

const chanceOneOfEach = (finalOdds: number[][]) => {
  let chance = 0;
  for (let j = 1; j < 7; j++) {
    for (let k = 1; k < 7; k++) {
      chance += finalOdds[j][k];
    }
  }
  return chance;
};

const chanceMultiRateups = (finalOdds: number[][], numRateups: number) => {
  let chance = 0;
  if (numRateups === 6) {
    // we're calculating 6+, not "exactly 6"
    chance =
      1 -
      Array(6)
        .fill(0)
        .map((_, i) => chanceMultiRateups(finalOdds, i))
        .reduce((a, b) => a + b);
  } else {
    for (let i = 0; i <= numRateups; i++) {
      chance += finalOdds[i][numRateups - i];
    }
  }
  return chance;
};

const Rateup: NextPage = () => {
  const [pulls, setPulls] = useState(0);
  const [_pulls, _setPulls] = useState("0");
  const [pity, setPity] = useState(0);
  const [_pity, _setPity] = useState("0");
  const [bannerType, setBannerType] = useState<
    "event" | "standard" | "limited"
  >("event");
  const theme = useTheme();
  const isXSmallScreen = useMediaQuery(theme.breakpoints.down("xs"));

  let subrate = 0.5;
  if (bannerType === "standard") {
    subrate = 0.25;
  } else if (bannerType === "limited") {
    subrate = 0.35;
  }

  const finalOdds = useMemo(() => {
    let probabilities = initialize3dArray();
    probabilities[pity][0][0] = 1;
    for (let a = 0; a < pulls; a++) {
      const newProbabilities = initialize3dArray();
      for (let i = 0; i < 99; i++) {
        const sixStarChance = i <= 49 ? 0.02 : 0.02 * (i - 48);
        for (let j = 0; j < 7; j++) {
          if (bannerType !== "event") {
            for (let k = 0; k < 7; k++) {
              newProbabilities[Math.min(i + 1, 98)][j][k] +=
                probabilities[i][j][k] * (1 - sixStarChance);
              newProbabilities[0][j][k] +=
                probabilities[i][j][k] * sixStarChance * (1 - subrate * 2);
              newProbabilities[0][Math.min(j + 1, 6)][k] +=
                probabilities[i][j][k] * sixStarChance * subrate;
              newProbabilities[0][j][Math.min(k + 1, 6)] +=
                probabilities[i][j][k] * sixStarChance * subrate;
            }
          } else {
            newProbabilities[Math.min(i + 1, 98)][j][0] +=
              probabilities[i][j][0] * (1 - sixStarChance);
            newProbabilities[0][j][0] +=
              probabilities[i][j][0] * sixStarChance * (1 - subrate);
            newProbabilities[0][Math.min(j + 1, 6)][0] +=
              probabilities[i][j][0] * sixStarChance * subrate;
          }
        }
      }
      probabilities = newProbabilities;
    }
    const odds = initialize2dArray();
    for (let i = 0; i < 99; i++) {
      for (let j = 0; j < 7; j++) {
        for (let k = 0; k < 7; k++) {
          odds[j][k] += probabilities[i][j][k];
        }
      }
    }
    return odds;
  }, [pity, pulls, subrate, bannerType]);

  const toPercentage = (p: number) => {
    if (p === 0) {
      return "0%";
    }
    const percentage = p * 100;
    if (percentage < 100 && percentage > 100 - 1e-6) {
      return `~ 100%`;
    }
    if (percentage > 1e-6) {
      return `${sprintf("%.4g", percentage)}%`;
    }
    if (percentage > 0 && percentage < 1e-12) {
      return "< 0.0000000000001%";
    }
    return `${sprintf("%.12f", percentage)}%`;
  };
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) =>
    e.target.select();

  const handleTextInputChage = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    let toInt = parseInt(e.target.value as string, 10);
    if (isNaN(toInt)) {
      if (e.target.name === "pulls") {
        _setPulls("");
      } else {
        _setPity("");
      }
    } else if (e.target.name === "pulls") {
      toInt = minMax(0, toInt, MAX_PULL_COUNT);
      if (toInt >= 0 && toInt <= MAX_PULL_COUNT) {
        setPulls(toInt);
        _setPulls(toInt.toString());
      }
    } else {
      toInt = minMax(0, toInt, 98);
      if (toInt >= 0 && toInt <= 98) {
        setPity(toInt);
        _setPity(toInt.toString());
      }
    }
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    setBannerType(e.target.value as "event" | "standard" | "limited");
  };

  return (
    <Layout tab="/tools" page="/rateup">
      <Box display="flex" justifyContent="center">
        <Grid container spacing={2} sx={{ maxWidth: "800px" }}>
          <Grid item xs={12}>
            <Board title="Data">
              <Grid container spacing={2} sx={{ maxWidth: "800px" }}>
                <Grid item xs={6} sm={3}>
                  <TextField
                    fullWidth
                    name="pulls"
                    label="Number of pulls"
                    variant="outlined"
                    size="small"
                    margin="none"
                    value={_pulls}
                    error={_pulls === ""}
                    helperText={`Max ${MAX_PULL_COUNT}`}
                    onFocus={handleFocus}
                    onChange={handleTextInputChage}
                    inputProps={{
                      inputMode: "numeric",
                      pattern: "[0-9]*",
                    }}
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField
                    fullWidth
                    name="pity"
                    label="Initial pity"
                    variant="outlined"
                    size="small"
                    margin="none"
                    value={_pity}
                    error={_pity === ""}
                    helperText="Between 0 and 98"
                    onFocus={handleFocus}
                    onChange={handleTextInputChage}
                    inputProps={{
                      inputMode: "numeric",
                      pattern: "[0-9]*",
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel htmlFor="banner-type">Banner type</InputLabel>
                    <Select
                      native
                      size="small"
                      label="Banner type"
                      inputProps={{
                        name: "banner-type",
                        id: "banner-type",
                      }}
                      onChange={handleSelectChange}
                    >
                      <option value="event">
                        Event (one rate-up 6⭐️, 50%)
                      </option>
                      <option value="standard">
                        Standard (two rate-up 6⭐️, each 25%)
                      </option>
                      <option value="limited">
                        Limited (two rate-up 6⭐️, each 35%)
                      </option>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Board>
          </Grid>

          <Grid item xs={12}>
            <Board title="Probabilities">
              <Grid container alignItems="center">
                <Grid item xs={8}>
                  <Typography variant="body1">
                    {!isXSmallScreen && "Chance of obtaining "}
                    <strong>
                      at least 1{bannerType !== "event" && " of any"}
                    </strong>{" "}
                    rate-up:
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography variant="h6" sx={{ pl: 2 }}>
                    {toPercentage(1 - finalOdds[0][0])}
                  </Typography>
                </Grid>
                {(bannerType === "standard" || bannerType === "limited") && (
                  <>
                    <Grid item xs={8}>
                      <Typography variant="body1">
                        {!isXSmallScreen && "Chance of obtaining "}
                        <strong>at least 1 of a specific</strong> rate-up:
                      </Typography>
                    </Grid>
                    <Grid item>
                      <Typography variant="h6" sx={{ pl: 2 }}>
                        {toPercentage(1 - finalOdds[0].reduce((a, b) => a + b))}
                      </Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography variant="body1">
                        {!isXSmallScreen && "Chance of obtaining "}
                        <strong>at least 1 of each</strong> rate-up:
                      </Typography>
                    </Grid>
                    <Grid item>
                      <Typography variant="h6" sx={{ pl: 2 }}>
                        {toPercentage(chanceOneOfEach(finalOdds))}
                      </Typography>
                    </Grid>
                  </>
                )}
              </Grid>
              <Divider />
              <Grid container alignItems="center">
                {[...Array(7).keys()].map((i) => (
                  <React.Fragment key={i}>
                    <Grid item xs={8}>
                      <Typography variant="body1">
                        {!isXSmallScreen && "Chance of obtaining "}
                        <strong>
                          {i === 6 ? "6 or more" : `exactly ${i}`}
                          {bannerType !== "event" && " of any"}
                        </strong>{" "}
                        rate-up
                        {i !== 1 && "s"}:
                      </Typography>
                    </Grid>
                    <Grid item>
                      <Typography variant="h6" sx={{ pl: 2 }}>
                        {toPercentage(
                          bannerType === "event"
                            ? finalOdds[i][0]
                            : chanceMultiRateups(finalOdds, i)
                        )}
                      </Typography>
                    </Grid>
                  </React.Fragment>
                ))}
              </Grid>
            </Board>
            {bannerType === "limited" && (
              <Typography variant="caption" sx={{ display: "block", mt: 2 }}>
                * Parametric system is not factored into these probabilities
              </Typography>
            )}
          </Grid>
        </Grid>
      </Box>
    </Layout>
  );
};
export default Rateup;
