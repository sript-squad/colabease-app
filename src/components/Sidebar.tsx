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
  Folder,
  Chat,
  FileCopy,
  Assessment,
  Description,
  Brush,
  Settings,
} from "@mui/icons-material";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../auth/authContex";

const drawerWidth = 240;

const SIDEBAR_ITEMS = [
  { text: "Dashboard", path: "/", icon: Home },
  { text: "Projects", path: "/projects", icon: Folder },
  { text: "Chat", path: "/chat", icon: Chat, badge: 5 },
  { text: "Files", path: "/files", icon: FileCopy },
  { text: "Milestones", path: "/milestones", icon: Assessment },
  { text: "Documents", path: "/documents", icon: Description },
  { text: "Whiteboard", path: "/whiteboard", icon: Brush },
  { text: "Settings", path: "/settings", icon: Settings },
];

const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuth();
  
  // Get initials for avatar
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

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
          borderRight: "1px solid rgba(255, 255, 255, 0.05)",
        },
      }}
    >
      <Toolbar />
      <Box sx={{ overflow: "auto", mt: 2 }}>
        <List sx={{ px: 1 }}>
          {SIDEBAR_ITEMS.map((item) => {
            const isActive = 
              item.path === "/" 
                ? location.pathname === "/" 
                : location.pathname.startsWith(item.path);

            const Icon = item.icon;

            return (
              <ListItemButton
                key={item.text}
                component={Link}
                to={item.path}
                sx={{
                  mb: 0.5,
                  borderRadius: "10px",
                  position: "relative",
                  transition: "all 0.2s ease",
                  backgroundColor: isActive ? "rgba(59, 109, 17, 0.08)" : "transparent",
                  color: isActive ? "#3B6D11" : "var(--text-color-light, #212529)",
                  "&:hover": {
                    backgroundColor: "rgba(0, 0, 0, 0.04)",
                  },
                  // Green accent border for active state
                  "&::before": isActive ? {
                    content: '""',
                    position: "absolute",
                    left: 0,
                    top: "15%",
                    bottom: "15%",
                    width: "4px",
                    backgroundColor: "#3B6D11",
                    borderRadius: "0 4px 4px 0",
                    boxShadow: "2px 0 8px rgba(59, 109, 17, 0.3)",
                  } : {},
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {item.badge ? (
                    <Badge badgeContent={item.badge} color="error" sx={{ "& .MuiBadge-badge": { fontSize: 10, height: 16, minWidth: 16 } }}>
                      <Icon sx={{ color: isActive ? "#3B6D11" : "inherit", fontSize: 22 }} />
                    </Badge>
                  ) : (
                    <Icon sx={{ color: isActive ? "#3B6D11" : "inherit", fontSize: 22 }} />
                  )}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{ 
                    fontSize: "0.95rem", 
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? "#3B6D11" : "inherit",
                    letterSpacing: "0.01em"
                  }} 
                />
              </ListItemButton>
            );
          })}
        </List>
      </Box>

      <Box sx={{ position: "absolute", bottom: 0, width: "100%", borderTop: "1px solid rgba(0, 0, 0, 0.08)" }}>
        <ListItemButton
          component={Link}
          to="/profile"
          sx={{
            p: 2,
            transition: "all 0.2s ease",
            "&:hover": {
              backgroundColor: "rgba(0, 0, 0, 0.04)",
            },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Avatar sx={{ width: 36, height: 36, bgcolor: "#3B6D11", fontSize: "0.85rem" }}>
              {user?.username ? getInitials(user.username) : "U"}
            </Avatar>
            <Box sx={{ ml: 1.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: "var(--text-color-light, #212529)", lineHeight: 1.2 }}>
                {user?.username || "ColabEase User"}
              </Typography>
              <Typography variant="caption" sx={{ color: "var(--text-color-light, #212529)", opacity: 0.7 }}>
                {user?.email || "Team Member"}
              </Typography>
            </Box>
          </Box>
        </ListItemButton>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
