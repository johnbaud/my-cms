import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import prisma from "../prismaClient.js";


const router = express.Router();

const uploadDir = path.resolve("public/uploads");

// Crée le dossier si nécessaire
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  }
});
const fileFilter = (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error("Seuls les fichiers JPG, PNG, WEBP et GIF sont autorisés"))
    }
}

const upload = multer({ storage, fileFilter })

router.post("/upload-image", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Aucun fichier envoyé ou type non supporté" });
  }

  // Chemin relatif depuis /public
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
});

// 🔥 Supprimer une image
router.delete("/delete-image", async (req, res) => {
  const { url } = req.body;
  console.log("🧼 Requête suppression reçue pour :", url);

  if (!url || !url.startsWith("/uploads/")) {
    return res.status(400).json({ message: "URL invalide ou manquante" });
  }

  const filePath = path.join("public", url);
  console.log("🧾 Chemin fichier à supprimer :", filePath);

  try {
    const exists = fs.existsSync(filePath);
    if (!exists) {
      console.warn("⛔ Fichier introuvable sur le disque :", filePath);
      return res.status(404).json({ message: "Fichier introuvable sur le disque" });
    }

    // ✅ Pas besoin de vérifier la BDD ici — le front s’en est chargé en amont
    await fs.promises.unlink(filePath);
    console.log("🗑️ Fichier supprimé physiquement :", filePath);
    res.json({ message: "Fichier supprimé avec succès" });

  } catch (err) {
    console.error("❌ Suppression échouée :", err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
});


  
export default router;
