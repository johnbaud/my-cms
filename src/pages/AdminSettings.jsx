import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import AdminSidebar from "../components/AdminSidebar"
import { Settings, Save, Upload, Trash2 } from "lucide-react"

export default function AdminSettings() {
  const [settings, setSettings] = useState({ siteName: "Mon Site", logo: "", primaryColor: "#ffffff" })
  const [message, setMessage] = useState("")
  const [logoFile, setLogoFile] = useState(null) // 🔹 Stocke le fichier sélectionné
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem("token")
  
    fetch("http://localhost:5000/api/admin/settings", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data) setSettings(data)
      })
      .catch(() => navigate("/login"))
  }, [navigate])
  

  const handleFileChange = (e) => {
    setLogoFile(e.target.files[0])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const token = localStorage.getItem("token")
    const formData = new FormData()

    formData.append("siteName", settings.siteName)
    formData.append("primaryColor", settings.primaryColor)
    if (logoFile) formData.append("logo", logoFile) // 🔹 Ajoute le fichier si sélectionné

    const response = await fetch("http://localhost:5000/api/admin/settings", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }, // 🔹 Pas de `Content-Type`, il est géré par FormData
      body: formData
    })

    if (response.ok) {
      setMessage("Paramètres mis à jour avec succès !")
    } else {
      setMessage("Erreur lors de la mise à jour.")
    }
  }

  const handleDeleteLogo = async () => {
    const token = localStorage.getItem("token")
  
    const response = await fetch("http://localhost:5000/api/admin/settings/logo", {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    })
  
    const data = await response.json()
    if (response.ok) {
      setSettings(prev => ({ ...prev, logo: data.logo })) // 🔹 Met à jour l'affichage
      setMessage("Logo supprimé avec succès.")
    } else {
      setMessage("Erreur lors de la suppression du logo.")
    }
  }
  
  return (
    <div className="d-flex">
      <AdminSidebar />
      <div className="container mt-5" style={{ marginLeft: "260px" }}>
        <h2><Settings size={24} className="me-2" /> Paramètres du site</h2>
        {message && <p className="text-success">{message}</p>}

        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <div className="mb-3">
            <label>Nom du site</label>
            <input
              type="text"
              className="form-control"
              value={settings.siteName}
              onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
              required
            />
          </div>

          {/* Upload du logo */}
          <div className="mb-3">
            <label>Logo</label>
            <input
              type="file"
              className="form-control"
              accept="image/png, image/jpeg, image/svg+xml"
              onChange={handleFileChange}
            />
            {settings.logo && (
              <div className="mt-2">
                <img src={settings.logo} alt="Logo actuel" style={{ maxWidth: "100px" }} />
                {settings.logo !== "/assets/default-logo.png" && (
                  <button type="button" className="btn btn-danger btn-sm ms-2" onClick={handleDeleteLogo} title="Supprimer">
                    <Trash2 size={16}/>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Sélection de couleur */}
          <div className="mb-3">
            <label>Couleur principale</label>
            <input
              type="color"
              className="form-control form-control-color"
              value={settings.primaryColor}
              onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
            />
          </div>

          <button type="submit" className="btn btn-primary">
            <Save size={20} className="me-2" /> Enregistrer
          </button>
        </form>
      </div>
    </div>
  )
}
