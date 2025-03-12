import React from "react"

export default function NavbarPreview({ settings }) {
  return (
    <div className="mb-4">
      <h5>Prévisualisation</h5>
      <div 
        className="navbar navbar-expand-lg"
        style={{
          backgroundColor: settings.navBgColor,
          height: `${settings.navHeight}px`,
          display: "flex",
          alignItems: "center",
          justifyContent: settings.navAlignment === "center"
            ? "center"
            : settings.navAlignment === "right"
            ? "flex-end"
            : "flex-start",
          padding: "0 20px"
        }}
      >
        <div className="container d-flex justify-content-between">
          {/* Logo + Nom du site */}
          <div className="d-flex align-items-center">
            {settings.showLogo && (
              <img src={settings.logo} alt="Logo" style={{ maxHeight: "40px", marginRight: "10px" }} />
            )}
            {settings.showSiteName && <span className="fw-bold">{settings.siteName}</span>}
          </div>

          {/* 🔹 Liens de navigation fictifs */}
          <div>
            <a href="#" className="nav-link d-inline mx-2 text-dark">Accueil</a>
            <a href="#" className="nav-link d-inline mx-2 text-dark">À Propos</a>
            <a href="#" className="nav-link d-inline mx-2 text-dark">Contact</a>
          </div>
        </div>
      </div>
    </div>
  )
}
