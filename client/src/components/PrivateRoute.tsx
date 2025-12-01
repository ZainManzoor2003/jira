// PrivateRoute.tsx
import { Navigate } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
import type { ReactNode, FC } from "react"; // ⭐ type-only import

interface PrivateRouteProps {
  children: ReactNode;
}

const PrivateRoute: FC<PrivateRouteProps> = ({ children }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [auth, setAuth] = useState<boolean>(false);

  useEffect(() => {
    axios
      .get<{ loggedIn: boolean; user?: any }>("http://localhost:8080/auth/check-auth", {
        withCredentials: true,
      })
      .then((response) => {
        setAuth(response.data.loggedIn);
        setLoading(false);
      })
      .catch(() => {
        setAuth(false);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading...</p>;

  return auth ? <>{children}</> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
