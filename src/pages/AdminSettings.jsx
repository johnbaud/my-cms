import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import { Settings, Save, Trash2 } from "lucide-react";
import AdminSettingsTabs from "../components/AdminSettingsTabs";
import { Tab } from "react-bootstrap";
import CustomNavbar from "../components/Navbar";
import Footer from "../components/Footer";
import NavigationLinksManager from "../components/NavigationLinksManager";
import { authFetch } from "../utils/authFetch";
import { useAuth } from "../context/AuthContext";

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    siteName: "Mon Site",
    logo: "",
    primaryColor: "#ffffff",
    showLogo: true,
    showSiteName: true,
    navAlignment: "left",
    navHeight: 40,
    navBgColor: "#ffffff",
    navTextColor: "#000000",
    footerBgColor: "#000000",
    footerTextColor: "#ffffff",
    footerAlignment: "center",
    showFooterLinks: true,
    allowedFileExtensions: "jpg,jpeg,png,gif,webp,svg,pdf,zip,mp4"
  });

  const { accessToken } = useAuth();
  const [message, setMessage] = useState("");
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [navLinks, setNavLinks] = useState([]);
  const [footerLinks, setFooterLinks] = useState([]);
  const [pendingLogo, setPendingLogo] = useState(null);
  const [previousLogo, setPreviousLogo] = useState(null);

  useEffect(() => {
    authFetch("/admin/settings", {}, accessToken)
      .then(res => res.json())
      .then(data => {
        if (data) setSettings(data);
      })
      .catch(() => navigate("/login"));

    fetch("http://localhost:5000/api/navigation/navbar")
      .then(res => res.json())
      .then(data => setNavLinks(data))
      .catch(() => console.error("❌ Erreur chargement navigation"));

    fetch("http://localhost:5000/api/navigation/footer")
      .then(res => res.json())
      .then(data => setFooterLinks(data))
      .catch(() => console.error("❌ Erreur chargement footer"));
  }, [navigate, refreshTrigger, accessToken]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await authFetch("/upload-image", {
        method: "POST",
        body: formData
      }, accessToken);

      if (response.ok) {
        const data = await response.json();
        setPreviousLogo(settings.logo);
        setSettings(prev => ({ ...prev, logo: data.url }));
        setPendingLogo(data.url);
      } else {
        console.error("⚠️ Erreur lors de l’upload du logo");
      }
    } catch (err) {
      console.error("❌ Erreur réseau pendant l’upload :", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await authFetch("/admin/settings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(settings)
    }, accessToken);

    if (response.ok) {
      if (
        previousLogo &&
        previousLogo !== "/assets/default-logo.png" &&
        previousLogo !== settings.logo
      ) {
        await authFetch("/delete-image", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: previousLogo })
        }, accessToken);
      }

      setMessage("Paramètres mis à jour avec succès !");
      setRefreshTrigger(t => t + 1);
      setPreviousLogo(null);
    } else {
      setMessage("Erreur lors de la mise à jour.");
    }
  };

  const handleDeleteLogo = async () => {
    try {
      const response = await authFetch("/admin/settings/logo", {
        method: "DELETE"
      }, accessToken);

      const data = await response.json();

      if (response.ok) {
        setSettings(prev => ({ ...prev, logo: data.logo }));
        setMessage("Logo supprimé avec succès.");
      } else {
        setMessage("Erreur lors de la suppression du logo.");
      }
    } catch (err) {
      console.error("❌ Erreur pendant la suppression du logo :", err);
      setMessage("Erreur réseau lors de la suppression.");
    }
  };

  const triggerFileInput = () => fileInputRef.current.click();

  return (
    <div className="d-flex">
      <AdminSidebar />
      <div className="container mt-5" style={{ marginLeft: "260px" }}>
        <h2><Settings size={24} className="me-2" /> Paramètres du site</h2>
        {message && <p className="text-success">{message}</p>}

        <AdminSettingsTabs>
          {(activeTab) => (
            <>
              {/* Onglet général */}
              <Tab.Pane eventKey="general">
                <form onSubmit={handleSubmit}>
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
                    {!settings.logo && (
                      <input
                        type="file"
                        className="form-control"
                        accept="image/png, image/jpeg, image/svg+xml"
                        onChange={handleFileChange}
                      />
                    )}

                    {settings.logo && (
                      <div className="mt-2">
                        <img src={settings.logo} alt="Logo actuel" style={{ maxWidth: "100px" }} />
                        <div className="d-flex gap-2 mt-2">
                          <button
                            type="button"
                            className="btn btn-outline-primary btn-sm"
                            onClick={triggerFileInput}
                          >
                            Changer le logo
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm"
                            onClick={handleDeleteLogo}
                          >
                            Supprimer
                          </button>
                        </div>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          className="d-none"
                          accept="image/png, image/jpeg, image/svg+xml"
                        />
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
                  <div className="mb-3">
                    <label>Extensions autorisées pour l’upload</label>
                    <select
                      className="form-select"
                      multiple
                      value={Array.isArray(settings.allowedFileExtensions) ? settings.allowedFileExtensions : (settings.allowedFileExtensions || "").split(",")}
                      onChange={(e) => {
                        const selected = Array.from(e.target.selectedOptions).map(opt => opt.value);
                        setSettings({ ...settings, allowedFileExtensions: selected });
                      }}
                    >
                      <optgroup label="📷 Images">
                        <option value="jpg">JPG</option>
                        <option value="jpeg">JPEG</option>
                        <option value="png">PNG</option>
                        <option value="gif">GIF</option>
                        <option value="webp">WEBP</option>
                        <option value="svg">SVG</option>
                      </optgroup>

                      <optgroup label="📄 Documents">
                        <option value="pdf">PDF</option>
                        <option value="txt">TXT</option>
                        <option value="csv">CSV</option>
                        <option value="json">JSON</option>
                        <option value="xml">XML</option>
                        <option value="md">MD</option>
                      </optgroup>

                      <optgroup label="📦 Archives">
                        <option value="zip">ZIP</option>
                        <option value="rar">RAR</option>
                        <option value="7z">7Z</option>
                        <option value="tar">TAR</option>
                        <option value="gz">GZ</option>
                      </optgroup>

                      <optgroup label="🎥 Vidéos">
                        <option value="mp4">MP4</option>
                        <option value="webm">WEBM</option>
                        <option value="mov">MOV</option>
                      </optgroup>

                      <optgroup label="🎧 Audio">
                        <option value="mp3">MP3</option>
                        <option value="wav">WAV</option>
                        <option value="ogg">OGG</option>
                      </optgroup>
                    </select>
                    <div className="form-text">
                      Utilisez Ctrl/Cmd + clic pour en sélectionner plusieurs.
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary">
                    <Save size={20} className="me-2" /> Enregistrer
                  </button>
                </form>
              </Tab.Pane>

              {/* Onglet navigation */}
              <Tab.Pane eventKey="navigation">
                <CustomNavbar settings={settings} navLinks={navLinks} />
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label>Afficher le logo</label>
                    <div>
                      <button
                        type="button"
                        className={`btn ${settings.showLogo ? "btn-success" : "btn-outline-secondary"} me-2`}
                        onClick={() => setSettings({ ...settings, showLogo: true })}
                      >Oui</button>
                      <button
                        type="button"
                        className={`btn ${!settings.showLogo ? "btn-danger" : "btn-outline-secondary"}`}
                        onClick={() => setSettings({ ...settings, showLogo: false })}
                      >Non</button>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label>Afficher le nom du site</label>
                    <div>
                      <button
                        type="button"
                        className={`btn ${settings.showSiteName ? "btn-success" : "btn-outline-secondary"} me-2`}
                        onClick={() => setSettings({ ...settings, showSiteName: true })}
                      >Oui</button>
                      <button
                        type="button"
                        className={`btn ${!settings.showSiteName ? "btn-danger" : "btn-outline-secondary"}`}
                        onClick={() => setSettings({ ...settings, showSiteName: false })}
                      >Non</button>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label>Alignement de la navigation</label>
                    <select className="form-select" value={settings.navAlignment} onChange={(e) => setSettings({ ...settings, navAlignment: e.target.value })}>
                      <option value="left">Gauche</option>
                      <option value="center">Centre</option>
                      <option value="right">Droite</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label>Hauteur de la barre de navigation : {settings.navHeight}px</label>
                    <input type="range" className="form-range" min="40" max="120" value={settings.navHeight} onChange={(e) => setSettings({ ...settings, navHeight: e.target.value })} />
                  </div>

                  <div className="mb-3">
                    <label>Couleur de fond</label>
                    <input type="color" className="form-control form-control-color" value={settings.navBgColor} onChange={(e) => setSettings({ ...settings, navBgColor: e.target.value })} />
                  </div>

                  <div className="mb-3">
                    <label>Couleur du texte</label>
                    <input type="color" className="form-control form-control-color" value={settings.navTextColor} onChange={(e) => setSettings({ ...settings, navTextColor: e.target.value })} />
                  </div>

                  <button type="submit" className="btn btn-primary">Enregistrer les paramètres</button>
                </form>
                <NavigationLinksManager location="navbar" onUpdate={() => setRefreshTrigger(t => t + 1)} />
              </Tab.Pane>

              {/* Onglet footer */}
              <Tab.Pane eventKey="footer">
                <Footer settings={settings} footerLinks={footerLinks} />
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label>Couleur de fond</label>
                    <input type="color" className="form-control form-control-color" value={settings.footerBgColor} onChange={(e) => setSettings({ ...settings, footerBgColor: e.target.value })} />
                  </div>

                  <div className="mb-3">
                    <label>Couleur du texte</label>
                    <input type="color" className="form-control form-control-color" value={settings.footerTextColor} onChange={(e) => setSettings({ ...settings, footerTextColor: e.target.value })} />
                  </div>

                  <div className="mb-3">
                    <label>Alignement du texte</label>
                    <select className="form-select" value={settings.footerAlignment} onChange={(e) => setSettings({ ...settings, footerAlignment: e.target.value })}>
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
                <NavigationLinksManager location="footer" onUpdate={() => setRefreshTrigger(t => t + 1)} />
              </Tab.Pane>

              {/* Onglet formulaires */}
              <Tab.Pane eventKey="forms">
                <p>⚙️ Ici on va gérer les formulaires.</p>
              </Tab.Pane>
            </>
          )}
        </AdminSettingsTabs>
      </div>
    </div>
  );
}
