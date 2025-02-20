import express from "express"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import prisma from "../prismaClient.js"

const router = express.Router()

// Inscription
router.post("/register", async (req, res) => {
  const { email, password, name } = req.body

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) return res.status(400).json({ message: "L'utilisateur existe déjà." })

    const hashedPassword = await bcrypt.hash(password, 10)
    const newUser = await prisma.user.create({
      data: { email, password: hashedPassword, name }
    })

    res.status(201).json({ message: "Utilisateur créé." })
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur." })
  }
})

// Connexion
router.post("/login", async (req, res) => {
    const { email, password } = req.body
  
    try {
      const user = await prisma.user.findUnique({ where: { email } })
      if (!user) return res.status(400).json({ message: "Utilisateur non trouvé." })
  
      const isValid = await bcrypt.compare(password, user.password)
      if (!isValid) return res.status(401).json({ message: "Mot de passe incorrect." })
  
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      )
  
      res.json({ token, role: user.role }) // Renvoie aussi le rôle
    } catch (error) {
      res.status(500).json({ message: "Erreur serveur." })
    }
  })
  

export default router
