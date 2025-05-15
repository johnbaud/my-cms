// src/pages/AdminSettings.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import AdminSettingsTabs from "../components/AdminSettingsTabs";
import { useAuth } from "../context/AuthContext";
import { authFetch } from "../utils/authFetch";
import TagsInput from "../components/TagsInput";

// React-Bootstrap
import { Tab } from "react-bootstrap";

// Enfants
import GeneralSettings from "../components/AdminSettings/GeneralSettings";
import NavigationSettings from "../components/AdminSettings/NavigationSettings";
import FooterSettings from "../components/AdminSettings/FooterSettings";
import FormulaireSettings from "../components/AdminSettings/FormulaireSettings";
import SeoGlobalSettings from "../components/AdminSettings/SeoGlobalSettings";

export default function AdminSettings() {
  const { accessToken } = useAuth();
  const navigate = useNavigate();

  const [settings, setSettings] = useState({
    siteName: "",
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
    allowedFileExtensions: [],
    defaultMetaKeywords: [],
  });
  const [mailCfg, setMailCfg] = useState({
    host: "",
    port: 587,
    user: "",
    pass: "",
    fromAddress: ""
  });
  const [navLinks, setNavLinks] = useState([]);
  const [footerLinks, setFooterLinks] = useState([]);
  const [message, setMessage] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  //  ─── FETCH INITIAL ────────────────────────────────────────────────────────────
  useEffect(() => {
    // 1) Paramètres globaux
    authFetch("/admin/settings", {}, accessToken)
      .then(res => res.json())
      .then(data => {
        if (data) {
          // si allowedFileExtensions en string, on split()
          const ext = Array.isArray(data.allowedFileExtensions)
            ? data.allowedFileExtensions
            : data.allowedFileExtensions?.split(",") || [];
          setSettings({ ...data, allowedFileExtensions: ext, defaultMetaKeywords: data.defaultMetaKeywords ? data.defaultMetaKeywords.split(",").map(k => k.trim()): [] });
        }
      })
      .catch(() => navigate("/login"));

    // 2) SMTP
    authFetch("/admin/mail-settings", {}, accessToken)
      .then(res => res.json())
      .then(data => {
        if (data) setMailCfg(data);
      })
      .catch(err => console.error("⚠️ fetch mailSettings:", err));

    // 3) Nav links
    authFetch("/navigation/navbar", {}, accessToken)
      .then(res => res.json())
      .then(setNavLinks)
      .catch(err => console.error("⚠️ fetch navbar links:", err));

    // 4) Footer links
    authFetch("/navigation/footer", {}, accessToken)
      .then(res => res.json())
      .then(setFooterLinks)
      .catch(err => console.error("⚠️ fetch footer links:", err));
  }, [accessToken, navigate, refreshTrigger]);

  //  ─── HANDLERS ────────────────────────────────────────────────────────────────
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    const payload = {
      ...settings,
      defaultMetaKeywords: settings.defaultMetaKeywords.join(","),
      allowedFileExtensions: settings.allowedFileExtensions.join(",")
    };
    const res = await authFetch(
      "/admin/settings",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      },
      accessToken
    );
    if (res.ok) {
      setMessage("✅ Paramètres mis à jour !");
      setRefreshTrigger(t => t + 1);
    } else {
      setMessage("❌ Erreur enregistrement paramètres");
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);
    const res = await authFetch("/upload-image", { method: "POST", body: formData }, accessToken);
    if (res.ok) {
      const data = await res.json();
      setSettings(s => ({ ...s, logo: data.url }));
      setMessage("✅ Logo mis à jour !");
    } else {
      setMessage("❌ Erreur upload logo");
    }
  };

  const handleDeleteLogo = async () => {
    const res = await authFetch("/admin/settings/logo", { method: "DELETE" }, accessToken);
    if (res.ok) {
      const data = await res.json();
      setSettings(s => ({ ...s, logo: data.logo }));
      setMessage("✅ Logo supprimé");
    } else {
      setMessage("❌ Erreur suppression logo");
    }
  };

  const handleSaveSMTP = async (e) => {
    e.preventDefault();
    const res = await authFetch(
      "/admin/mail-settings",
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mailCfg)
      },
      accessToken
    );
    if (res.ok) {
      setMessage("✅ Configuration SMTP mise à jour !");
    } else {
      setMessage("❌ Erreur SMTP");
    }
  };

  const handleUpdateNav = () => setRefreshTrigger(t => t + 1);
  const handleUpdateFooter = () => setRefreshTrigger(t => t + 1);

  //  ─── RENDU ───────────────────────────────────────────────────────────────────
  return (
    <div className="d-flex">
      <AdminSidebar />
      <div className="container mt-5" style={{ marginLeft: "260px" }}>
        <h2>⚙️ Paramètres du site</h2>
        {message && <div className="alert alert-info">{message}</div>}

        <AdminSettingsTabs>
          {(activeTab) => (
            <>
              <Tab.Pane eventKey="general">
                <GeneralSettings
                  settings={settings}
                  setSettings={setSettings}
                  onSave={handleSaveSettings}
                  onFileChange={handleFileChange}
                  onDeleteLogo={handleDeleteLogo}
                />
              </Tab.Pane>

              <Tab.Pane eventKey="navigation">
                <NavigationSettings
                  settings={settings}
                  setSettings={setSettings}
                  navLinks={navLinks}
                  onSave={handleSaveSettings}
                  onUpdateNav={handleUpdateNav}
                />
              </Tab.Pane>

              <Tab.Pane eventKey="footer">
                <FooterSettings
                  settings={settings}
                  setSettings={setSettings}
                  footerLinks={footerLinks}
                  onSave={handleSaveSettings}
                  onUpdateFooter={handleUpdateFooter}
                />
              </Tab.Pane>

              <Tab.Pane eventKey="forms">
                <FormulaireSettings
                  mailCfg={mailCfg}
                  setMailCfg={setMailCfg}
                  onSave={handleSaveSMTP}
                />
              </Tab.Pane>

              <Tab.Pane eventKey="seoGlobal">
                <SeoGlobalSettings 
                  settings={settings}
                  setSettings={setSettings}
                  onSave={handleSaveSettings}
                />  
              </Tab.Pane>
            </>
          )}
        </AdminSettingsTabs>
      </div>
    </div>
  );
}
