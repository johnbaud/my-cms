import { useState, useRef, useEffect } from "react";

export default function ImageBlockForm({ content, onChange }) {
  const [preview, setPreview] = useState(content || "");
  const [oldImage, setOldImage] = useState(null);
  const fileInputRef = useRef(null);
  const [message, setMessage] = useState("");


  useEffect(() => {
    setPreview(content || "");
  }, [content]);

  const deleteOldImage = async (url) => {
    if (!url) return;
  
    const response = await fetch("http://localhost:5000/api/delete-image", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
  
    if (response.status === 403) {
      console.info("⛔ Image non supprimée : elle est encore utilisée dans d’autres blocs.");
    } else if (!response.ok) {
      console.warn("⚠️ Erreur lors de la tentative de suppression de l'image :", await response.text());
    }
  };
  

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Sauvegarde l’ancienne image AVANT de la remplacer
    const previousUrl = preview;

    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch("http://localhost:5000/api/upload-image", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      const data = await response.json();
      setPreview(data.url);
      onChange(data.url);

      // Supprimer l’ancienne image (si elle n’est plus utilisée)
      if (previousUrl && previousUrl !== data.url) {
        await deleteOldImage(previousUrl);
      }
      setMessage("✅ Image remplacée avec succès.");
      setTimeout(() => setMessage(""), 3000);
    } else {
      alert("Erreur lors de l’upload.");
    }

  };

  const handleRemoveImage = async () => {
    if (preview) {
      const response = await fetch("http://localhost:5000/api/delete-image", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: preview }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        alert(errData.message || "⚠️ L’image n’a pas pu être supprimée du serveur.");
      } else {
        setMessage("🗑️ Image supprimée avec succès.");
        setTimeout(() => setMessage(""), 3000);
      }
    }

    setPreview("");
    onChange("");
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="mb-3">
      {message && (
        <div className="alert alert-success py-1 px-2 small mt-2">{message}</div>
        )}
      <div className="alert alert-info py-1 px-2 small mt-2">
        Pour un affichage rapide, utilisez des images <strong>inférieures à 500 Ko</strong> (formats JPG, PNG, WEBP, GIF).
      </div>

      {!preview && (
        <input
          type="file"
          className="form-control"
          accept="image/*"
          onChange={handleFileChange}
        />
      )}

      {preview && (
        <div className="mt-2">
          <img src={preview} alt="Aperçu" style={{ maxWidth: "200px", maxHeight: "200px", objectFit: "contain" }} className="rounded border mb-2" />

          <div className="d-flex gap-2">
            <button type="button" className="btn btn-outline-primary btn-sm" onClick={triggerFileInput}>
              Changer l’image
            </button>
            <button type="button" className="btn btn-outline-danger btn-sm" onClick={handleRemoveImage}>
              Supprimer l’image
            </button>
          </div>

          <input
            type="file"
            className="d-none"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
        </div>
      )}
    </div>
  );
}
