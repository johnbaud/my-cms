import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import authRoutes from "./routes/auth.js"
import { verifyToken, isAdmin } from "./middleware/authMiddleware.js"
import settingsRoutes from "./routes/settings.js"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

// Routes d'authentification
app.use("/api/auth", authRoutes)
app.use("/api/admin/settings", settingsRoutes)

app.get("/api/admin", verifyToken, isAdmin, (req, res) => {
  res.json({ message: "Bienvenue dans l’admin, accès réservé aux admins !" })
})

app.listen(PORT, () => console.log(`Serveur démarré sur http://localhost:${PORT}`))
