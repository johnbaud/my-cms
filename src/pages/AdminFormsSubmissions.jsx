// src/pages/AdminFormsSubmissions.jsx
import { useEffect, useState } from "react";
import AdminSidebar from "../components/AdminSidebar";
import { CheckCircle, XCircle } from "lucide-react";

export default function AdminFormsSubmissions() {
  const [forms, setForms] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [filterFormId, setFilterFormId] = useState("");

  // 1️⃣ Charger les formulaires pour le filtre
  useEffect(() => {
    fetch("http://localhost:5000/api/forms")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setForms(data);
      })
      .catch(err => console.error("❌ Erreur chargement formulaires :", err));
  }, []);

  // 2️⃣ Charger les soumissions
  useEffect(() => {
    fetch("http://localhost:5000/api/forms/submissions")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setSubmissions(data);
        else console.error("Réponse inattendue :", data);
      })
      .catch(err => console.error("❌ Erreur récupération soumissions :", err));
  }, []);

  // 3️⃣ Filtrer les soumissions en mémoire
  const filtered = filterFormId
    ? submissions.filter(s => s.formId === parseInt(filterFormId))
    : submissions;

  // 4️⃣ Handler pour exporter le CSV
  const handleExport = () => {
    const url = new URL("http://localhost:5000/api/forms/submissions/export");
    if (filterFormId) url.searchParams.set("formId", filterFormId);
    // Ouvre dans un nouvel onglet pour déclencher le téléchargement
    window.open(url.toString(), "_blank");
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
            onChange={e => setFilterFormId(e.target.value)}
          >
            <option value="">Tous les formulaires</option>
            {forms.map(f => (
              <option key={f.id} value={f.id}>
                {f.title}
              </option>
            ))}
          </select>

          <button className="btn btn-outline-success btn-sm" onClick={handleExport}>
            Exporter CSV
          </button>
        </div>

        {/* Affichage */}
        {filtered.length === 0 ? (
          <p>Aucune soumission pour l’instant.</p>
        ) : (
          <ul className="list-unstyled">
            {submissions.map(sub => {
              const success = !!sub.emailSent;
              return (
                <li
                  key={sub.id}
                  className={`
                    mb-4 p-3 
                    bg-white 
                    shadow-sm 
                    border-start border-4 
                    ${success ? "border-success" : "border-danger"}
                  `}
                >
                  <div className="d-flex justify-content-between">
                    <div>
                      <div><strong>ID :</strong> {sub.id}</div>
                      <div><strong>Date :</strong> {new Date(sub.createdAt).toLocaleString()}</div>
                    </div>
                    <div>
                      <span
                        className={`badge ${
                          success ? "bg-success" : "bg-danger"
                        } d-flex align-items-center`}
                      >
                        {success ? (
                          <CheckCircle size={16} className="me-1" />
                        ) : (
                          <XCircle size={16} className="me-1" />
                        )}
                        {success ? "E-mail envoyé" : "E-mail non envoyé"}
                      </span>
                    </div>
                  </div>
                  <hr />
                  <pre className="mb-0">{JSON.stringify(sub.data, null, 2)}</pre>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
