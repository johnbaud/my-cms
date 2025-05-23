import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import cron from "node-cron";
import authRoutes from "./routes/auth.js"
import { verifyToken, isAdmin } from "./middleware/authMiddleware.js"
import settingsRoutes from "./routes/settings.js"
import pagesRoutes from "./routes/pages.js"
import blocksRoutes from "./routes/blocks.js"
import navigationRoutes from "./routes/navigation.js"
import uploadRoutes from "./routes/upload.js";
import formRoutes from "./routes/forms.js";
import mailSettingsRoutes from "./routes/mailSettings.js"
import themesRoutes from "./routes/themes.js";
import { PrismaClient } from "@prisma/client"
import cookieParser from "cookie-parser"

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
app.use("/api/auth", authRoutes)
app.use("/api/admin/settings", settingsRoutes)
app.use("/api/settings", settingsRoutes)
app.use("/api/pages", pagesRoutes)
app.use("/api/blocks", blocksRoutes)
app.use("/api/navigation", navigationRoutes)
app.use("/api/forms", formRoutes)
app.use("/api/admin/mail-settings", mailSettingsRoutes)
app.use("/api/admin/themes", themesRoutes);
app.get("/api/admin", verifyToken, isAdmin, (req, res) => {
  res.json({ message: "Bienvenue dans l’admin, accès réservé aux admins !" })
})

// ➤ Cron job : suppression chaque jour à minuit
cron.schedule("0 0 * * *", async () => {
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  try {
    const { count } = await prisma.formSubmission.deleteMany({
      where: { createdAt: { lt: cutoff } }
    });
    console.log(`🧹 ${count} ancienne(s) soumission(s) supprimée(s) (avant ${cutoff.toISOString()}).`);
  } catch (err) {
    console.error("❌ Erreur nettoyage des soumissions :", err);
  }
});


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
