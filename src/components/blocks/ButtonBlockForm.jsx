import { useEffect, useState, useMemo, useRef } from "react";

export default function ButtonBlockForm({ content, onChange }) {
  const [label, setLabel] = useState("");
  const [type, setType] = useState("internal");
  const [url, setUrl] = useState("");
  const [pages, setPages] = useState([]);
  const [style, setStyle] = useState("commun");
  const [backgroundColor, setBackgroundColor] = useState("#000000");
  const [textColor, setTextColor] = useState("#ffffff");
  const [fontSize, setFontSize] = useState("16px");
  const [borderColor, setBorderColor] = useState("#cccccc");
  const [borderRadius, setBorderRadius] = useState(4);
  const [hoverColor, setHoverColor] = useState("#aaaaaa");
  const didInit = useRef(false);

  useEffect(() => {
    if (!didInit.current && content) {
      try {
        const parsed = JSON.parse(content || "{}");
        setLabel(parsed.label || "");
        setType(parsed.type || "internal");
        setUrl(parsed.url || "");
        setStyle(parsed.style || "commun");
        const s = parsed.styles || {};
        setBackgroundColor(s.backgroundColor || "#000000");
        setTextColor(s.textColor || "#ffffff");
        setFontSize(s.fontSize || "16px");
        setBorderColor(s.borderColor || "#cccccc");
        setBorderRadius(s.borderRadius || 4);
        setHoverColor(s.hoverColor || "#aaaaaa");
      } catch {
        // fallback si parsing JSON rate
      }
      didInit.current = true;
    }
  }, [content]);

  useEffect(() => {
    fetch("http://localhost:5000/api/pages/public")
      .then(res => res.json())
      .then(data => setPages(data));
  }, []);

  const styles = useMemo(() => ({
    backgroundColor,
    textColor,
    fontSize,
    borderColor,
    borderRadius,
    hoverColor
  }), [backgroundColor, textColor, fontSize, borderColor, borderRadius, hoverColor]);

  useEffect(() => {
    if (didInit.current) {
      const updatedContent = {
        label,
        type,
        url,
        style,
        styles
      };
      onChange(JSON.stringify(updatedContent));
    }
  }, [label, type, url, style, styles, onChange]);

  return (
    <div className="mb-3">
      <label className="form-label">Texte du bouton</label>
      <input type="text" className="form-control mb-2" value={label} onChange={e => setLabel(e.target.value)} />

      <label className="form-label">Type de lien</label>
      <select className="form-control mb-2" value={type} onChange={e => setType(e.target.value)}>
        <option value="internal">Lien interne</option>
        <option value="external">Lien externe</option>
        <option value="anchor">Ancre (#...)</option>
      </select>

      {type === "internal" && (
        <>
          <label className="form-label">Page cible</label>
          <select className="form-control mb-2" value={url} onChange={e => setUrl(e.target.value)}>
            <option value="">-- Sélectionnez une page --</option>
            {pages.map(p => (
              <option key={p.id} value={`/${p.slug}`}>{p.title}</option>
            ))}
          </select>
        </>
      )}

      {type === "external" && (
        <>
          <label className="form-label">URL</label>
          <input type="text" className="form-control mb-2" placeholder="https://..." value={url} onChange={e => setUrl(e.target.value)} />
        </>
      )}

      {type === "anchor" && (
        <>
          <label className="form-label">ID de l'ancre (ex : #contact)</label>
          <input type="text" className="form-control mb-2" value={url} onChange={e => setUrl(e.target.value)} />
        </>
      )}

      <label className="form-label">Style du bouton</label>
      <select className="form-control mb-3" value={style} onChange={e => setStyle(e.target.value)}>
        <option value="commun">Classique (plein)</option>
        <option value="border">Bordure</option>
        <option value="underline">Souligné</option>
      </select>

      {(style === "commun" || style === "border") && (
        <>
          {style === "commun" && (
            <>
              <label className="form-label">Couleur de fond</label>
              <input type="color" className="form-control form-control-color mb-2" value={backgroundColor} onChange={e => setBackgroundColor(e.target.value)} />
            </>
          )}

          <label className="form-label">Couleur du texte</label>
          <input type="color" className="form-control form-control-color mb-2" value={textColor} onChange={e => setTextColor(e.target.value)} />

          {style === "border" && (
            <>
              <label className="form-label">Couleur de bordure</label>
              <input type="color" className="form-control form-control-color mb-2" value={borderColor} onChange={e => setBorderColor(e.target.value)} />
            </>
          )}

          <label className="form-label">Taille du texte</label>
          <input type="text" className="form-control mb-2" value={fontSize} onChange={e => setFontSize(e.target.value)} />

          <label className="form-label">Arrondi des coins (px)</label>
          <input type="number" className="form-control mb-2" value={borderRadius} onChange={e => setBorderRadius(e.target.value)} />
        </>
      )}

      <label className="form-label">Couleur au survol (hover)</label>
      <input type="color" className="form-control form-control-color mb-2" value={hoverColor} onChange={e => setHoverColor(e.target.value)} />
    </div>
  );
}
