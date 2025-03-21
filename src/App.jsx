import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import SiteLayout from "./components/SiteLayout"
import NotFoundPage from "./pages/NotFoundPage"
import PageRenderer from "./pages/PageRenderer"

// Importation de l'admin
import Login from "./pages/Login"
import Admin from "./pages/Admin"
import AdminSettings from "./pages/AdminSettings"
import AdminPages from "./pages/AdminPages"
import AdminPageEditor from "./pages/AdminPageEditor"

import { useEffect, useState } from "react"

export default function App() {
  const [pages, setPages] = useState([])
  const [homePageId, setHomePageId] = useState(null)
  const [settings, setSettings] = useState(null);
  const [navLinks, setNavLinks] = useState([]);
  const [footerLinks, setFooterLinks] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
  
        // 🔹 Récupération des paramètres globaux
        const settingsRes = await fetch("http://localhost:5000/api/admin/settings/public");

  
        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          setSettings(settingsData);
        } else {
          console.error("❌ Erreur lors du chargement des paramètres. Accès refusé ?");
        }
  
        // 🔹 Récupération des liens de navigation
        const navLinksRes = await fetch("http://localhost:5000/api/navigation/navbar");
  
        if (navLinksRes.ok) {
          const navLinksData = await navLinksRes.json();
          setNavLinks(navLinksData);
        } else {
          console.error("❌ Erreur lors du chargement de la navigation.");
        }
  
        // 🔹 Récupération des liens du footer
        const footerLinksRes = await fetch("http://localhost:5000/api/navigation/footer");
  
        if (footerLinksRes.ok) {
          const footerLinksData = await footerLinksRes.json();
          setFooterLinks(footerLinksData);
        } else {
          console.error("❌ Erreur lors du chargement du footer.");
        }
  
        // 🔹 Récupération des pages du site (pas forcément protégé)
        const pagesRes = await fetch("http://localhost:5000/api/pages/public");
        if (pagesRes.ok) {
          const pagesData = await pagesRes.json();
          setPages(pagesData);
  
          // Définir la page d'accueil
          const homePage = pagesData.find((page) => page.slug === "");
          if (homePage) setHomePageId(homePage.id);
        }
      } catch (err) {
        console.error("❌ Erreur lors du chargement des données :", err);
      }
    };
  
    fetchData();
  }, []);
  if (!settings || !pages || !navLinks || !footerLinks) return <p>Chargement...</p>;
  return (
    <Router>
      <Routes>
        {/* 🔹 Routes publiques (site) */}
        <Route element={ <SiteLayout settings={settings} navLinks={navLinks} footerLinks={footerLinks} />}>
          {homePageId && <Route path="/" element={<PageRenderer pageId={homePageId} />} />}
          {pages.map((page) =>
            page.slug !== "" ? (
              <Route key={page.id} path={`/${page.slug}`} element={<PageRenderer pageId={page.id} />} />
            ) : null
          )}
        </Route>

        {/* 🔹 Routes Admin */}
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
        <Route path="/admin/pages" element={<AdminPages />} />
        <Route path="/admin/pages/:pageId" element={<AdminPageEditor />} />

        {/* 🔹 Page 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  )
}
