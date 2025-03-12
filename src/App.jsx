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

  useEffect(() => {
    fetch("http://localhost:5000/api/pages/public")
      .then(res => res.json())
      .then(data => {
        setPages(data)

        // 🔹 Définir la page d'accueil (celle avec un slug vide "")
        const homePage = data.find(page => page.slug === "")
        if (homePage) setHomePageId(homePage.id)
      })
      .catch(err => console.error("❌ Erreur lors du chargement des pages :", err))
  }, [])

  return (
    <Router>
      <Routes>
        {/* 🔹 Routes publiques (site) */}
        <Route element={<SiteLayout />}>
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
