import React, { useCallback, useMemo, useRef, useState } from "react";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
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
import DoubleArrowIcon from "@mui/icons-material/DoubleArrow";
import { EventsData, Event } from "types/localStorageSettings";

interface Props {
    open: boolean;
    onClose: () => void;
    depot: Record<string, DepotItem>;
    goalData: GoalData[];
    expOwned: number;
    goalsMaterials: Record<string, number>;
    openEvents: (state: boolean) => void;
    eventsData: EventsData;
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
    const { open, onClose, depot, expOwned, goalsMaterials, goalData, openEvents, eventsData } = props;
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
    const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
    const containerRef = useRef<HTMLElement>(null);

    const [tab, setTab] = useState('summary');
    const [isTotalDigits, setTotalToDidigts] = useState(false);

    const [selectedEventIndex, setSelectedEventIndex] = useState(-1);
    const [isSelectFinished, setIsSelectFinished] = useState(false);

    const handleToggleChange = (event: React.MouseEvent<HTMLElement>, nextTab: string) => {
        let toTab = nextTab;
        if (toTab === null) {
            switch (tab) {
                case "summary": toTab = "statistic"
                    break;
                case "statistic": toTab = "summary"
                    break;
            }
        }
        setTab(toTab);
    };

    const handleDigitsSwitch = (event: React.ChangeEvent<HTMLInputElement>) => {
        setTotalToDidigts(!event.target.checked);
    };

    const handleClose = () => {
        setTab('summary');
        setTotalToDidigts(false);
        setIsSelectFinished(false);
        setSelectedEventIndex(-1);
        onClose();
    }

    const getMaterialsFromGoalData = (goalData: GoalData[]) => {

        const _materialsFromGoals: Record<string, number> = {};

        goalData.flatMap((goal) => getPlannerGoals(goal))
            .flatMap(getGoalIngredients).forEach((ingr) => {
                if (Number(ingr.id) > 30000 && Number(ingr.id) < 32000) {
                    _materialsFromGoals[ingr.id] = (_materialsFromGoals[ingr.id] ?? 0) + ingr.quantity;
                }
            });

        return _materialsFromGoals;

    };

    const addMatsToTierFromAllTiersHigher = (materials: Record<string, number>, toTier: number) => {

        Object.keys(materials)
            .filter((id) => itemsJson[id as keyof typeof itemsJson].tier > toTier)
            .sort((a, b) => itemsJson[b as keyof typeof itemsJson].tier - itemsJson[a as keyof typeof itemsJson].tier)
            .forEach((id) => {
                const item = itemsJson[id as keyof typeof itemsJson] as Item;
                if (item.ingredients) {
                    const numCrafts = Math.ceil(materials[id] / (item.yield ?? 1));
                    item.ingredients.forEach((ingr) => {
                        if (Number(ingr.id) > 30000 && Number(ingr.id) < 32000) {
                            materials[ingr.id] = (materials[ingr.id] ?? 0) + ingr.quantity * numCrafts;
                        }
                    })
                }
            });
    };

    const addMatsToTierFromPreviousTier = (materials: Record<string, number>, toTier: number, includeSkillSummaries?: boolean) => {
        if (toTier === 1) return;
        Object.values(itemsJson)
            .filter((item) => item.tier === toTier
                && (Number(item.id) > 3300 && includeSkillSummaries || Number(item.id) > 30000)
                && Number(item.id) < 32000)
            .forEach((item) => {
                const itemJson: Item = item;
                if (!itemJson.ingredients) return;
                const multiplier = itemJson.yield ?? 1;
                const crafted = itemJson.ingredients
                    .filter(ingr => materials[ingr.id])
                    .map(ingr => Math.floor(materials[ingr.id] / ingr.quantity))
                    .reduce((min, uses) => Math.min(min, uses), Infinity);
                if (crafted != Infinity && crafted != 0) {
                    materials[item.id] = (materials[item.id] ?? 0) + crafted * multiplier;
                    //fully remove ingrediets
                    itemJson.ingredients.forEach(ingr => {
                        /* materials[ingr.id] -= crafted * ingr.quantity;
                        if (materials[ingr.id] <= 0) { */
                        delete materials[ingr.id];
                        /* } */
                    });
                }
            });
    };

    const getAmountAndStatsOfTier = (materials: Record<string, number>, tier: number) => {

        const _materials = { ...materials };

        const _tierMaterials = Object.keys(_materials)
            .filter((id) => itemsJson[id as keyof typeof itemsJson].tier === tier)
            .reduce((acc, id) => {
                acc[id] = _materials[id];
                return acc;
            }, {} as Record<string, number>);

        const _tierTotal = Object.keys(_tierMaterials)
            .reduce((acc: number, id: string) => acc + _materials[id], 0);

        const _tierTotalsWithPercents = Object.keys(_tierMaterials).reduce((acc, id) => {
            acc[id] = {
                total: _materials[id],
                percent: Math.round(10 * 100 * _materials[id] / _tierTotal) / 10
            };
            return acc;
        }, {} as Record<string, { total: number, percent: number }>);

        return _tierTotalsWithPercents;
    };

    const getTier3StatisticFromMaterials = useCallback((materials: Record<string, number>) => {

        const _materials = { ...materials };

        addMatsToTierFromAllTiersHigher(_materials, 3);
        addMatsToTierFromPreviousTier(_materials, 2);
        addMatsToTierFromPreviousTier(_materials, 3);

        return getAmountAndStatsOfTier(_materials, 3);
    }, []
    );

    const onEventChange = (index: number) => {
        setSelectedEventIndex(index);
        setIsSelectFinished(true);
    }

    const getTotalMaterialsUptoSelectedEvent = useCallback(() => {
        const _eventMaterials = Object.entries(eventsData)
            .filter(([, eventData]) => eventData.index <= selectedEventIndex)
            .reduce((acc, [, eventData]) => {
                if (!eventData.materials) return acc;
                Object.entries(eventData.materials).forEach(([id, quantity]) => {
                    acc[id] = (acc[id] ?? 0) + quantity;
                });
                return acc;
            }, {} as Record<string, number>);
        return _eventMaterials;
    }, [selectedEventIndex, eventsData]
    );

    const localSortId: [string, number][] = useMemo(() => [
        ["LMD", -3],
        ["EXP", -2],
        ["Certificate", -1],
        //all mats= 0
        ["Summary", 1],
        ["Catalyst", 3],
        ["chip", 2],
        ["Chip", 2],
        ["Data", 4],
    ], []);

    const customItemsSort = useCallback((idA: string, idB: string, lowTierFirst: boolean = false) => {
        const itemA = itemsJson[idA as keyof typeof itemsJson];
        const itemB = itemsJson[idB as keyof typeof itemsJson];
        const itemAlocalSortID = localSortId.find(keyword => itemA.name.includes(keyword[0]))?.[1] ?? 0;
        const itemBlocalSortID = localSortId.find(keyword => itemB.name.includes(keyword[0]))?.[1] ?? 0;
        return (
            (itemAlocalSortID - itemBlocalSortID) ||
            (!lowTierFirst ? (itemB.tier - itemA.tier) : (itemA.tier - itemB.tier)) ||
            (itemB.sortId - itemA.sortId)
        )
    }, [localSortId]
    )

    const calculateSummaryTab = useCallback(() => {

        //dont do background calculcation
        if (!open) return {
            sortedNeedToFarm: [],
            sortedNeedToCraft: [],
            sortedPossibleCraft: [],
            eventsList: [],
            sortedEventMaterials: []
        };

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

        // Create a copy of depot from itemsJson list of items to have full itemsList for calcs
        const _depot = Object.fromEntries(
            Object.keys(itemsJson).map((key) => [
                key,
                { material_id: key, stock: depot[key]?.stock ?? 0 },
            ])
        );

        _depot["EXP"] = { material_id: "EXP", stock: expOwned };

        //+eventsData: count events mats and add them to depot
        const eventsList = Object.entries(eventsData)
            .sort(([, a], [, b]) => a.index - b.index)

        const _eventMaterials = getTotalMaterialsUptoSelectedEvent();

        Object.entries(_eventMaterials).reduce((acc, [id, quantity]) => {
            if (acc[id]) {
                acc[id].stock = (acc[id].stock ?? 0) + quantity;
            } else {
                acc[id] = { material_id: id, stock: quantity };
            }
            return acc;
        }, _depot);

        const sortedEventMaterials = Object.entries(_eventMaterials)
            .sort(([itemIdA], [itemIdB]) => customItemsSort(itemIdA, itemIdB));
        //-eventsData       

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
            .filter(([id, need]) => craftingList.includes(id) && need - (_depot[id]?.stock ?? 0) > 0)
            .sort(([itemIdA], [itemIdB]) => customItemsSort(itemIdA, itemIdB, true))
            .map(([id, need]) => ([id, need - (_depot[id]?.stock ?? 0)] as [string, number]));

        const sortedNeedToFarm = Object.entries(_materialsNeeded)
            .filter(([id, need]) => !craftingList.includes(id) && need - (_depot[id]?.stock ?? 0) > 0)
            .sort(([itemIdA], [itemIdB]) => {
                const itemA = itemsJson[itemIdA as keyof typeof itemsJson];
                const itemB = itemsJson[itemIdB as keyof typeof itemsJson];
                const itemAlocalSortID = localSortId.find(keyword => itemA.name.includes(keyword[0]))?.[1] ?? 0;
                const itemBlocalSortID = localSortId.find(keyword => itemB.name.includes(keyword[0]))?.[1] ?? 0;
                return (
                    (itemAlocalSortID - itemBlocalSortID) ||
                    (_materialsNeeded[itemIdB] - (_depot[itemIdB]?.stock ?? 0)) - (_materialsNeeded[itemIdA] - (_depot[itemIdA]?.stock ?? 0))
                );
            })
            .map(([id, need]) => ([id, need - (_depot[id]?.stock ?? 0)] as [string, number]));

        const needToFarm123 = Object.entries(_materialsNeeded)
            .filter(([id, need]) => !craftingList.includes(id) && need - (_depot[id]?.stock ?? 0) > 0
                && itemsJson[id as keyof typeof itemsJson].tier < (craftTier)
                && Number(id) > 3300 && Number(id) < 32000)
            .reduce((acc, [id, need]) => {
                acc[id] = (need - (_depot[id]?.stock ?? 0));
                return acc;
            }, {} as Record<string, number>);

        const lowTierMats = Object.values(_depot)
            .filter((item) =>
                itemsJson[item.material_id as keyof typeof itemsJson].tier < (craftTier - 1)
                && Number(item.material_id) > 3300 && Number(item.material_id) < 32000
            ).reduce((acc, item) => {
                acc[item.material_id] = Math.max(0, item.stock - (_materialsNeeded[item.material_id] ?? 0));
                return acc;
            }, {} as Record<string, number>);

        addMatsToTierFromPreviousTier(lowTierMats, 2, true);
        const t2OrirockException: [string, number] = ["30012", (lowTierMats["30012"] ?? 0)];
        addMatsToTierFromPreviousTier(lowTierMats, 3, true);

        const sortedPossibleCraft = Object.entries(getTier3StatisticFromMaterials(lowTierMats))
            .map(([id, { total: num }]) => [id, num] as [string, number]).concat([t2OrirockException])
            .filter(([id, num]) => num > 0 && needToFarm123[id])
            .sort(([itemIdA], [itemIdB]) => customItemsSort(itemIdA, itemIdB))
            .map(([id, num]) => [id, Math.min(num, needToFarm123[id])] as [string, number]);

        return {
            sortedNeedToFarm,
            sortedNeedToCraft,
            sortedPossibleCraft,
            eventsList,
            sortedEventMaterials
        }
    }, [open, goalsMaterials, depot, expOwned, eventsData, localSortId,
        getTier3StatisticFromMaterials, , getTotalMaterialsUptoSelectedEvent, customItemsSort]
    );

    const calculateStatisticTab = useCallback(() => {

        if (!open) return { sortedAllGoalsStats: [], sortedFilteredGoalsStats: [] };

        const allGoalMaterials = getMaterialsFromGoalData(goalData);
        const filteredGoalMaterials = Object.entries(goalsMaterials)
            .filter(([id]) => Number(id) > 30000 && Number(id) < 32000)
            .reduce((acc, [id, need]) => {
                acc[id] = need;
                return acc;
            }, {} as Record<string, number>)

        const sortedAllGoalsStats = Object.entries(getTier3StatisticFromMaterials(allGoalMaterials))
            .sort(([, { percent: pA }], [, { percent: pB }]) => pB - pA)
            .map(([id, { total, percent }]) => [id, total, percent] as [string, number, number]);

        const sortedFilteredGoalsStats = Object.entries(getTier3StatisticFromMaterials(filteredGoalMaterials))
            .sort(([, { percent: pA }], [, { percent: pB }]) => pB - pA)
            .map(([id, { total, percent }]) => [id, total, percent] as [string, number, number]);

        const totalAll = sortedAllGoalsStats.reduce((acc, [, total]) => acc + total, 0);
        const totalFiltered = sortedFilteredGoalsStats.reduce((acc, [, total]) => acc + total, 0);

        return {
            sortedAllGoalsStats,
            sortedFilteredGoalsStats: (totalAll != totalFiltered) ? sortedFilteredGoalsStats : []
        }
    }
        , [open, goalData, goalsMaterials, getTier3StatisticFromMaterials])

    const formatNumber = (num: number) => {
        return num < 1000
            ? num
            : num < 1000000
                ? `${num % 1000 === 0 ? `${num / 1000}` : (num / 1000).toFixed(1)}K`
                : `${num % 1000000 === 0 ? `${num / 1000000}` : (num / 1000000).toFixed(2)}M`;
    };

    const itemBaseSize = isMdUp ? 64 : 56;

    const getNumberCSS = (size: number = itemBaseSize) => ({
        component: "span",
        sx: {
            display: "inline-block",
            py: 0.25,
            px: 0.5,
            lineHeight: 1,
            mr: `${size / 16}px`,
            mb: `${size / 16}px`,
            alignSelf: "end",
            justifySelf: "end",
            backgroundColor: "background.paper",
            zIndex: 1,
            fontSize: `${size / 24 + 12}px`,
        },
    });

    const { sortedNeedToFarm, sortedNeedToCraft, sortedPossibleCraft, eventsList, sortedEventMaterials } = useMemo(calculateSummaryTab, [calculateSummaryTab]);

    const { sortedAllGoalsStats, sortedFilteredGoalsStats } = useMemo(calculateStatisticTab, [calculateStatisticTab]);

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
                        display: "grid",
                        gridTemplate: {
                            xs:
                                `"buttons none switch close"
                                "title title title title"/1fr 2fr 1fr 1fr`,
                            sm: `"buttons title switch"/1fr 5fr 1fr`
                        },
                        justifyContent: "space-between",
                        paddingBottom: "12px",
                    }}
                >
                    <Box gridArea="buttons">
                        <ToggleButtonGroup
                            orientation="horizontal"
                            value={tab}
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
                    </Box>
                    <Typography
                        gridArea="title"
                        fontSize="2rem"
                        color="textPrimary"
                        textAlign="left"
                        sx={{
                            marginLeft: "8px",
                            paddingTop: "12px",
                        }}
                    >
                        {(tab === "summary") ? "Active goals" : "Statistic"}
                    </Typography>
                    <Box gridArea="switch">
                        {(tab === "statistic") && (
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
                    </Box>
                    <IconButton onClick={handleClose} sx={{ display: { sm: "none" }, gridArea: "close" }}>
                        <Close />
                    </IconButton>
                </DialogTitle>
                <DialogContent
                    sx={{
                        height: { sm: '500px', xl: '700px' },
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                        "&::-webkit-scrollbar": {
                            display: "none",
                        },
                    }} ref={containerRef}
                > <Box component={"div"} display="flex">
                        <Slide container={containerRef.current}
                            in={tab === "summary"}
                            direction="right"
                            timeout={{ enter: 500, exit: tab != "summary" ? 1 : 400 }}
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
                                                <Stack direction="row" alignItems="center">
                                                    <Typography variant="h3" p={1} fontWeight="bold">Farm missing materials
                                                        {sortedPossibleCraft.length > 0 ? <> <big>≪</big><span>some possible to craft</span></> : null}
                                                    </Typography>
                                                </Stack>
                                                <Stack direction="row" flexWrap="wrap" alignItems="center">
                                                    {sortedNeedToFarm.map(([id, need]) => (
                                                        <ItemBase key={id} itemId={id} size={itemBaseSize}>
                                                            <Typography {...getNumberCSS()}>
                                                                {formatNumber(need)}
                                                            </Typography>
                                                        </ItemBase>
                                                    ))}
                                                    {sortedPossibleCraft.length > 0 ? (
                                                        <>

                                                            {sortedPossibleCraft.map(([id, need], index) => (
                                                                index === 0 ? (
                                                                    <Box key={id} display="flex" alignItems="center">
                                                                        <DoubleArrowIcon
                                                                            sx={{
                                                                                transform: "rotate(180deg)",
                                                                                ml: 0.5,
                                                                                mr: -1,
                                                                                fontSize: "2rem",
                                                                                color: "rgba(255, 255, 255, 0.8)",
                                                                                stroke: "black",
                                                                                strokeWidth: "0.2px",
                                                                                zIndex: 1,
                                                                            }}
                                                                        />
                                                                        <ItemBase itemId={id} size={itemBaseSize * 0.75}>
                                                                            <Typography {...getNumberCSS(itemBaseSize * 0.75)}>
                                                                                {formatNumber(need)}
                                                                            </Typography>
                                                                        </ItemBase>
                                                                    </Box>
                                                                ) : (
                                                                    <ItemBase key={id} itemId={id} size={itemBaseSize * 0.75}>
                                                                        <Typography {...getNumberCSS(itemBaseSize * 0.75)}>
                                                                            {formatNumber(need)}
                                                                        </Typography>
                                                                    </ItemBase>
                                                                )
                                                            ))}

                                                        </>
                                                    ) : null}
                                                </Stack>
                                            </>
                                        ) : null}
                                        {sortedNeedToCraft.length > 0 ? (
                                            <>
                                                <Typography variant="h3" p={1} fontWeight="bold">Craft high tier materials</Typography>
                                                {sortedNeedToCraft
                                                    .map(([id, need]) => (
                                                        <ItemBase key={id} itemId={id} size={itemBaseSize}>
                                                            <Typography {...getNumberCSS()}>
                                                                {formatNumber(need)}
                                                            </Typography>
                                                        </ItemBase>
                                                    ))}
                                            </>
                                        ) : null}
                                        {sortedEventMaterials.length > 0 ? (
                                            <Accordion>
                                                <AccordionSummary>Income from future events</AccordionSummary>
                                                <AccordionDetails>
                                                    {sortedEventMaterials
                                                        .map(([id, need]) => (
                                                            <ItemBase key={id} itemId={id} size={itemBaseSize * 0.6}>
                                                                <Typography {...getNumberCSS(0)}>
                                                                    {formatNumber(need)}
                                                                </Typography>
                                                            </ItemBase>
                                                        ))}
                                                </AccordionDetails>
                                            </Accordion>
                                        ) : null}
                                    </>
                                )}
                            </Box>
                        </Slide>
                        <Slide container={containerRef.current}
                            in={tab === "statistic"}
                            direction="left"
                            timeout={{ enter: 500, exit: tab != "statistic" ? 1 : 400 }}
                            mountOnEnter
                            unmountOnExit>
                            <Box>
                                {sortedAllGoalsStats.length === 0 ? (
                                    <>
                                        <Typography variant="h3" p={2} fontWeight="bold">Add goals to see their statistic</Typography>
                                    </>)
                                    : (
                                        <>
                                            <Typography variant="h3" p={2} fontWeight="bold">
                                                Total usage of material types from costs of user goals, converted to tier 3, ignoring depot. </Typography>
                                            <Typography variant="h3" p={2} fontWeight="bold">For all goals, ignoring filters</Typography>
                                            {sortedAllGoalsStats.map(([id, total, percent]) => (
                                                <ItemBase key={id} itemId={id} size={itemBaseSize}>
                                                    <Typography {...getNumberCSS()}>
                                                        {isTotalDigits ? formatNumber(total) : percent + "%"}
                                                    </Typography>
                                                </ItemBase>
                                            ))}
                                            {sortedFilteredGoalsStats.length > 0 ? (
                                                <>
                                                    <Typography variant="h3" p={2} fontWeight="bold">For active goals, with filters</Typography>
                                                    {sortedFilteredGoalsStats.map(([id, total, percent]) => (
                                                        <ItemBase key={id} itemId={id} size={itemBaseSize}>
                                                            <Typography {...getNumberCSS()}>
                                                                {isTotalDigits ? formatNumber(total) : percent + "%"}
                                                            </Typography>
                                                        </ItemBase>
                                                    ))}
                                                </>
                                            ) : null}
                                        </>
                                    )}
                            </Box>
                        </Slide>
                    </Box>
                </DialogContent>
                <DialogActions sx={{
                    gap: 1,
                    justifyContent: "flex-start"
                }} >
                    <Button
                        disabled={tab !== "summary" ? true : false}
                        variant="contained"
                        color="primary"
                        onClick={() => {
                            handleClose();
                            openEvents(true);
                        }}
                    >{fullScreen ? "Events" : "Events tracker"}
                    </Button>
                    <FormControl sx={{ flexGrow: 1 }}>
                        <InputLabel>Select future Event</InputLabel>
                        <Select
                            disabled={tab !== "summary" ? true : false}
                            value={selectedEventIndex}
                            onChange={(e) => onEventChange(Number(e.target.value))}
                            onOpen={() => {
                                setIsSelectFinished(false)
                            }}
                            label="Select future Event"
                            fullWidth
                        >
                            {eventsList
                                .map(([name, event]) => (
                                    <MenuItem value={event.index} key={event.index} className="no-underline">
                                        <Stack direction="row" justifyContent="space-between" alignItems="center" width="stretch">
                                            {`${event.index}: ${name}`} {!isSelectFinished ? (
                                                <Stack direction="row">
                                                    {Object.entries(event.materials)
                                                        .sort(([itemIdA], [itemIdB]) => customItemsSort(itemIdA, itemIdB))
                                                        .slice(0, fullScreen ? 4 : 10)
                                                        .map(([id, quantity]) => (
                                                            <ItemBase key={id} itemId={id} size={itemBaseSize * 0.5}>
                                                                <Typography {...getNumberCSS(0)}>{formatNumber(quantity)}</Typography>
                                                            </ItemBase>
                                                        ))}
                                                    {"..."}
                                                </Stack>) : null}
                                        </Stack>
                                    </MenuItem>
                                ))}
                            <Divider component="li" />
                            <MenuItem value={-1} key={-1} className="no-underline">without Events</MenuItem>
                        </Select>
                    </FormControl>
                </DialogActions>
            </Dialog>
        </>)
});

MaterialsSummaryDialog.displayName = "MaterialsSummaryDialog";
export default MaterialsSummaryDialog;