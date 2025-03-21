import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import authRoutes from "./routes/auth.js"
import { verifyToken, isAdmin } from "./middleware/authMiddleware.js"
import settingsRoutes from "./routes/settings.js"
import pagesRoutes from "./routes/pages.js"
import navigationRoutes from "./routes/navigation.js"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()


dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

// Routes d'authentification
app.use("/api/auth", authRoutes)
app.use("/api/admin/settings", settingsRoutes)
app.use("/api/settings", settingsRoutes)
app.use("/api/pages", pagesRoutes)
app.use("/api/navigation", navigationRoutes)
app.get("/api/admin", verifyToken, isAdmin, (req, res) => {
  res.json({ message: "Bienvenue dans l’admin, accès réservé aux admins !" })
})
const createHomePageIfNotExists = async () => {
  const existingHomePage = await prisma.page.findFirst({
    where: { slug: "" } // 🔹 Recherche une page avec un slug vide
  })

  if (!existingHomePage) {
    console.log("🏡 Aucune page d'accueil trouvée, création en cours...")

    const homePage = await prisma.page.create({
      data: {
        title: "Accueil",
        slug: "", // 🔹 Slug vide pour la page d’accueil
        blocks: {
          create: [
            {
              type: "text",
              content: JSON.stringify({
                siteName: "Nom du site",
                logo: "/default-logo.png"
              }),
              order: 0
            }
          ]
        }
      }
    })

    console.log("✅ Page d'accueil créée :", homePage)
  }
}

createHomePageIfNotExists()

app.listen(PORT, () => console.log(`Serveur démarré sur http://localhost:${PORT}`))
