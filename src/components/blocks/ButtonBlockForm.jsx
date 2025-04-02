// components/blocks/ButtonBlockForm.jsx
import { useState, useEffect } from "react";

export default function ButtonBlockForm({ content, onChange }) {
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");

  useEffect(() => {
    try {
      const parsed = JSON.parse(content || "{}");
      setLabel(parsed.label || "");
      setUrl(parsed.url || "");
    } catch {
      setLabel("");
      setUrl("");
    }
  }, [content]);

  useEffect(() => {
    onChange(JSON.stringify({ label, url }));
  }, [label, url]);

  return (
    <div className="mb-2">
      <label className="form-label">Texte du bouton</label>
      <input
        type="text"
        className="form-control mb-2"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
      />
      <label className="form-label">Lien</label>
      <input
        type="text"
        className="form-control"
        value={url}
        placeholder="https://..."
        onChange={(e) => setUrl(e.target.value)}
      />
    </div>
  );
}
