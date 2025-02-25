import { Link, useNavigate, useLocation } from "react-router-dom"
import { useEffect, useState } from "react"
import { Menu, X, Home, Settings, FileText, LogOut } from "lucide-react"


export default function AdminSidebar() {
  const navigate = useNavigate()
  const location = useLocation() // 🔹 Récupère l'URL actuelle
  const [userName, setUserName] = useState("")
  const [isExpanded, setIsExpanded] = useState(true) 

  useEffect(() => {
    const storedUser = localStorage.getItem("username")
    if (storedUser) setUserName(storedUser)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("role")
    localStorage.removeItem("username")
    navigate("/login")
  }

  // 🔹 Fonction pour gérer la classe active et désactiver le lien actif
  const getNavLinkClass = (path) => 
    location.pathname === path 
      ? "nav-link text-white fw-bold bg-primary disabled"  // ✅ Surbrillance + désactivé
      : "nav-link text-white"

  return (
    <div className={`d-flex flex-column vh-100 bg-dark text-white p-3 ${isExpanded ? "sidebar-expanded" : "sidebar-collapsed"}`} 
         style={{ width: isExpanded ? "250px" : "80px", position: "fixed", left: 0, top: 0, transition: "width 0.3s" }}>
      <button className="btn btn-outline-light mb-3" onClick={() => setIsExpanded(!isExpanded)}>
        {isExpanded ? <X size={20} /> : <Menu size={20} />}
      </button>    
      <h3 className={`mb-4 ${isExpanded ? "" : "d-none"}`}>Admin Panel</h3>
      <ul className="nav flex-column">
        <li className="nav-item mb-2">
          <Link className={getNavLinkClass("/admin")} to="/admin">
            <Home size={20} className={isExpanded ? "me-2" : "d-block mx-auto"} /> {isExpanded && "Dashboard"}
          </Link>
        </li>
        <li className="nav-item mb-2">
          <Link className={getNavLinkClass("/admin/settings")} to="/admin/settings">
            <Settings size={20} className={isExpanded ? "me-2" : "d-block mx-auto"} /> {isExpanded && "Paramètres"}
          </Link>
        </li>
        <li className="nav-item mb-2">
          <Link className={getNavLinkClass("/admin/pages")} to="/admin/pages">
            <FileText size={20} className={isExpanded ? "me-2" : "d-block mx-auto"} /> {isExpanded && "Gérer les pages"}
          </Link>
        </li>
      </ul>
      <div className="mt-auto">
        <p className={`text-white-50 ${isExpanded ? "" : "d-none"}`}>Connecté en tant que {userName || "Admin"}</p>
        <button className="btn btn-danger w-100 mt-3" onClick={handleLogout}>
          <LogOut size={20} className={isExpanded ? "me-2" : "d-block mx-auto"} /> {isExpanded && "Déconnexion"}
        </button>
      </div>
    </div>
  )
}
