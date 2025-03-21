import express from "express"
import prisma from "../prismaClient.js"
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js"

const router = express.Router()

// 🔹 Récupérer les liens de navigation (Navbar ou Footer)
router.get("/:location", async (req, res) => {
  try {
    const links = await prisma.navigationLink.findMany({
      where: { location: req.params.location, parentId: null },
      include: {
        children: {
          orderBy: { position: "asc" },
          include: { page: { select: { slug: true } } } // ✅ Ajoute le slug aux sous-liens
        },
        page: { select: { slug: true } } // ✅ Ajoute le slug aux liens principaux
      },
      orderBy: { position: "asc" }
    })
    res.json(links)
  } catch (error) {
    console.error("❌ Erreur récupération des liens :", error)
    res.status(500).json({ message: "Erreur serveur." })
  }
})

// 🔹 Ajouter un lien
router.post("/", verifyToken, isAdmin, async (req, res) => {
  let { label, type, url, pageId, parentId, position, location } = req.body;

  console.log("📩 Données reçues :", req.body);

  try {
      pageId = pageId ? parseInt(pageId, 10) : null;
      parentId = parentId ? parseInt(parentId, 10) : null;

      if (position === undefined) {
          const lastLink = await prisma.navigationLink.findFirst({
              where: { location, parentId }, // Ne compte que les liens principaux
              orderBy: { position: "desc" }
          });
          position = lastLink ? lastLink.position + 1 : 0;
      }

      const newLink = await prisma.navigationLink.create({
          data: { label, type, url, pageId, parentId, position, location }
      });

      res.json(newLink);
  } catch (error) {
      console.error("❌ Erreur ajout du lien :", error);
      res.status(500).json({ message: "Erreur serveur.", details: error.message });
  }
});

  

// 🔹 Supprimer un lien
router.delete("/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    await prisma.navigationLink.delete({
      where: { id: parseInt(req.params.id) }
    })
    res.json({ message: "Lien supprimé avec succès" })
  } catch (error) {
    console.error("❌ Erreur suppression du lien :", error)
    res.status(500).json({ message: "Erreur serveur." })
  }
})

// 🔹 Mettre à jour un lien de navigation
router.post("/update", verifyToken, isAdmin, async (req, res) => {
  const { id, label, type, url, pageId, parentId } = req.body;

  try {
    const updatedLink = await prisma.navigationLink.update({
      where: { id: parseInt(id) },
      data: {
        label,
        type,
        url,
        pageId: pageId ? parseInt(pageId, 10) : null,
        parentId: parentId ? parseInt(parentId, 10) : null
      }
    });

    res.json(updatedLink);
  } catch (error) {
    console.error("❌ Erreur mise à jour du lien :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
});

// 🔹 Mettre à jour l’ordre des liens
router.post("/updateOrder", verifyToken, isAdmin, async (req, res) => {
    const { links } = req.body;
    try {
      for (let link of links) {
        await prisma.navigationLink.update({
          where: { id: link.id },
          data: { position: link.position, parentId: link.parentId || null }
        });
      }
      res.json({ message: "Ordre des liens mis à jour" });
    } catch (error) {
      console.error("❌ Erreur mise à jour des positions :", error);
      res.status(500).json({ message: "Erreur serveur." });
    }
  });
  
export default router
