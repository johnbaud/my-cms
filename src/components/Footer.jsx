import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

export default function Footer({ settings, footerLinks }) {
  if (!settings) return null;

  return (
    <footer className="text-white text-center py-3 mt-auto"
      style={{ backgroundColor: settings.footerBgColor, color: settings.footerTextColor }}>
      {settings.showFooterLinks && (
        <div className="container d-flex justify-content-md-center mb-3">
          {footerLinks.map((parentLink) => (
            <div key={parentLink.id} className="mx-2">
              <strong className="text-uppercase" style={{ color: settings.footerTextColor }}>{parentLink.label}</strong>
              <ul className="list-unstyled">
                {parentLink.children?.map((child) => (
                  <li key={child.id}>
                    <Link className="text-decoration-none" to={`/${child.page?.slug || "#"}`} style={{ color: settings.footerTextColor }}>
                      {child.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
      {/* 🔹 Texte Copyright */}
      <p className="mb-0" style={{ textDecoration: "none", color: settings.footerTextColor }}>
        © {new Date().getFullYear()} {settings.siteName} - Tous droits réservés -  <Link to="/mentions-legales" className="mt-1" style={{ textDecoration: "none", color: settings.footerTextColor }}>Mentions Légales</Link>
      </p>
    </footer>
  );
}

