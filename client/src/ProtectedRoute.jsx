import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuth from "./hooks/useAuth";

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  // While the authentication status is loading, don't render anything
  if (loading) {
    return null;
  }

  // If there is a logged-in user, render the child component
  // (e.g., Dashboard, Analytics). The <Outlet /> is a placeholder for it.
  if (user) {
    return <Outlet />;
  }

  // If there is no user and the status is not loading, redirect to the login page.
  return <Navigate to="/login" replace />;
};

export default ProtectedRoute;
