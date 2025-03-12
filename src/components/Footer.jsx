import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

export default function Footer() {
  const [settings, setSettings] = useState({
    siteName: "Mon Site",
    footerBgColor: "#000000",
    footerAlignment: "center",
    showFooterLinks: true
  })

  const [footerLinks, setFooterLinks] = useState([])

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

        // 🔹 Récupération des liens de navigation pour le footer
        const linksRes = await fetch("http://localhost:5000/api/navigation/footer")
        if (linksRes.ok) {
          const linksData = await linksRes.json()
          setFooterLinks(linksData)
        } else {
          console.error("❌ Erreur lors du chargement des liens du footer.")
        }

      } catch (error) {
        console.error("❌ Erreur lors du chargement des données Footer :", error)
      }
    }
    fetchData()
  }, [])

  // 🔹 Styles dynamiques du Footer
  const footerStyle = {
    backgroundColor: settings.footerBgColor,
    textAlign: settings.footerAlignment
  }

  return (
    <footer className="text-white text-center py-3 mt-auto" style={footerStyle}>
      
      {/* 🔹 Liens de navigation en haut */}
      {settings.showFooterLinks && (
        <div className="mb-2">
          {footerLinks.length > 0 ? (
            footerLinks.map(link => (
              link.type === "dropdown" ? (
                <div key={link.id} className="d-inline-block mx-2 dropdown">
                  <a className="text-white dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
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
                </div>
              ) : (
                <span key={link.id} className="mx-2">
                  {link.type === "internal" ? (
                    <Link className="text-white" to={`/page/${link.pageId}`}>{link.label}</Link>
                  ) : (
                    <a className="text-white" href={link.url} target="_blank" rel="noopener noreferrer">{link.label}</a>
                  )}
                </span>
              )
            ))
          ) : (
            <span className="text-muted">Aucun lien</span>
          )}
        </div>
      )}

      {/* 🔹 Texte fixe : Copyright + Année + Mentions Légales */}
      <p className="mb-0">
        © {new Date().getFullYear()} {settings.siteName} - Tous droits réservés
      </p>
      <Link to="/mentions-legales" className="text-white mt-1">Mentions Légales</Link>
    </footer>
  )
}
