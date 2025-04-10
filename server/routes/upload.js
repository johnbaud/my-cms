import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import prisma from "../prismaClient.js";

const router = express.Router();
const uploadDir = path.resolve("public/uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 🔹 Récupération dynamique des extensions autorisées
async function getAllowedExtensions() {
  const settings = await prisma.settings.findFirst();
  return settings?.allowedFileExtensions || ["jpg", "jpeg", "png", "gif", "webp", "svg", "pdf", "zip"];
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

function asyncMulterUpload(req, res, next) {
  getAllowedExtensions().then((allowed) => {
    const filter = (req, file, cb) => {
      const ext = path.extname(file.originalname).slice(1).toLowerCase();
      if (allowed.includes(ext)) cb(null, true);
      else cb(new Error(`Extension "${ext}" non autorisée.`), false);
    };

    const upload = multer({ storage, fileFilter: filter }).single("image");
    upload(req, res, function (err) {
      if (err instanceof multer.MulterError || err) {
        return res.status(400).json({ message: err.message || "Erreur d’upload" });
      }
      next();
    });
  });
}

// 🔹 Upload d'image
router.post("/upload-image", asyncMulterUpload, (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Aucun fichier envoyé ou type non supporté" });
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
});

// 🔹 Suppression d’image (blocs, logo, AdminUploads)
router.delete("/delete-image", async (req, res) => {
  const { url } = req.body;
  if (!url || !url.startsWith("/uploads/")) {
    return res.status(400).json({ message: "URL invalide ou manquante" });
  }

  const filePath = path.join("public", url);

  try {
    const isLogoUsed = await prisma.settings.findFirst({ where: { logo: url } });

    const matchingBlocks = await prisma.block.findMany({
      where: { type: "image", content: url }
    });

    const isUsed = (isLogoUsed || matchingBlocks.length > 0);
    if (isUsed) {
      return res.status(403).json({ message: "Ce fichier est encore utilisé dans une ou plusieurs pages ou comme logo du site." });
    }

    const exists = fs.existsSync(filePath);
    if (!exists) {
      return res.status(404).json({ message: "Fichier introuvable sur le disque" });
    }

    await fs.promises.unlink(filePath);
    res.json({ message: "Fichier supprimé avec succès" });

  } catch (err) {
    console.error("❌ Suppression échouée :", err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
});

// 🔹 Listing des fichiers
router.get("/uploads/list", async (req, res) => {
  try {
    const folderPath = path.join("public", "uploads");
    const files = await fs.promises.readdir(folderPath);

    const settings = await prisma.settings.findFirst();
    const currentLogo = settings?.logo || null;

    const fileStats = await Promise.all(
      files.map(async (name) => {
        const fullPath = path.join(folderPath, name);
        const stats = await fs.promises.stat(fullPath);
        const url = `/uploads/${name}`;

        const usedBlocks = await prisma.block.findMany({
          where: {
            type: "image",
            content: url
          },
          include: {
            page: {
              select: { id: true, title: true, slug: true }
            }
          }
        });

        const usedOnPages = usedBlocks.map(b => b.page).filter(Boolean);

        return {
          name,
          size: stats.size,
          createdAt: stats.birthtime,
          url,
          extension: path.extname(name).slice(1).toUpperCase(),
          usedOnPages,
          usedAsLogo: currentLogo === url 
        };
      })
    );

    res.json(fileStats);
  } catch (err) {
    console.error("❌ Erreur listing fichiers :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

export default router;
