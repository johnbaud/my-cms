import React from "react"

export default function FooterPreview({ settings }) {
  return (
    <div className="mb-4">
      <h5>Prévisualisation</h5>
      <div className="p-3 text-white" style={{ backgroundColor: settings.footerBgColor, textAlign: settings.footerAlignment }}>
        
        {/* 🔹 Liens de navigation en haut */}
        {settings.showFooterLinks && (
          <div className="mb-2">
            <a href="#" className="text-white mx-2">Accueil</a>
            <a href="#" className="text-white mx-2">À Propos</a>
            <a href="#" className="text-white mx-2">Contact</a>
          </div>
        )}

        {/* 🔹 Texte fixe : Copyright + Année + Mentions Légales */}
        <p className="mb-0">
          © {new Date().getFullYear()} {settings.siteName} - Tous droits réservés - <a href="#" className="text-white mt-1">Mentions Légales</a>
        </p>
      </div>
    </div>
  )
}
