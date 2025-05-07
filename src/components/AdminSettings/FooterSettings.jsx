import React from "react";
import { Save } from "lucide-react";
import Footer from "../Footer";
import NavigationLinksManager from "../NavigationLinksManager";

export default function FooterSettings({
  settings,
  setSettings,
  footerLinks,
  onSave,
  onUpdateFooter
}) {
  return (
    <>
      <Footer settings={settings} footerLinks={footerLinks} />

      <form onSubmit={onSave}>
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
          <label>Couleur du texte</label>
          <input
            type="color"
            className="form-control form-control-color"
            value={settings.footerTextColor}
            onChange={(e) => setSettings({ ...settings, footerTextColor: e.target.value })}
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
          <div>
            <button
              type="button"
              className={`btn ${settings.showFooterLinks ? "btn-success" : "btn-outline-secondary"} me-2`}
              onClick={() => setSettings({ ...settings, showFooterLinks: true })}
            >
              Oui
            </button>
            <button
              type="button"
              className={`btn ${!settings.showFooterLinks ? "btn-danger" : "btn-outline-secondary"}`}
              onClick={() => setSettings({ ...settings, showFooterLinks: false })}
            >
              Non
            </button>
          </div>
        </div>

        <button type="submit" className="btn btn-primary">
          <Save size={20} className="me-2" /> Enregistrer
        </button>
      </form>

      <NavigationLinksManager location="footer" onUpdate={onUpdateFooter} />
    </>
  );
}
