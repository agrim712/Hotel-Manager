import { Navigate } from "react-router-dom";
import { useProductContext } from "../context/ProductAccessContext";


const ProtectedRoute = ({ children, allowedRoles, requiredProduct }) => {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("userRole");

  const { products } = useProductContext();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (requiredProduct && !products.includes(requiredProduct)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
