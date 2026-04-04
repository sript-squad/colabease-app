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
  const [errors, setErrors] = useState<{ name?: string }>({});

  const validateForm = (): boolean => {
    const newErrors: { name?: string } = {};
    
    if (!name.trim()) {
      newErrors.name = "Project name is required";
    } else if (name.trim().length < 3) {
      newErrors.name = "Project name must be at least 3 characters";
    } else if (name.trim().length > 100) {
      newErrors.name = "Project name must not exceed 100 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = () => {
    if (!validateForm()) {
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
    setErrors({});
  };

  const handleClose = () => {
    setName("");
    setDescription("");
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth
      PaperProps={{
        sx: {
          backgroundColor: "var(--bg-color-light)"
        }
      }}
    >
      <DialogTitle
        sx={{
          backgroundColor: "#f8f9fa",
          borderBottom: "1px solid #e9ecef",
          fontWeight: 600,
          color: "#212529"
        }}
      >
        Create New Project
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <TextField
          autoFocus
          margin="dense"
          label="Project Name"
          type="text"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={!!errors.name}
          helperText={errors.name}
          required
          sx={{
            backgroundColor: "#ffffff",
            borderRadius: "4px",
            "& .MuiOutlinedInput-root": {
              borderColor: "#dee2e6",
              "&:hover": {
                borderColor: "#adb5bd",
              },
              "&.Mui-focused": {
                borderColor: "#007bff",
              }
            },
            "& .MuiOutlinedInput-input": {
              color: "#212529"
            },
            "& .MuiInputBase-input::placeholder": {
              color: "#6c757d",
              opacity: 0.7
            },
            "& .MuiFormLabel-root": {
              color: "#6c757d"
            }
          }}
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
          sx={{
            backgroundColor: "#ffffff",
            borderRadius: "4px",
            mt: 2,
            "& .MuiOutlinedInput-root": {
              borderColor: "#dee2e6",
              "&:hover": {
                borderColor: "#adb5bd",
              },
              "&.Mui-focused": {
                borderColor: "#007bff",
              }
            },
            "& .MuiOutlinedInput-input": {
              color: "#212529"
            },
            "& .MuiInputBase-input::placeholder": {
              color: "#6c757d",
              opacity: 0.7
            },
            "& .MuiFormLabel-root": {
              color: "#6c757d"
            }
          }}
        />
      </DialogContent>
      <DialogActions
        sx={{
          borderTop: "1px solid #e9ecef",
          padding: "16px"
        }}
      >
        <Button 
          onClick={handleClose}
          sx={{
            color: "#6c757d",
            border: "1px solid #dee2e6",
            backgroundColor: "#f8f9fa",
            "&:hover": {
              backgroundColor: "#e9ecef",
              borderColor: "#adb5bd"
            }
          }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleCreate} 
          variant="contained"
          sx={{
            backgroundColor: "#007bff",
            color: "#ffffff",
            "&:hover": {
              backgroundColor: "#0056b3"
            }
          }}
        >
          Create Project
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NewProject;
