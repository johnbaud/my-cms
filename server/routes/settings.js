import express from "express"
import prisma from "../prismaClient.js"
import path from "path"
import fs from "fs"
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js"

const router = express.Router()

// 🔹 Récupérer les paramètres globaux
router.get("/", verifyToken, isAdmin, async (req, res) => {
  try {
    const settings = await prisma.settings.findFirst()

    res.json({
      siteName: settings?.siteName || "Mon Site",
      logo: settings?.logo || "/assets/default-logo.png",
      primaryColor: settings?.primaryColor || "#ffffff",
      secondaryColor: settings?.secondaryColor || "#f8f9fa",
      fontFamily: settings?.fontFamily || "Montserrat, sans-serif",
      fontSizeBase: settings?.fontSizeBase || "1rem",
      fontSizeH1: settings?.fontSizeH1 || "2.25rem",
      fontSizeH2: settings?.fontSizeH2 || "1.75rem",
      fontSizeH3: settings?.fontSizeH3 || "1.25rem",
      lineHeight: settings?.lineHeight || "1.6",
      letterSpacing: settings?.letterSpacing || "normal",
      textMaxWidth: settings?.textMaxWidth || "65ch",
      spacingBetweenBlocks: settings?.spacingBetweenBlocks || "2rem",
      borderRadius: settings?.borderRadius || "0.5rem",
      boxShadow: settings?.boxShadow ?? false,
      showLogo: settings?.showLogo ?? true,
      showSiteName: settings?.showSiteName ?? true,
      navAlignment: settings?.navAlignment || "left",
      navHeight: settings?.navHeight || 40,
      navBgColor: settings?.navBgColor || "#ffffff",
      navTextColor: settings?.navTextColor || "#000000",
      footerBgColor: settings?.footerBgColor || "#000000",
      footerTextColor: settings?.footerTextColor || "#ffffff",
      footerAlignment: settings?.footerAlignment || "center",
      showFooterLinks: settings?.showFooterLinks ?? true,
      allowedFileExtensions: settings?.allowedFileExtensions?.split(",") || ["jpg", "jpeg", "png", "gif", "webp", "svg", "pdf", "zip", "mp4"],
      defaultTitleSuffix: settings?.defaultTitleSuffix || "",
      defaultMetaKeywords: settings?.defaultMetaKeywords || "",
      defaultMetaImage: settings?.defaultMetaImage || "",
      defaultRobots: settings?.defaultRobots || "",
      selectedTheme: settings?.selectedTheme || "modern-light"
    })
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des paramètres :", error)
    res.status(500).json({ message: "Erreur serveur." })
  }
})

// 🔹 Modifier les paramètres globaux (le logo est déjà uploadé en amont)
router.post("/", verifyToken, isAdmin, async (req, res) => {
  const {
    siteName,
    primaryColor,
    secondaryColor,
    fontFamily,
    fontSizeBase,
    fontSizeH1,
    fontSizeH2,
    fontSizeH3,
    lineHeight,
    letterSpacing,
    textMaxWidth,
    spacingBetweenBlocks,
    borderRadius,
    boxShadow,
    logo,
    showLogo,
    showSiteName,
    navAlignment,
    navHeight,
    navBgColor,
    navTextColor,
    footerBgColor,
    footerTextColor,
    footerAlignment,
    showFooterLinks,
    allowedFileExtensions,
    defaultTitleSuffix,
    defaultMetaKeywords,
    defaultMetaImage,
    defaultRobots,
    selectedTheme 
  } = req.body;

  // 👇 Nettoyage et validation des metaKeywords globaux
  const keywordsArray = String(defaultMetaKeywords || "")
    .split(',')
    .map(kw => kw.trim())
    .filter(kw => kw.length > 0);
  const cleanedDefaultMetaKeywords = [...new Set(keywordsArray)].join(',');

  try {
    let settings = await prisma.settings.findFirst();
    const extensionList = Array.isArray(allowedFileExtensions)
      ? allowedFileExtensions.join(",")
      : allowedFileExtensions;

    if (settings) {
      settings = await prisma.settings.update({
        where: { id: settings.id },
        data: {
          siteName,
          primaryColor,
          secondaryColor,
          fontFamily,
          fontSizeBase,
          fontSizeH1,
          fontSizeH2,
          fontSizeH3,
          lineHeight,
          letterSpacing,
          textMaxWidth,
          spacingBetweenBlocks,
          borderRadius,
          boxShadow,
          ...(logo && { logo }),
          showLogo,
          showSiteName,
          navAlignment,
          navHeight: parseInt(navHeight),
          navBgColor,
          navTextColor,
          footerBgColor,
          footerTextColor,
          footerAlignment,
          showFooterLinks,
          allowedFileExtensions: extensionList,
          defaultTitleSuffix,
          defaultMetaKeywords: cleanedDefaultMetaKeywords,
          defaultMetaImage,
          defaultRobots,
          selectedTheme 
        }
      });
    } else {
      settings = await prisma.settings.create({
        data: {
          siteName,
          primaryColor,
          secondaryColor: "#f8f9fa",
          fontFamily: "Montserrat, sans-serif",
          fontSizeBase: "1rem",
          fontSizeH1: "2.25rem",
          fontSizeH2: "1.75rem",
          fontSizeH3: "1.25rem",
          lineHeight: "1.6",
          letterSpacing: "normal",
          textMaxWidth: "65ch",
          spacingBetweenBlocks: "2rem",
          borderRadius: "0.5rem",
          boxShadow: false,
          logo: logo || "/assets/default-logo.png",
          showLogo: true,
          showSiteName: true,
          navAlignment: "left",
          navHeight: 40,
          navBgColor: "#ffffff",
          navTextColor: "#000000",
          footerBgColor: "#000000",
          footerTextColor: "#ffffff",
          footerAlignment: "center",
          showFooterLinks: false,
          allowedFileExtensions: "jpg,jpeg,png,gif,webp,svg,pdf,zip,mp4",
          defaultTitleSuffix: "",
          defaultMetaKeywords: cleanedDefaultMetaKeywords,
          defaultMetaImage: "",
          defaultRobots: "",
          selectedTheme: "modern-light"
        }
      });
    }

    res.json({ message: "Paramètres mis à jour avec succès !" });
  } catch (error) {
    console.error("❌ Erreur lors de la mise à jour des paramètres :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
});

// 🔹 Supprimer le logo et revenir au logo par défaut
router.delete("/logo", verifyToken, isAdmin, async (req, res) => {
  try {
    const settings = await prisma.settings.findFirst();
    if (!settings || !settings.logo || settings.logo === "/assets/default-logo.png") {
      return res.status(400).json({ message: "Aucun logo à supprimer." });
    }

    const logoPath = path.join("public", settings.logo);

    if (fs.existsSync(logoPath)) {
      await fs.promises.unlink(logoPath);
      console.log("🗑️ Logo supprimé physiquement :", logoPath);
    } else {
      console.warn("⚠️ Le fichier du logo n'existe pas :", logoPath);
    }

    await prisma.settings.update({
      where: { id: settings.id },
      data: { logo: "/assets/default-logo.png" }
    });

    res.json({ message: "Logo supprimé avec succès.", logo: "/assets/default-logo.png" });
  } catch (error) {
    console.error("❌ Erreur lors de la suppression du logo :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
});

// ✅ Endpoint public
router.get("/public", async (req, res) => {
  try {
    const settings = await prisma.settings.findFirst();
    const host = req.get("host").split(":")[0];
    const titleSuffix = settings?.defaultTitleSuffix
      ? settings.defaultTitleSuffix
      : ` | ${host}`;
    res.json({
      siteName: settings?.siteName || "Mon Site",
      logo: settings?.logo || "/assets/default-logo.png",
      primaryColor: settings?.primaryColor || "#ffffff",
      secondaryColor: settings?.secondaryColor || "#f8f9fa",
      fontFamily: settings?.fontFamily || "Montserrat, sans-serif",
      fontSizeBase: settings?.fontSizeBase || "1rem",
      fontSizeH1: settings?.fontSizeH1 || "2.25rem",
      fontSizeH2: settings?.fontSizeH2 || "1.75rem",
      fontSizeH3: settings?.fontSizeH3 || "1.25rem",
      lineHeight: settings?.lineHeight || "1.6",
      letterSpacing: settings?.letterSpacing || "normal",
      textMaxWidth: settings?.textMaxWidth || "65ch",
      spacingBetweenBlocks: settings?.spacingBetweenBlocks || "2rem",
      borderRadius: settings?.borderRadius || "0.5rem",
      boxShadow: settings?.boxShadow ?? false,
      showLogo: settings?.showLogo ?? true,
      showSiteName: settings?.showSiteName ?? true,
      navAlignment: settings?.navAlignment || "left",
      navHeight: settings?.navHeight || 40,
      navBgColor: settings?.navBgColor || "#ffffff",
      navTextColor: settings?.navTextColor || "#000000",
      footerBgColor: settings?.footerBgColor || "#000000",
      footerTextColor: settings?.footerTextColor || "#ffffff",
      footerAlignment: settings?.footerAlignment || "center",
      showFooterLinks: settings?.showFooterLinks ?? true,
      allowedFileExtensions: settings?.allowedFileExtensions?.split(",") || ["jpg", "jpeg", "png", "gif", "webp", "svg", "pdf", "zip", "mp4"],
      defaultTitleSuffix: titleSuffix,
      defaultMetaKeywords: settings?.defaultMetaKeywords || "",
      defaultMetaImage: settings?.defaultMetaImage || "",
      defaultRobots: settings?.defaultRobots || "",
      selectedTheme: settings?.selectedTheme || "modern-light"
    });

  } catch (error) {
    console.error("Erreur lors de la récupération des paramètres publics :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
});

export default router
