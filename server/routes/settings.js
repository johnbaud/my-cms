import express from "express"
import prisma from "../prismaClient.js"
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js"

const router = express.Router()

// Récupérer les paramètres globaux
router.get("/", verifyToken, isAdmin, async (req, res) => {
  try {
    const settings = await prisma.settings.findFirst()
    res.json(settings || {})
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur." })
  }
})

// Modifier les paramètres globaux
router.post("/", verifyToken, isAdmin, async (req, res) => {
  const { siteName, logo, primaryColor } = req.body

  try {
    let settings = await prisma.settings.findFirst()

    if (settings) {
      settings = await prisma.settings.update({
        where: { id: settings.id },
        data: { siteName, logo, primaryColor }
      })
    } else {
      settings = await prisma.settings.create({
        data: { siteName, logo, primaryColor }
      })
    }

    res.json(settings)
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur." })
  }
})

export default router
