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

// 🔹 Créer une nouvelle page
router.post("/", verifyToken, isAdmin, async (req, res) => {
  const { title, slug } = req.body

  try {
    const newPage = await prisma.page.create({
      data: { title, slug }
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

export default router
