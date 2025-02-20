import { Link, useNavigate } from "react-router-dom"

export default function AdminNav() {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("role")
    navigate("/login")
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/admin">Dashboard</Link>
        <div className="collapse navbar-collapse">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/admin/settings">Paramètres</Link>
            </li>
            <li className="nav-item">
              <button className="btn btn-danger ms-3" onClick={handleLogout}>Déconnexion</button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  )
}
