import GoalData from "types/goalData";
import {
  alpha,
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import {
  DragDropContext,
  Draggable,
  DraggableProvided,
  Droppable,
  DroppableProvided,
  DropResult,
} from "react-beautiful-dnd";
import React, { useCallback, useEffect, useState } from "react";
import operatorJson from "data/operators";
import { GroupsDataInsert } from "types/groupData";
import Image from "next/image";
import _ from "lodash";

interface Props {
  open: boolean;
  goals: GoalData[] | undefined;
  groups: string[] | undefined;
  updateGoals: (goalsData: GoalData[]) => void;
  putGroups: (goalGroupInsert: GroupsDataInsert[]) => void;
  onClose: () => void;
}

// for possible scrolling issue, may want to take a look at https://atlassian.design/components/pragmatic-drag-and-drop/optional-packages/react-beautiful-dnd-migration/about
const GoalReorderDialog = (props: Props) => {
  const { open, goals, groups, updateGoals, putGroups, onClose } = props;

  const [reorderedGroups, setReorderedGroups] = useState<string[]>([]);
  const [groupedOperators, setGroupedOperators] = useState<Record<string, GoalData[]>>({});

  useEffect(() => {
    if (groups) {
      setReorderedGroups([...groups]);
    }
  }, [groups]);

  useEffect(() => {
    if (goals) {
      const groupedOp = _.groupBy(structuredClone(goals), (goal) => goal.group_name) as Record<string, GoalData[]>;
      //const groupedOp = Object.groupBy(structuredClone(goals), (goal) => goal.group_name) as Record<string, GoalData[]>;
      Object.values(groupedOp).forEach((goalArray) => goalArray.sort((a, b) => a.sort_order - b.sort_order));
      setGroupedOperators(groupedOp);
    }
  }, [goals]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    if (result.type == "group") {
      const reordered = [...reorderedGroups];
      const removedItem = reordered.splice(result.source.index, 1)[0];
      reordered.splice(result.destination.index, 0, removedItem);

      setReorderedGroups(reordered);
    }

    if (result.type.indexOf("-operators") != -1) {
      const reordered = { ...groupedOperators };
      const groupName = result.type.substring(0, result.type.indexOf("-operators"));
      const group = reordered[groupName];
      const removedItem = group.splice(result.source.index, 1)[0];
      group.splice(result.destination.index, 0, removedItem);
      group.forEach((goal, index) => (goal.sort_order = index));

      setGroupedOperators(reordered);
    }
  };

  const handleConfirmReorder = useCallback(() => {
    const updatedGroups: GroupsDataInsert[] = [];
    reorderedGroups.forEach((group, index) => {
      const updatedGroup: GroupsDataInsert = {
        group_name: group,
        sort_order: index,
      };
      updatedGroups.push(updatedGroup);
    });

    const updatedGoals = Object.values(groupedOperators).flat();

    putGroups(updatedGroups);
    updateGoals(updatedGoals);
    onClose();
  }, [updateGoals, putGroups, groupedOperators, onClose, reorderedGroups]);

  return (
    <>
      <Dialog open={open} onClose={onClose}>
        <DialogTitle
          variant="h2"
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: 4,
          }}
        >
          Goal reordering
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            This tool cannot move operators between groups.
          </Alert>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Box
              p={2}
              sx={{
                backgroundColor: "background.default",
                minHeight: "50px",
              }}
            >
              <Droppable droppableId="group-list" type="group">
                {(provided: DroppableProvided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    <Box component="ul" sx={{ m: 0, p: 0 }}>
                      {reorderedGroups.map((groupName, i) => (
                        <Box
                          key={groupName}
                          component="li"
                          sx={{
                            display: "contents",
                            "& > *": {
                              borderTop: "4px solid",
                              borderColor: "primary.main",
                              mb: "8px",
                            },
                          }}
                        >
                          <Draggable draggableId={groupName} index={i}>
                            {(provided: DraggableProvided) => (
                              <div {...provided.draggableProps} ref={provided.innerRef} {...provided.dragHandleProps}>
                                <Box p={1} sx={{ backgroundColor: "background.paper" }}>
                                  <Typography>{groupName}</Typography>
                                  <Droppable droppableId={`${groupName}-list`} type={`${groupName}-operators`}>
                                    {(operatorProvided: DroppableProvided) => (
                                      <div {...operatorProvided.droppableProps} ref={operatorProvided.innerRef}>
                                        <Box component="ul" sx={{ m: 0, p: 0, pl: 2 }}>
                                          {(groupedOperators[groupName] ?? []).map((operator, i) => (
                                            <Box
                                              key={operator.op_id}
                                              component="li"
                                              sx={{
                                                display: "contents",
                                                "& > *": {
                                                  borderLeft: "4px solid",
                                                  borderColor: "primary.main",
                                                  backgroundColor: (theme) =>
                                                    `${alpha(theme.palette.primary.main, 0.15)}`,
                                                  mt: "4px",
                                                },
                                              }}
                                            >
                                              <Draggable draggableId={groupName + operator.op_id} index={i}>
                                                {(operatorProvided: DraggableProvided) => (
                                                  <Typography
                                                    key={operator.op_id}
                                                    {...operatorProvided.draggableProps}
                                                    {...operatorProvided.dragHandleProps}
                                                    ref={operatorProvided.innerRef}
                                                    sx={{ display: "flex", alignItems: "center", p: 0.5, gap: 1 }}
                                                  >
                                                    <Image
                                                      src={`/img/avatars/${operator.op_id}.png`}
                                                      alt=""
                                                      width={24}
                                                      height={24}
                                                    />
                                                    {operatorJson[operator.op_id].name}
                                                  </Typography>
                                                )}
                                              </Draggable>
                                            </Box>
                                          ))}
                                        </Box>
                                        {operatorProvided.placeholder}
                                      </div>
                                    )}
                                  </Droppable>
                                </Box>
                              </div>
                            )}
                          </Draggable>
                        </Box>
                      ))}
                    </Box>
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </Box>
          </DragDropContext>
        </DialogContent>
        <DialogActions sx={{ gap: 1 }}>
          <Button variant="outlined" onClick={() => onClose()}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleConfirmReorder}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default GoalReorderDialog;
