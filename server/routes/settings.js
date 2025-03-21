import express from "express"
import prisma from "../prismaClient.js"
import multer from "multer"
import path from "path"
import fs from "fs"
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js"

const router = express.Router()

// 🔹 Configuration de Multer pour l'upload
const storage = multer.diskStorage({
  destination: "public/uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)) // 🔹 Nom unique
  }
})

const upload = multer({ 
  storage, 
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/svg+xml"]
    if (allowedTypes.includes(file.mimetype)) cb(null, true)
    else cb(new Error("Format non supporté"), false)
  }
})

// 🔹 Récupérer les paramètres globaux
router.get("/", verifyToken, isAdmin, async (req, res) => {
  try {
    const settings = await prisma.settings.findFirst()
    
    res.json({
      siteName: settings?.siteName || "Mon Site",
      logo: settings?.logo || "/assets/default-logo.png", // 🔹 Définit le logo par défaut
      primaryColor: settings?.primaryColor || "#ffffff",
      // 🔹 Navigation
      showLogo: settings?.showLogo ?? true,
      showSiteName: settings?.showSiteName ?? true,
      navAlignment: settings?.navAlignment || "left",
      navHeight: settings?.navHeight || 40,
      navBgColor: settings?.navBgColor || "#ffffff",
      navTextColor: settings?.navTextColor || "#000000",
        // 🔹 Footer
      footerBgColor: settings?.footerBgColor || "#000000",
      footerTextColor: settings?.footerTextColor || "#ffffff",
      footerAlignment: settings?.footerAlignment || "center",
      showFooterLinks: settings?.showFooterLinks ?? true
    })
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des paramètres :", error)
    res.status(500).json({ message: "Erreur serveur." })
  }
})


// 🔹 Modifier les paramètres globaux (avec upload du logo)
router.post("/", verifyToken, isAdmin, upload.single("logo"), async (req, res) => {
  console.log("📩 Données reçues :", req.body)
  const { siteName, primaryColor, showLogo, showSiteName, navAlignment, navHeight, navBgColor, navTextColor, footerBgColor, footerTextColor, footerAlignment, showFooterLinks } = req.body
  const logo = req.file ? `/uploads/${req.file.filename}` : undefined // 🔹 Stocke le logo si un fichier est uploadé

  try {
    let settings = await prisma.settings.findFirst()
    if (settings) {
      settings = await prisma.settings.update({
        where: { id: settings.id },
        data: { 
          siteName, 
          primaryColor, 
          ...(logo && { logo }), // 🔹 Met à jour le logo seulement si un fichier est uploadé
          // 🔹 Navigation
          showLogo: showLogo === "true",
          showSiteName: showSiteName === "true",
          navAlignment,
          navHeight: parseInt(navHeight), // 🔹 Convertir en nombre
          navBgColor,
          navTextColor,
          // 🔹 Footer
          footerBgColor,
          footerTextColor,
          footerAlignment,
          showFooterLinks: showFooterLinks === "true"
        }
      })
    } else {
      settings = await prisma.settings.create({
        data: { 
          siteName, 
          primaryColor, 
          logo: logo || "/assets/default-logo.png",
          // 🔹 Navigation
          showLogo: true,
          showSiteName: true,
          navAlignment: "left",
          navHeight: 40,
          navBgColor: "#ffffff",
          navTextColor: "#000000",
          // 🔹 Footer
          footerBgColor: "#000000",
          footerTextColor: "#ffffff",
          footerAlignment: "center",
          showFooterLinks: false
        }
      })
    }
    console.log("✅ Paramètres mis à jour :", settings)
    res.json({ message: "Paramètres mis à jour avec succès !" })
  } catch (error) {
    console.error("❌ Erreur lors de la mise à jour des paramètres :", error)
    res.status(500).json({ message: "Erreur serveur." })
  }
})

// 🔹 Supprimer le logo et revenir au logo par défaut
router.delete("/logo", verifyToken, isAdmin, async (req, res) => {
  try {
    let settings = await prisma.settings.findFirst()
    if (!settings || !settings.logo || settings.logo === "/assets/default-logo.png") {
      return res.status(400).json({ message: "Aucun logo à supprimer." })
    }

    const logoPath = `public${settings.logo}` // 📌 Construire le chemin du fichier
    if (fs.existsSync(logoPath)) {
      fs.unlinkSync(logoPath) // 📌 Supprimer le fichier
    }

    // 🔹 Mettre à jour les paramètres pour remettre le logo par défaut
    settings = await prisma.settings.update({
      where: { id: settings.id },
      data: { logo: "/assets/default-logo.png" }
    })

    res.json({ message: "Logo supprimé avec succès.", logo: "/assets/default-logo.png" })
  } catch (error) {
    console.error("❌ Erreur lors de la suppression du logo :", error)
    res.status(500).json({ message: "Erreur serveur." })
  }
})

export default router
