import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import { Trash2, Edit } from "lucide-react";
import { authFetch } from "../utils/authFetch";
import { useAuth } from "../context/AuthContext";

export default function AdminBlocks() {
  const { accessToken } = useAuth();
  const [blocks, setBlocks] = useState([]);
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    const fetchBlocks = async () => {
      try {
        const res = await authFetch("/blocks", {}, accessToken);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setBlocks(data);
      } catch (err) {
        console.error("Erreur lors de la récupération des blocs:", err);
      }
    };

    fetchBlocks();
  }, [accessToken]);

  const handleDelete = async (blockId) => {
    if (!window.confirm("Supprimer ce bloc ?")) return;

    const response = await authFetch(`/pages/blocks/${blockId}`, {
      method: "DELETE",
    }, accessToken);

    if (response.ok) {
      setBlocks((prev) => prev.filter((b) => b.id !== blockId));
    } else {
      alert("Erreur lors de la suppression.");
    }
  };

  const filteredBlocks = filterType === "all"
    ? blocks
    : blocks.filter((b) => b.type === filterType);

  const types = Array.from(new Set(blocks.map((b) => b.type)));

  return (
    <div className="d-flex">
      <AdminSidebar />
      <div className="container mt-5" style={{ marginLeft: "260px" }}>
        <h2 className="mb-4">Liste des blocs</h2>

        <div className="mb-3 d-flex align-items-center gap-2">
          <label className="form-label mb-0">Filtrer par type :</label>
          <select
            className="form-select w-auto"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">Tous</option>
            {types.map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Page</th>
              <th>Ordre</th>
              <th>Contenu</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBlocks.map((block) => (
              <tr key={block.id}>
                <td>{block.type}</td>
                <td>{block.page?.title || "-"}</td>
                <td>{block.order}</td>
                <td>
                  {block.type === "text" ? (
                    <div dangerouslySetInnerHTML={{ __html: block.content?.slice(0, 100) }} />
                  ) : block.type === "image" ? (
                    <img src={block.content} alt="" style={{ maxHeight: "50px" }} />
                  ) : block.type === "button" ? (
                    <pre className="mb-0 small text-muted">
                      {JSON.stringify(JSON.parse(block.content || "{}"), null, 2)}
                    </pre>
                  ) : (
                    block.content
                  )}
                </td>
                <td className="d-flex gap-2">
                  <Link to={`/admin/blocks/${block.id}`} className="btn btn-sm btn-secondary">
                    <Edit size={16} />
                  </Link>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(block.id)}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
