import { StrictMode, useEffect, useState } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import SiteLayout from "./components/SiteLayout"
import NotFoundPage from "./pages/NotFoundPage"
import PageRenderer from "./pages/PageRenderer"
import "./index.css"
import "bootstrap/dist/css/bootstrap.min.css"

function App() {
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
    <StrictMode>
      <Router>
        <SiteLayout>
          <Routes>
            {/* 🔹 La page d'accueil est récupérée dynamiquement */}
            {homePageId && <Route path="/" element={<PageRenderer pageId={homePageId} />} />}
            {pages.map((page) =>
              page.slug !== "" ? (
                <Route key={page.id} path={`/${page.slug}`} element={<PageRenderer pageId={page.id} />} />
              ) : null
            )}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </SiteLayout>
      </Router>
    </StrictMode>
  )
}

createRoot(document.getElementById("root")).render(<App />)
