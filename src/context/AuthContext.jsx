// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { setAccessToken } from "../utils/authFetch";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // { email, role }
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 🔁 Vérifie si on a un refresh token valide
  useEffect(() => {
    const init = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/auth/refresh-token", {
          method: "POST",
          credentials: "include",
        });

        if (!res.ok) throw new Error("Échec du refresh");

        const data = await res.json();
        setAccessToken(data.accessToken);
        setUser({ email: data.email, role: data.role }); // ou plus selon ce que tu renvoies
      } catch (err) {
        console.warn("⛔ Pas connecté ou refresh expiré");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const login = async (email, password) => {
    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Échec de connexion");

    setAccessToken(data.token);
    setUser({ email, role: data.role });
  };

  const logout = async () => {
    await fetch("http://localhost:5000/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    setUser(null);
    setAccessToken(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
