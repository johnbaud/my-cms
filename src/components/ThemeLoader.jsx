// src/components/ThemeLoader.jsx
import { useEffect, useState } from "react";
import axios from "axios";

export default function ThemeLoader() {
  const [theme, setTheme] = useState(null);

  useEffect(() => {
    // Appel à l'API pour récupérer les paramètres globaux, dont le thème actif
    axios.get("/api/settings").then((res) => {
      const selectedTheme = res.data.selectedTheme || "modern-light";
      import(`../themes/${selectedTheme}/index.js`).then((module) => {
        const themeData = module.default;
        setTheme(themeData);
      });
    });
  }, []);

  useEffect(() => {
    if (!theme) return;

    // Injection du fichier CSS
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = theme.cssFile;
    document.head.appendChild(link);

    // Injection des variables CSS
    Object.entries(theme.variables || {}).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });

    // Injection des scripts JS
    theme.scripts?.forEach((src) => {
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      document.body.appendChild(script);
    });

    // Cleanup si on change de thème
    return () => {
      document.head.removeChild(link);
      theme.scripts?.forEach((src) => {
        const existingScript = document.querySelector(`script[src="${src}"]`);
        if (existingScript) document.body.removeChild(existingScript);
      });
    };
  }, [theme]);

  return null;
}
