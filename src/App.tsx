import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Box, CssBaseline, Toolbar } from "@mui/material";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import ProtectedRoute from "./components/ProtectedRoute";
import Callback from "./pages/Callback";
import Dashboard from "./pages/Dashboard";
import Documents from "./pages/Documents";
import Files from "./pages/Files";
import Milestones from "./pages/Milestones";
import Whiteboard from "./pages/Whiteboard";
import ProjectsPage from "./components/ProjectsPage";
import ProjectDetails from "./pages/ProjectDetails";
import Landing from "./pages/Landing";
import UserDetails from "./pages/UserDetails";
import ChatPage from "./pages/Chat";  // ← updated import (was @mui/icons-material Chat)
import Settings from "./pages/Settings"; // ← add this if it exists

function App() {
  return (
    <Router>
      <Routes>
        {/* Public route — Landing page at root */}
        <Route path="/" element={<Landing />} />
        <Route path="/callback" element={<Callback />} />

        {/* All other routes are protected */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Box sx={{ display: "flex" }}>
                <CssBaseline />
                <Header />
                <Sidebar />
                <Box
                  component="main"
                  sx={{
                    flexGrow: 1,
                    bgcolor: "background.default",
                    p: 3,
                    // Give the chat page full height without extra padding
                    "&:has(.chat-page-root)": { p: 0 },
                  }}
                >
                  <Toolbar />
                  <Routes>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/projects" element={<ProjectsPage />} />
                    <Route path="/projects/:id" element={<ProjectDetails />} />
                    <Route path="/chat" element={<ChatPage />} />
                    <Route path="/files" element={<Files />} />
                    <Route path="/milestones" element={<Milestones />} />
                    <Route path="/documents" element={<Documents />} />
                    <Route path="/whiteboard" element={<Whiteboard />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/profile" element={<UserDetails />} />
                  </Routes>
                </Box>
              </Box>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;