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
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New Task</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Task Title"
          type="text"
          fullWidth
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <TextField
          margin="dense"
          label="Description"
          type="text"
          fullWidth
          multiline
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <TextField
          margin="dense"
          label="Project ID"
          type="text"
          fullWidth
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          required
        />
        <FormControl margin="dense" fullWidth>
          <InputLabel>Status</InputLabel>
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <MenuItem value="todo">To Do</MenuItem>
            <MenuItem value="inProgress">In Progress</MenuItem>
            <MenuItem value="done">Done</MenuItem>
          </Select>
        </FormControl>
        <FormControl margin="dense" fullWidth>
          <InputLabel>Priority</InputLabel>
          <Select value={priority} onChange={(e) => setPriority(e.target.value)}>
            <MenuItem value="Low">Low</MenuItem>
            <MenuItem value="Medium">Medium</MenuItem>
            <MenuItem value="High">High</MenuItem>
          </Select>
        </FormControl>
        <TextField
          margin="dense"
          label="Assigned To"
          type="text"
          fullWidth
          value={assignedTo}
          onChange={(e) => setAssignedTo(e.target.value)}
        />
        <TextField
          margin="dense"
          label="Due Date"
          type="date"
          fullWidth
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          InputLabelProps={{
            shrink: true,
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleCreate} variant="contained">
          Create Task
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NewTask;
