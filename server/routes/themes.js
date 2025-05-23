import express from "express";
import fs from "fs";
import path from "path";
import { isAdmin, verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", verifyToken, isAdmin, async (req, res) => {
  try {
    const themesDir = path.join(process.cwd(), "src", "themes");
    const themeFolders = fs.readdirSync(themesDir).filter((folder) => {
      return fs.existsSync(path.join(themesDir, folder, "index.js"));
    });

    const themes = themeFolders.map((folder) => {
      // Lecture directe du nom dans le fichier index.js → simple regex pour trouver name + id
      const indexPath = path.join(themesDir, folder, "index.js");
      const content = fs.readFileSync(indexPath, "utf8");

      const nameMatch = content.match(/name:\s*["'`](.*?)["'`]/);
      const idMatch = content.match(/id:\s*["'`](.*?)["'`]/);

      return {
        id: idMatch?.[1] || folder,
        name: nameMatch?.[1] || folder
      };
    });

    res.json(themes);
  } catch (error) {
    console.error("❌ Erreur récupération des thèmes :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

export default router;
