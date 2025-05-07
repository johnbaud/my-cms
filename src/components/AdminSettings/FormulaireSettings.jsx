import React from "react";
import { Save } from "lucide-react";
import { Link } from "react-router-dom";

export default function FormulaireSettings({ mailCfg, setMailCfg, onSave }) {
  return (
    <>
      <div className="mb-4">
        <Link to="/admin/form-submissions" className="btn btn-outline-primary">
          Voir les soumissions de formulaires
        </Link>
      </div>

      <form onSubmit={onSave}>
        <div className="mb-3">
          <label>Hôte SMTP</label>
          <input
            type="text"
            className="form-control"
            value={mailCfg.host}
            onChange={(e) => setMailCfg({ ...mailCfg, host: e.target.value })}
            required
          />
        </div>

        <div className="mb-3">
          <label>Port</label>
          <input
            type="number"
            className="form-control"
            value={mailCfg.port}
            onChange={(e) => setMailCfg({ ...mailCfg, port: +e.target.value })}
            required
          />
        </div>

        <div className="mb-3">
          <label>Utilisateur SMTP</label>
          <input
            type="text"
            className="form-control"
            value={mailCfg.user}
            onChange={(e) => setMailCfg({ ...mailCfg, user: e.target.value })}
            required
          />
        </div>

        <div className="mb-3">
          <label>Mot de passe SMTP</label>
          <input
            type="password"
            className="form-control"
            value={mailCfg.pass}
            onChange={(e) => setMailCfg({ ...mailCfg, pass: e.target.value })}
            required
          />
        </div>

        <div className="mb-3">
          <label>Adresse “From”</label>
          <input
            type="email"
            className="form-control"
            value={mailCfg.fromAddress}
            onChange={(e) => setMailCfg({ ...mailCfg, fromAddress: e.target.value })}
            placeholder="ex: noreply@monsite.fr"
            required
          />
        </div>

        <div className="mb-3">
          <label>Adresse destinataire par défaut</label>
          <input
            type="email"
            className="form-control"
            value={mailCfg.defaultRecipient || ""}
            onChange={(e) => setMailCfg({ ...mailCfg, defaultRecipient: e.target.value })}
            placeholder="ex: contact@monsite.fr"
            required
          />
        </div>

        <button type="submit" className="btn btn-primary">
          <Save size={16} className="me-1" /> Enregistrer SMTP
        </button>
      </form>
    </>
  );
}
