import { useEffect, useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import AdminSidebar from "../components/AdminSidebar"
import { FileText, Plus, Edit, Trash2 } from "lucide-react"

export default function AdminPages() {
  const [pages, setPages] = useState([])
  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [message, setMessage] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    fetch("http://localhost:5000/api/pages")
      .then(res => res.json())
      .then(data => setPages(data))
  }, [])

  const handleCreatePage = async (e) => {
    e.preventDefault()
    const token = localStorage.getItem("token")
    console.log("Token utilisé :", token)
    const response = await fetch("http://localhost:5000/api/pages", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ title, slug })
    })
    const data = await response.json()
    console.log("Réponse API :", data)
    
    if (response.ok) {
      setMessage("✅ Page créée avec succès !")
      setTitle("")
      setSlug("")
      fetch("http://localhost:5000/api/pages")
        .then(res => res.json())
        .then(data => setPages(data))
    } else {
      setMessage("❌ Erreur lors de la création de la page.")
    }
  }

  const handleDeletePage = async (pageId) => {
    const token = localStorage.getItem("token")
  
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette page ? Cette action est irréversible.")) {
      return
    }
  
    const response = await fetch(`http://localhost:5000/api/pages/${pageId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    })
  
    if (response.ok) {
      setPages(pages.filter(page => page.id !== pageId)) // 🔹 Met à jour l'affichage
    } else {
      const errorData = await response.json().catch(() => ({ message: "Erreur inconnue" }))
      console.log("❌ Erreur API :", errorData)
    }
  }
  
  return (
    <div className="d-flex">
      <AdminSidebar />
      <div className="container mt-5" style={{ marginLeft: "260px" }}>
      <h2><FileText size={24} className="me-2" /> Gestion des pages</h2>
        {message && <p className={message.startsWith("✅") ? "text-success" : "text-danger"}>{message}</p>}

        {/* Formulaire de création */}
        <form onSubmit={handleCreatePage} className="mb-4">
          <div className="mb-3">
            <label>Titre de la page</label>
            <input type="text" className="form-control" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="mb-3">
            <label>Slug (URL)</label>
            <input type="text" className="form-control" value={slug} onChange={(e) => setSlug(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary">
            <Plus size={20} className="me-2" /> Ajouter la page
          </button>
        </form>

        {/* Liste des pages */}
        <h3><FileText size={20} className="me-2" /> Pages existantes</h3>
        <ul className="list-group">
          {pages.map(page => (
            <li key={page.id} className="list-group-item d-flex justify-content-between align-items-center">
              {page.title} ({page.slug})
              <Link to={`/admin/pages/${page.id}`} className="btn btn-secondary btn-sm" title="Modifier">
                <Edit size={16}/>
              </Link>
              <button className="btn btn-danger btn-sm" onClick={() => handleDeletePage(page.id)} title="Supprimer">
                <Trash2 size={16}/>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
