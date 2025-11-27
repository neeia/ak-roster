import { Box, ToggleButton, ToggleButtonGroup, ToggleButtonGroupProps, Tooltip, Typography } from "@mui/material";
import factionJson from "data/factions";
import React, { useMemo, useState } from "react";
import Image from "components/base/Image";
import operatorJson from "data/operators";
import imageBase from "util/imageBase";

interface Props extends Omit<ToggleButtonGroupProps, "onChange"> {
    onChange: (value: string) => void;
    onHover?: (value: { id: string, title: string } | null) => void;
    fullScreen?: boolean
}

const FactionsFilter = (props: Props) => {
    const { value, onChange, onHover, fullScreen, ...rest } = props;
    const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

    const factionsList = useMemo(() => {
        const usedFactionIds = new Set(
            Object.values(operatorJson)
                .flatMap(op => op.factions ?? [])
        );
        return Object.entries(factionJson)
            .filter(([id]) => id !== "none" && usedFactionIds.has(id))
            .sort(([ai, a], [bi, b]) => a.sortId - b.sortId)
            .map(([id, f]) => {
                return { id, title: f.powerName, code: f.powerCode }

            })
    }, []);

    return (
        <ToggleButtonGroup
            value={value}
            sx={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                width: "100%",
                gap: 0.5,
                overflowY: "auto",
                overflowX: "hidden",
                maxHeight: "7rem",
            }}
        >
            {factionsList.map(({ id, title, code }) => (
                <ToggleButton
                    key={id}
                    value={id}
                    onChange={() => onChange(id)}
                    onMouseEnter={() => !imageErrors[id] && !fullScreen && onHover?.({ id, title })}
                    onMouseLeave={() => !imageErrors[id] && !fullScreen && onHover?.(null)}
                    sx={{
                        "&:not(._):not(._)":
                            { borderRadius: 1 },
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        textTransform: "none",
                    }}
                >{fullScreen
                    ? <Box component="div" height="fit-content">
                        {code}
                    </Box>
                    : <Image width={42} height={imageErrors[id] ? "fit-content" : 42} alt={code}
                        src={`${imageBase}/factions/logo_${id}.webp`}
                        hideOnError={true}
                        onError={() => setImageErrors((prev) => ({ ...prev, [id]: true }))} />
                    }
                </ToggleButton>
            ))}
        </ToggleButtonGroup>
    );
};

export default FactionsFilter;
