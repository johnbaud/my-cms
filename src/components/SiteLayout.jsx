import Navbar from "./Navbar"
import Footer from "./Footer"

export default function SiteLayout({  children, settings, navLinks, footerLinks  }) {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar settings={settings} navLinks={navLinks} />
      <main className="flex-grow-1 w-100"> {/* 🔹 Ajout de w-100 pour pleine largeur */}
        <div className="container-fluid">{children}</div> {/* 🔹 Ajout de container-fluid */}
      </main>
      <Footer settings={settings} footerLinks={footerLinks} />
    </div>
  )
}
