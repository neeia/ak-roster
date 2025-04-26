import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
    IconButton,
    InputAdornment,
    Slide,
    Stack,
    Switch,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Tooltip,
    Typography,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import { TransitionProps } from '@mui/material/transitions';
import { Close } from "@mui/icons-material";
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import FunctionsIcon from '@mui/icons-material/Functions';
import ReduceCapacityIcon from '@mui/icons-material/ReduceCapacity';
import DoubleArrowIcon from "@mui/icons-material/DoubleArrow";
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import EventIcon from '@mui/icons-material/Event';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import itemsJson from "data/items.json";
import ItemBase from "../depot/ItemBase";
import DepotItem from "types/depotItem";
import { Item } from "types/item";
import canCompleteByCrafting from "util/fns/depot/canCompleteByCrafting";
import GoalData, { GoalDataInsert, getPlannerGoals } from "types/goalData";
import getGoalIngredients from "util/fns/depot/getGoalIngredients";
import { OperatorData } from "types/operators/operator";
import operators from "data/operators";
import useOperators from "util/hooks/useOperators";
import { defaultOperatorObject, MAX_SKILL_LEVEL_BY_PROMOTION } from "util/changeOperator"
import depotToExp from "util/fns/depot/depotToExp";
import { customItemsSort, EXP, farmItemsSort, formatNumber, getFarmCSS, getItemBaseStyling } from "util/fns/depot/itemUtils";
import EventsSelector from "components/planner/events/EventsSelector";
import { EventsData, NamedEvent } from "types/events";
import { createEmptyNamedEvent } from "util/fns/eventUtils";

type GoalBuilder = Partial<GoalDataInsert>;

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
    const containerRef = useRef<HTMLElement>(null);

    const [tab, setTab] = useState('summary');
    const [sliderDirection, setSliderDirection] = useState<"left" | "right">("right");
    const [isTotalDigits, setTotalToDidigts] = useState(false);

    const [balanceValue, setBalanceValue] = useState<number>(100);
    const [applyBalance, setApplyBalance] = useState(false);
    const [balanceType, setBalanceType] = useState<string | null>(null);

    const [selectedEvent, setSelectedEvent] = useState<NamedEvent>(createEmptyNamedEvent());

    const [isAccordionExpanded, setAccordionExpanded] = useState(false);

    const [roster] = useOperators();

    const HELP_INFORMATION =
        <>
            <p>
                The Summary combines <strong>depot</strong>, <strong>goals</strong>, and <strong>future events</strong> data, allowing Krooster to handle calculations more independently.
            </p>

            <strong>1. Basic Setup</strong> - Using planner to track depot and goals:
            <ul>
                <li>The Summary automatically calculates missing materials and suggests how to obtain them (based on general Arknights knowledge).</li>
                <li>Includes statistics to assist in decision-making.</li>
            </ul>
            <strong>2. Overfarming to Balance</strong>
            <ul>
                <li style={{ verticalAlign: "bottom" }}><strong><CalendarMonthIcon />Balance </strong> inputs adjust farming summary around a target number of available tier 3 materials after goals needs are met.</li>
                <li><strong>Algorithm:</strong>
                    <ul>
                        <li>Full balance value is applied to the highest %-usage material that isn't orirock</li>
                        <li>Adjusted values are applied to other materials based on the difference in %-usage.</li>
                        <li>%-usage depends on whether goals are tracked, with priority given to: 1. active goals, 2. all goals, 3. unowned operators statistics.</li>
                        <li style={{ verticalAlign: "bottom" }}>
                            The <EventIcon /><strong>Event farms only</strong> button applies the same algorithm but exclusively to 2-3 farmable materials from a selected event.
                            (<em>To use this option:</em> select event with set T3 Farms)
                        </li>
                    </ul>
                </li>
            </ul>
            <strong>3. Events Tracker Setup</strong> - Planning future upgrades with future income.
            <ul>
                <li>After adding future Events from Defaults, manually or with import, the Summary will also track free materials.</li>
                <li>Combined materials from selected and previous events are factored into all calculations, reducing required amounts.</li>
                <li>Highlights farmable tier 3 materials from selected event if they were set in the tracker.</li>
            </ul>
        </>;

    const handleToggleChange = (event: React.MouseEvent<HTMLElement>, nextTab: string) => {
        let toTab = nextTab;
        if (toTab === null) {
            switch (tab) {
                case "summary": toTab = "goalsStatistic"
                    break;
                case "goalsStatistic": toTab = "operatorsStatistic"
                    break;
                case "operatorsStatistic": toTab = "help"
                    break;
                case "help": toTab = "summary"
            }
        }
        setTab(toTab);
        setSliderDirection((prevDirection) => (prevDirection === "right" ? "left" : "right"));
    };

    const handleBalanceToggle = (event: React.MouseEvent<HTMLElement>, nextBalance: string) => {
        if (nextBalance === null) {
            setApplyBalance(false);
        } else {
            setApplyBalance(true);
        }
        setBalanceType(nextBalance);
    };

    const handleDigitsSwitch = (event: React.ChangeEvent<HTMLInputElement>) => {
        setTotalToDidigts(!event.target.checked);
    };

    const handleClose = () => {
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

    //reset if out of index
    useEffect(() => {
        if (!open) return;
        if ((selectedEvent.index + 1) > Object.keys(eventsData).length)
            setSelectedEvent(createEmptyNamedEvent());
    }, [open, selectedEvent, eventsData, setSelectedEvent]
    )

    const onEventChange = (_event: NamedEvent) => {
        if (_event.index === -1)
            setSelectedEvent(createEmptyNamedEvent());
        else
            setSelectedEvent(_event);

        if (balanceType === "event" && (_event.farms?.length ?? 0) === 0) {
            setApplyBalance(false);
            setBalanceType(null);
        };
    }

    const getTotalMaterialsUptoSelectedEvent = useCallback(() => {
        if (!eventsData || selectedEvent.index === -1) return { materials: {}, farmTimes: {} };

        const _eventsData = eventsData;
        const _filteredEvents = Object.entries(_eventsData)
            .filter(([, eventData]) => eventData.index <= selectedEvent.index);
        const _eventMaterials = _filteredEvents
            .reduce((acc, [, eventData]) => {
                if (!eventData.materials) return acc;
                Object.entries(eventData.materials).forEach(([id, quantity]) => {
                    acc[id] = (acc[id] ?? 0) + quantity;
                });
                return acc;
            }, {} as Record<string, number>);

        //store xTimes farms appearances and add 0 mats to totals if missing
        const _farmTimes = _filteredEvents
            .reduce((acc, [, eventData]) => {
                if (eventData.farms) {
                    eventData.farms.forEach((id) => {
                        acc[id] = (acc[id] ?? 0) + 1;
                        if (!_eventMaterials[id]) {
                            _eventMaterials[id] = 0;
                        }
                    })
                };
                return acc;
            }, {} as Record<string, number>);

        //EXP count
        const _exp = depotToExp(EXP.reduce((acc, id) => {
            acc[id] = { material_id: id, stock: _eventMaterials[id] ?? 0 }
            return acc
        }, {} as Record<string, DepotItem>));

        if (_exp != 0) _eventMaterials["EXP"] = _exp;

        return { materials: _eventMaterials, farmTimes: _farmTimes };
    }, [selectedEvent, eventsData]
    );

    const includeCraftIds: string[] = useMemo(() => [
        "30013", //Orirock Cluster
    ], []);

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

    const { sortedAllGoalsStats, sortedFilteredGoalsStats } = useMemo(calculateStatisticTab, [calculateStatisticTab]);

    const maxGoalBuilder = (opData: OperatorData) => {

        const op = defaultOperatorObject(opData.id, true)

        const setMax = {
            elite: 2,
            skill_level: 7,
            masteries: [3, 3, 3],
            module: 3,
        }

        const skillCount = opData.skillData?.length ?? 0;
        const maxElite = opData.eliteLevels.length ?? 0;
        const maxSkillLevel = MAX_SKILL_LEVEL_BY_PROMOTION[maxElite];

        const _goalBuilder: GoalBuilder = {};
        _goalBuilder.op_id = opData.id;
        _goalBuilder.elite_from = 0;
        _goalBuilder.elite_to = maxElite;
        _goalBuilder.skill_level_from = 0;
        _goalBuilder.skill_level_to = Math.min(setMax.skill_level, maxSkillLevel);

        const masteries_from = op.masteries;
        const _masteries_to = setMax.masteries;
        const masteries_to = _masteries_to
            .filter((_, i) => i < skillCount)
            .map((mastery, i) => (mastery === -1 ? masteries_from[i] : mastery));

        if (
            opData.rarity > 3 &&
            masteries_from.some((v, i) => v !== masteries_to[i])
        ) {
            _goalBuilder.masteries_from = masteries_from;
            _goalBuilder.masteries_to = masteries_to;
        }

        if (opData.moduleData?.length) {
            const modules = op.modules;
            const modules_to = Object.entries(modules)
                .reduce((acc, [name]) => {
                    acc[name] = setMax.module;
                    return acc;
                }, {} as Record<string, number>);
            {
                _goalBuilder.modules_from = modules;
                _goalBuilder.modules_to = modules_to;
            }
        }
        return _goalBuilder;
    }
    const calculateOperatorsTab = useCallback(() => {

        if (!open) return { sortedAllOperatorsStats: [], sortedUnownedOperatorsStats: [] };

        const _allOpsGoalData = Object.values(operators)
            .map((opData) => maxGoalBuilder(opData) as GoalData);

        const _notOwnedOpsGoalData = Object.values(operators)
            .filter((opData) => !roster[opData.id])
            .map((opData) => maxGoalBuilder(opData) as GoalData);

        const _allOpsMaterials = getMaterialsFromGoalData(_allOpsGoalData);

        const _unownedOpsMaterials = getMaterialsFromGoalData(_notOwnedOpsGoalData);

        const sortedAllOperatorsStats = Object.entries(getTier3StatisticFromMaterials(_allOpsMaterials))
            .sort(([, { percent: pA }], [, { percent: pB }]) => pB - pA)
            .map(([id, { total, percent }]) => [id, total, percent] as [string, number, number]);

        const sortedUnownedOperatorsStats = Object.entries(getTier3StatisticFromMaterials(_unownedOpsMaterials))
            .sort(([, { percent: pA }], [, { percent: pB }]) => pB - pA)
            .map(([id, { total, percent }]) => [id, total, percent] as [string, number, number]);


        return { sortedAllOperatorsStats, sortedUnownedOperatorsStats }
    }, [open, roster, getTier3StatisticFromMaterials]
    );

    const { sortedAllOperatorsStats, sortedUnownedOperatorsStats } = useMemo(calculateOperatorsTab, [calculateOperatorsTab]);

    const addBalanceValue = useCallback((materials: Record<string, number>) => {
        if (applyBalance) {
            const farmItems = selectedEvent.farms ?? [];
            const percentsSource = sortedFilteredGoalsStats.length != 0
                ? sortedFilteredGoalsStats
                : sortedAllGoalsStats.length != 0
                    ? sortedAllGoalsStats
                    : sortedUnownedOperatorsStats;
            const farmItemsStats = (balanceType === "event")
                ? percentsSource.filter(([id]) => farmItems.includes(id))
                : percentsSource;

            if (farmItemsStats.length > 0) {
                const maxPercent = farmItemsStats.reduce((acc, [id, , percent]) => {
                    return (percent > acc && !includeCraftIds.includes(id)) ? percent : acc;
                }, 0);

                farmItemsStats.forEach(([id, , percent]) => {
                    const proportion = maxPercent != 0 ? percent / maxPercent : 0;
                    const additionalValue = Math.round(balanceValue * proportion);

                    if (!includeCraftIds.includes(id)) {
                        materials[id] = (materials[id] ?? 0) + additionalValue;
                    } else {
                        //correct into t2 for force crafted.                    
                        const item = itemsJson[id as keyof typeof itemsJson] as Item
                        item.ingredients && item.ingredients
                            .filter((ingr) => itemsJson[ingr.id as keyof typeof itemsJson].tier === 2)
                            .forEach((ingr) => {
                                materials[ingr.id] = (materials[ingr.id] ?? 0) + ingr.quantity * Math.ceil(additionalValue / (item.yield ?? 1));
                            });
                    };
                });
            };
        };

    }, [applyBalance, balanceValue, balanceType, selectedEvent, sortedFilteredGoalsStats, sortedAllGoalsStats, sortedUnownedOperatorsStats, includeCraftIds]
    )

    const calculateSummaryTab = useCallback(() => {

        //dont do background calculcation
        if (!open) return {
            sortedNeedToFarm: [],
            sortedNeedToCraft: [],
            sortedPossibleCraft: [],
            sortedEventMaterials: [],
            farmTimes: {}
        };

        const craftTier = 4;
        //specific craftables of wrong tiers
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

        const { materials: _eventMaterials, farmTimes } = getTotalMaterialsUptoSelectedEvent();

        Object.entries(_eventMaterials).reduce((acc, [id, quantity]) => {
            if (acc[id]) {
                acc[id].stock = (acc[id].stock ?? 0) + quantity;
            } else {
                acc[id] = { material_id: id, stock: quantity };
            }
            return acc;
        }, _depot);

        const sortedEventMaterials = Object.entries(_eventMaterials)
            .filter(([id]) => !EXP.includes(id))
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

        addBalanceValue(_materialsNeeded);

        const sortedNeedToCraft = Object.entries(_materialsNeeded)
            .filter(([id, need]) => craftingList.includes(id) && need - (_depot[id]?.stock ?? 0) > 0)
            .sort(([itemIdA], [itemIdB]) => customItemsSort(itemIdA, itemIdB, true))
            .map(([id, need]) => ([id, need - (_depot[id]?.stock ?? 0)] as [string, number]));

        const sortedNeedToFarm = Object.entries(_materialsNeeded)
            .filter(([id, need]) => !craftingList.includes(id) && need - (_depot[id]?.stock ?? 0) > 0)
            .sort(([itemIdA], [itemIdB]) => {
                const isInSelectedEventFarmA = selectedEvent?.farms?.includes(itemIdA) ? 1 : 0;
                const isInSelectedEventFarmB = selectedEvent?.farms?.includes(itemIdB) ? 1 : 0;
                return (
                    (isInSelectedEventFarmB - isInSelectedEventFarmA) ||
                    (farmItemsSort(itemIdA, itemIdB)) ||
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
            sortedEventMaterials,
            farmTimes,
        }
    }, [open, goalsMaterials, depot, expOwned, includeCraftIds, selectedEvent,
        getTier3StatisticFromMaterials, getTotalMaterialsUptoSelectedEvent,
        addBalanceValue]
    );

    const { sortedNeedToFarm, sortedNeedToCraft, sortedPossibleCraft, sortedEventMaterials, farmTimes } = useMemo(calculateSummaryTab, [calculateSummaryTab]);

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
                            <ToggleButton value="goalsStatistic" aria-label="goalsStatistic">
                                <LeaderboardIcon />
                            </ToggleButton>
                            <ToggleButton value="operatorsStatistic" aria-label="operatorsStatistic">
                                <ReduceCapacityIcon />
                            </ToggleButton>
                            <ToggleButton value="help" aria-label="help">
                                <QuestionMarkIcon />
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
                        {(tab === "summary") && "Active goals"}
                        {tab.includes("Statistic") && `Statistic ${(tab === "goalsStatistic") ? " - goals" : " - operators"}`}
                        {(tab === "help") && "Description"}
                    </Typography>
                    <Box gridArea="switch">
                        <Stack direction="row" alignItems="center">
                            {tab.includes("Statistic") && (
                                <>
                                    <Typography>∑</Typography>
                                    <Switch
                                        checked={!isTotalDigits}
                                        onChange={handleDigitsSwitch}
                                        inputProps={{ 'aria-label': 'controlled' }}
                                    />
                                    <Typography>%</Typography>
                                </>
                            )}
                            {(tab === "summary") && (
                                <>
                                    <TextField value={balanceValue}
                                        variant="standard"
                                        label="Balance to"
                                        type="number"
                                        onChange={(e) => {
                                            setBalanceValue(Number(e.target.value) || 0)
                                        }}
                                        sx={{ minWidth: "4ch" }}
                                        slotProps={{
                                            input: { startAdornment: <InputAdornment position="start">+</InputAdornment>, },
                                            htmlInput: {
                                                type: "text",
                                            },
                                        }} />
                                    <ToggleButtonGroup
                                        orientation="horizontal"
                                        size="small"
                                        value={balanceType}
                                        exclusive
                                        onChange={handleBalanceToggle}
                                        sx={{ alignItems: "flex-end" }}
                                    >
                                        <Tooltip title="Apply only to 2-3 event farms">
                                            <Box>
                                                <ToggleButton value="event" aria-label="event"
                                                    disabled={(selectedEvent?.farms ?? []).length === 0 ? true : false}>
                                                    <EventIcon />
                                                </ToggleButton>
                                            </Box>
                                        </Tooltip>
                                        <ToggleButton value="global" aria-label="global">
                                            <Tooltip title="Apply to all materials">
                                                <CalendarMonthIcon />
                                            </Tooltip>
                                        </ToggleButton>
                                    </ToggleButtonGroup>
                                </>)}
                        </Stack>
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
                            direction={sliderDirection}
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
                                                    <Typography variant="h3" p={1} fontWeight="bold">Farm missing materials {balanceType != null && "& balance on top"}
                                                        {sortedPossibleCraft.length > 0 ? <> <big>≪</big><span>some possible to craft</span></> : null}
                                                    </Typography>
                                                </Stack>
                                                <Stack direction="row" flexWrap="wrap" alignItems="center">
                                                    {sortedNeedToFarm.map(([id, need]) => (
                                                        <ItemBase key={id} itemId={id} size={getItemBaseStyling("summary", fullScreen).itemBaseSize}
                                                            sx={{ ...(selectedEvent?.farms?.includes(id) && getFarmCSS("box")) }}>
                                                            <Typography {...getItemBaseStyling("summary", fullScreen).numberCSS}>
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
                                                                        <ItemBase itemId={id} size={getItemBaseStyling("summary_craft", fullScreen).itemBaseSize}>
                                                                            <Typography {...getItemBaseStyling("summary_craft", fullScreen).numberCSS}>
                                                                                {formatNumber(need)}
                                                                            </Typography>
                                                                        </ItemBase>
                                                                    </Box>
                                                                ) : (
                                                                    <ItemBase key={id} itemId={id} size={getItemBaseStyling("summary_craft", fullScreen).itemBaseSize}>
                                                                        <Typography {...getItemBaseStyling("summary_craft", fullScreen).numberCSS}>
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
                                                        <ItemBase key={id} itemId={id} size={getItemBaseStyling("summary", fullScreen).itemBaseSize}>
                                                            <Typography {...getItemBaseStyling("summary", fullScreen).numberCSS}>
                                                                {formatNumber(need)}
                                                            </Typography>
                                                        </ItemBase>
                                                    ))}
                                            </>
                                        ) : null}
                                        {sortedEventMaterials.length > 0 ? (
                                            <Accordion
                                                onChange={(_, expanded) => setAccordionExpanded(expanded)}
                                                expanded={isAccordionExpanded}>
                                                <AccordionSummary >
                                                    <Stack direction="row" width="100%" justifyContent="space-between">Income up to the selected event is deducted
                                                        {isAccordionExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                                    </Stack>
                                                </AccordionSummary>
                                                <AccordionDetails>
                                                    {sortedEventMaterials
                                                        .map(([id, need]) => (
                                                            <Tooltip key={`${id}-tip`} title={farmTimes[id] ? `can be farmed in ${farmTimes[id]} event${farmTimes[id] > 1 ? "s" : ""}` : ""}>
                                                                <ItemBase key={id} itemId={id} size={getItemBaseStyling("summary_totals", fullScreen).itemBaseSize}
                                                                    sx={{
                                                                        ...(farmTimes[id] && getFarmCSS("round"))
                                                                    }}>
                                                                    <Typography {...getItemBaseStyling("summary_totals", fullScreen).numberCSS}>
                                                                        {formatNumber(need)}
                                                                    </Typography>
                                                                </ItemBase>
                                                            </Tooltip>
                                                        ))}
                                                </AccordionDetails>
                                            </Accordion>
                                        ) : null}
                                    </>
                                )}
                            </Box>
                        </Slide>
                        <Slide container={containerRef.current}
                            in={tab === "goalsStatistic"}
                            direction={sliderDirection}
                            timeout={{ enter: 500, exit: tab != "goalsStatistic" ? 1 : 400 }}
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
                                                Total usage of material types, converted to tier 3. <br />Based on planner goals of user. Depot is ignored. </Typography>
                                            <Typography variant="h3" p={2} fontWeight="bold">For all goals, ignoring filters</Typography>
                                            {sortedAllGoalsStats.map(([id, total, percent]) => (
                                                <ItemBase key={id} itemId={id} size={getItemBaseStyling("summary", fullScreen).itemBaseSize}>
                                                    <Typography {...getItemBaseStyling("summary", fullScreen).numberCSS}>
                                                        {isTotalDigits ? formatNumber(total) : percent + "%"}
                                                    </Typography>
                                                </ItemBase>
                                            ))}
                                            {sortedFilteredGoalsStats.length > 0 ? (
                                                <>
                                                    <Typography variant="h3" p={2} fontWeight="bold">For active goals, with filters</Typography>
                                                    {sortedFilteredGoalsStats.map(([id, total, percent]) => (
                                                        <ItemBase key={id} itemId={id} size={getItemBaseStyling("summary", fullScreen).itemBaseSize}>
                                                            <Typography {...getItemBaseStyling("summary", fullScreen).numberCSS}>
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
                        <Slide container={containerRef.current}
                            in={tab === "operatorsStatistic"}
                            direction={sliderDirection}
                            timeout={{ enter: 500, exit: tab != "operatorsStatistic" ? 1 : 400 }}
                            mountOnEnter
                            unmountOnExit>
                            <Box>
                                <Typography variant="h3" p={2} fontWeight="bold">
                                    Total usage of material types, converted to tier 3. <br />Based on existing operators. Includes costs of elite 1-2, skill levels 1-7, all masteries and modules 1-3 and unreleased CN operators. Depot is ignored.</Typography>
                                {(sortedAllOperatorsStats.length > 0) && (
                                    <>
                                        <Typography variant="h3" p={2} fontWeight="bold">All operators</Typography>
                                        {sortedAllOperatorsStats.map(([id, total, percent]) => (
                                            <ItemBase key={id} itemId={id} size={getItemBaseStyling("summary", fullScreen).itemBaseSize}>
                                                <Typography {...getItemBaseStyling("summary", fullScreen).numberCSS}>
                                                    {isTotalDigits ? formatNumber(total) : percent + "%"}
                                                </Typography>
                                            </ItemBase>
                                        ))}
                                    </>
                                )}
                                {(sortedUnownedOperatorsStats.length > 0) && (
                                    <>
                                        <Typography variant="h3" p={2} fontWeight="bold">All unowned by user operators</Typography>
                                        {sortedUnownedOperatorsStats.map(([id, total, percent]) => (
                                            <ItemBase key={id} itemId={id} size={getItemBaseStyling("summary", fullScreen).itemBaseSize}>
                                                <Typography {...getItemBaseStyling("summary", fullScreen).numberCSS}>
                                                    {isTotalDigits ? formatNumber(total) : percent + "%"}
                                                </Typography>
                                            </ItemBase>
                                        ))}
                                    </>
                                )}
                            </Box>
                        </Slide>
                        <Slide container={containerRef.current}
                            in={tab === "help"}
                            direction={sliderDirection}
                            timeout={{ enter: 500, exit: tab != "help" ? 1 : 400 }}
                            mountOnEnter
                            unmountOnExit>
                            <Box>
                                {HELP_INFORMATION}
                            </Box>
                        </Slide>
                    </Box>
                </DialogContent>
                <DialogActions sx={{
                    gap: 1,
                    justifyContent: "flex-start",
                    width: fullScreen ? "90%" : "100%"
                }} >
                    {tab === "summary" && <>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => {
                                handleClose();
                                openEvents(true);
                            }}
                            sx={{ order: fullScreen ? 2 : 1, whiteSpace: "nowrap", minWidth: "fit-content" }}
                        >{fullScreen ? "Events" : "Events tracker"}
                        </Button>
                        <Box sx={{ width: "100%", order: fullScreen ? 1 : 2 }}>
                            <EventsSelector
                                emptyItem={"Select future event (tracker, or defaults)"}
                                dataType={'events'}
                                eventsData={eventsData}
                                selectedEvent={selectedEvent ?? createEmptyNamedEvent()}
                                onChange={onEventChange}
                            />
                        </Box>
                    </>}
                </DialogActions>
            </Dialog>
        </>)
});

MaterialsSummaryDialog.displayName = "MaterialsSummaryDialog";
export default MaterialsSummaryDialog;