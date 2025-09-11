import { Routes, Route, Navigate } from "react-router-dom"; // Import Navigate
import AIAnalysisPage from "./pages/AIAnalysis";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import ProtectedRoute from "./ProtectedRoute";
import { Toaster } from "@/components/ui/sonner";
import GoalsPage from "./pages/Goals";
import SettingsPage from "./pages/Settings";

function App() {
  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/" element={<Navigate to="/signup" replace />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/analytics" element={<Analytics />} />
          {/* --- ADD THESE NEW ROUTES --- */}
          <Route path="/goals" element={<GoalsPage />} />
          <Route path="/ai-analysis" element={<AIAnalysisPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
      <Toaster richColors />
    </>
  );
}

export default App;
