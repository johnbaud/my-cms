import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import AdminSidebar from "../components/AdminSidebar"
import { Settings, Save, Trash2 } from "lucide-react"
import AdminSettingsTabs from "../components/AdminSettingsTabs" // 🔹 Nouveau nom
import { Tab } from "react-bootstrap"
import NavbarPreview from "../components/NavbarPreview"
import FooterPreview from "../components/FooterPreview"
import NavigationLinksManager from "../components/NavigationLinksManager"


export default function AdminSettings() {
  const [settings, setSettings] = useState({ siteName: "Mon Site", logo: "", primaryColor: "#ffffff" })
  const [message, setMessage] = useState("")
  const [logoFile, setLogoFile] = useState(null) 
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
    if (logoFile) formData.append("logo", logoFile)
    formData.append("showLogo", settings.showLogo)
    formData.append("showSiteName", settings.showSiteName)
    formData.append("navAlignment", settings.navAlignment)
    formData.append("navHeight", settings.navHeight) // Pas besoin de parseInt ici, c'est géré par le back
    formData.append("navBgColor", settings.navBgColor)
    const response = await fetch("http://localhost:5000/api/admin/settings", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
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
      setSettings(prev => ({ ...prev, logo: data.logo }))
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

        <AdminSettingsTabs>
          {(activeTab) => (
            <>
              <Tab.Pane eventKey="general">
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
              </Tab.Pane>

              <Tab.Pane eventKey="navigation">
                <NavbarPreview settings={settings} />
                <form onSubmit={handleSubmit}>
                  
                  {/* Afficher/Masquer le logo */}
                  <div className="mb-3">
                    <label>Afficher le logo</label>
                    <div>
                      <button 
                        type="button" 
                        className={`btn ${settings.showLogo ? "btn-success" : "btn-outline-secondary"} me-2`} 
                        onClick={() => setSettings({ ...settings, showLogo: true })}
                      >
                        Oui
                      </button>
                      <button 
                        type="button" 
                        className={`btn ${!settings.showLogo ? "btn-danger" : "btn-outline-secondary"}`} 
                        onClick={() => setSettings({ ...settings, showLogo: false })}
                      >
                        Non
                      </button>
                    </div>
                  </div>

                  {/* Afficher/Masquer le nom du site */}
                  <div className="mb-3">
                    <label>Afficher le nom du site</label>
                    <div>
                      <button 
                        type="button" 
                        className={`btn ${settings.showSiteName ? "btn-success" : "btn-outline-secondary"} me-2`} 
                        onClick={() => setSettings({ ...settings, showSiteName: true })}
                      >
                        Oui
                      </button>
                      <button 
                        type="button" 
                        className={`btn ${!settings.showSiteName ? "btn-danger" : "btn-outline-secondary"}`} 
                        onClick={() => setSettings({ ...settings, showSiteName: false })}
                      >
                        Non
                      </button>
                    </div>
                  </div>

                  {/* Alignement */}
                  <div className="mb-3">
                    <label>Alignement de la navigation</label>
                    <select 
                      className="form-select"
                      value={settings.navAlignment}
                      onChange={(e) => setSettings({ ...settings, navAlignment: e.target.value })}
                    >
                      <option value="left">Gauche</option>
                      <option value="center">Centre</option>
                      <option value="right">Droite</option>
                    </select>
                  </div>

                  {/* Hauteur de la navbar */}
                  <div className="mb-3">
                    <label>Hauteur de la barre de navigation : {settings.navHeight}px</label>
                    <input 
                      type="range"
                      className="form-range"
                      min="40"
                      max="120"
                      value={settings.navHeight}
                      onChange={(e) => setSettings({ ...settings, navHeight: e.target.value })}
                    />
                  </div>

                  {/* Couleur de fond */}
                  <div className="mb-3">
                    <label>Couleur de fond</label>
                    <input 
                      type="color"
                      className="form-control form-control-color"
                      value={settings.navBgColor}
                      onChange={(e) => setSettings({ ...settings, navBgColor: e.target.value })}
                    />
                  </div>

                  <button type="submit" className="btn btn-primary">
                    Enregistrer les paramètres
                  </button>
                </form>
                <NavigationLinksManager location="navbar" />
              </Tab.Pane>


              <Tab.Pane eventKey="footer">
                <FooterPreview settings={settings} />

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label>Couleur de fond</label>
                    <input 
                      type="color"
                      className="form-control form-control-color"
                      value={settings.footerBgColor}
                      onChange={(e) => setSettings({ ...settings, footerBgColor: e.target.value })}
                    />
                  </div>

                  <div className="mb-3">
                    <label>Alignement du texte</label>
                    <select 
                      className="form-select"
                      value={settings.footerAlignment}
                      onChange={(e) => setSettings({ ...settings, footerAlignment: e.target.value })}
                    >
                      <option value="left">Gauche</option>
                      <option value="center">Centre</option>
                      <option value="right">Droite</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label>Afficher les liens ?</label>
                    <button type="button" className={`btn ${settings.showFooterLinks ? "btn-success" : "btn-outline-secondary"} me-2`} onClick={() => setSettings({ ...settings, showFooterLinks: true })}>Oui</button>
                    <button type="button" className={`btn ${!settings.showFooterLinks ? "btn-danger" : "btn-outline-secondary"}`} onClick={() => setSettings({ ...settings, showFooterLinks: false })}>Non</button>
                  </div>

                  <button type="submit" className="btn btn-primary">Enregistrer</button>
                </form>
                <NavigationLinksManager location="footer" />
              </Tab.Pane>

              <Tab.Pane eventKey="forms">
                <p>⚙️ Ici on va gérer les formulaires.</p>
              </Tab.Pane>
            </>
          )}
        </AdminSettingsTabs>
      </div>
    </div>
  )
}
