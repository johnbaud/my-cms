import express from "express"
import prisma from "../prismaClient.js"
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js"

const router = express.Router()

// 🔹 Récupérer toutes les pages
router.get("/", async (req, res) => {
  try {
    const pages = await prisma.page.findMany({
      include: { blocks: { orderBy: { order: "asc" } } }
    })
    res.json(pages)
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur." })
  }
})

router.get("/public", async (req, res) => {
  try {
    const pages = await prisma.page.findMany({
      where: { isPublished: true },
      select: { id: true, title: true, slug: true }
    })
    res.json(pages)
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des pages :", error)
    res.status(500).json({ message: "Erreur serveur." })
  }
})

// 🔹 Créer une nouvelle page
router.post("/", verifyToken, isAdmin, async (req, res) => {
  const { title, slug, isPublished = true } = req.body

  try {
    const newPage = await prisma.page.create({
      data: { title, slug, isPublished }
    })
    res.json(newPage)
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur." })
  }
})

// 🔹 Ajouter un bloc à une page
router.post("/:pageId/blocks", verifyToken, isAdmin, async (req, res) => {
  const { type, content, order } = req.body
  const { pageId } = req.params

  try {
    const newBlock = await prisma.block.create({
      data: {
        type,
        content: JSON.stringify(content),
        order,
        page: { connect: { id: parseInt(pageId) } }
      }
    })
    res.json(newBlock)
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur." })
  }
})
// 🔹 Récupérer une page avec ses blocs
router.get("/:pageId", async (req, res) => {
  try {
    const page = await prisma.page.findUnique({
      where: { id: parseInt(req.params.pageId) },
      include: { blocks: { orderBy: { order: "asc" } } }
    })
    if (!page) return res.status(404).json({ message: "Page non trouvée" })
    res.json(page)
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur." })
  }
})

router.delete("/:pageId", verifyToken, isAdmin, async (req, res) => {
  const { pageId } = req.params

  try {
    // 🔹 Vérifie si la page existe
    const page = await prisma.page.findUnique({
      where: { id: parseInt(pageId) }
    })

    if (!page) return res.status(404).json({ message: "Page non trouvée" })

    const isHomepage = page.slug === ""
    if (isHomepage) {
      return res.status(403).json({ message: "La page d'accueil ne peut pas être supprimée." })
    }

    // 🔹 Supprime la page (les blocs seront supprimés en cascade)
    await prisma.page.delete({ where: { id: parseInt(pageId) } })

    res.json({ message: "Page supprimée avec succès" })
  } catch (error) {
    console.log("❌ Erreur lors de la suppression de la page :", error)
    res.status(500).json({ message: "Erreur serveur." })
  }
})

// 🔹 Modifier un bloc
router.put("/blocks/:blockId", verifyToken, isAdmin, async (req, res) => {
  const { content } = req.body
  const { blockId } = req.params
  console.log("🔹 Mise à jour demandée pour le bloc ID :", blockId)
  try {
    const updatedBlock = await prisma.block.update({
      where: { id: parseInt(blockId) },
      data: { content: JSON.stringify(content) }
    })
    res.json(updatedBlock)
  } catch (error) {
    console.log("❌ Erreur lors de la mise à jour :", error)
    res.status(500).json({ message: "Erreur serveur." })
  }
})

// 🔹 Supprimer un bloc
router.delete("/blocks/:blockId", verifyToken, isAdmin, async (req, res) => {
  const { blockId } = req.params

  try {
    await prisma.block.delete({ where: { id: parseInt(blockId) } })
    res.json({ message: "Bloc supprimé avec succès" })
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur." })
  }
})
// 🔹 déplacer un bloc
router.put("/blocks/:blockId/move", verifyToken, isAdmin, async (req, res) => {
  const { blockId } = req.params
  const { direction } = req.body

  try {
    const currentBlock = await prisma.block.findUnique({ where: { id: parseInt(blockId) } })
    if (!currentBlock) return res.status(404).json({ message: "Bloc non trouvé" })

    const adjacentBlock = await prisma.block.findFirst({
      where: {
        pageId: currentBlock.pageId,
        order: direction === "up" ? { lt: currentBlock.order } : { gt: currentBlock.order }
      },
      orderBy: { order: direction === "up" ? "desc" : "asc" }
    })

    if (!adjacentBlock) return res.json({ message: "Aucun bloc à échanger" })

    await prisma.block.update({
      where: { id: currentBlock.id },
      data: { order: adjacentBlock.order }
    })

    await prisma.block.update({
      where: { id: adjacentBlock.id },
      data: { order: currentBlock.order }
    })

    const updatedBlocks = await prisma.block.findMany({
      where: { pageId: currentBlock.pageId },
      orderBy: { order: "asc" }
    })

    res.json(updatedBlocks)
  } catch (error) {
    console.log("❌ Erreur lors du déplacement du bloc :", error)
    res.status(500).json({ message: "Erreur serveur." })
  }
})

// 🔹 Mettre à jour le titre ou le slug d’une page
router.patch("/:pageId", verifyToken, isAdmin, async (req, res) => {
  const { title, slug } = req.body
  const { pageId } = req.params

  try {
    const updated = await prisma.page.update({
      where: { id: parseInt(pageId) },
      data: {
        ...(title && { title }),
        ...(slug && { slug })
      }
    })
    res.json(updated)
  } catch (error) {
    console.error("❌ Erreur lors de la mise à jour de la page :", error)
    res.status(500).json({ message: "Erreur serveur lors de la mise à jour de la page." })
  }
})

// 🔹 Mettre à jour le statut de publication
router.patch("/:pageId/publish", verifyToken, isAdmin, async (req, res) => {
  const { isPublished } = req.body;

  try {
    const updated = await prisma.page.update({
      where: { id: parseInt(req.params.pageId) },
      data: { isPublished }
    });

    res.json(updated);
  } catch (error) {
    console.log("❌ Erreur lors de la mise à jour du statut :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
});


export default router
