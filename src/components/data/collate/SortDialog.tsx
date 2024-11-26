import React from "react";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  MenuItem,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Close, DragHandle, NorthEast, PlaylistAdd, Sort, SouthEast } from "@mui/icons-material";
import { SortFunctionData, SortListItem } from "types/sort";
import { DragDropContext, Draggable, Droppable, DropResult } from "react-beautiful-dnd";

interface Props {
  sortFns: Record<string, SortFunctionData>;
  sortQueue: SortListItem[];
  setSortQueue: (newQueue: SortListItem[]) => void;
  toggleSort: (property: string, value?: boolean) => void;
}

const SortDialog = (props: Props) => {
  const { sortFns, sortQueue, setSortQueue, toggleSort } = props;
  const theme = useTheme();
  const fullScreen = !useMediaQuery(theme.breakpoints.up("sm"));

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) {
      const items = Array.from(sortQueue);
      items.splice(result.source.index, 1);
      setSortQueue(items);
      return;
    }
    if (result.source.index === result.destination.index) return;
    const items = Array.from(sortQueue);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setSortQueue(items);
  };
  const changeKey = (orig: string, newKey: string) => {
    if (orig === newKey) return;
    const items = Array.from(sortQueue);
    const index = items.findIndex((v) => v.key === orig);
    if (index >= 0) {
      items[index] = { key: newKey, desc: sortFns[newKey].dfDesc };
    }
    setSortQueue(items);
  };
  const changeDesc = (key: string) => {
    const items = Array.from(sortQueue);
    const index = items.findIndex((v) => v.key === key);
    if (index >= 0) {
      items[index] = { key: key, desc: !items[index].desc };
    }
    setSortQueue(items);
  };

  const openSorts = Object.keys(sortFns).filter((key) => !sortQueue.some((sli) => sli.key === key));

  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Tooltip title="Sort" arrow describeChild>
        <IconButton
          onClick={() => {
            setOpen(true);
          }}
          aria-label="Sort"
          sx={{ display: "flex", flexDirection: "column" }}
        >
          <Sort fontSize="large" color="primary" />
          <Typography variant="caption" sx={{ display: { sm: "none" }, lineHeight: 1.1 }}>
            Sort
          </Typography>
        </IconButton>
      </Tooltip>
      <Dialog open={open} onClose={() => setOpen(false)} fullScreen={fullScreen} keepMounted fullWidth maxWidth="sm">
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            paddingBottom: "12px",
          }}
        >
          <Typography variant="h2" component="div">
            Sorting
          </Typography>
          <IconButton onClick={() => setOpen(false)} sx={{ display: { sm: "none" } }}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            "& .inactive": {
              opacity: 0.9,
              py: "0.6rem",
            },
            "& .active": {
              opacity: 1,
              boxShadow: 0,
              pt: "0.6rem",
              borderBottomWidth: "0.25rem",
              borderBottomColor: "primary.main",
              borderBottomStyle: "solid",
              backgroundColor: "info.light",
            },
          }}
        >
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="droppable">
              {(provided) => (
                <Box
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                >
                  {sortQueue.map(({ key, desc }, index) => (
                    <Draggable key={key} draggableId={key} index={index}>
                      {(provided) => {
                        return (
                          <Box
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            sx={{
                              display: "grid",
                              gridTemplateColumns: "auto 1fr auto auto",
                              gap: 1.5,
                              alignItems: "center",
                            }}
                          >
                            <DragHandle />
                            <TextField
                              select
                              value={key}
                              onChange={(e) => changeKey(key, e.target.value)}
                              variant="outlined"
                              size="small"
                            >
                              <MenuItem key={key} value={key}>
                                {key}
                              </MenuItem>
                              {openSorts.map((otherKey) => (
                                <MenuItem key={otherKey} value={otherKey}>
                                  {otherKey}
                                </MenuItem>
                              ))}
                            </TextField>
                            <IconButton onClick={() => changeDesc(key)}>
                              <NorthEast sx={{ display: desc ? "none" : "" }} />
                              <SouthEast sx={{ display: desc ? "" : "none" }} />
                            </IconButton>
                            <IconButton onClick={() => toggleSort(key)}>
                              <Close />
                            </IconButton>
                          </Box>
                        );
                      }}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                  <Button
                    onClick={(e) => toggleSort(openSorts[0], sortFns[openSorts[0]].dfDesc)}
                    size="small"
                    disabled={openSorts.length === 0}
                    sx={{
                      display: "flex",
                      gap: 1,
                      width: "fit-content",
                    }}
                  >
                    <PlaylistAdd />
                    Add a sort
                  </Button>
                  <Divider variant="middle" />
                  <Box
                    sx={{
                      display: "grid",
                      opacity: 0.5,
                      gridTemplateColumns: "auto 1fr auto",
                      gap: 1.5,
                    }}
                  >
                    <DragHandle sx={{ opacity: 0.6 }} />
                    Class
                    <div>(default)</div>
                    <DragHandle sx={{ opacity: 0.6 }} />
                    Name (A-Z)
                    <div>(default)</div>
                  </Box>
                </Box>
              )}
            </Droppable>
          </DragDropContext>
        </DialogContent>
      </Dialog>
    </>
  );
};
export default SortDialog;
