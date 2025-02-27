import Navbar from "./Navbar"
import Footer from "./Footer"

export default function SiteLayout({ children }) {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <main className="flex-grow-1 w-100"> {/* 🔹 Ajout de w-100 pour pleine largeur */}
        <div className="container-fluid">{children}</div> {/* 🔹 Ajout de container-fluid */}
      </main>
      <Footer />
    </div>
  )
}
