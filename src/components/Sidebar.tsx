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
  IconButton,
  Tooltip,
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
  Logout,
} from "@mui/icons-material";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/authContex";

const drawerWidth = 240;

const SIDEBAR_ITEMS = [
  { text: "Dashboard", path: "/dashboard", icon: Home },
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
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  // Get initials for avatar
  const getInitials = (name: string) => {
    if (!name) return "U";
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
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
          backgroundColor: "#fff",
          color: "#1a2e0f",
          borderRight: "1px solid rgba(0, 0, 0, 0.05)",
        },
      }}
    >
      <Toolbar />
      <Box sx={{ overflow: "auto", mt: 2 }}>
        <List sx={{ px: 1 }}>
          {SIDEBAR_ITEMS.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
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
                  color: isActive ? "#3B6D11" : "#1a2e0f",
                  "&:hover": {
                    backgroundColor: "rgba(0, 0, 0, 0.04)",
                  },
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

      <Box sx={{ position: "absolute", bottom: 0, width: "100%", p: 2, borderTop: "1px solid rgba(0, 0, 0, 0.08)" }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Avatar sx={{ width: 36, height: 36, bgcolor: "#3B6D11", fontSize: "0.85rem" }}>
            {user?.username ? getInitials(user.username) : "U"}
          </Avatar>
          <Box sx={{ ml: 1.5, flex: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: "#1a2e0f", lineHeight: 1.2 }}>
              {user?.username || "ColabEase User"}
            </Typography>
            <Typography variant="caption" sx={{ color: "#1a2e0f", opacity: 0.7, display: "block", mb: 0.2 }}>
              {user?.email || "Team Member"}
            </Typography>
            <Typography 
              variant="caption" 
              onClick={handleLogout}
              sx={{ 
                color: "#d32f2f", 
                cursor: "pointer", 
                fontWeight: 700,
                display: "inline-block",
                transition: "opacity 0.2s",
                "&:hover": { opacity: 0.7, textDecoration: "underline" }
              }}
            >
              Logout
            </Typography>
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
