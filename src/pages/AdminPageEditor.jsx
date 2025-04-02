import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import BlockFormFactory from "../components/blocks/BlockFormFactory";
import { Plus, Edit, Trash2, Save, ArrowLeft } from "lucide-react";

export default function AdminPageEditor() {
  const { pageId } = useParams();
  const navigate = useNavigate();
  const [page, setPage] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [newBlockType, setNewBlockType] = useState("text");
  const [newBlockContent, setNewBlockContent] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`http://localhost:5000/api/pages/${pageId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setPage(data);
        setBlocks(data.blocks || []);
      })
      .catch(() => navigate("/admin/pages"));
  }, [pageId, navigate]);

  const handleAddBlock = async () => {
    const token = localStorage.getItem("token");
    const response = await fetch(`http://localhost:5000/api/pages/${pageId}/blocks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        type: newBlockType,
        content: newBlockContent,
        order: blocks.length,
      }),
    });

    if (response.ok) {
      const newBlock = await response.json();
      setBlocks([...blocks, newBlock]);
      setNewBlockContent("");
    }
  };

  const handleUpdateBlock = async (blockId, newContent) => {
    const token = localStorage.getItem("token");
    const response = await fetch(`http://localhost:5000/api/pages/blocks/${blockId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content: newContent }),
    });

    if (response.ok) {
      setBlocks(blocks.map((b) => (b.id === blockId ? { ...b, content: newContent } : b)));
    }
  };

  const handleDeleteBlock = async (blockId) => {
    const token = localStorage.getItem("token");
    const response = await fetch(`http://localhost:5000/api/pages/blocks/${blockId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.ok) {
      setBlocks(blocks.filter((b) => b.id !== blockId));
    }
  };

  const handleMoveBlock = async (blockId, direction) => {
    const token = localStorage.getItem("token");
    const response = await fetch(`http://localhost:5000/api/pages/blocks/${blockId}/move`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ direction }),
    });

    if (response.ok) {
      const updatedBlocks = await response.json();
      setBlocks(updatedBlocks);
    }
  };

  const handleUpdatePageMeta = async () => {
    const token = localStorage.getItem("token");
    const response = await fetch(`http://localhost:5000/api/pages/${pageId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title: page.title, slug: page.slug }),
    });

    if (response.ok) {
      const updated = await response.json();
      setPage(updated);
      setMessage("✅ Métadonnées mises à jour avec succès.");
    } else {
      const error = await response.json().catch(() => ({ message: "Erreur inconnue" }));
      setMessage(`❌ ${error.message}`);
    }
  };

  return (
    <div className="d-flex">
      <AdminSidebar />
      <div className="container mt-5" style={{ marginLeft: "260px" }}>
        {page ? (
          <>
            <button className="btn btn-outline-secondary btn-sm mb-3" onClick={() => navigate("/admin/pages")}>
              <ArrowLeft size={16} /> Retour
            </button>

            <h2><Edit size={16} /> Modifier la page : {page.title}</h2>
            <h3 className="mt-4">Informations de la page</h3>
            {message && <p>{message}</p>}

            <form onSubmit={(e) => { e.preventDefault(); handleUpdatePageMeta(); }}>
              <div className="mb-2">
                <label  className="form-label">Nom</label>
                <input type="text" className="form-control" value={page.title} onChange={(e) => setPage({ ...page, title: e.target.value })} />
              </div>
              <div className="mb-2">
                <label className="form-label">Slug</label>
                <input type="text" className="form-control mt-2" value={page.slug} onChange={(e) => setPage({ ...page, slug: e.target.value })} />
              </div>

              <button className="btn btn-primary mt-2"><Save size={16} /> Enregistrer</button>
            </form>

            <h3 className="mt-4">Blocs existants</h3>
            <ul className="list-group mt-4">
              {blocks.map((block, idx) => (
                <li key={block.id} className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <strong className="mb-2">{block.type.toUpperCase()}</strong>
                    <BlockFormFactory type={block.type} content={block.content} onChange={(c) => handleUpdateBlock(block.id, c)} />
                  </div>

                  <div>
                    <button className="btn btn-secondary btn-sm" onClick={() => handleMoveBlock(block.id, "up")} disabled={idx === 0}>🔼</button>
                    <button className="btn btn-secondary btn-sm" onClick={() => handleMoveBlock(block.id, "down")} disabled={idx === blocks.length - 1}>🔽</button>
                  </div>  
                  <button className="btn btn-danger btn-sm ms-2" onClick={() => handleDeleteBlock(block.id)}><Trash2 size={16} /></button>
                </li>
              ))}
            </ul>
            <h3 className="mt-4">Ajouter un bloc</h3>
            <div className="mb-3">
              <label className="form-label">Type de bloc</label>
              <select value={newBlockType} onChange={(e) => setNewBlockType(e.target.value)} className="form-control">
                <option value="text">Texte</option>
                <option value="image">Image</option>
                <option value="button">Bouton</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">Contenu</label>
              <BlockFormFactory type={newBlockType} content={newBlockContent} onChange={setNewBlockContent} />
              <button className="btn btn-primary" onClick={handleAddBlock}><Plus /> Ajouter</button>
            </div>
          </>
        ) : <p>Chargement...</p>}
      </div>
    </div>
  );
}
