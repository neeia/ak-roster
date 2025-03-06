import React, { useCallback, useMemo, useRef, useState } from "react";
import {
    Box,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    Slide,
    Stack,
    Switch,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import { TransitionProps } from '@mui/material/transitions';
import { Close } from "@mui/icons-material";
import itemsJson from "data/items.json";
import ItemBase from "../depot/ItemBase";
import DepotItem from "types/depotItem";
import { Item } from "types/item";
import canCompleteByCrafting from "util/fns/depot/canCompleteByCrafting";
import GoalData, { getPlannerGoals } from "types/goalData";
import getGoalIngredients from "util/fns/depot/getGoalIngredients";
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import FunctionsIcon from '@mui/icons-material/Functions';

interface Props {
    open: boolean;
    onClose: () => void;
    depot: Record<string, DepotItem>;
    goalData: GoalData[];
    expOwned: number;
    goalsMaterials: Record<string, number>;
}

const Transition = React.forwardRef(function Transition(
    props: TransitionProps & {
        children: React.ReactElement<any, any>;
    },
    ref: React.Ref<unknown>,
) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const MaterialsSummaryDialog = React.memo((props: Props) => {
    const { open, onClose, depot, expOwned, goalsMaterials, goalData } = props;
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
    const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
    const containerRef = useRef<HTMLElement>(null);

    const [view, setView] = useState('summary');
    const [isTotalDigits, setTotalToDidigts] = useState(false);

    const handleToggleChange = (event: React.MouseEvent<HTMLElement>, nextView: string) => {
        let toView = nextView;
        if (toView === null) {
            switch (view) {
                case "summary": toView = "statistic"
                    break;
                case "statistic": toView = "summary"
                    break;
            }
        }
        setView(toView);
    };

    const handleDigitsSwitch = (event: React.ChangeEvent<HTMLInputElement>) => {
        setTotalToDidigts(!event.target.checked);
    };

    const handleClose = () => {
        setView('summary');
        setTotalToDidigts(false);
        onClose();
    }

    const craftHighFromLowTier = (tier: number, materials: Record<string, number>) => {
        if (tier === 1) return;
        Object.values(itemsJson)
            .filter((item) => item.tier === tier
                && Number(item.id) > 30000 && Number(item.id) < 32000)
            .forEach((item) => {
                const itemJson: Item = item;;
                if (!itemJson.ingredients) return;
                const multiplier = itemJson.yield ?? 1;
                const crafted = itemJson.ingredients
                    .filter(ingr => materials[ingr.id])
                    .map(ingr => Math.floor(materials[ingr.id] / ingr.quantity))
                    .reduce((min, uses) => Math.min(min, uses), Infinity);
                materials[item.id] = materials[item.id] + crafted * multiplier;
            })
    };

    const goalsMaterialLinesUse = useCallback(() => {

        //not filtered goals materials
        const goalsMaterialsAll: Record<string, number> = {};

        goalData.flatMap((goal) => getPlannerGoals(goal))
            .flatMap(getGoalIngredients).forEach((ingr) => {
                if (Number(ingr.id) > 30000 && Number(ingr.id) < 32000) {
                    goalsMaterialsAll[ingr.id] = (goalsMaterialsAll[ingr.id] ?? 0) + ingr.quantity;
                }
            });

        //counting tiers 5 > 4 > 3 result
        Object.keys(goalsMaterialsAll)
            .filter((id) => itemsJson[id as keyof typeof itemsJson].tier > 3)
            .sort((a, b) => itemsJson[b as keyof typeof itemsJson].tier - itemsJson[a as keyof typeof itemsJson].tier)
            .forEach((id) => {
                const item = itemsJson[id as keyof typeof itemsJson] as Item;
                if (item.ingredients) {
                    const numCrafts = Math.ceil(goalsMaterialsAll[id] / (item.yield ?? 1));
                    item.ingredients.forEach((ingr) => {
                        if (Number(ingr.id) > 30000 && Number(ingr.id) < 32000) {
                            goalsMaterialsAll[ingr.id] = (goalsMaterialsAll[ingr.id] ?? 0) + ingr.quantity * numCrafts;
                        }
                    })
                }
            });

        //crafting tier 2 from ingredients
        craftHighFromLowTier(2, goalsMaterialsAll);
        //crafting tier 3 from ingredients
        craftHighFromLowTier(3, goalsMaterialsAll);

        //collecting tier 3 totals
        const tier3Materials = Object.keys(goalsMaterialsAll)
            .filter((id) => itemsJson[id as keyof typeof itemsJson].tier === 3)
            .reduce((acc, id) => {
                acc[id] = goalsMaterialsAll[id];
                return acc;
            }, {} as Record<string, number>);
        //summ all tier 3 quantities
        const tier3Total = Object.keys(tier3Materials)
            .reduce((acc: number, id: string) => acc + goalsMaterialsAll[id], 0);

        //calculate % from total
        const tier3TotalsWithPercents = Object.keys(tier3Materials).reduce((acc, id) => {
            acc[id] = {
                total: goalsMaterialsAll[id],
                percent: Math.round(10 * 100 * goalsMaterialsAll[id] / tier3Total) / 10
            };
            return acc;
        }, {} as Record<string, { total: number, percent: number }>);

        return tier3TotalsWithPercents;

    }, [goalData]
    );

    const calculateSummaryMaterials = useCallback(() => {

        //dont do background calculcation
        if (!open) return { sortedNeedToFarm: [], sortedNeedToCraft: [], sortedStatistic: [] };

        const craftTier = 4;
        //specific craftables of wrong tiers
        const includeCraftIds: string[] = [
            "30013", //Orirock Cluster
        ];
        const excludeCraftIds: string[] = [
            //"3302" //skill summary 2
        ];
        const excludeCraftNames: string[] = [
            " Chip", //any " Chips" and " Chip Packs"
            "Data", //module ingredients
        ];

        const localSortId: [string, number][] = [
            ["LMD", -3],
            ["EXP", -2],
            ["Certificate", -1],
            //all mats= 0
            ["Summary", 1],
            ["Catalyst", 3],
            ["chip", 2],
            ["Chip", 2],
            ["Data", 4],
        ];

        const _depot = { ...depot };
        _depot["EXP"] = { material_id: "EXP", stock: expOwned };

        const craftingList = Object.keys(_depot)
            .filter((id) => {
                const item: Item = itemsJson[id as keyof typeof itemsJson];
                return (
                    item.tier >= craftTier
                    && item.ingredients
                    && !excludeCraftIds.includes(id)
                    && !excludeCraftNames.some(keyword => item.name.includes(keyword))
                )
            })
            .concat(includeCraftIds);

        const _materialsNeeded = { ...goalsMaterials };

        //mutates _materialsNeeded
        canCompleteByCrafting(_materialsNeeded, _depot, craftingList);

        const sortedNeedToCraft = Object.entries(_materialsNeeded)
            .filter(([id, need]) => craftingList.includes(id) && need - _depot[id].stock > 0)
            .sort(([itemIdA], [itemIdB]) => {
                const itemA = itemsJson[itemIdA as keyof typeof itemsJson];
                const itemB = itemsJson[itemIdB as keyof typeof itemsJson];
                const itemAlocalSortID = localSortId.find(keyword => itemA.name.includes(keyword[0]))?.[1] ?? 0;
                const itemBlocalSortID = localSortId.find(keyword => itemB.name.includes(keyword[0]))?.[1] ?? 0;
                return (
                    (itemAlocalSortID - itemBlocalSortID) ||
                    (itemA.tier - itemB.tier) ||
                    (itemB.sortId - itemA.sortId)
                )
            })
            .map(([id, need]) => ([id, need - _depot[id].stock] as [string, number]));

        const sortedNeedToFarm = Object.entries(_materialsNeeded)
            .filter(([id, need]) => !craftingList.includes(id) && need - _depot[id].stock > 0)
            .sort(([itemIdA], [itemIdB]) => {
                const itemA = itemsJson[itemIdA as keyof typeof itemsJson];
                const itemB = itemsJson[itemIdB as keyof typeof itemsJson];
                const itemAlocalSortID = localSortId.find(keyword => itemA.name.includes(keyword[0]))?.[1] ?? 0;
                const itemBlocalSortID = localSortId.find(keyword => itemB.name.includes(keyword[0]))?.[1] ?? 0;
                return (
                    (itemAlocalSortID - itemBlocalSortID) ||
                    (_materialsNeeded[itemIdB] - _depot[itemIdB].stock) - (_materialsNeeded[itemIdA] - _depot[itemIdA].stock)
                );
            })
            .map(([id, need]) => ([id, need - _depot[id].stock] as [string, number]));

        const tier3Statistic = goalsMaterialLinesUse();

        const sortedStatistic = Object.entries(tier3Statistic)
            .sort(([, { percent: pA }], [, { percent: pB }]) => pB - pA)
            .map(([id, { total, percent }]) => [id, total, percent] as [string, number, number]);

        return { sortedNeedToFarm, sortedNeedToCraft, sortedStatistic }
    }, [open, goalsMaterials, depot, expOwned, goalsMaterialLinesUse]
    );

    const { sortedNeedToFarm, sortedNeedToCraft, sortedStatistic } = useMemo(calculateSummaryMaterials, [calculateSummaryMaterials]);

    const formatNumber = (num: number) => {
        return num < 1000
            ? num
            : num < 1000000
                ? `${num % 1000 === 0 ? `${num / 1000}` : (num / 1000).toFixed(1)}K`
                : `${num % 1000000 === 0 ? `${num / 1000000}` : (num / 1000000).toFixed(2)}M`;
    };

    const itemBaseSize = isMdUp ? 64 : 56;

    const numberCSS = {
        component: "span",
        sx: {
            display: "inline-block",
            py: 0.25,
            px: 0.5,
            lineHeight: 1,
            mr: `${itemBaseSize / 16}px`,
            mb: `${itemBaseSize / 16}px`,
            alignSelf: "end",
            justifySelf: "end",
            backgroundColor: "background.paper",
            zIndex: 1,
            fontSize: `${itemBaseSize / 24 + 12}px`,
        },
    };

    return (
        <>
            <Dialog
                open={open}
                onClose={handleClose}
                TransitionComponent={Transition}
                fullScreen={fullScreen}
                keepMounted fullWidth maxWidth="md">
                <DialogTitle
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        paddingBottom: "12px",
                    }}
                >
                    <Stack direction="row" justifyContent="flex-start" alignItems="center">
                        <ToggleButtonGroup
                            orientation="horizontal"
                            value={view}
                            exclusive
                            onChange={handleToggleChange}
                        >
                            <ToggleButton value="summary" aria-label="summary">
                                <FunctionsIcon />
                            </ToggleButton>
                            <ToggleButton value="statistic" aria-label="statistic">
                                <LeaderboardIcon />
                            </ToggleButton>
                        </ToggleButtonGroup>
                        <Typography
                            variant="h2"
                            sx={{
                                marginLeft: "8px",
                                paddingTop: "12px",
                            }}
                        >
                            {(view === "summary") ? "Active goals require" : "Statistic"}
                        </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="flex-end" alignItems="center">
                        {(view === "statistic") && (
                            <Stack direction="row" alignItems="center">
                                <Typography>∑</Typography>
                                <Switch
                                    checked={!isTotalDigits}
                                    onChange={handleDigitsSwitch}
                                    inputProps={{ 'aria-label': 'controlled' }}
                                />
                                <Typography>%</Typography>
                            </Stack>
                        )}
                        <IconButton onClick={handleClose} sx={{ display: { sm: "none" } }}>
                            <Close />
                        </IconButton>
                    </Stack>
                </DialogTitle>
                <DialogContent
                    sx={{
                        height: { sm: '500px' },
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                        "&::-webkit-scrollbar": {
                            display: "none",
                        },
                    }} ref={containerRef}
                > <Box component={"div"} display="flex">
                        <Slide container={containerRef.current}
                            in={view === "summary"}
                            direction="right"
                            timeout={{ enter: 500, exit: view != "summary" ? 1 : 400 }}
                            mountOnEnter
                            unmountOnExit>
                            <Box>
                                {sortedNeedToFarm.length === 0 && sortedNeedToCraft.length === 0 ? (
                                    <>
                                        <Typography variant="h3" p={2} fontWeight="bold">All requirements are met</Typography>
                                    </>
                                ) : (
                                    <>
                                        {sortedNeedToFarm.length > 0 ? (
                                            <>
                                                <Typography variant="h3" p={1} fontWeight="bold">Farm missing materials (or craft from lower tier) </Typography>
                                                {sortedNeedToFarm.map(([id, need]) => (
                                                    <ItemBase key={id} itemId={id} size={itemBaseSize}>
                                                        <Typography {...numberCSS}>
                                                            {formatNumber(need)}
                                                        </Typography>
                                                    </ItemBase>
                                                ))}
                                            </>
                                        ) : null}
                                        {sortedNeedToCraft.length > 0 ? (
                                            <>
                                                <Typography variant="h3" p={1} fontWeight="bold">Craft high tier materials</Typography>
                                                {sortedNeedToCraft
                                                    .map(([id, need]) => (
                                                        <ItemBase key={id} itemId={id} size={itemBaseSize}>
                                                            <Typography {...numberCSS}>
                                                                {formatNumber(need)}
                                                            </Typography>
                                                        </ItemBase>
                                                    ))}
                                            </>
                                        ) : null}
                                    </>
                                )}
                            </Box>
                        </Slide>
                        <Slide container={containerRef.current}
                            in={view === "statistic"}
                            direction="left"
                            timeout={{ enter: 500, exit: view === "summary" ? 1 : 400 }}
                            mountOnEnter
                            unmountOnExit>
                            <Box>
                                {sortedStatistic.length === 0 ? (
                                    <>
                                        <Typography variant="h3" p={2} fontWeight="bold">Add goals to see their statistic</Typography>
                                    </>)
                                    : (
                                        <>
                                            <Typography variant="h3" p={2} fontWeight="bold">
                                                Total usage of material types from costs of all user goals, converted to tier 3.
                                                <br />Calculated ignoring depot and filters.</Typography>
                                            {sortedStatistic.map(([id, total, percent]) => (
                                                <ItemBase key={id} itemId={id} size={itemBaseSize}>
                                                    <Typography {...numberCSS}>
                                                        {isTotalDigits ? formatNumber(total) : percent + "%"}
                                                    </Typography>
                                                </ItemBase>
                                            ))}
                                        </>
                                    )}
                            </Box>
                        </Slide>
                    </Box>
                </DialogContent>
            </Dialog>
        </>)

});

MaterialsSummaryDialog.displayName = "MaterialsSummaryDialog";
export default MaterialsSummaryDialog;