import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField } from "@mui/material";
import React, { useEffect, useState } from "react";
import ItemBase from "./ItemBase";

interface Props {
    open: boolean;
    onClose: () => void;
    onSubmit: (depotUpdate: [string, number][], materialsLeft: Record<string, number> | false) => void;
    eventMaterials: Record<string, number>;
    eventFarms: string[];
}

const AddEventToDepotDialog = (props: Props) => {
    const { open, onClose, onSubmit, eventMaterials, eventFarms } = props;

    const [depotAddon, setDepotAddon] = useState<Record<string, number>>({});
    const [keepEvent, setKeepEvent] = useState<boolean>(false);

    useEffect(() => {
        if (!open) return;
        setDepotAddon(eventMaterials ?? {});
        setKeepEvent(false || eventFarms.length > 0);
    }, [open, eventMaterials, eventFarms]);

    const handleInputChange = (id: string, value: number) => {
        setDepotAddon((prev) => {
            const newValue = Math.max(0, Math.min(value || 0, eventMaterials[id] ?? 0));
            const updatedDepotAddon = { ...prev, [id]: newValue };

            const allValuesMatch = Object.entries(updatedDepotAddon).every(
                ([key, val]) => val === eventMaterials[key]
            );
            setKeepEvent(!allValuesMatch || eventFarms.length > 0);

            return updatedDepotAddon;
        });
    };

    const handleDialogClose = () => {
        setDepotAddon({});
        onClose();
    };

    const handleSubmit = () => {

        const filteredDepotAddon
            = Object.entries(depotAddon).filter(([_, value]) => value > 0);

        if (keepEvent) {
            const materialsLeft = Object.fromEntries(
                Object.entries(eventMaterials ?? {})
                    .map(([id, quantity]) => ([id, quantity - (depotAddon[id] ?? 0)] as [string, number]))
                    .filter(([_, quantity]) => quantity > 0)
            );
            onSubmit(filteredDepotAddon, materialsLeft);
        } else {
            onSubmit(filteredDepotAddon, false);
        }
        handleDialogClose();
    };

    const isSubmitDisabled = Object.values(depotAddon).every((value) => value === 0);

    return (
        <Dialog open={open} onClose={handleDialogClose}>
            <DialogTitle>Add to Depot & remove {!keepEvent ? "" : "from "}Event</DialogTitle>
            <DialogContent sx={{
                display: "flex",
                flexDirection: "row",
                flexWrap: "wrap"
            }}>
                {Object.keys(depotAddon).length > 0 && (
                    <>
                        {Object.entries(depotAddon).map(([id, quantity]) => (
                            <Stack key={id} direction="row">
                                <ItemBase key={`${id}-item`} itemId={id} size={40 * 0.7} sx={{ zIndex: 2 }} />
                                <TextField
                                    value={quantity != 0 ? quantity : ""}
                                    key={`${id}-input`}
                                    onChange={(e) => handleInputChange(id, Number(e.target.value))}
                                    onFocus={(e) => e.target.select()}
                                    size="small"
                                    sx={{ ml: -2.5, zIndex: 1 }}
                                    type="number"
                                    slotProps={{
                                        htmlInput: {
                                            type: "text",
                                            sx: {
                                                textAlign: "right",
                                                width: "3.5ch",
                                                flexGrow: 1,
                                                color: "primary",
                                                fontWeight: "bolder",
                                            },
                                        },
                                    }}
                                />
                            </Stack>
                        ))}
                    </>
                )}
            </DialogContent>
            <DialogActions sx={{ gap: 1 }}>
                <Button disabled={isSubmitDisabled} onClick={handleSubmit} variant="contained">
                    Submit
                </Button>
                <Button onClick={handleDialogClose}>Cancel</Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddEventToDepotDialog;