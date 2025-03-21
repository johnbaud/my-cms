import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import AdminSidebar from "../components/AdminSidebar"
import { FileText, Plus, Edit, Trash2, Save } from "lucide-react"

const safeParseContent = (content) => {
  try {
    return JSON.parse(content)
  } catch {
    return content
  }
}

export default function AdminPageEditor() {
  const { pageId } = useParams()
  const navigate = useNavigate()
  const [page, setPage] = useState(null)
  const [blocks, setBlocks] = useState([])
  const [newBlockType, setNewBlockType] = useState("text")
  const [newBlockContent, setNewBlockContent] = useState("")
  const [message, setMessage] = useState("")

  useEffect(() => {
    const token = localStorage.getItem("token")
    fetch(`http://localhost:5000/api/pages/${pageId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setPage(data)
        setBlocks(data.blocks || [])
      })
      .catch(() => navigate("/admin/pages"))
  }, [pageId, navigate])

  const handleAddBlock = async () => {
    const token = localStorage.getItem("token")
    const response = await fetch(`http://localhost:5000/api/pages/${pageId}/blocks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        type: newBlockType,
        content: newBlockContent,
        order: blocks.length
      })
    })

    if (response.ok) {
      const newBlock = await response.json()
      setBlocks([...blocks, newBlock])
      setNewBlockContent("")
    } else {
      const errorData = await response.json().catch(() => ({ message: "Erreur inconnue" }))
      console.log("❌ Erreur API :", errorData)
    }
  }

  const handleUpdateBlock = async (blockId, newContent) => {
    const token = localStorage.getItem("token")
    const response = await fetch(`http://localhost:5000/api/pages/blocks/${blockId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ content: newContent })
    })

    if (response.ok) {
      setBlocks(blocks.map(b => b.id === blockId ? { ...b, content: newContent } : b))
    }
  }

  const handleDeleteBlock = async (blockId) => {
    const token = localStorage.getItem("token")
    const response = await fetch(`http://localhost:5000/api/pages/blocks/${blockId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    })

    if (response.ok) {
      setBlocks(blocks.filter(b => b.id !== blockId))
    }
  }

  const handleMoveBlock = async (blockId, direction) => {
    const token = localStorage.getItem("token")
    const response = await fetch(`http://localhost:5000/api/pages/blocks/${blockId}/move`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ direction })
    })

    if (response.ok) {
      const updatedBlocks = await response.json()
      setBlocks(updatedBlocks)
    }
  }

  const handleUpdatePageMeta = async () => {
    const token = localStorage.getItem("token")
    const response = await fetch(`http://localhost:5000/api/pages/${pageId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ title: page.title, slug: page.slug })
    })

    if (response.ok) {
      const updated = await response.json()
      setPage(updated)
      setMessage("✅ Métadonnées mises à jour avec succès.")
    } else {
      const error = await response.json().catch(() => ({ message: "Erreur inconnue" }))
      setMessage(`❌ ${error.message}`)
    }
  }

  return (
    <div className="d-flex">
      <AdminSidebar />
      <div className="container mt-5" style={{ marginLeft: "260px" }}>
        {page ? (
          <>
            <h2><Edit size={16} className="me-1" /> Modifier la page : {page.title}</h2>
            {message && <p>{message}</p>}

            {/* 🔹 Formulaire modification titre + slug */}
            <form onSubmit={(e) => { e.preventDefault(); handleUpdatePageMeta() }} className="mb-4">
              <div className="mb-3">
                <label>Titre de la page</label>
                <input
                  type="text"
                  className="form-control"
                  value={page.title}
                  onChange={(e) => setPage({ ...page, title: e.target.value })}
                />
              </div>
              <div className="mb-3">
                <label>Slug (URL)</label>
                <input
                  type="text"
                  className="form-control"
                  value={page.slug}
                  onChange={(e) => setPage({ ...page, slug: e.target.value })}
                />
              </div>
              <button type="submit" className="btn btn-primary"><Save size={16} className="me-1" /> Enregistrer</button>
            </form>

            {/* 🔹 Liste des blocs */}
            <h3 className="mt-4">Blocs existants</h3>
            <ul className="list-group mb-4">
              {blocks.map((block, index) => (
                <li key={block.id} className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <strong>{block.type.toUpperCase()}</strong>
                    <input
                      type="text"
                      className="form-control mt-2"
                      value={safeParseContent(block.content)}
                      onChange={(e) => handleUpdateBlock(block.id, e.target.value)}
                    />
                  </div>
                  <div>
                    <button className="btn btn-secondary btn-sm me-1" onClick={() => handleMoveBlock(block.id, "up")} disabled={index === 0}>🔼</button>
                    <button className="btn btn-secondary btn-sm" onClick={() => handleMoveBlock(block.id, "down")} disabled={index === blocks.length - 1}>🔽</button>
                    <button className="btn btn-danger btn-sm ms-2" onClick={() => handleDeleteBlock(block.id)}>
                      <Trash2 size={16} className="me-1" /> Supprimer
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            {/* 🔹 Ajout d’un nouveau bloc */}
            <h3><Plus size={20} className="me-2" /> Ajouter un bloc</h3>
            <div className="mb-3">
              <label>Type de bloc</label>
              <select className="form-control" value={newBlockType} onChange={(e) => setNewBlockType(e.target.value)}>
                <option value="text">Texte</option>
                <option value="image">Image</option>
                <option value="button">Bouton</option>
              </select>
            </div>
            <div className="mb-3">
              <label>Contenu</label>
              <input type="text" className="form-control" value={newBlockContent} onChange={(e) => setNewBlockContent(e.target.value)} />
            </div>
            <button className="btn btn-primary" onClick={handleAddBlock}>Ajouter</button>
          </>
        ) : (
          <p>Chargement...</p>
        )}
      </div>
    </div>
  )
}
