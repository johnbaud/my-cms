import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import { FileText, Plus, Edit, Trash2 } from "lucide-react";
import { authFetch } from "../utils/authFetch";
import { useAuth } from "../context/AuthContext";

export default function AdminPages() {
  const [pages, setPages] = useState([]);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [metaKeywords, setMetaKeywords] = useState("");
  const [metaImage, setMetaImage] = useState("");
  const [metaRobots, setMetaRobots] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const { accessToken } = useAuth();

  useEffect(() => {
    authFetch("/pages", {}, accessToken)
      .then(res => res.json())
      .then(data => setPages(data));
  }, [accessToken]);

  const handleCreatePage = async (e) => {
    e.preventDefault();

    const response = await authFetch("/pages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, slug, metaTitle, metaDescription, metaKeywords, metaImage, metaRobots })
    }, accessToken);

    const data = await response.json();

    if (response.ok) {
      setMessage("✅ Page créée avec succès !");
      setTitle("");
      setSlug("");
      setMetaTitle("");
      setMetaDescription("");
      setMetaKeywords("");
      setMetaImage("");
      setMetaRobots("");      
      const updatedPages = await authFetch("/pages", {}, accessToken).then(res => res.json());
      setPages(updatedPages);
    } else {
      setMessage("❌ Erreur lors de la création de la page.");
    }
  };

  const handleDeletePage = async (pageId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette page ? Cette action est irréversible.")) return;

    const response = await authFetch(`/pages/${pageId}`, {
      method: "DELETE"
    }, accessToken);

    if (response.ok) {
      setPages(pages.filter(page => page.id !== pageId));
    } else {
      const errorData = await response.json().catch(() => ({ message: "Erreur inconnue" }));
      console.log("❌ Erreur API :", errorData);
    }
  };

  const handleTogglePublished = async (pageId, currentStatus) => {
    const response = await authFetch(`/pages/${pageId}/publish`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: !currentStatus }),
    }, accessToken);

    if (response.ok) {
      const updated = await response.json();
      setPages((prev) =>
        prev.map((p) => (p.id === pageId ? { ...p, isPublished: updated.isPublished } : p))
      );
      setMessage(`✅ Page ${updated.isPublished ? "publiée" : "dépubliée"} avec succès`);
    } else {
      setMessage("❌ Erreur lors de la mise à jour du statut de publication");
    }

    setTimeout(() => setMessage(""), 4000);
  };

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
          <div className="mb-3">
            <label>Titre SEO (metaTitle)</label>
            <input
              type="text"
              className="form-control"
              value={metaTitle}
              onChange={e => setMetaTitle(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label>Description SEO (metaDescription)</label>
            <textarea
              className="form-control"
              rows={2}
              value={metaDescription}
              onChange={e => setMetaDescription(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label>Mots-clés (metaKeywords, CSV)</label>
            <input
              type="text"
              className="form-control"
              value={metaKeywords}
              onChange={e => setMetaKeywords(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label>Image Open Graph (metaImage, URL)</label>
            <input
              type="text"
              className="form-control"
              value={metaImage}
              onChange={e => setMetaImage(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label>Robots (metaRobots, ex. “index,follow”)</label>
            <input
              type="text"
              className="form-control"
              value={metaRobots}
              onChange={e => setMetaRobots(e.target.value)}
            />
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
              <div>
                <strong>{page.title}</strong> <span className="text-muted">({page.slug})</span>{" "}
                {page.isPublished ? (
                  <span className="badge bg-success">Publiée</span>
                ) : (
                  <span className="badge bg-secondary">Brouillon</span>
                )}
              </div>

              <div>
                <Link to={`/admin/pages/${page.id}`} className="btn btn-secondary btn-sm me-2" title="Modifier">
                  <Edit size={16} />
                </Link>
                {page.slug !== "" && (
                  <button className="btn btn-danger btn-sm me-2" onClick={() => handleDeletePage(page.id)} title="Supprimer">
                    <Trash2 size={16} />
                  </button>
                )}
                {page.slug === "" ? (
                  <button className="btn btn-sm btn-secondary" disabled title="Impossible de dépublier la page d'accueil">
                    Page d'accueil
                  </button>
                ) : (
                  <button
                    className={`btn btn-sm ${page.isPublished ? "btn-warning" : "btn-success"}`}
                    onClick={() => handleTogglePublished(page.id, page.isPublished)}
                  >
                    {page.isPublished ? "Dépublier" : "Publier"}
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
