import { Routes, Route, Navigate } from "react-router-dom"; // Import Navigate
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Tracker from "./pages/Tracker";
import Analytics from "./pages/Analytics";
import ProtectedRoute from "./ProtectedRoute";
import { Toaster } from "@/components/ui/sonner";

function App() {
  return (
    <>
      <Routes>
        {/* Redirect base route to signup */}
        <Route path="/" element={<Navigate to="/signup" replace />} />

        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/tracker" element={<Tracker />} />
          <Route path="/analytics" element={<Analytics />} />
        </Route>
      </Routes>
      <Toaster richColors />
    </>
  );
}

export default App;
