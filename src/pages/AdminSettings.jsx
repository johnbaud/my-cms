import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import AdminSidebar from "../components/AdminSidebar"

export default function AdminSettings() {
  const [settings, setSettings] = useState({ siteName: "", logo: "", primaryColor: "" })
  const [message, setMessage] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem("token")
    const role = localStorage.getItem("role")

    if (!token || role !== "admin") {
      navigate("/login")
      return
    }

    fetch("http://localhost:5000/api/admin/settings", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data) setSettings(data)
      })
      .catch(() => navigate("/login"))
  }, [navigate]) // 🔹 Ajout de `navigate` en dépendance pour éviter un warning

  const handleSubmit = async (e) => {
    e.preventDefault()
    const token = localStorage.getItem("token")

    const response = await fetch("http://localhost:5000/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(settings)
    })

    if (response.ok) {
      setMessage("✅ Mise à jour réussie !")
    } else {
      setMessage("❌ Erreur lors de la mise à jour.")
    }
  }

  return (
    <div className="d-flex">
      <AdminSidebar />
      <div className="container mt-5" style={{ marginLeft: "260px" }}>
        <h2>⚙️ Paramètres du site</h2>
        {message && <p className={message.startsWith("✅") ? "text-success" : "text-danger"}>{message}</p>}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label>Nom du site</label>
            <input
              type="text"
              className="form-control"
              value={settings.siteName || ""}
              onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
              required
            />
          </div>

          <div className="mb-3">
            <label>Logo (URL)</label>
            <input
              type="text"
              className="form-control"
              value={settings.logo || ""}
              onChange={(e) => setSettings({ ...settings, logo: e.target.value })}
            />
          </div>

          <div className="mb-3">
            <label>Couleur principale</label>
            <input
              type="text"
              className="form-control"
              value={settings.primaryColor || ""}
              onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
            />
          </div>

          <button type="submit" className="btn btn-primary">💾 Enregistrer</button>
        </form>
      </div>
    </div>
  )
}
