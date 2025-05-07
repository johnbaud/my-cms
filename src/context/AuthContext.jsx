// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { setAccessToken } from "../utils/authFetch";
import toast from "react-hot-toast";

const AuthContext = createContext();
let inactivityTimeout;

function resetInactivityTimer(logoutFn, user) {
  clearTimeout(inactivityTimeout);

  if (!user) return; // 🔐 Pas de session = pas de timer

  inactivityTimeout = setTimeout(() => {
    toast.error("⏳ Session expirée par inactivité.");
    logoutFn();
  }, 600_000); // 10 min
}


export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // { email, role }
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [loginTime, setLoginTime] = useState(null);


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
        setLoginTime(new Date().toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit"
        }));
        
      } catch (err) {
        console.warn("⛔ Pas connecté ou refresh expiré");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  // 👀 Détection d’inactivité utilisateur
  useEffect(() => {
    if (user) {
      const activityEvents = ["click", "mousemove", "keydown", "scroll", "touchstart"];

      const handleActivity = () => resetInactivityTimer(logout, user);
      ;

      activityEvents.forEach(event =>
        window.addEventListener(event, handleActivity)
      );
      resetInactivityTimer(logout, user);


      return () => {
        activityEvents.forEach(event =>
          window.removeEventListener(event, handleActivity)
        );
        clearTimeout(inactivityTimeout);
      };
    }
  }, [user]);

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
    setLoginTime(new Date().toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit"
    }));
    
  };

  const logout = async () => {
    await fetch("http://localhost:5000/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    setUser(null);
    setAccessToken(null);
    clearTimeout(inactivityTimeout);
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, loginTime }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
