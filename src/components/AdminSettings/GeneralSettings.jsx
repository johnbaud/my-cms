import React, { useRef } from "react";
import { Save } from "lucide-react";
import { Form } from "react-bootstrap";

export default function GeneralSettings({
  settings,
  setSettings,
  onSave,
  onFileChange,
  onDeleteLogo,
  themeOptions = []
}) {
  const fileInputRef = useRef();

  const triggerFileInput = () => fileInputRef.current.click();

  return (
    <form onSubmit={onSave}>
      <div className="mb-3">
        <label>Nom du site</label>
        <input
          type="text"
          className="form-control"
          value={settings.siteName}
          onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
          required
        />
      </div>

      <div className="mb-3">
        <label>Logo</label>
        {!settings.logo ? (
          <input
            type="file"
            className="form-control"
            accept="image/png, image/jpeg, image/svg+xml"
            onChange={onFileChange}
          />
        ) : (
          <div className="mt-2">
            <img src={settings.logo} alt="Logo actuel" style={{ maxWidth: "100px" }} />
            <div className="d-flex gap-2 mt-2">
              <button
                type="button"
                className="btn btn-outline-primary btn-sm"
                onClick={triggerFileInput}
              >
                Changer le logo
              </button>
              <button
                type="button"
                className="btn btn-outline-danger btn-sm"
                onClick={onDeleteLogo}
              >
                Supprimer
              </button>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="d-none"
              accept="image/png, image/jpeg, image/svg+xml"
              onChange={onFileChange}
            />
          </div>
        )}
      </div>
      <Form.Group className="mb-3">
        <Form.Label>🎨 Thème du site</Form.Label>
        <Form.Select
          value={settings.selectedTheme || ""}
          onChange={(e) =>
            setSettings((prev) => ({ ...prev, selectedTheme: e.target.value }))
          }
        >
          <option value="">-- Choisir un thème --</option>
          {themeOptions.map((theme) => (
            <option key={theme.id} value={theme.id}>
              {theme.name}
            </option>
          ))}
        </Form.Select>
      </Form.Group>
      <div className="mb-3">
        <label>Couleur principale</label>
        <input
          type="color"
          className="form-control form-control-color"
          value={settings.primaryColor}
          onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
        />
      </div>

      <div className="mb-3">
        <label>Extensions autorisées pour l’upload</label>
        <select
          className="form-select"
          multiple
          value={
            Array.isArray(settings.allowedFileExtensions)
              ? settings.allowedFileExtensions
              : (settings.allowedFileExtensions || "").split(",")
          }
          onChange={(e) => {
            const selected = Array.from(e.target.selectedOptions).map((opt) => opt.value);
            setSettings({ ...settings, allowedFileExtensions: selected });
          }}
        >
          <optgroup label="📷 Images">
            <option value="jpg">JPG</option>
            <option value="jpeg">JPEG</option>
            <option value="png">PNG</option>
            <option value="gif">GIF</option>
            <option value="webp">WEBP</option>
            <option value="svg">SVG</option>
          </optgroup>
          <optgroup label="📄 Documents">
            <option value="pdf">PDF</option>
            <option value="txt">TXT</option>
            <option value="csv">CSV</option>
            <option value="json">JSON</option>
            <option value="xml">XML</option>
            <option value="md">MD</option>
          </optgroup>
          <optgroup label="📦 Archives">
            <option value="zip">ZIP</option>
            <option value="rar">RAR</option>
            <option value="7z">7Z</option>
            <option value="tar">TAR</option>
            <option value="gz">GZ</option>
          </optgroup>
          <optgroup label="🎥 Vidéos">
            <option value="mp4">MP4</option>
            <option value="webm">WEBM</option>
            <option value="mov">MOV</option>
          </optgroup>
          <optgroup label="🎧 Audio">
            <option value="mp3">MP3</option>
            <option value="wav">WAV</option>
            <option value="ogg">OGG</option>
          </optgroup>
        </select>
        <div className="form-text">
          Utilisez Ctrl/Cmd + clic pour en sélectionner plusieurs.
        </div>
      </div>

      <button type="submit" className="btn btn-primary">
        <Save size={20} className="me-2" /> Enregistrer
      </button>
    </form>
  );
}
