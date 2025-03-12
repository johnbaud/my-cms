import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

export default function Navbar() {
  const [settings, setSettings] = useState({
    siteName: "Mon Site",
    logo: "/assets/default-logo.png",
    showLogo: true,
    showSiteName: true,
    navAlignment: "left",
    navHeight: 40,
    navBgColor: "#ffffff"
  })

  const [navLinks, setNavLinks] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token")

        // 🔹 Récupération des paramètres globaux
        const settingsRes = await fetch("http://localhost:5000/api/admin/settings", {
          headers: { "Authorization": `Bearer ${token}` }
        })
        if (settingsRes.ok) {
          const settingsData = await settingsRes.json()
          setSettings(settingsData)
        } else {
          console.error("❌ Erreur lors du chargement des paramètres.")
        }

        // 🔹 Récupération des liens de navigation
        const linksRes = await fetch("http://localhost:5000/api/navigation/navbar")
        if (linksRes.ok) {
          const linksData = await linksRes.json()
          setNavLinks(linksData)
        } else {
          console.error("❌ Erreur lors du chargement des liens de navigation.")
        }

      } catch (error) {
        console.error("❌ Erreur lors du chargement des données :", error)
      }
    }
    fetchData()
  }, [])

  // 🔹 Styles dynamiques de la Navbar
  const navbarStyle = {
    backgroundColor: settings.navBgColor,
    height: `${settings.navHeight}px`,
    display: "flex",
    alignItems: "center",
    justifyContent: settings.navAlignment === "center"
      ? "center"
      : settings.navAlignment === "right"
      ? "flex-end"
      : "flex-start"
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-light" style={navbarStyle}>
      <div className="container">
        {/* 🔹 Logo & Nom du site */}
        <Link className="navbar-brand d-flex align-items-center" to="/">
          {settings.showLogo && (
            <img src={settings.logo} alt="Logo" style={{ maxHeight: "40px", marginRight: "10px" }} />
          )}
          {settings.showSiteName && <span>{settings.siteName}</span>}
        </Link>

        {/* 🔹 Bouton menu mobile */}
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* 🔹 Liens de navigation */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            {navLinks.length > 0 ? (
              navLinks.map(link => (
                link.type === "dropdown" ? (
                  <li key={link.id} className="nav-item dropdown">
                    <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                      {link.label}
                    </a>
                    <ul className="dropdown-menu">
                      {link.children && link.children.length > 0 ? (
                        link.children.map(child => (
                          <li key={child.id}>
                            {child.type === "internal" ? (
                              <Link className="dropdown-item" to={`/page/${child.pageId}`}>{child.label}</Link>
                            ) : (
                              <a className="dropdown-item" href={child.url} target="_blank" rel="noopener noreferrer">{child.label}</a>
                            )}
                          </li>
                        ))
                      ) : (
                        <li><span className="dropdown-item text-muted">Aucun lien</span></li>
                      )}
                    </ul>
                  </li>
                ) : (
                  <li key={link.id} className="nav-item">
                    {link.type === "internal" ? (
                      <Link className="nav-link" to={`/page/${link.pageId}`}>{link.label}</Link>
                    ) : (
                      <a className="nav-link" href={link.url} target="_blank" rel="noopener noreferrer">{link.label}</a>
                    )}
                  </li>
                )
              ))
            ) : (
              <li className="nav-item">
                <span className="nav-link text-muted">Aucun lien</span>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  )
}
