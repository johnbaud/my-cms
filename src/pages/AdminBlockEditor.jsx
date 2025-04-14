import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BlockFormFactory from "../components/blocks/BlockFormFactory";
import AdminSidebar from "../components/AdminSidebar";
import { Save, ArrowLeft } from "lucide-react";
import { authFetch } from "../utils/authFetch";
import { useAuth } from "../context/AuthContext";

export default function AdminBlockEditor() {
  const { accessToken } = useAuth();
  const { blockId } = useParams();
  const navigate = useNavigate();
  const [block, setBlock] = useState(null);
  const [content, setContent] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchBlock = async () => {
      try {
        const res = await authFetch(`/blocks/${blockId}`, {}, accessToken);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setBlock(data);
        setContent(data.content);
      } catch (err) {
        navigate("/admin/blocks");
      }
    };

    fetchBlock();
  }, [blockId, navigate, accessToken]);

  const handleSave = async () => {
    const response = await authFetch(`/blocks/${blockId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    }, accessToken);

    if (response.ok) {
      setMessage("✅ Bloc mis à jour avec succès.");
      setTimeout(() => setMessage(""), 3000);
    } else {
      setMessage("❌ Échec de la mise à jour du bloc.");
    }
  };

  return (
    <div className="d-flex">
      <AdminSidebar />
      <div className="container mt-5" style={{ marginLeft: "260px" }}>
        <button
          className="btn btn-outline-secondary btn-sm mb-3"
          onClick={() => navigate("/admin/blocks")}
        >
          <ArrowLeft size={16} /> Retour
        </button>

        <h2>Modifier un bloc</h2>

        {message && (
          <div className="alert alert-info py-1 px-2 small mt-2">{message}</div>
        )}

        {block ? (
          <>
            <p>
              <strong>Type :</strong> {block.type}
            </p>
            <p>
              <strong>Page :</strong> {block.page?.title || "-"}
            </p>
            <p>
              <strong>Ordre :</strong> {block.order}
            </p>

            <BlockFormFactory
              type={block.type}
              content={content}
              onChange={setContent}
            />

            <button className="btn btn-primary mt-3" onClick={handleSave}>
              <Save size={16} /> Enregistrer
            </button>
          </>
        ) : (
          <p>Chargement...</p>
        )}
      </div>
    </div>
  );
}
