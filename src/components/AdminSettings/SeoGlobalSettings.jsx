import React from "react";
import { Save } from "lucide-react";
import { Form, Button } from "react-bootstrap";
import TagsInput from "../TagsInput";

export default function SeoGlobalSettings({ settings, setSettings, onSave }) {
  return (
    <form onSubmit={onSave}>
      <h4>🌐 SEO global</h4>
      <Form.Group className="mb-3">
        <Form.Label>Titre par défaut</Form.Label>
        <Form.Control
          type="text"
          value={settings.defaultMetaTitle || ""}
          onChange={e => setSettings({ ...settings, defaultMetaTitle: e.target.value })}
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Mots-clés par défaut</Form.Label>
        <TagsInput
          value={Array.isArray(settings.defaultMetaKeywords) ? settings.defaultMetaKeywords : (settings.defaultMetaKeywords || "").split(",").map(k => k.trim()).filter(k => k)}
          onChange={arr => setSettings({ ...settings, defaultMetaKeywords: arr })}
          placeholder="Appuie sur Entrée ou , pour ajouter"
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Image Open Graph par défaut (URL)</Form.Label>
        <Form.Control
          type="text"
          value={settings.defaultMetaImage || ""}
          onChange={e => setSettings({ ...settings, defaultMetaImage: e.target.value })}
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Robots (index,follow, noindex,…)</Form.Label>
        <Form.Control
          type="text"
          value={settings.defaultRobots || ""}
          onChange={e => setSettings({ ...settings, defaultRobots: e.target.value })}
        />
      </Form.Group>

      <Button type="submit" className="btn btn-primary">
        <Save size={16} className="me-1" />
        Enregistrer SEO global
      </Button>
    </form>
  );
}
