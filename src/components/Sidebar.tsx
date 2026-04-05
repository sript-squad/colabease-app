import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Avatar,
  Typography,
  Box,
  Badge,
} from "@mui/material";
import {
  Home,
  ListAlt,
  Folder,
  Chat,
  FileCopy,
  Assessment,
  Description,
  Brush,
  Settings,
} from "@mui/icons-material";
import { Link } from "react-router-dom";

const drawerWidth = 240;

const Sidebar = () => {
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: "border-box",
          backgroundColor: "var(--accent-color)",
          color: "var(--text-color)",
        },
      }}
    >
      <Toolbar />
      <List>
        <ListItemButton
          component={Link}
          to="/"
          sx={{ "&:hover": { backgroundColor: "var(--secondary-color)" } }}
        >
          <ListItemIcon>
            <Home sx={{ color: "var(--text-color)" }} />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItemButton>
        <ListItemButton
          component={Link}
          to="/tasks"
          sx={{ "&:hover": { backgroundColor: "var(--secondary-color)" } }}
        >
          <ListItemIcon>
            <ListAlt sx={{ color: "var(--text-color)" }} />
          </ListItemIcon>
          <ListItemText primary="Tasks" />
        </ListItemButton>
        <ListItemButton
          component={Link}
          to="/projects"
          sx={{ "&:hover": { backgroundColor: "var(--secondary-color)" } }}
        >
          <ListItemIcon>
            <Folder sx={{ color: "var(--text-color)" }} />
          </ListItemIcon>
          <ListItemText primary="Projects" />
        </ListItemButton>
        <ListItemButton
          component={Link}
          to="/chat"
          sx={{ "&:hover": { backgroundColor: "var(--secondary-color)" } }}
        >
          <ListItemIcon>
            <Badge badgeContent={5} color="error">
              <Chat sx={{ color: "var(--text-color)" }} />
            </Badge>
          </ListItemIcon>
          <ListItemText primary="Chat" />
        </ListItemButton>
        <ListItemButton
          component={Link}
          to="/files"
          sx={{ "&:hover": { backgroundColor: "var(--secondary-color)" } }}
        >
          <ListItemIcon>
            <FileCopy sx={{ color: "var(--text-color)" }} />
          </ListItemIcon>
          <ListItemText primary="Files" />
        </ListItemButton>
        <ListItemButton
          component={Link}
          to="/milestones"
          sx={{ "&:hover": { backgroundColor: "var(--secondary-color)" } }}
        >
          <ListItemIcon>
            <Assessment sx={{ color: "var(--text-color)" }} />
          </ListItemIcon>
          <ListItemText primary="Milestones" />
        </ListItemButton>
        <ListItemButton
          component={Link}
          to="/documents"
          sx={{ "&:hover": { backgroundColor: "var(--secondary-color)" } }}
        >
          <ListItemIcon>
            <Description sx={{ color: "var(--text-color)" }} />
          </ListItemIcon>
          <ListItemText primary="Documents" />
        </ListItemButton>
        <ListItemButton
          component={Link}
          to="/whiteboard"
          sx={{ "&:hover": { backgroundColor: "var(--secondary-color)" } }}
        >
          <ListItemIcon>
            <Brush sx={{ color: "var(--text-color)" }} />
          </ListItemIcon>
          <ListItemText primary="Whiteboard" />
        </ListItemButton>
        <ListItemButton
          component={Link}
          to="/settings"
          sx={{ "&:hover": { backgroundColor: "var(--secondary-color)" } }}
        >
          <ListItemIcon>
            <Settings sx={{ color: "var(--text-color)" }} />
          </ListItemIcon>
          <ListItemText primary="Settings" />
        </ListItemButton>
      </List>
      <Box sx={{ position: "absolute", bottom: 0, width: "100%", p: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Avatar>JD</Avatar>
          <Box sx={{ ml: 2 }}>
            <Typography variant="subtitle1">John Doe</Typography>
            <Typography variant="body2" color="textSecondary">
              john@company.com
            </Typography>
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
