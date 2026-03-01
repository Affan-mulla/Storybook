import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminRoute({ children }) {
  const { user, role } = useAuth();

  if (!user || role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}
