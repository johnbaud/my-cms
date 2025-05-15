import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import BlockFormFactory from "../components/blocks/BlockFormFactory";
import { Plus, Edit, Trash2, Save, ArrowLeft, ChevronsUpDown } from "lucide-react";
import { authFetch } from "../utils/authFetch";
import { useAuth } from "../context/AuthContext";
import TagsInput from "../components/TagsInput";


export default function AdminPageEditor() {
  const { pageId } = useParams();
  const navigate = useNavigate();
  const { accessToken } = useAuth();

  const [page, setPage] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [newBlockType, setNewBlockType] = useState("text");
  const [newBlockContent, setNewBlockContent] = useState("");
  const [message, setMessage] = useState("");
  const [expandedBlockId, setExpandedBlockId] = useState(null);
  const [keywords, setKeywords] = useState([]);

  useEffect(() => {
    authFetch(`/pages/${pageId}`, {}, accessToken)
      .then((res) => res.json())
      .then((data) => {
        setPage(data);
        setKeywords(
          data.metaKeywords
            ? data.metaKeywords.split(",").map(k => k.trim())
            : []
        );        
        const parsedBlocks = (data.blocks || []).map((block) => {
          let parsedContent = block.content;
          try {
            if (typeof block.content === "string") {
              parsedContent = JSON.parse(block.content);
            }
          } catch (e) {
            console.warn(`❌ Impossible de parser le bloc ID ${block.id}`, e);
          }
          return { ...block, content: parsedContent };
        });
        setBlocks(parsedBlocks);
      })
      .catch(() => navigate("/admin/pages"));
  }, [pageId, navigate, accessToken]);

  const handleAddBlock = async () => {
    const response = await authFetch(`/pages/${pageId}/blocks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: newBlockType,
        content: newBlockContent, // objet JS structuré
        order: blocks.length,
      }),
    }, accessToken);
  
    if (response.ok) {
      const newBlock = await response.json();
      setBlocks((prev) => [...prev, newBlock]);
      setNewBlockContent("");
    }
  };  

  const handleUpdateBlock = async (blockId, newContent) => {
    const contentToSend = typeof newContent === "string" ? newContent : JSON.stringify(newContent);

    const response = await authFetch(`/pages/blocks/${blockId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: contentToSend }),
    }, accessToken);

    if (response.ok) {
      setBlocks((prev) =>
        prev.map((b) => (b.id === blockId ? { ...b, content: newContent } : b))
      );
    }
  };

  const handleDeleteBlock = async (blockId) => {
    const response = await authFetch(`/pages/blocks/${blockId}`, {
      method: "DELETE",
    }, accessToken);

    if (response.ok) {
      setBlocks((prev) => prev.filter((b) => b.id !== blockId));
    }
  };

  const handleMoveBlock = async (blockId, direction) => {
    const response = await authFetch(`/pages/blocks/${blockId}/move`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ direction }),
    }, accessToken);

    if (response.ok) {
      const updatedBlocks = await response.json();
      setBlocks(updatedBlocks);
    }
  };

  const handleUpdatePageMeta = async () => {
    const response = await authFetch(`/pages/${pageId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: page.title, slug: page.slug, metaTitle: page.metaTitle, metaDescription: page.metaDescription,metaKeywords: keywords.join(","), metaImage: page.metaImage, metaRobots: page.metaRobots}),
    }, accessToken);

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

            {message && <p>{message}</p>}

            <form onSubmit={(e) => { e.preventDefault(); handleUpdatePageMeta(); }}>
              <div className="mb-2">
                <label className="form-label">Nom</label>
                <input type="text" className="form-control" value={page.title} onChange={(e) => setPage({ ...page, title: e.target.value })} />
              </div>
              <div className="mb-2">
                <label className="form-label">Slug</label>
                <input type="text" className="form-control mt-2" value={page.slug} onChange={(e) => setPage({ ...page, slug: e.target.value })} />
              </div>
              <div className="mb-3">
                <label>Titre SEO (metaTitle)</label>
                <input
                  type="text"
                  className="form-control"
                  value={page.metaTitle || ""}
                  onChange={e => setPage({ ...page, metaTitle: e.target.value })}
                />
              </div>
              <div className="mb-3">
                <label>Description SEO (metaDescription)</label>
                <textarea
                  className="form-control"
                  rows={2}
                  value={page.metaDescription || ""}
                  onChange={e => setPage({ ...page, metaDescription: e.target.value })}
                />
              </div>
              <div className="mb-3">
                <label>Mots-clés (metaKeywords)</label>
                <TagsInput
                  value={keywords}
                  onChange={setKeywords}
                  placeholder="Appuie sur Entrée ou , pour ajouter"
                />
              </div>
              <div className="mb-3">
                <label>Image Open Graph (metaImage)</label>
                <input
                  type="text"
                  className="form-control"
                  value={page.metaImage || ""}
                  onChange={e => setPage({...page, metaImage: e.target.value })}
                />
              </div>
              <div className="mb-3">
                <label>Robots (metaRobots)</label>
                <input
                  type="text"
                  className="form-control"
                  value={page.metaRobots || ""}
                  onChange={e => setPage({ ...page, metaRobots: e.target.value })}
                />
              </div>
              <button className="btn btn-primary mt-2"><Save size={16} /> Enregistrer</button>
            </form>

            <h3 className="mt-4">Blocs existants</h3>
            <ul className="list-group mt-4">
              {blocks.map((block, idx) => (
                <li key={block.id || `new-${idx}`} className="list-group-item">
                  <div className="d-flex justify-content-between align-items-center">
                    <strong className="mb-2">{block.type.toUpperCase()}</strong>
                    <div className="d-flex align-items-center gap-2">
                      <button className="btn btn-sm btn-outline-secondary" onClick={() => setExpandedBlockId(prev => prev === block.id ? null : block.id)}>
                        <ChevronsUpDown size={16} />
                      </button>
                      <button className="btn btn-secondary btn-sm" onClick={() => handleMoveBlock(block.id, "up")} disabled={idx === 0}>🔼</button>
                      <button className="btn btn-secondary btn-sm" onClick={() => handleMoveBlock(block.id, "down")} disabled={idx === blocks.length - 1}>🔽</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDeleteBlock(block.id)}><Trash2 size={16} /></button>
                    </div>
                  </div>

                  {block.id && expandedBlockId === block.id && (
                    <BlockFormFactory type={block.type} content={block.content} onChange={(c) => handleUpdateBlock(block.id, c)} />
                  )}
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
                <option value="form">Formulaire</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">Contenu</label>
              <BlockFormFactory type={newBlockType} content={newBlockContent} onChange={setNewBlockContent} />
              <button className="btn btn-primary mt-2" onClick={handleAddBlock}>
                <Plus /> Ajouter
              </button>
            </div>
          </>
        ) : <p>Chargement...</p>}
      </div>
    </div>
  );
}
