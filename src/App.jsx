import { Routes, Route } from "react-router-dom";
import SiteLayout from "./components/SiteLayout";
import NotFoundPage from "./pages/NotFoundPage";
import PageRenderer from "./pages/PageRenderer";
import RequireAuth from "./components/RequireAuth";
import ThemeLoader from "./components/ThemeLoader";

import Login from "./pages/Login";
import Admin from "./pages/Admin";
import AdminSettings from "./pages/AdminSettings";
import AdminPages from "./pages/AdminPages";
import AdminBlocks from "./pages/AdminBlocks";
import AdminUploads from "./pages/AdminUploads";
import AdminPageEditor from "./pages/AdminPageEditor";
import AdminBlockEditor from "./pages/AdminBlockEditor";
import AdminFormsSubmissions from "./pages/AdminFormsSubmissions";

import { useEffect, useState } from "react";

export default function App() {
  const [pages, setPages] = useState([]);
  const [homePageId, setHomePageId] = useState(null);
  const [settings, setSettings] = useState(null);
  const [navLinks, setNavLinks] = useState([]);
  const [footerLinks, setFooterLinks] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const settingsRes = await fetch("http://localhost:5000/api/admin/settings/public");
        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          setSettings(settingsData);
        }

        const navLinksRes = await fetch("http://localhost:5000/api/navigation/navbar");
        if (navLinksRes.ok) {
          const navLinksData = await navLinksRes.json();
          setNavLinks(navLinksData);
        }

        const footerLinksRes = await fetch("http://localhost:5000/api/navigation/footer");
        if (footerLinksRes.ok) {
          const footerLinksData = await footerLinksRes.json();
          setFooterLinks(footerLinksData);
        }

        const pagesRes = await fetch("http://localhost:5000/api/pages/public");
        if (pagesRes.ok) {
          const pagesData = await pagesRes.json();
          setPages(pagesData);
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
    <>
      <ThemeLoader />
      <Routes>
        {/* 🔹 Routes publiques (site) */}
        <Route element={<SiteLayout settings={settings} navLinks={navLinks} footerLinks={footerLinks} />}>
          {homePageId && <Route path="/" element={<PageRenderer pageId={homePageId} />} />}
          {pages.map((page) =>
            page.slug !== "" ? (
              <Route key={page.id} path={`/${page.slug}`} element={<PageRenderer pageId={page.id} />} />
            ) : null
          )}
        </Route>

        {/* 🔹 Login accessible sans auth */}
        <Route path="/login" element={<Login />} />

        {/* 🔹 Routes Admin (protégées) */}
        <Route element={<RequireAuth />}>
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          <Route path="/admin/uploads" element={<AdminUploads />} />
          <Route path="/admin/pages" element={<AdminPages />} />
          <Route path="/admin/pages/:pageId" element={<AdminPageEditor />} />
          <Route path="/admin/blocks" element={<AdminBlocks />} />
          <Route path="/admin/blocks/:blockId" element={<AdminBlockEditor />} />
          <Route path="/admin/forms/" element={<AdminBlockEditor />} />
          <Route path="/admin/form-submissions" element={<AdminFormsSubmissions />} />
        </Route>

        {/* 🔹 Page 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}
