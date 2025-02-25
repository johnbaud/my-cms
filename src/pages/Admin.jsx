import { useEffect, useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import AdminSidebar from "../components/AdminSidebar"
import { Home, Settings, FileText, LogOut } from "lucide-react"

export default function Admin() {
  const [message, setMessage] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem("token")
    const role = localStorage.getItem("role")

    if (!token || role !== "admin") {
      navigate("/login") // 🔹 Redirige si l'utilisateur n'est pas admin
    } else {
      fetch("http://localhost:5000/api/admin", {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => setMessage(data.message))
        .catch(() => navigate("/login"))
    }
  }, [navigate]) // 🔹 Ajoute `navigate` pour éviter un bug de dépendance

  return (
    <div className="d-flex">
      <AdminSidebar />
      <div className="container mt-5" style={{ marginLeft: "260px" }}>
        <h1>{message}</h1>
        
        {/* Utilisation de Link au lieu de <a href> */}
        <nav className="mt-4">
          <ul className="list-unstyled">
            <li>
              <Link to="/admin/settings" className="btn btn-primary">
                <Settings size={20} className="me-2" /> Gérer les paramètres
              </Link>
            </li>
            <li className="mt-2">
              <Link to="/admin/pages" className="btn btn-success">
                <FileText size={20} className="me-2" /> Gérer les pages
              </Link>
            </li>
          </ul>
        </nav>

        {/* Bouton Déconnexion */}
        <button className="btn btn-danger mt-3" onClick={() => {
          localStorage.removeItem("token")
          localStorage.removeItem("role")
          navigate("/login")
        }}>
          <LogOut size={20} className="me-2" /> Déconnexion
        </button>
      </div>
    </div>
  )
}
