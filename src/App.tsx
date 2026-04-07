import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Box, CssBaseline, Toolbar } from "@mui/material";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import ProtectedRoute from "./components/ProtectedRoute";
import Callback from "./pages/Callback";
import Dashboard from "./pages/Dashboard";
import { Chat, Settings } from "@mui/icons-material";
import Documents from "./pages/Documents";
import Files from "./pages/Files";
import Milestones from "./pages/Milestones";
import Tasks from "./pages/Tasks";
import Whiteboard from "./pages/Whiteboard";
import ProjectsPage from "./components/ProjectsPage"; 
// ... other imports

function App() {
  return (
    <Router>
      <Routes>
        {/* Public route — Cognito redirects here after login */}
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
                <Box component="main" sx={{ flexGrow: 1, bgcolor: "background.default", p: 3 }}>
                  <Toolbar />
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/projects" element={<ProjectsPage />} />
                    <Route path="/tasks" element={<Tasks />} />
                    <Route path="/chat" element={<Chat />} />
                    <Route path="/files" element={<Files />} />
                    <Route path="/milestones" element={<Milestones />} />
                    <Route path="/documents" element={<Documents />} />
                    <Route path="/whiteboard" element={<Whiteboard />} />
                    <Route path="/settings" element={<Settings />} />
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