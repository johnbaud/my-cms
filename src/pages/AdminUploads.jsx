import { useEffect, useState } from "react";
import AdminSidebar from "../components/AdminSidebar";
import { Trash2 } from "lucide-react";

export default function AdminUploads() {
  const [files, setFiles] = useState([]);
  const [message, setMessage] = useState("");
  const [allowedFileExtensions, setAllowedExtensions] = useState([]);

  useEffect(() => {
    // 🔹 Charger les extensions autorisées
    fetch("http://localhost:5000/api/admin/settings", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setAllowedExtensions(data.allowedFileExtensions || []);
      });

    // 🔹 Charger les fichiers
    fetch("http://localhost:5000/api/uploads/list")
      .then((res) => res.json())
      .then((data) => {
        const normalized = data.map((f) => ({
          ...f,
          filename: f.name,
          date: f.createdAt,
          extension: f.name?.split(".").pop()?.toUpperCase() || "",
        }));
        setFiles(normalized);
      })
      .catch((err) => console.error("Erreur chargement fichiers:", err));
  }, []);

  const handleDelete = async (filename) => {
    const confirm = window.confirm("Supprimer ce fichier ?");
    if (!confirm) return;

    const response = await fetch("http://localhost:5000/api/delete-image", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: `/uploads/${filename}` }),
    });

    if (response.ok) {
      setFiles((files) => files.filter((f) => f.filename !== filename));
      setMessage("✅ Fichier supprimé avec succès.");
    } else {
      const err = await response.json().catch(() => ({}));
      setMessage(`❌ ${err.message || "Erreur lors de la suppression"}`);
    }

    setTimeout(() => setMessage(""), 3000);
  };

  return (
    <div className="d-flex">
      <AdminSidebar />
      <div className="container mt-5" style={{ marginLeft: "260px" }}>
        <h2>📁 Fichiers uploadés</h2>

        {allowedFileExtensions.length > 0 && (
          <div className="alert alert-light border mb-3 p-2 small">
            Extensions autorisées : <strong>{allowedFileExtensions.join(", ")}</strong>
          </div>
        )}

        {message && (
          <div className="alert alert-info my-3 py-2 small">{message}</div>
        )}

        <div className="row">
          {files.map((file, index) => {
            const isUsed = file.usedAsLogo || (file.usedOnPages?.length > 0);

            return (
              <div key={file.filename || index} className="col-md-3 col-sm-6 mb-4">
                <div className="card">
                  {file.filename?.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                    <img
                      src={file.url}
                      alt={file.filename}
                      className="card-img-top"
                      style={{ objectFit: "contain", maxHeight: "200px" }}
                    />
                  ) : (
                    <div
                      className="card-img-top d-flex align-items-center justify-content-center bg-light"
                      style={{ height: "200px" }}
                    >
                      <span className="text-muted small">Pas d'aperçu</span>
                    </div>
                  )}

                  <div className="card-body">
                    <p
                      className="card-text small text-truncate mb-1"
                      title={file.filename}
                    >
                      {file.filename}
                    </p>
                    <p className="text-muted small mb-1">
                      {file.extension} – {(file.size / 1024).toFixed(1)} Ko
                    </p>
                    <p className="text-muted small mb-2">
                      {new Date(file.date).toLocaleString("fr-FR", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>

                    {file.usedOnPages?.length > 0 && (
                      <p className="text-muted small mb-1">
                        Utilisé dans :{" "}
                        {file.usedOnPages.map((p) => p.title).join(", ")}
                      </p>
                    )}
                    {file.usedAsLogo && (
                      <p className="text-muted small mb-1">Logo du site</p>
                    )}

                    <button
                      className="btn btn-sm btn-danger w-100"
                      onClick={() => handleDelete(file.filename)}
                      disabled={isUsed}
                      title={
                        isUsed
                          ? "Ce fichier est utilisé dans le site"
                          : "Supprimer ce fichier"
                      }
                    >
                      <Trash2 size={14} className="me-1" /> Supprimer
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {files.length === 0 && (
          <p className="text-muted">Aucun fichier trouvé.</p>
        )}
      </div>
    </div>
  );
}
