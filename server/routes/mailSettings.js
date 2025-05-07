
import express from "express"
import prisma from "../prismaClient.js"
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js"

const router = express.Router()

// 🔹 Récupérer la config SMTP
router.get("/", verifyToken, isAdmin, async (req, res) => {
  let cfg = await prisma.mailSettings.findFirst()
  if (!cfg) {
    // si jamais aucun n’existe, on crée un placeholder vide
    cfg = await prisma.mailSettings.create({
      data: { host:"", port:587, user:"", pass:"", fromAddress:"", defaultRecipient: "" }
    })
  }
  res.json(cfg)
})

// 🔹 Mettre à jour la config SMTP
router.put("/", verifyToken, isAdmin, async (req, res) => {
  const { host, port, user, pass, fromAddress, defaultRecipient } = req.body
  try {
    const updated = await prisma.mailSettings.upsert({
      where: { id: 1 },              // on s’attend à n’avoir qu’une ligne
      update: { host, port, user, pass, fromAddress, defaultRecipient },
      create: { host, port, user, pass, fromAddress, defaultRecipient }
    })
    res.json(updated)
  } catch (err) {
    console.error("❌ Erreur mailSettings PUT:", err)
    res.status(500).json({ message: "Erreur serveur." })
  }
})

export default router
