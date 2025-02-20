import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import AdminNav from "../components/AdminNav"


export default function Admin() {
  const [message, setMessage] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem("token")
    const role = localStorage.getItem("role")

    if (!token || role !== "admin") {
      navigate("/login") // Redirection si pas admin
    } else {
      fetch("http://localhost:5000/api/admin", {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => setMessage(data.message))
        .catch(() => navigate("/login"))
    }
  }, [])

  return (
    <div>
        <AdminNav />
        <div className="container mt-5">
            <h1>{message}</h1>
            <nav className="mt-4">
                <ul className="list-unstyled">
                <li>
                    <a href="/admin/settings" className="btn btn-primary">Gérer les paramètres</a>
                </li>
                </ul>
            </nav>
            <button className="btn btn-danger" onClick={() => {
                localStorage.removeItem("token")
                localStorage.removeItem("role")
                navigate("/login")
            }}>Déconnexion</button>
        </div>
    </div>

  )
}
