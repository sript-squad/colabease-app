import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
} from "@mui/material";
import { useState } from "react";

interface CreateTaskData {
  title: string;
  description?: string;
  projectId: string;
  status?: string;
  priority?: string;
  assignedTo?: string;
  dueDate?: string;
}

interface NewTaskProps {
  open: boolean;
  onClose: () => void;
  onCreate: (data: CreateTaskData) => void;
}

const NewTask = ({ open, onClose, onCreate }: NewTaskProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState("");
  const [status, setStatus] = useState("todo");
  const [priority, setPriority] = useState("Medium");
  const [assignedTo, setAssignedTo] = useState("");
  const [dueDate, setDueDate] = useState("");

  const handleCreate = () => {
    if (!title.trim()) {
      alert("Task title is required");
      return;
    }

    if (!projectId.trim()) {
      alert("Project ID is required");
      return;
    }

    const taskData: CreateTaskData = {
      title: title.trim(),
      description: description.trim() || undefined,
      projectId: projectId.trim(),
      status: status || undefined,
      priority: priority || undefined,
      assignedTo: assignedTo.trim() || undefined,
      dueDate: dueDate || undefined,
    };

    onCreate(taskData);
    setTitle("");
    setDescription("");
    setProjectId("");
    setStatus("todo");
    setPriority("Medium");
    setAssignedTo("");
    setDueDate("");
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: "var(--bg-color)",
          color: "var(--text-color)",
        },
      }}
    >
      <DialogTitle
        sx={{
          backgroundColor: "var(--primary-color)",
          color: "var(--text-color)",
          fontWeight: 600,
          fontSize: "1.25rem",
        }}
      >
        Create New Task
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            autoFocus
            label="Task Title"
            type="text"
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            sx={{
              "& .MuiOutlinedInput-root": {
                color: "var(--text-color)",
                "& fieldset": {
                  borderColor: "var(--secondary-color)",
                },
                "&:hover fieldset": {
                  borderColor: "var(--accent-color)",
                },
              },
              "& .MuiInputBase-input::placeholder": {
                opacity: 0.7,
              },
            }}
          />
          <TextField
            label="Description"
            type="text"
            fullWidth
            multiline
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                color: "var(--text-color)",
                "& fieldset": {
                  borderColor: "var(--secondary-color)",
                },
                "&:hover fieldset": {
                  borderColor: "var(--accent-color)",
                },
              },
            }}
          />
          <TextField
            label="Project ID"
            type="text"
            fullWidth
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            required
            sx={{
              "& .MuiOutlinedInput-root": {
                color: "var(--text-color)",
                "& fieldset": {
                  borderColor: "var(--secondary-color)",
                },
                "&:hover fieldset": {
                  borderColor: "var(--accent-color)",
                },
              },
            }}
          />
          <FormControl fullWidth>
            <InputLabel sx={{ color: "var(--text-color)" }}>Status</InputLabel>
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              sx={{
                color: "var(--text-color)",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "var(--secondary-color)",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "var(--accent-color)",
                },
              }}
            >
              <MenuItem value="todo">To Do</MenuItem>
              <MenuItem value="inProgress">In Progress</MenuItem>
              <MenuItem value="done">Done</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel sx={{ color: "var(--text-color)" }}>
              Priority
            </InputLabel>
            <Select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              sx={{
                color: "var(--text-color)",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "var(--secondary-color)",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "var(--accent-color)",
                },
              }}
            >
              <MenuItem value="Low">Low</MenuItem>
              <MenuItem value="Medium">Medium</MenuItem>
              <MenuItem value="High">High</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Assigned To"
            type="text"
            fullWidth
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                color: "var(--text-color)",
                "& fieldset": {
                  borderColor: "var(--secondary-color)",
                },
                "&:hover fieldset": {
                  borderColor: "var(--accent-color)",
                },
              },
            }}
          />
          <TextField
            label="Due Date"
            type="date"
            fullWidth
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                color: "var(--text-color)",
                "& fieldset": {
                  borderColor: "var(--secondary-color)",
                },
                "&:hover fieldset": {
                  borderColor: "var(--accent-color)",
                },
              },
            }}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button
          onClick={onClose}
          sx={{
            color: "var(--text-color)",
            borderColor: "var(--secondary-color)",
            "&:hover": {
              backgroundColor: "rgba(65, 90, 119, 0.1)",
            },
          }}
          variant="outlined"
        >
          Cancel
        </Button>
        <Button
          onClick={handleCreate}
          variant="contained"
          sx={{
            backgroundColor: "var(--accent-color)",
            color: "var(--text-color)",
            "&:hover": {
              backgroundColor: "var(--secondary-color)",
            },
          }}
        >
          Create Task
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NewTask;
