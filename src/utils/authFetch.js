// src/utils/authFetch.js
let accessToken = null;

export function setAccessToken(token) {
  accessToken = token;
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
        window.location.href = "/login";
        return;
      }
    }

    return res;
  } catch (error) {
    console.error("❌ authFetch error:", error);
    throw error;
  }
}
