import { useState } from "react";

export default function FormBlock({ content }) {
  const {
    title = "Formulaire de contact",
    submitLabel = "Envoyer",
    successMessage = "Merci pour votre message !",
    storeInDatabase = true,
    fields = [],
    formId
  } = content || {};

  const [formData, setFormData] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formId) {
      alert("Ce formulaire n’est pas correctement configuré (ID manquant).");
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/forms/submit/${formId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: formData }),
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        alert("Erreur lors de l’envoi.");
      }
    } catch (error) {
      console.error("Erreur :", error);
    }
  };

  if (submitted) {
    return <p className="alert alert-success">{successMessage}</p>;
  }

  return (
    <div className="mt-4">
      <form onSubmit={handleSubmit} className="mt-4">
        {title && <h4>{title}</h4>}
        {fields.map((field, i) => (
          <div className="mb-3" key={i}>
            <label className="form-label">{field.label}</label>
            {field.type === "textarea" ? (
              <textarea
                className="form-control"
                name={field.name}
                placeholder={field.placeholder}
                required={field.required}
                onChange={(e) => handleChange(field.name, e.target.value)}
              />
            ) : (
              <input
                type={field.type}
                className="form-control"
                name={field.name}
                placeholder={field.placeholder}
                required={field.required}
                onChange={(e) => handleChange(field.name, e.target.value)}
              />
            )}
          </div>
        ))}
        <button type="submit" className="btn btn-primary">{submitLabel}</button>
      </form>
      {storeInDatabase && (
        <p className="text-muted small mt-3">
            Conformément à la RGPD, vos données sont conservées pendant <strong>30 jours</strong> avant suppression automatique.
        </p>
      )}
    </div>
  );
}
