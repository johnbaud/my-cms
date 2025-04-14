import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import authRoutes from "./routes/auth.js"
import { verifyToken, isAdmin } from "./middleware/authMiddleware.js"
import settingsRoutes from "./routes/settings.js"
import pagesRoutes from "./routes/pages.js"
import blocksRoutes from "./routes/blocks.js"
import navigationRoutes from "./routes/navigation.js"
import uploadRoutes from "./routes/upload.js";
import { PrismaClient } from "@prisma/client"
import cookieParser from "cookie-parser"
import refreshTokenRoutes from "./routes/refreshToken.js"

const prisma = new PrismaClient()

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors({
  origin: "http://localhost:5173", // l'URL de ton frontend
  credentials: true
}))
app.use(express.json())
app.use(express.static('../public'))
app.use(cookieParser())

app.use("/api", uploadRoutes);
app.use("/uploads", express.static("public/uploads"));

// Routes existantes
app.use("/api/refresh-token", refreshTokenRoutes)
app.use("/api/auth", authRoutes)
app.use("/api/admin/settings", settingsRoutes)
app.use("/api/settings", settingsRoutes)
app.use("/api/pages", pagesRoutes)
app.use("/api/blocks", blocksRoutes)
app.use("/api/navigation", navigationRoutes)

app.get("/api/admin", verifyToken, isAdmin, (req, res) => {
  res.json({ message: "Bienvenue dans l’admin, accès réservé aux admins !" })
})

const createHomePageIfNotExists = async () => {
  const existingHomePage = await prisma.page.findFirst({
    where: { slug: "" }
  })

  if (!existingHomePage) {
    console.log("🏡 Aucune page d'accueil trouvée, création en cours...")

    const homePage = await prisma.page.create({
      data: {
        title: "Accueil",
        slug: "",
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
