import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { useState } from "react";

interface CreateProjectData {
  name: string;
  description?: string;
  ownerId: string;
}

interface NewProjectProps {
  open: boolean;
  onClose: () => void;
  onCreate: (data: CreateProjectData) => void;
}

const NewProject = ({ open, onClose, onCreate }: NewProjectProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleCreate = () => {
    if (!name.trim()) {
      alert("Project name is required");
      return;
    }

    const projectData: CreateProjectData = {
      name: name.trim(),
      description: description.trim() || undefined,
      ownerId: "default-user", // This should come from user context/auth
    };

    onCreate(projectData);
    setName("");
    setDescription("");
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New Project</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Project Name"
          type="text"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <TextField
          margin="dense"
          label="Description"
          type="text"
          fullWidth
          multiline
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleCreate} variant="contained">
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NewProject;
