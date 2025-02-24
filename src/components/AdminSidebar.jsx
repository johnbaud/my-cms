import { Link, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"

export default function AdminSidebar() {
  const navigate = useNavigate()
  const [userName, setUserName] = useState("")

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

  return (
    <div className="d-flex flex-column vh-100 bg-dark text-white p-3" style={{ width: "250px", position: "fixed", left: 0, top: 0 }}>
      <h3 className="mb-4">Admin Panel</h3>
      <ul className="nav flex-column">
        <li className="nav-item mb-2">
          <Link className="nav-link text-white" to="/admin">🏠 Dashboard</Link>
        </li>
        <li className="nav-item mb-2">
          <Link className="nav-link text-white" to="/admin/settings">⚙️ Paramètres</Link>
        </li>
      </ul>
      <div className="mt-auto">
        <p className="text-white-50">Connecté en tant que {userName || "Admin"}</p>
        <button className="btn btn-danger w-100" onClick={handleLogout}>🚪 Déconnexion</button>
      </div>
    </div>
  )
}

