import { useEffect, useState } from "react";
import { Button, Form, Row, Col } from "react-bootstrap";

export default function FormBlockForm({ content, onChange }) {
  const [formContent, setFormContent] = useState({
    title: content?.title || "",
    submitLabel: content?.submitLabel || "Envoyer",
    successMessage: content?.successMessage || "Merci pour votre message !",
    emailTo: content?.emailTo || "",
    storeInDatabase: content?.storeInDatabase ?? true,
    fields: content?.fields || [],
    formId: content?.formId || null
  });

  const update = (updates) => {
    const updated = { ...formContent, ...updates };
    setFormContent(updated);
    onChange(updated);
  };

  const updateField = (index, updatedField) => {
    const updatedFields = [...formContent.fields];
    updatedFields[index] = { ...updatedFields[index], ...updatedField };
    update({ fields: updatedFields });
  };

  const removeField = (index) => {
    const updatedFields = formContent.fields.filter((_, i) => i !== index);
    update({ fields: updatedFields });
  };

  const addField = () => {
    const newField = {
      label: "",
      name: "",
      type: "text",
      required: false,
      placeholder: "",
    };
    update({ fields: [...formContent.fields, newField] });
  };

  return (
    <div className="bg-light p-3 rounded">
      <h5>Formulaire</h5>

      {formContent.formId && (
        <div className="alert alert-info">
          Ce bloc utilise le formulaire <strong>ID {formContent.formId}</strong>
        </div>
      )}

      <Form.Group className="mb-3">
        <Form.Label>Titre</Form.Label>
        <Form.Control
          type="text"
          value={formContent.title}
          onChange={(e) => update({ title: e.target.value })}
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Email de réception</Form.Label>
        <Form.Control
          type="email"
          value={formContent.emailTo}
          onChange={(e) => update({ emailTo: e.target.value })}
        />
      </Form.Group>

      <Form.Check
        type="checkbox"
        label="Enregistrer les soumissions"
        checked={formContent.storeInDatabase}
        onChange={(e) => update({ storeInDatabase: e.target.checked })}
        className="mb-3"
      />

      <h6>Champs</h6>
      {formContent.fields.map((field, index) => (
        <div key={index} className="border p-2 mb-2 bg-white rounded">
          <Row className="mb-2">
            <Col>
              <Form.Control
                placeholder="Label"
                value={field.label}
                onChange={(e) => updateField(index, { label: e.target.value })}
              />
            </Col>
            <Col>
              <Form.Control
                placeholder="Nom"
                value={field.name}
                onChange={(e) => updateField(index, { name: e.target.value })}
              />
            </Col>
          </Row>
          <Row className="mb-2">
            <Col>
              <Form.Select
                value={field.type}
                onChange={(e) => updateField(index, { type: e.target.value })}
              >
                <option value="text">Texte</option>
                <option value="email">Email</option>
                <option value="textarea">Zone de texte</option>
              </Form.Select>
            </Col>
            <Col>
              <Form.Control
                placeholder="Placeholder"
                value={field.placeholder}
                onChange={(e) => updateField(index, { placeholder: e.target.value })}
              />
            </Col>
          </Row>
          <Form.Check
            type="checkbox"
            label="Champ requis"
            checked={field.required}
            onChange={(e) => updateField(index, { required: e.target.checked })}
          />
          <Button
            variant="danger"
            size="sm"
            className="mt-2"
            onClick={() => removeField(index)}
          >
            Supprimer
          </Button>
        </div>
      ))}

      <Button variant="secondary" onClick={addField} className="mb-3">
        Ajouter un champ
      </Button>

      <Form.Group className="mb-3">
        <Form.Label>Label du bouton</Form.Label>
        <Form.Control
          type="text"
          value={formContent.submitLabel}
          onChange={(e) => update({ submitLabel: e.target.value })}
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Message de succès</Form.Label>
        <Form.Control
          type="text"
          value={formContent.successMessage}
          onChange={(e) => update({ successMessage: e.target.value })}
        />
      </Form.Group>
    </div>
  );
}
