import ClearAllIcon from "@mui/icons-material/ClearAll";
import { Box, Button, Paper, Typography } from "@mui/material";
import {
  DragDropContext,
  Draggable,
  DraggableProvided,
  Droppable,
  DroppableProvided,
  DropResult,
} from "react-beautiful-dnd";

import { completeGoal } from "store/goalsActions";
import {
  clearAllGoals,
  deleteGoal,
  selectGoals,
  reorderGoal,
} from "store/goalsSlice";
import { useAppDispatch, useAppSelector } from "store/hooks";
import { PlannerGoal } from "types/goal";

import PlannerGoalCard from "./PlannerGoalCard";

const OperatorGoals: React.FC = () => {
  const dispatch = useAppDispatch();
  const goals = useAppSelector(selectGoals);

  const handleGoalDeleted = (goal: PlannerGoal) => {
    dispatch(deleteGoal(goal));
  };

  const handleGoalCompleted = (goal: PlannerGoal) => {
    dispatch(completeGoal(goal));
  };

  const handleClearAll = () => {
    dispatch(clearAllGoals());
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    const source = result.source;
    const destination = result.destination;
    dispatch(
      reorderGoal({
        oldIndex: source.index,
        newIndex: destination.index,
      })
    );
  };

  return (
    <section>
      <Paper
        sx={{
          display: "grid",
          mb: 1,
          p: 2,
          gridTemplateColumns: "1fr auto",
        }}
      >
        <Typography component="h3" variant="h5">
          Operator goals
        </Typography>
        <Button
          onClick={handleClearAll}
          startIcon={<ClearAllIcon />}
          variant="outlined"
          color="secondary"
        >
          Clear All
        </Button>
      </Paper>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="goal-list">
          {(provided: DroppableProvided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              <Box component="ul" sx={{ m: 0, p: 0 }}>
                {goals.map((goal, i) => (
                  <Draggable key={i} draggableId={`goal-${i}`} index={i}>
                    {(provided: DraggableProvided) => (
                      <PlannerGoalCard
                        key={i}
                        goal={goal}
                        onGoalDeleted={handleGoalDeleted}
                        onGoalCompleted={handleGoalCompleted}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        ref={provided.innerRef}
                      />
                    )}
                  </Draggable>
                ))}
              </Box>
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </section>
  );
};
export default OperatorGoals;
