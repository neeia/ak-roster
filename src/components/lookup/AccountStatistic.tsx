import React from "react";
import operatorJson from "data/operators";
import { LookupData } from "util/hooks/useLookup";
import { OperatorData } from "types/operators/operator";
import { MAX_PROMOTION_BY_RARITY, MAX_LEVEL_BY_RARITY, getMaxPotentialById } from "util/changeOperator";
import { Box, Typography, Tooltip, useMediaQuery, useTheme, alpha, Theme } from "@mui/material";
import getContrastText from "util/fns/getContrastText";
import { rarityColors } from "styles/rarityColors";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

export type StatsEntry = {
  [key: number]: {
    have: number[];
    total?: number[];
  };
};

export type StatsData = {
  [key: string]: {
    entries: StatsEntry;
    have: number;
    total: number;
  };
};

const getRarityLabel = (rarity: number): string => `${rarity}★`;

const getRaritySpreadText = (values: number[], isForTooltip: boolean = true): string | React.ReactNode => {
  const rarityLabels = ['4★', '5★', '6★'];
  const parts = values
    .map((v, i) => (v > 0 ? { label: rarityLabels[i], value: v } : null))
    .filter(Boolean) as { label: string; value: number }[];

  if (parts.length === 0) return isForTooltip ? "" : null;

  if (isForTooltip) {
    const joined = parts.map(p => `${p.label}: ${p.value}`).join(`\u00A0\u00A0|\u00A0\u00A0`);
    return <Typography variant="body2">{joined}</Typography>;
  } else {
    return (
      <Box
        display="grid"
        width="100%"
        gridTemplateColumns={`repeat(${parts.length}, 1fr)`}
        columnGap={1}
        alignItems="center"
        sx={{ ml: 1, mr: 1 }}
      >
        {parts.map((p) => (
          <Box
            key={p.label}
            display="flex"
            justifyContent="center"
            alignItems="center"
            sx={{
              px: 0.5,
              py: 0.25,
              borderRadius: 0.5,
              backgroundColor: (theme) => getBlurredBackground(theme),
            }}
          >
            <Typography
              variant="body2"
              sx={{ fontSize: "0.8rem", whiteSpace: "nowrap" }}
            >
              {p.label}: {p.value}
            </Typography>
          </Box>
        ))}
      </Box>
    );
  }
};

const renderGridStat = (label: string, values: number[], total?: number) => {
  const _total = total ?? values.reduce((sum, v) => sum + v, 0);
  if (_total === 0) return null;

  return (
    <React.Fragment key={label}>
      <Typography variant="body2" sx={{ fontWeight: 500 }}>
        {label}
      </Typography>
      <Typography variant="body2" textAlign="center">{_total}</Typography>
      {values.map((v, i) => (
        <Typography key={i} variant="body2" textAlign="center">
          {v > 0 ? v : "–"}
        </Typography>
      ))}
    </React.Fragment>
  );
};

const renderTooltipStat = (values: number[], label: string, total?: number) => {
  const _total = total ?? values.reduce((sum, v) => sum + v, 0);
  if (_total === 0) return null;

  const spreadText = getRaritySpreadText(values);
  return (
    <Tooltip key={label} title={spreadText} arrow
      PopperProps={{
        modifiers: [
          {
            name: "offset",
            options: {
              offset: [0, 5],
            },
          },
        ],
      }}>
      <Typography
        variant="body2"
        sx={{
          display: 'inline',
          transition: 'opacity 0.2s ease',
          cursor: 'help',
          '&:hover': { opacity: 0.6 },
        }}
      >
        {label}: {_total}
      </Typography>
    </Tooltip>
  );
};

function incrementStats(
  stats: StatsData,
  key: keyof StatsData,
  entryKey: number,
  index: number,
  isTotal = false,
  value: number = 1,
) {
  if (!stats[key].entries[entryKey]) {
    stats[key].entries[entryKey] = { have: [0, 0, 0] };
  }
  const entry = stats[key].entries[entryKey];

  const ensureArrayLength = (arr: number[] | undefined, idx: number): number[] => {
    const newArr = arr ? [...arr] : [];
    while (newArr.length <= idx) newArr.push(0);
    return newArr;
  };
  entry.have = ensureArrayLength(entry.have, index);
  if (entry.total) {
    entry.total = ensureArrayLength(entry.total, index);
  }

  if (isTotal) {
    if (entry.total) {
      entry.total[index] += value;
    }
    if (entryKey === 0) {
      stats[key].total += value;
    }
  } else {
    entry.have[index] += value;
    if (entryKey === 0) {
      stats[key].have += value;
    }
  }
}

function isOperatorVisible(opData: OperatorData, isCn: boolean): boolean {
  return isCn || !opData.isCnOnly;
}

const getBlurredBackground = (theme: Theme) => ({
  backgroundColor: alpha(theme.palette.background.paper, 0.8),
  backdropFilter: "blur(24px) grayscale(50%)"
});

const StatsTable: React.FC<{
  stats: StatsData;
  isMobile: boolean;
  color: string;
}> = ({ stats, isMobile, color }) => {
  const rarities = [6, 5, 4, 3, 2, 1];

  const statColumns = [
    { key: 'rarity', label: 'Operators' },
    { key: 'elite1', label: 'Elite 1' },
    { key: 'elite2', label: 'Elite 2' },
    { key: 'levelMax', label: 'Max Level' },
    { key: 'potentialMax', label: 'Max Potential' },
  ];

  const renderStatCell = (
    have: number,
    totalSource: number,
    showTotal: boolean = false
  ) => {
    const shouldShowTotal = showTotal && have !== totalSource;
    const displayValue = shouldShowTotal ? `${have} / ${totalSource}` : have;
    const isFull = have === totalSource;

    return (
      <Typography variant="body2"
        sx={{
          textAlign: 'center',
          p: 0.5,
          color: isFull ? color : 'inherit'
        }}
      >
        {have === 0 ? '-' : displayValue}
      </Typography>
    );
  };

  const isColumnFull = (statKey: string): boolean => {
    const stat = stats[statKey];
    if (!stat || !stat.have) return false;
    const have = stat.have;
    let total = stat.total;
    if (statKey === "rarity") {
      total = stats.rarity.total;
    }
    return have === total;
  };

  return (
    <Box sx={{
      display: 'grid',
      gridTemplateColumns: `auto repeat(${statColumns.length}, 1fr)`,
      gap: 1,
      fontSize: '12px',
      p: isMobile ? 1 : 0,
      pt: 0,
    }}>
      <Box display="flex" alignItems="center" justifyContent="center">
        <Typography variant="body2" sx={{
          fontWeight: 'bold', p: 0.5,
          backgroundColor: (theme) => getBlurredBackground(theme)
        }}>★</Typography>
      </Box>
      {statColumns.map(col => (
        <Box key={col.key} display="flex" alignItems="center" justifyContent="center">
          <Typography variant="body2"
            sx={{
              textAlign: 'center',
              color: isColumnFull(col.key) ? color : 'inherit',
              borderRadius: 1,
              p: 0.5,
              fontWeight: 'bold',
              backgroundColor: (theme) => getBlurredBackground(theme)
            }}
          >
            {col.label}
          </Typography></Box>
      ))}

      {rarities.map(rarity => {
        const rarityIndex = rarity - 1;
        const rarityHave = stats.rarity.entries[0].have[rarityIndex];
        const rarityTotal = stats.rarity.entries[0].total?.[rarityIndex] || 0;

        return (
          <React.Fragment key={rarity}>
            <Typography variant="body2" sx={{
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: 0.5,
              backgroundColor: (theme) => getBlurredBackground(theme)
            }}>
              {getRarityLabel(rarity)}
            </Typography>
            {renderStatCell(rarityHave, rarityTotal, true)}
            {renderStatCell(stats.elite1.entries[0].have[rarityIndex], rarityHave)}
            {renderStatCell(stats.elite2.entries[0].have[rarityIndex], rarityHave)}
            {renderStatCell(stats.levelMax.entries[0].have[rarityIndex], rarityHave)}
            {renderStatCell(stats.potentialMax.entries[0].have[rarityIndex], rarityHave)}
          </React.Fragment>
        );
      })}
    </Box>
  );
};

const TitleBar: React.FC<{
  isMobile: boolean;
  collapsed: boolean;
  ownedOperators: number;
  totalOperators: number;
  theme: Theme;
}> = ({ isMobile, collapsed, ownedOperators, totalOperators, theme }) => {
  const pct = totalOperators === 0 ? 0 : (ownedOperators / totalOperators * 100);
  return (
    <Typography variant="h3" component="h2"
      width={{ xs: "stretch", sm: "fit-content" }}
      ml={{ xs: 0, sm: 'auto' }} mr='auto'
      sx={{
        ...getBlurredBackground(theme),
        fontSize: "16px",
        display: 'block',
        textAlign: { xs: 'left', sm: 'center' },
        pb: 0,
        mb: 1,
      }}
    >
      <Box display="flex" alignItems="center">
        {isMobile && (collapsed ? <ExpandMoreIcon /> : <ExpandLessIcon />)}
        {isMobile && (<span style={{ marginLeft: isMobile ? 8 : 4 }}>Account Statistics: </span>)}
        <span style={{ marginLeft: isMobile ? 8 : 4, marginRight: isMobile ? 8 : 4 }}>{ownedOperators} / {totalOperators} - {pct.toFixed(1)}%</span>
        {isMobile && (collapsed ? <ExpandMoreIcon sx={{ ml: "auto" }} /> : <ExpandLessIcon sx={{ ml: "auto" }} />)}
      </Box>
    </Typography>
  );
};

const RarityBar: React.FC<{
  stats: StatsData;
  isMobile: boolean;
  color: string;
  theme: Theme;
  toggleOnMobile?: boolean;
}> = ({ stats, isMobile, color, theme }) => {
  const rarityStats = stats.rarity.entries[0];
  const totalOperators = stats.rarity.total;
  const ownedOperators = stats.rarity.have;

  return (
    <Tooltip
      title={<StatsTable stats={stats} isMobile={false} color={color} />}
      arrow
      placement="bottom"
      slotProps={{
        tooltip: {
          sx: {
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            maxWidth: 'none',
          }
        }
      }}
      disableHoverListener={isMobile}
      disableFocusListener={isMobile}
      disableTouchListener={isMobile}
    >
      <Box sx={{ mb: 0.5, cursor: isMobile ? 'default' : 'help' }}>
        <Box sx={{
          display: 'flex',
          height: 25,
          width: '100%',
          borderRadius: 1,
          overflow: 'hidden',
          position: 'relative',
          backgroundColor: "#666666",
        }}>
          {rarityStats.total?.map((total, index) => {
            if (total === 0) return null;

            const have = rarityStats.have[index];
            const percentage = (total / totalOperators) * 100;
            const havePercentage = (have / total) * percentage;

            const minWidthForDigits = isMobile ? 6 : 4; // percent
            const minWidthForFullText = isMobile ? 12 : 8;

            let showText = false;
            let textToShow = '';

            if (have === total) {
              if (havePercentage >= minWidthForDigits) {
                showText = true;
                textToShow = `${have}`;
              }
            } else {
              if (havePercentage >= minWidthForFullText) {
                showText = true;
                textToShow = `${have}/${total}`;
              } else if (havePercentage >= minWidthForDigits) {
                showText = true;
                textToShow = `${have}`;
              }
            }

            return (
              <Box
                key={index}
                sx={{
                  width: `${havePercentage}%`,
                  backgroundColor: rarityColors[index + 1],
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {showText && (
                  <Typography
                    variant="caption"
                    sx={{
                      color: getContrastText(rarityColors[index + 1]),
                      textShadow: '1px 1px 1px rgba(0,0,0,0.5)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      px: 0.5
                    }}
                  >
                    {textToShow}
                  </Typography>
                )}
              </Box>
            );
          })}

          {ownedOperators < totalOperators && (
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: "transparent",
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: getContrastText("#666666"),
                  textShadow: '1px 1px 1px rgba(255, 255, 255, 0.5)',
                }}
              >
                {((totalOperators - ownedOperators) / totalOperators * 100).toFixed(1)}%
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Tooltip>
  );
};

/* Unified StatBlock (used both for Masteries and Modules) */
const StatBlock: React.FC<{
  title: string;
  entries: any;
  opEntries?: any;
  theme: Theme;
  color: string;
  isMobile?: boolean;
  collapsed?: boolean;
}> = ({
  title,
  entries,
  opEntries,
  theme,
  color,
  isMobile = false,
  collapsed = false,
}) => {
    const topHave = entries.entries[0].have;
    const topTotal = entries.have;

    const isModules = title === "Modules";
    const prefix = isModules ? "L" : "M";

    // Desktop layout
    if (!isMobile) {
      if (topTotal === 0) return <Box width={0} height={0}></Box>
      const titleOpsElement = (<Typography variant="body2">
        Ops w/:
      </Typography>)
      return (
        <Box
          sx={{
            ...getBlurredBackground(theme),
            borderRadius: 1,
            p: 1,
            pt: 0, pb: 0,
            minWidth: 120,
            display: "flex",
            flexDirection: "column",
            alignItems: "center"
          }}
        >
          {/* Row 1 — levels progression */}
          <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
            {renderTooltipStat(topHave, title, topTotal)}
            {[1, 2, 3].map((lvl) =>
              renderTooltipStat(entries.entries[lvl].have, `${prefix}${lvl}`)
            )}
          </Box>

          {/* Row 2 — Operator-based progression */}
          {opEntries && (
            <Box
              mt={0.5}
              display="flex"
              alignItems="center"
              gap={1}
              flexWrap="wrap"
            >
              {isModules ? (
                (() => {
                  const entries = opEntries.entries as StatsEntry;
                  const hasL3s = Object.entries(entries).some(([k, { have }]) => Number(k) >= 6 && have.some(v => v > 0));

                  return (
                    <>
                      {titleOpsElement}
                      {/* module operator counts (1–5) */}
                      {[1, 2, 3, 4, 5]
                        .filter((k) => entries[k])
                        .map((k) =>
                          renderTooltipStat(entries[k].have, `${k}`)
                        )}

                      {/* show "L3s:" + their group */}
                      {hasL3s && (
                        <>
                          <Typography variant="body2" sx={{ mx: 0.5 }}>
                            L3s:
                          </Typography>
                          {[6, 9, 12, 15]
                            .filter((k) => entries[k])
                            .map((k) =>
                              renderTooltipStat(entries[k].have, `${k / 3}`)
                            )}
                        </>
                      )}
                    </>
                  );
                })()
              ) : (<>
                {titleOpsElement}
                {/* Masteries (M3, M6, M9) */}
                {[3, 6, 9].map((lvl) =>
                  renderTooltipStat(
                    opEntries.entries[lvl]?.have ?? [0, 0, 0],
                    `${prefix}${lvl}`
                  )
                )}
              </>)}
            </Box>
          )}
        </Box>
      );
    }

    // Mobile expanded layout (grid)
    if (isMobile && !collapsed) {
      return (
        <>
          {/* Row 1 */}
          {renderGridStat(title, entries.entries[0].have, entries.have)}
          {[1, 2, 3].map((lvl) =>
            renderGridStat(`${prefix}${lvl}`, entries.entries[lvl].have)
          )}

          {/* Row 2 */}
          {opEntries && (
            <>
              <Typography
                variant="body2"
                gridColumn="1 / -1"
                textAlign="left"
                width="100%"

              >
                Operators with:
              </Typography>

              {isModules ? (
                (() => {
                  const entries = opEntries.entries as StatsEntry;
                  const hasL3s = Object.entries(entries).some(([k, { have }]) => Number(k) >= 6 && have.some(v => v > 0));
                  return (<>
                    {[1, 2, 3, 4, 5]
                      .filter((k) => entries[k])
                      .map((k) =>
                        renderGridStat(`${k}`, entries[k].have)
                      )}
                    {hasL3s && (
                      <>
                        <Typography
                          variant="body2"
                          gridColumn="1 / -1"
                          textAlign="left"
                          width="100%"
                        >
                          with several Level3:
                        </Typography>
                        {[6, 9, 12, 15]
                          .filter((k) => entries[k])
                          .map((k) =>
                            renderGridStat(`${k / 3}`, entries[k].have,)
                          )}
                      </>
                    )}
                  </>)
                })()
              ) : [3, 6, 9].map((lvl) =>
                renderGridStat(
                  `${prefix}${lvl}`,
                  opEntries.entries[lvl]?.have ?? [0, 0, 0]
                )
              )}
            </>
          )}
        </>
      );
    }

    // Collapsed (mobile)
    return null;
  };

/* Views */
const MobileCollapsedView: React.FC<{ stats: StatsData }> = ({ stats }) => {
  const masteriesHave = stats.masteries.have;
  const modulesHave = stats.modules.have;

  return (
    <Box m={1} mt={0} display="grid" rowGap={0.5} columnGap={1} gridTemplateColumns="repeat(6, 1fr)">

      <Typography variant="body2" fontWeight="bold" gridColumn="1 / 2"
        sx={{ backgroundColor: (theme) => getBlurredBackground(theme) }}>
        Masteries:
      </Typography>
      <Typography variant="body2" fontWeight="bold" gridColumn="2 / 3" textAlign="center"
        sx={{ backgroundColor: (theme) => getBlurredBackground(theme) }}>
        {masteriesHave}
      </Typography>
      <Box gridColumn="3 / 7">
        {getRaritySpreadText(stats.masteries.entries[0].have, false)}
      </Box>
      <Typography variant="body2" fontWeight="bold" gridColumn="1 / 2"
        sx={{ backgroundColor: (theme) => getBlurredBackground(theme) }}>
        Modules:
      </Typography>
      <Typography variant="body2" fontWeight="bold" gridColumn="2 / 3" textAlign="center"
        sx={{ backgroundColor: (theme) => getBlurredBackground(theme) }}>
        {modulesHave}
      </Typography>
      <Box gridColumn="3 / 7">
        {getRaritySpreadText(stats.modules.entries[0].have, false)}
      </Box>
    </Box>
  );
};

const MobileExpandedView: React.FC<{ stats: StatsData; color: string; theme: Theme }> = ({ stats, color, theme }) => {
  return (
    <Box sx={{
      display: 'grid',
      gridTemplateColumns: "auto repeat(4, 1fr)",
      gap: 0.5,
      alignItems: "center",
      m: 1,
    }}>
      {/* Header row */}
      <Typography variant="body2" fontWeight="bold" />
      {["All", "4★", "5★", "6★"].map(label => (
        <Typography key={label} variant="body2" fontWeight="bold" textAlign="center"
          sx={{ backgroundColor: (theme) => getBlurredBackground(theme) }}>{label}</Typography>
      ))}

      {/* Masteries rows (merged grid group) */}
      <StatBlock title="Masteries" entries={stats.masteries} opEntries={stats.masteryOperators} theme={theme} color={color} isMobile collapsed={false} />

      {/* Modules rows */}
      <StatBlock title="Modules" entries={stats.modules} opEntries={stats.moduleOperators} theme={theme} color={color} isMobile collapsed={false} />
    </Box>
  );
};

const DesktopView: React.FC<{ stats: StatsData; color: string; theme: Theme }> = ({ stats, color, theme }) => {
  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'flex-start',
      gap: 1,
    }}>
      <StatBlock title="Masteries" entries={stats.masteries} opEntries={stats.masteryOperators} theme={theme} color={color} />
      <StatBlock title="Modules" entries={stats.modules} opEntries={stats.moduleOperators} theme={theme} color={color} />
    </Box>
  );
};

const AccountStatistic: React.FC<{
  data: NonNullable<LookupData>;
  color?: string;
  collapsed: boolean;
  setCollapsed: (v: React.SetStateAction<boolean>) => void;
}> = ({ data, color = "primary.main", collapsed, setCollapsed }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { roster, account } = data;
  const isCn = (account.server ?? "").toLowerCase() === "cn" || ["官服", "B服"].includes((account.server ?? ""));

  const stats = React.useMemo<StatsData>(() => {
    const s: StatsData = {
      rarity: { entries: { 0: { have: [0, 0, 0, 0, 0, 0], total: [0, 0, 0, 0, 0, 0] } }, have: 0, total: 0 },
      elite1: { entries: { 0: { have: [0, 0, 0, 0, 0, 0], total: [0, 0, 0, 0, 0, 0] } }, have: 0, total: 0 },
      elite2: { entries: { 0: { have: [0, 0, 0, 0, 0, 0], total: [0, 0, 0, 0, 0, 0] } }, have: 0, total: 0 },
      potentialMax: { entries: { 0: { have: [0, 0, 0, 0, 0, 0] } }, have: 0, total: 0 },
      levelMax: { entries: { 0: { have: [0, 0, 0, 0, 0, 0] } }, have: 0, total: 0 },
      masteries: {
        entries: {
          0: { have: [0, 0, 0], total: [0, 0, 0] },
          1: { have: [0, 0, 0] },
          2: { have: [0, 0, 0] },
          3: { have: [0, 0, 0] },
        },
        have: 0,
        total: 0,
      },
      modules: {
        entries: {
          0: { have: [0, 0, 0], total: [0, 0, 0] },
          1: { have: [0, 0, 0] },
          2: { have: [0, 0, 0] },
          3: { have: [0, 0, 0] },
        },
        have: 0,
        total: 0,
      },
      masteryOperators: {
        entries: {
          1: { have: [0, 0, 0] },
          2: { have: [0, 0, 0] },
          3: { have: [0, 0, 0] },
          6: { have: [0, 0, 0] },
          9: { have: [0, 0, 0] },
        },
        have: 0,
        total: 0,
      },
      moduleOperators: {
        entries: {
          1: { have: [0, 0, 0] },
          2: { have: [0, 0, 0] },
          3: { have: [0, 0, 0] },
          6: { have: [0, 0, 0] },
          9: { have: [0, 0, 0] },
        },
        have: 0,
        total: 0,
      },
    };

    for (const [opId, opData] of Object.entries(operatorJson)) {
      const rarityIndex = Math.max(0, Math.min(5, (opData.rarity ?? 1) - 1)); // 1-6 -> 0-5
      const ri = Math.max(0, rarityIndex - 3); // 0-2 for 4..6
      const toTotals = true;
      const toHave = !toTotals
      const ownedOp = roster[opId];

      //count totals server based - but prioritise user-input - in case krooster lags updates.
      if (ownedOp || isOperatorVisible(opData, isCn)) {
        //rarity totals
        incrementStats(s, "rarity", 0, rarityIndex, toTotals);
        //Elite1 & Elite2 totals
        const maxPromotion = MAX_PROMOTION_BY_RARITY[opData.rarity];
        if (maxPromotion >= 1) incrementStats(s, "elite1", 0, rarityIndex, toTotals);
        if (maxPromotion === 2) incrementStats(s, "elite2", 0, rarityIndex, toTotals);

        //modules & masteries totals
        if (opData.rarity >= 4) {
          const mSkillsAmount = (opData.skillData ?? []).filter((sd) => (sd.masteries?.length ?? 0) > 0).length;
          incrementStats(s, "masteries", 0, ri, toTotals, mSkillsAmount);

          const modsAmount = (opData.moduleData ?? [])
            .filter((md) => (md.stages?.length ?? 0) > 0 && (!md.isCnOnly || isCn)).length;
          incrementStats(s, "modules", 0, ri, toTotals, modsAmount);
        }
      }
      //count for owned ops
      if (ownedOp) {
        incrementStats(s, "rarity", 0, rarityIndex);

        const elite = ownedOp.elite;
        if (elite >= 1) incrementStats(s, "elite1", 0, rarityIndex);
        if (elite === 2) incrementStats(s, "elite2", 0, rarityIndex);

        const maxLevel = MAX_LEVEL_BY_RARITY[opData.rarity][MAX_PROMOTION_BY_RARITY[opData.rarity]];
        const isMaxLevel = ownedOp.elite === MAX_PROMOTION_BY_RARITY[opData.rarity] && ownedOp.level === maxLevel;
        if (isMaxLevel) incrementStats(s, "levelMax", 0, rarityIndex);

        const maxPotential = getMaxPotentialById(opId);
        if (maxPotential === ownedOp.potential) incrementStats(s, "potentialMax", 0, rarityIndex);

        if (opData.rarity >= 4) {
          const masteryLevels = Array.isArray(ownedOp.masteries) ? ownedOp.masteries : [];
          const m1Count = masteryLevels.filter((lvl) => lvl === 1).length;
          const m2Count = masteryLevels.filter((lvl) => lvl === 2).length;
          const m3Count = masteryLevels.filter((lvl) => lvl === 3).length;

          incrementStats(s, "masteries", 0, ri, toHave, m1Count + m2Count + m3Count);
          if (m1Count > 0) incrementStats(s, "masteries", 1, ri, toHave, m1Count);
          if (m2Count > 0) incrementStats(s, "masteries", 2, ri, toHave, m2Count);
          if (m3Count > 0) incrementStats(s, "masteries", 3, ri, toHave, m3Count);

          if (m1Count > 0) incrementStats(s, "masteryOperators", 1, ri);
          if (m2Count > 0) incrementStats(s, "masteryOperators", 2, ri);
          if (m3Count > 0) incrementStats(s, "masteryOperators", 3, ri);
          if (m3Count === 2) incrementStats(s, "masteryOperators", 6, ri);
          if (m3Count === 3) incrementStats(s, "masteryOperators", 9, ri);
        }

        const moduleLevels = Object.values(ownedOp.modules ?? {});
        const totalModules = moduleLevels.filter((lvl) => lvl > 0).length;

        //number of lvl
        const l1Count = moduleLevels.filter((lvl) => lvl === 1).length;
        const l2Count = moduleLevels.filter((lvl) => lvl === 2).length;
        const l3Count = moduleLevels.filter((lvl) => lvl === 3).length;

        // total have
        incrementStats(s, "modules", 0, ri, toHave, l1Count + l2Count + l3Count);
        // have levels
        if (l1Count > 0) incrementStats(s, "modules", 1, ri, toHave, l1Count);
        if (l2Count > 0) incrementStats(s, "modules", 2, ri, toHave, l2Count);
        if (l3Count > 0) incrementStats(s, "modules", 3, ri, toHave, l3Count);

        // operator counts - any level module
        if (totalModules === 1) incrementStats(s, "moduleOperators", 1, ri);
        if (totalModules === 2) incrementStats(s, "moduleOperators", 2, ri);
        if (totalModules === 3) incrementStats(s, "moduleOperators", 3, ri);
        if (totalModules === 4) incrementStats(s, "moduleOperators", 4, ri);
        if (totalModules === 5) incrementStats(s, "moduleOperators", 5, ri);

        // operator counts — lvl 3 modules
        if (l3Count === 2) incrementStats(s, "moduleOperators", 6, ri);
        if (l3Count === 3) incrementStats(s, "moduleOperators", 9, ri);
        if (l3Count === 4) incrementStats(s, "moduleOperators", 12, ri);
        if (l3Count === 5) incrementStats(s, "moduleOperators", 15, ri);
      }
    }

    return s;
  }, [roster, isCn]);

  if (!stats.rarity) return null;

  const totalOperators = stats.rarity.total;
  const ownedOperators = stats.rarity.have;

  const handleToggle = () => {
    if (isMobile) setCollapsed(prev => !prev);
  };

  return (
    <Box
      onClick={handleToggle}
      sx={{
        position: isMobile ? 'relative' : 'absolute',
        top: isMobile ? 'auto' : 10,
        left: 0,
        right: 0,
        pt: 1,
        ml: isMobile ? 1 : 0,
        mr: isMobile ? 1 : 0,
        borderRadius: 1,
        zIndex: 10,
        maxHeight: !isMobile ? 'auto' : collapsed ? '20vh' : 'auto',
      }}
    >
      <TitleBar
        isMobile={isMobile}
        collapsed={collapsed}
        ownedOperators={ownedOperators}
        totalOperators={totalOperators}
        theme={theme}
      />

      <RarityBar stats={stats} isMobile={isMobile} color={color} theme={theme} />

      {/* Mobile StatsTable (expanded) */}
      {isMobile && !collapsed && <StatsTable stats={stats} isMobile color={color} />}

      {/* Main blocks */}
      {isMobile ? (
        collapsed ? (
          <Box sx={{ mt: 1 }}>
            <MobileCollapsedView stats={stats} />
          </Box>
        ) : (
          <Box sx={{ mt: 1 }}>
            <MobileExpandedView stats={stats} color={color} theme={theme} />
          </Box>
        )
      ) : (
        <Box>
          <DesktopView stats={stats} color={color} theme={theme} />
        </Box>
      )}
    </Box>
  );
};

export default AccountStatistic;
