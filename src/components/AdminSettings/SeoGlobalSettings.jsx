import React, { useRef, useState } from "react";
import { Save } from "lucide-react";
import { Form, Button } from "react-bootstrap";
import TagsInput from "../TagsInput";
import { useAuth } from "../../context/AuthContext"
import { authFetch } from "../../utils/authFetch"

export default function SeoGlobalSettings({ settings, setSettings, onSave }) {

  const { accessToken } = useAuth()
  const fileInputRef = useRef()
  const [preview, setPreview] = useState(settings.defaultMetaImage || "")

  const triggerUpload = () => fileInputRef.current.click()

  const handleUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const formData = new FormData()
    formData.append("image", file)
    const res = await authFetch("/uploads/upload-image", { method: "POST", body: formData }, accessToken)
    if (res.ok) {
      const { url } = await res.json()
      setSettings(s => ({ ...s, defaultMetaImage: url }))
      setPreview(url)
    } else {
      console.error("Erreur upload OG image")
    }
  }  
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
        <div className="d-flex align-items-center gap-3">
          {preview && <img src={preview} alt="preview OG" style={{ width: 100, height: 60, objectFit: "cover" }} />}
          <Button variant="outline-secondary" size="sm" onClick={triggerUpload}>
            {preview ? "Changer l’image" : "Uploader une image"}
          </Button>
        </div>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          className="d-none"
          onChange={handleUpload}
        />
      </Form.Group>

      <Button type="submit" className="btn btn-primary">
        <Save size={16} className="me-1" />
        Enregistrer SEO global
      </Button>
    </form>
  );
}
