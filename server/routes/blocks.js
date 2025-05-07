import express from "express"
import prisma from "../prismaClient.js"
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js"

const router = express.Router()

router.get("/", async (req, res) => {
    try {
      const blocks = await prisma.block.findMany({
        include: {
          page: {
            select: { id: true, title: true, slug: true },
          },
        },
        orderBy: [
          { type: "asc" },
          { pageId: "asc" },
          { order: "asc" },
        ],
      });
  
      res.json(blocks);
    } catch (err) {
      console.error("❌ Erreur lors de la récupération des blocs:", err);
      res.status(500).json({ message: "Erreur serveur" });
    }
  });

router.get("/:blockId", async (req, res) => {
    const { blockId } = req.params;
  
    try {
      const block = await prisma.block.findUnique({
        where: { id: parseInt(blockId) },
        include: {
          page: {
            select: { id: true, title: true, slug: true },
          },
        },
      });
  
      if (!block) {
        return res.status(404).json({ message: "Bloc introuvable." });
      }
  
      res.json(block);
    } catch (err) {
      console.error("❌ Erreur lors de la récupération du bloc :", err);
      res.status(500).json({ message: "Erreur serveur" });
    }
  });


router.put("/:blockId", async (req, res) => {
  const { blockId } = req.params;
  let { content } = req.body;

  try {
    // 🔍 Récupération du bloc existant
    const existingBlock = await prisma.block.findUnique({
      where: { id: parseInt(blockId) },
    });

    if (!existingBlock) {
      return res.status(404).json({ message: "Bloc introuvable." });
    }

    // Si ce n'est pas un bloc de formulaire : mise à jour simple
    if (existingBlock.type !== "form") {
      const stringContent = typeof content === "string" ? content : JSON.stringify(content);
      const updatedBlock = await prisma.block.update({
        where: { id: parseInt(blockId) },
        data: { content: stringContent },
      });
      return res.json(updatedBlock);
    }

    // 🧠 Bloc formulaire : mise à jour de la structure Form + FormField
    if (typeof content === "string") {
      content = JSON.parse(content);
    }

    const { formId, title, submitLabel, successMessage, emailTo, storeInDatabase, fields = [] } = content;

    if (!formId) {
      return res.status(400).json({ message: "Ce formulaire ne contient pas de formId." });
    }

    // 🔁 Mise à jour du formulaire principal
    await prisma.form.update({
      where: { id: formId },
      data: {
        title,
        submitLabel,
        successMessage,
        emailTo,
        storeInDatabase,
      },
    });

    // 🔄 Suppression + recréation des champs
    await prisma.formField.deleteMany({ where: { formId } });

    await prisma.formField.createMany({
      data: fields.map((f, i) => ({
        formId,
        label: f.label,
        name: f.name,
        type: f.type,
        required: f.required,
        placeholder: f.placeholder,
        order: i,
      })),
    });

    // 🔃 Mise à jour du bloc avec contenu JSON
    const updatedBlock = await prisma.block.update({
      where: { id: parseInt(blockId) },
      data: {
        content: JSON.stringify({
          formId,
          title,
          submitLabel,
          successMessage,
          emailTo,
          storeInDatabase,
          fields, // non utilisé par Prisma mais utile pour frontend
        }),
      },
    });

    res.json(updatedBlock);
  } catch (err) {
    console.error("❌ Erreur lors de la mise à jour du bloc formulaire :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

  
  
  export default router;