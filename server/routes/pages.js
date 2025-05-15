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

router.get("/public", async (req, res) => {
  try {
    const pages = await prisma.page.findMany({
      where: { isPublished: true },
      select: { 
        id: true,
        title: true,
        slug: true,
        metaTitle: true,
        metaDescription: true,
        metaKeywords: true,
        metaImage: true 
      }
    })
    res.json(pages)
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des pages :", error)
    res.status(500).json({ message: "Erreur serveur." })
  }
})

// 🔹 Créer une nouvelle page
router.post("/", verifyToken, isAdmin, async (req, res) => {
  const { title, slug, isPublished = true, metaTitle, metaDescription, metaKeywords, metaImage, metaRobots } = req.body

  try {
    const newPage = await prisma.page.create({
      data: { 
        title,
        slug,
        isPublished,
        metaTitle,
        metaDescription,
        metaKeywords,
        metaImage,
        metaRobots
      }
    })
    res.json(newPage)
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur." })
  }
})

// 🔹 Ajouter un bloc à une page
router.post("/:pageId/blocks", verifyToken, isAdmin, async (req, res) => {
  const { type, content, order } = req.body;
  const { pageId } = req.params;

  try {
    let blockContent = content;

    // Si c'est un formulaire → on crée la structure Form + FormField en base
    if (type === "form" && typeof content === "object") {
      const { title, submitLabel, successMessage, emailTo, storeInDatabase = true, fields = [] } = content;

      const form = await prisma.form.create({
        data: {
          title,
          slug: `form-${Date.now()}`, // ou une logique de slug propre
          submitLabel,
          successMessage,
          emailTo,
          storeInDatabase,
          fields: {
            create: fields.map((f, index) => ({
              label: f.label,
              name: f.name,
              type: f.type,
              required: f.required,
              placeholder: f.placeholder,
              order: index,
            })),
          },
        },
        include: { fields: true },
      });

      // Mise à jour du contenu du bloc pour qu’il référence le formId
      blockContent = {
        formId: form.id,
        title,
        submitLabel,
        successMessage,
        emailTo,
        storeInDatabase,
        fields: form.fields, // utile pour affichage direct
      };
    }

    const newBlock = await prisma.block.create({
      data: {
        type,
        content: typeof blockContent === "string" ? blockContent : JSON.stringify(blockContent),
        order,
        page: { connect: { id: parseInt(pageId) } },
      },
    });

    res.json(newBlock);
  } catch (error) {
    console.error("❌ Erreur lors de la création du bloc :", error);
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
});

// 🔹 Récupérer une page avec ses blocs
router.get("/:pageId", async (req, res) => {
  try {
    const page = await prisma.page.findUnique({
      where: { id: parseInt(req.params.pageId) },
      include: { blocks: { orderBy: { order: "asc" } } }
    })
    if (!page) return res.status(404).json({ message: "Page non trouvée" })
    res.json(page)
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur." })
  }
})

router.delete("/:pageId", verifyToken, isAdmin, async (req, res) => {
  const { pageId } = req.params

  try {
    // 🔹 Vérifie si la page existe
    const page = await prisma.page.findUnique({
      where: { id: parseInt(pageId) }
    })

    if (!page) return res.status(404).json({ message: "Page non trouvée" })

    const isHomepage = page.slug === ""
    if (isHomepage) {
      return res.status(403).json({ message: "La page d'accueil ne peut pas être supprimée." })
    }

    // 🔹 Supprime la page (les blocs seront supprimés en cascade)
    await prisma.page.delete({ where: { id: parseInt(pageId) } })

    res.json({ message: "Page supprimée avec succès" })
  } catch (error) {
    console.log("❌ Erreur lors de la suppression de la page :", error)
    res.status(500).json({ message: "Erreur serveur." })
  }
})

// 🔹 Modifier un bloc
router.put("/blocks/:blockId", verifyToken, isAdmin, async (req, res) => {
  const { content } = req.body;
  const { blockId } = req.params;

  try {
    // 1. Récupère le bloc actuel
    const currentBlock = await prisma.block.findUnique({
      where: { id: parseInt(blockId) },
    });

    if (!currentBlock) {
      return res.status(404).json({ message: "Bloc non trouvé." });
    }

    let finalContent = content;

    // 2. Si c'est un formulaire → on met aussi à jour le Form lié
    if (currentBlock.type === "form") {
      const parsedContent = typeof content === "string" ? JSON.parse(content) : content;
      const {
        formId,
        title,
        submitLabel,
        successMessage,
        emailTo,
        storeInDatabase,
        fields = [],
      } = parsedContent;

      if (!formId) {
        return res.status(400).json({ message: "formId manquant dans le contenu." });
      }

      // 🔁 Supprime tous les anciens champs liés
      await prisma.formField.deleteMany({ where: { formId } });

      // 🛠 Met à jour le formulaire
      await prisma.form.update({
        where: { id: formId },
        data: {
          title,
          submitLabel,
          successMessage,
          emailTo,
          storeInDatabase,
          fields: {
            create: fields.map((f, index) => ({
              label: f.label,
              name: f.name,
              type: f.type,
              required: f.required,
              placeholder: f.placeholder,
              order: index,
            })),
          },
        },
      });

      // ✅ Contenu final : on garde les champs pour affichage immédiat
      finalContent = {
        formId,
        title,
        submitLabel,
        successMessage,
        emailTo,
        storeInDatabase,
        fields,
      };
    }

    const updatedBlock = await prisma.block.update({
      where: { id: parseInt(blockId) },
      data: {
        content: typeof finalContent === "string" ? finalContent : JSON.stringify(finalContent),
      },
    });

    res.json(updatedBlock);
  } catch (error) {
    console.error("❌ Erreur lors de la mise à jour du bloc formulaire :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
});


// 🔹 Supprimer un bloc
router.delete("/blocks/:blockId", verifyToken, isAdmin, async (req, res) => {
  const { blockId } = req.params

  try {
    await prisma.block.delete({ where: { id: parseInt(blockId) } })
    res.json({ message: "Bloc supprimé avec succès" })
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur." })
  }
})
// 🔹 déplacer un bloc
router.put("/blocks/:blockId/move", verifyToken, isAdmin, async (req, res) => {
  const { blockId } = req.params
  const { direction } = req.body

  try {
    const currentBlock = await prisma.block.findUnique({ where: { id: parseInt(blockId) } })
    if (!currentBlock) return res.status(404).json({ message: "Bloc non trouvé" })

    const adjacentBlock = await prisma.block.findFirst({
      where: {
        pageId: currentBlock.pageId,
        order: direction === "up" ? { lt: currentBlock.order } : { gt: currentBlock.order }
      },
      orderBy: { order: direction === "up" ? "desc" : "asc" }
    })

    if (!adjacentBlock) return res.json({ message: "Aucun bloc à échanger" })

    await prisma.block.update({
      where: { id: currentBlock.id },
      data: { order: adjacentBlock.order }
    })

    await prisma.block.update({
      where: { id: adjacentBlock.id },
      data: { order: currentBlock.order }
    })

    const updatedBlocks = await prisma.block.findMany({
      where: { pageId: currentBlock.pageId },
      orderBy: { order: "asc" }
    })

    res.json(updatedBlocks)
  } catch (error) {
    console.log("❌ Erreur lors du déplacement du bloc :", error)
    res.status(500).json({ message: "Erreur serveur." })
  }
})

// 🔹 Mettre à jour le titre, slug, SEO d’une page
router.patch("/:pageId", verifyToken, isAdmin, async (req, res) => {
  const { title, slug, metaTitle, metaDescription, metaKeywords, metaImage, metaRobots } = req.body
  const { pageId } = req.params

  try {
    const updated = await prisma.page.update({
      where: { id: parseInt(pageId) },
      data: {
        ...(title && { title }),
        ...(slug && { slug }),
        ...(metaTitle !== undefined && { metaTitle }),
        ...(metaDescription !== undefined && { metaDescription }),
        ...(metaKeywords !== undefined && { metaKeywords }),
        ...(metaImage !== undefined && { metaImage }),
        ...(metaRobots !== undefined && { metaRobots })
      }
    })
    res.json(updated)
  } catch (error) {
    console.error("❌ Erreur lors de la mise à jour de la page :", error)
    res.status(500).json({ message: "Erreur serveur lors de la mise à jour de la page." })
  }
})

// 🔹 Mettre à jour le statut de publication
router.patch("/:pageId/publish", verifyToken, isAdmin, async (req, res) => {
  const { isPublished } = req.body;

  try {
    const updated = await prisma.page.update({
      where: { id: parseInt(req.params.pageId) },
      data: { isPublished }
    });

    res.json(updated);
  } catch (error) {
    console.log("❌ Erreur lors de la mise à jour du statut :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
});


export default router
