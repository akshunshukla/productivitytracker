import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import GoalsPage from "./pages/Goals";
import InsightsPage from "./pages/Insights";
import SessionHistory from "./pages/SessionHistory";
import ProtectedRoute from "./ProtectedRoute";
import { Toaster } from "@/components/ui/sonner";
import GlobalTimer from "./components/GlobalTimer";

function App() {
  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/goals" element={<GoalsPage />} />
          <Route path="/insights" element={<InsightsPage />} />
          <Route path="/history" element={<SessionHistory />} />
        </Route>
      </Routes>
      <GlobalTimer />
      <Toaster richColors />
    </>
  );
}

export default App;
