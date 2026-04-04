import React, { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Chip,
  Avatar,
  AvatarGroup,
  IconButton,
} from "@mui/material";
import { FilterList, MoreHoriz } from "@mui/icons-material";

const initialTasks = {
  todo: [
    {
      id: "1",
      title: "Design Homepage",
      priority: "High",
      description: "Create a modern and responsive design for the homepage.",
      assignee: ["SJ"],
      dueDate: "2024-08-15",
      attachments: 2,
      comments: 3,
    },
    {
      id: "2",
      title: "Develop User Authentication",
      priority: "Medium",
      description: "Implement user login and registration functionality.",
      assignee: ["MC"],
      dueDate: "2024-08-20",
      attachments: 1,
      comments: 5,
    },
  ],
  inProgress: [
    {
      id: "3",
      title: "API Integration",
      priority: "High",
      description: "Integrate with third-party APIs for enhanced features.",
      assignee: ["ED", "AT"],
      dueDate: "2024-08-25",
      attachments: 4,
      comments: 8,
    },
  ],
  done: [
    {
      id: "4",
      title: "Setup Project Structure",
      priority: "Low",
      description:
        "Initial setup of the project repository and file structure.",
      assignee: ["JD"],
      dueDate: "2024-07-30",
      attachments: 0,
      comments: 1,
    },
  ],
};

const getPriorityChipColor = (priority) => {
  switch (priority) {
    case "High":
      return "error";
    case "Medium":
      return "warning";
    case "Low":
      return "success";
    default:
      return "default";
  }
};

function SortableTask({ id, task }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Paper
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      sx={{ p: 2, mb: 2 }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6">{task.title}</Typography>
        <IconButton size="small">
          <MoreHoriz />
        </IconButton>
      </Box>
      <Chip
        label={task.priority}
        color={getPriorityChipColor(task.priority)}
        size="small"
        sx={{ my: 1 }}
      />
      <Typography variant="body2" color="text.secondary" sx={{ my: 1 }}>
        {task.description}
      </Typography>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mt: 2,
        }}
      >
        <AvatarGroup max={3}>
          {task.assignee.map((a) => (
            <Avatar key={a}>{a}</Avatar>
          ))}
        </AvatarGroup>
        <Typography variant="caption">Due: {task.dueDate}</Typography>
      </Box>
    </Paper>
  );
}

const TaskColumn = ({ id, title, tasks }) => {
  return (
    <Box sx={{ p: 2, backgroundColor: "#f4f5f7", borderRadius: 1, width: 300 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        {title}
      </Typography>
      <SortableContext
        items={tasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        {tasks.map((task) => (
          <SortableTask key={task.id} id={task.id} task={task} />
        ))}
      </SortableContext>
    </Box>
  );
};

const Tasks = () => {
  const [tasks, setTasks] = useState(initialTasks);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over) return;

    const activeContainer = findContainer(active.id);
    const overContainer = findContainer(over.id);

    if (
      !activeContainer ||
      !overContainer ||
      activeContainer === overContainer
    ) {
      // Handle reordering within the same column
      if (activeContainer) {
        setTasks((prev) => {
          const activeItems = prev[activeContainer];
          const activeIndex = activeItems.findIndex((t) => t.id === active.id);
          const overIndex = activeItems.findIndex((t) => t.id === over.id);

          return {
            ...prev,
            [activeContainer]: arrayMove(activeItems, activeIndex, overIndex),
          };
        });
      }
      return;
    }

    // Handle moving between columns
    setTasks((prev) => {
      const activeItems = prev[activeContainer];
      const overItems = prev[overContainer];
      const activeIndex = activeItems.findIndex((t) => t.id === active.id);
      const overIndex = overItems.findIndex((t) => t.id === over.id);

      const [movedItem] = activeItems.splice(activeIndex, 1);
      overItems.splice(overIndex, 0, movedItem);

      return {
        ...prev,
        [activeContainer]: [...activeItems],
        [overContainer]: [...overItems],
      };
    });
  };

  const findContainer = (id) => {
    if (id in tasks) {
      return id;
    }
    return Object.keys(tasks).find((key) =>
      tasks[key].find((item) => item.id === id),
    );
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Typography variant="h4">Tasks</Typography>
        <Box>
          <Button variant="outlined" sx={{ mr: 1 }}>
            List
          </Button>
          <Button variant="contained" sx={{ mr: 1 }}>
            Board
          </Button>
          <Button variant="outlined" sx={{ mr: 2 }}>
            Calendar
          </Button>
          <TextField size="small" placeholder="Search..." sx={{ mr: 2 }} />
          <Button variant="outlined" startIcon={<FilterList />} sx={{ mr: 2 }}>
            Filter
          </Button>
          <Button variant="contained">+ Add Task</Button>
        </Box>
      </Box>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <Box sx={{ display: "flex", gap: 2 }}>
          <TaskColumn id="todo" title="To Do" tasks={tasks.todo} />
          <TaskColumn
            id="inProgress"
            title="In Progress"
            tasks={tasks.inProgress}
          />
          <TaskColumn id="done" title="Done" tasks={tasks.done} />
        </Box>
      </DndContext>
    </Box>
  );
};

export default Tasks;
