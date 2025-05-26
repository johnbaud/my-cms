// src/components/ThemeLoader.jsx
import { useEffect, useState } from "react";
import axios from "axios";

export default function ThemeLoader() {
  const [theme, setTheme] = useState(null);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    // Appel à l'API pour récupérer les paramètres globaux, dont le thème actif
    axios.get("/api/settings").then((res) => {
      setSettings(res.data);
      const selectedTheme = res.data.selectedTheme || "modern-light";
      import(`../themes/${selectedTheme}/index.js`).then((module) => {
        const themeData = module.default;
        setTheme(themeData);
      });
    });
  }, []);

  useEffect(() => {
    if (!theme || !settings) return;

    // Injection du fichier CSS
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = theme.cssFile;
    document.head.appendChild(link);

    // Variables de thème personnalisées
    const vars = {
      "--primary-color": settings.primaryColor,
      "--secondary-color": settings.secondaryColor,
      "--font-family": settings.fontFamily,
      "--font-size-base": settings.fontSizeBase,
      "--font-size-h1": settings.fontSizeH1,
      "--font-size-h2": settings.fontSizeH2,
      "--font-size-h3": settings.fontSizeH3,
      "--line-height": settings.lineHeight,
      "--letter-spacing": settings.letterSpacing,
      "--text-max-width": settings.textMaxWidth,
      "--block-spacing": settings.spacingBetweenBlocks,
      "--radius-base": settings.borderRadius,
      "--box-shadow": settings.boxShadow ? "0 2px 10px rgba(0,0,0,0.1)" : "none"
    };

    // Injection des variables CSS
    Object.entries(vars).forEach(([key, value]) => {
      if (value) {
        document.documentElement.style.setProperty(key, value);
      }
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
  }, [theme, settings]);

  return null;
}
