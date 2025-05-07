// src/utils/authFetch.js
import toast from "react-hot-toast";


let accessToken = null;
let refreshTimeout = null;

export function setAccessToken(token, expiresAt = null) {
  accessToken = token;
  
  // 🕒 On renouvelle le token 2 min avant expiration (si 15 min = 900 000 ms → on attend 780 000 ms)
  if (refreshTimeout) clearTimeout(refreshTimeout);

  refreshTimeout = setTimeout(() => {
    console.log("🔁 Tentative de renouvellement automatique du token...");
    fetch("http://localhost:5000/api/auth/refresh-token", {
      method: "POST",
      credentials: "include",
    })
      .then(res => res.ok ? res.json() : Promise.reject("Échec du refresh"))
      .then(data => {
        accessToken = data.accessToken;
        console.log("✅ Token automatiquement renouvelé.");
      })
      .catch(err => {
        console.warn("⚠️ Erreur lors du renouvellement automatique :", err);
        toast.error("Votre session a expiré. Veuillez vous reconnecter.");
        setTimeout(() => {
          window.location.href = "/login";
        }, 3000);
      });
  }, 780_000); // 13 minutes = 780 000 ms
}

export async function authFetch(url, options = {}, tokenOverride = null) {
  const token = tokenOverride || accessToken;
  const headers = {
    ...(options.headers || {}),
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const BASE_URL = "http://localhost:5000/api";

  try {
    const res = await fetch(`${BASE_URL}${url}`, {
      ...options,
      headers,
      credentials: "include",
    });

    if (res.status === 401) {
      const refreshRes = await fetch(`${BASE_URL}/refresh-token`, {
        method: "POST",
        credentials: "include",
      });

      if (refreshRes.ok) {
        const { accessToken: newToken } = await refreshRes.json();
        accessToken = newToken;
      
        const retryRes = await fetch(`${BASE_URL}${url}`, {
          ...options,
          headers: {
            ...headers,
            Authorization: `Bearer ${newToken}`,
          },
          credentials: "include",
        });
      
        return retryRes;
      } else {
        toast.error("Votre session a expiré. Veuillez vous reconnecter.");
        setTimeout(() => {
          window.location.href = "/login";
        }, 3000); // redirection après 3 secondes
        return;
      }
      
    }

    return res;
  } catch (error) {
    console.error("❌ authFetch error:", error);
    throw error;
  }
}
