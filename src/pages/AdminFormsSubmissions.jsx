// src/pages/AdminFormsSubmissions.jsx
import { useEffect, useState } from "react";
import AdminSidebar from "../components/AdminSidebar";
import { CheckCircle, XCircle, Trash2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { authFetch } from "../utils/authFetch";
import { Pagination } from "react-bootstrap";

export default function AdminFormsSubmissions() {
  const { accessToken } = useAuth();

  const [forms, setForms]                 = useState([]);
  const [submissions, setSubmissions]     = useState([]);
  const [filterFormId, setFilterFormId]   = useState("");
  const [page, setPage]                   = useState(1);
  const pageSize                          = 10;
  const [totalPages, setTotalPages]       = useState(1);

  // ① Charger la liste des formulaires (pour le dropdown)
  useEffect(() => {
    authFetch("/forms", {}, accessToken)
      .then(r => r.json())
      .then(data => Array.isArray(data) && setForms(data))
      .catch(err => console.error("❌ Erreur chargement formulaires :", err));
  }, [accessToken]);

  // ② Charger les soumissions à chaque changement de page ou de filtre
  useEffect(() => {
    const params = new URLSearchParams({
      page:     String(page),
      pageSize: String(pageSize),
    });
    if (filterFormId) params.set("formId", filterFormId);

    authFetch(`/forms/submissions?${params.toString()}`, {}, accessToken)
      .then(r => r.json())
      .then(({ submissions, totalPages }) => {
        setSubmissions(submissions);
        setTotalPages(totalPages);
      })
      .catch(err => console.error("❌ Erreur récupération soumissions :", err));
  }, [page, filterFormId, accessToken]);

  // ③ Export CSV
  const handleExport = () => {
    const params = new URLSearchParams();
    if (filterFormId) params.set("formId", filterFormId);
    window.open(`/api/forms/submissions/export?${params}`, "_blank");
  };

  // ④ Suppression d’une soumission
  const handleDelete = async id => {
    if (!window.confirm("Supprimer cette soumission ?")) return;
    const res = await authFetch(`/forms/submissions/${id}`, { method: "DELETE" }, accessToken);
    if (res.ok) {
      setSubmissions(s => s.filter(x => x.id !== id));
    } else {
      alert("Erreur lors de la suppression.");
    }
  };

  return (
    <div className="d-flex">
      <AdminSidebar />
      <div className="container mt-5" style={{ marginLeft: "260px" }}>
        <h2 className="mb-4">Soumissions reçues</h2>

        {/* Filtre + Export */}
        <div className="d-flex align-items-center gap-2 mb-4">
          <label className="mb-0">Filtrer par formulaire :</label>
          <select
            className="form-select w-auto"
            value={filterFormId}
            onChange={e => {
              setFilterFormId(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Tous les formulaires</option>
            {forms.map(f => (
              <option key={f.id} value={f.id}>{f.title}</option>
            ))}
          </select>

          <button className="btn btn-outline-success btn-sm" onClick={handleExport}>
            Exporter CSV
          </button>
        </div>

        {/* Listing paginé */}
        {submissions.length === 0 ? (
          <p>Aucune soumission pour l'instant.</p>
        ) : (
          <>
            <ul className="list-unstyled">
              {submissions.map(sub => {
                const success = !!sub.emailSent;
                return (
                  <li
                    key={sub.id}
                    className={`
                      mb-4 p-3 bg-white shadow-sm
                      border-start border-4
                      ${success ? "border-success" : "border-danger"}
                    `}
                  >
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <div><strong>ID :</strong> {sub.id}</div>
                        <div><strong>Date :</strong> {new Date(sub.createdAt).toLocaleString()}</div>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <span className={`badge ${success ? "bg-success" : "bg-danger"} d-flex align-items-center`}>
                          {success
                            ? <CheckCircle size={16} className="me-1" />
                            : <XCircle    size={16} className="me-1" />
                          }
                          {success ? "E-mail envoyé" : "E-mail non envoyé"}
                        </span>
                        <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(sub.id)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <hr />
                    <pre className="mb-0">{JSON.stringify(sub.data, null, 2)}</pre>
                  </li>
                );
              })}
            </ul>

            {/* Pagination */}
            <Pagination>
              <Pagination.First onClick={() => setPage(1)} disabled={page === 1} />
              <Pagination.Prev  onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1} />
              {[...Array(totalPages)].map((_, i) => (
                <Pagination.Item
                  key={i+1}
                  active={page === i+1}
                  onClick={() => setPage(i+1)}
                >
                  {i+1}
                </Pagination.Item>
              ))}
              <Pagination.Next  onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages} />
              <Pagination.Last  onClick={() => setPage(totalPages)} disabled={page === totalPages} />
            </Pagination>
          </>
        )}
      </div>
    </div>
  );
}
