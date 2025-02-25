import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import AdminSidebar from "../components/AdminSidebar"
import { FileText, Plus, Edit, Trash2 } from "lucide-react"

const safeParseContent = (content) => {
    try {
      return JSON.parse(content) // ✅ Essaye de parser en JSON
    } catch {
      return content // ✅ Si erreur, retourne le texte brut
    }
  }
export default function AdminPageEditor() {
  const { pageId } = useParams()
  const navigate = useNavigate()
  const [page, setPage] = useState(null)
  const [blocks, setBlocks] = useState([])
  const [newBlockType, setNewBlockType] = useState("text")
  const [newBlockContent, setNewBlockContent] = useState("")

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

  // 🔹 Ajouter un bloc
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
        order: blocks.length // Assigne un ordre au bloc
      })
    })
  
    if (response.ok) {
      const newBlock = await response.json()
      setBlocks([...blocks, newBlock]) // 🔹 Ajoute le nouveau bloc à la liste
      setNewBlockContent("") // 🔹 Réinitialise l’input
    } else {
      const errorData = await response.json().catch(() => ({ message: "Erreur inconnue" }))
      console.log("❌ Erreur API :", errorData)
    }
  }
  

  // 🔹 Modifier un bloc
  const handleUpdateBlock = async (blockId, newContent) => {
    console.log("🔹 Tentative de mise à jour du bloc ID :", blockId) // 🔹 Vérifie l'ID envoyé
  
    const token = localStorage.getItem("token")
  
    const response = await fetch(`http://localhost:5000/api/pages/blocks/${blockId}`, {  // 🔹 Correction de l'URL ici !
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ content: newContent })
    })
  
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "Erreur inconnue" }))
      console.log("❌ Erreur API :", errorData)
      return
    }
  
    const data = await response.json()
    console.log("✅ Bloc mis à jour :", data)
  
    setBlocks(blocks.map(block => block.id === blockId ? { ...block, content: newContent } : block))
  }
  
  

  // 🔹 Supprimer un bloc
  const handleDeleteBlock = async (blockId) => {
    console.log("🔹 Tentative de suppression du bloc ID :", blockId) // 🔹 Vérification côté frontend
  
    const token = localStorage.getItem("token")
  
    const response = await fetch(`http://localhost:5000/api/pages/blocks/${blockId}`, { // 🔹 Correction ici
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    })
  
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "Erreur inconnue" }))
      console.log("❌ Erreur API :", errorData)
      return
    }
  
    console.log("✅ Bloc supprimé avec succès")
    setBlocks(blocks.filter(block => block.id !== blockId))
  }
  // 🔹 Déplacer un bloc
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
      setBlocks(updatedBlocks) // Met à jour la liste avec le nouvel ordre
    }
  }
  

  return (
    <div className="d-flex">
      <AdminSidebar />
      <div className="container mt-5" style={{ marginLeft: "260px" }}>
        {page ? (
          <>
            <h2><Edit size={16} className="me-1" /> Modifier la page : {page.title}</h2>

            {/* Liste des blocs existants */}
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
                    <button 
                      className="btn btn-secondary btn-sm me-1"
                      onClick={() => handleMoveBlock(block.id, "up")}
                      disabled={index === 0} // Désactiver pour le premier bloc
                    >
                      🔼
                    </button>
                    <button 
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleMoveBlock(block.id, "down")}
                      disabled={index === blocks.length - 1} // Désactiver pour le dernier bloc
                    >
                      🔽
                    </button>
                    <button className="btn btn-danger btn-sm ms-2" onClick={() => handleDeleteBlock(block.id)}>
                      <Trash2 size={16} className="me-1" /> Supprimer
                    </button>
                  </div>
                </li>
              ))}
            </ul>


            {/* Ajouter un nouveau bloc */}
            <h3> <Plus size={20} className="me-2" /> Ajouter un bloc</h3>
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
