import React from "react";
import { Save } from "lucide-react";
import CustomNavbar from "../Navbar";
import NavigationLinksManager from "../NavigationLinksManager";

export default function NavigationSettings({
  settings,
  setSettings,
  navLinks,
  onSave,
  onUpdateNav
}) {
  return (
    <>
      <CustomNavbar settings={settings} navLinks={navLinks} />

      <form onSubmit={onSave}>
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

        <div className="mb-3">
          <label>Hauteur de la barre : {settings.navHeight}px</label>
          <input
            type="range"
            className="form-range"
            min="40"
            max="120"
            value={settings.navHeight}
            onChange={(e) => setSettings({ ...settings, navHeight: +e.target.value })}
          />
        </div>

        <div className="mb-3">
          <label>Couleur de fond</label>
          <input
            type="color"
            className="form-control form-control-color"
            value={settings.navBgColor}
            onChange={(e) => setSettings({ ...settings, navBgColor: e.target.value })}
          />
        </div>

        <div className="mb-3">
          <label>Couleur du texte</label>
          <input
            type="color"
            className="form-control form-control-color"
            value={settings.navTextColor}
            onChange={(e) => setSettings({ ...settings, navTextColor: e.target.value })}
          />
        </div>

        <button type="submit" className="btn btn-primary">
          <Save size={20} className="me-2" /> Enregistrer
        </button>
      </form>

      <NavigationLinksManager location="navbar" onUpdate={onUpdateNav} />
    </>
  );
}
