import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authFetch } from "../utils/authFetch";

export default function RequireAuth() {
  const { user, loading } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(null);

  useEffect(() => {
    const verifyAccess = async () => {
      try {
        const res = await authFetch("/admin");
        if (!res.ok) throw new Error();
        setIsAuthorized(true);
      } catch (err) {
        setIsAuthorized(false);
      }
    };

    if (!loading) {
      if (!user) {
        setIsAuthorized(false);
      } else {
        verifyAccess();
      }
    }
  }, [user, loading]);

  if (loading || isAuthorized === null) {
    return <p>🔐 Vérification de l'authentification...</p>;
  }

  return isAuthorized ? <Outlet /> : <Navigate to="/login" replace />;
}
