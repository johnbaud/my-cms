import express from "express"
import prisma from "../prismaClient.js"
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js"

const router = express.Router()

router.get("/", async (req, res) => {
    try {
      const blocks = await prisma.block.findMany({
        include: {
          page: {
            select: { id: true, title: true, slug: true },
          },
        },
        orderBy: [
          { type: "asc" },
          { pageId: "asc" },
          { order: "asc" },
        ],
      });
  
      res.json(blocks);
    } catch (err) {
      console.error("❌ Erreur lors de la récupération des blocs:", err);
      res.status(500).json({ message: "Erreur serveur" });
    }
  });

router.get("/:blockId", async (req, res) => {
    const { blockId } = req.params;
  
    try {
      const block = await prisma.block.findUnique({
        where: { id: parseInt(blockId) },
        include: {
          page: {
            select: { id: true, title: true, slug: true },
          },
        },
      });
  
      if (!block) {
        return res.status(404).json({ message: "Bloc introuvable." });
      }
  
      res.json(block);
    } catch (err) {
      console.error("❌ Erreur lors de la récupération du bloc :", err);
      res.status(500).json({ message: "Erreur serveur" });
    }
  });


router.put("/:blockId", async (req, res) => {
    const { blockId } = req.params;
    const { content } = req.body;
  
    if (typeof content !== "string") {
      return res.status(400).json({ message: "Contenu invalide." });
    }
  
    try {
      const updatedBlock = await prisma.block.update({
        where: { id: parseInt(blockId) },
        data: { content },
      });
  
      res.json(updatedBlock);
    } catch (err) {
      console.error("❌ Erreur lors de la mise à jour du bloc :", err);
      res.status(500).json({ message: "Erreur serveur" });
    }
  });
  
  
  export default router;