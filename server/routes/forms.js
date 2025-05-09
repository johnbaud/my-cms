import dotenv from "dotenv";
dotenv.config();
import express from "express";
import prisma from "../prismaClient.js";
import nodemailer from "nodemailer";
const router = express.Router();
const isProd = process.env.NODE_ENV === "production";  
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";

// 🔹 1) Récupérer toutes les soumissions (paginated + filtrées)
router.get("/submissions", async (req, res) => {
  try {
    // 1️⃣ Récupérer et parser les query params
    const page     = parseInt(req.query.page)     || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const formId   = req.query.formId
      ? parseInt(req.query.formId)
      : null;

    // 2️⃣ Construire le filtre
    const where = {};
    if (formId) where.formId = formId;

    // 3️⃣ Compter le total pour calculer totalPages
    const totalCount = await prisma.formSubmission.count({ where });
    const totalPages = Math.ceil(totalCount / pageSize);

    // 4️⃣ Récupérer la page demandée
    const raw = await prisma.formSubmission.findMany({
      where,
      include: {
        form: { select: { id: true, title: true } }
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    // 5️⃣ Nettoyer les données
    const submissions = raw.map(sub => ({
      id: sub.id,
      createdAt: sub.createdAt,
      formId: sub.form?.id || null,
      formTitle: sub.form?.title || "Formulaire inconnu",
      data: sub.data,
      emailSent: sub.emailSent ?? false
    }));

    // 6️⃣ Répondre
    res.json({ submissions, totalPages });
  } catch (error) {
    console.error("❌ ERREUR RÉCUPÉRATION SUBMISSIONS :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
});


// 🔹 2) Export CSV des soumissions (optionnellement filtré par formId)
router.get("/submissions/export", async (req, res) => {
  try {
    const formId = req.query.formId
      ? parseInt(req.query.formId)
      : null;
    const where = {};
    if (formId) where.formId = formId;

    const subs = await prisma.formSubmission.findMany({
      where,
      include: { form: { select: { title: true } } },
      orderBy: { createdAt: "desc" },
    });

    // Colonnes CSV
    const header = ["id", "createdAt", "formTitle", "data"].join(",");

    // Génère chaque ligne
    const rows = subs.map(s => {
      const jsonData = JSON.stringify(s.data).replace(/"/g, '""');
      return [
        s.id,
        s.createdAt.toISOString(),
        `"${s.form?.title || ""}"`,
        `"${jsonData}"`,
      ].join(",");
    });

    const csv = [header, ...rows].join("\r\n");

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="submissions.csv"`);
    res.send(csv);
  } catch (err) {
    console.error("❌ ERREUR EXPORT CSV :", err);
    res.status(500).json({ message: "Erreur serveur." });
  }
});

// 🔹 2) Créer une soumission pour un formulaire donné
router.post("/submit/:formId", async (req, res) => {
  const { formId } = req.params;
  const { data } = req.body;
  try {
    const form = await prisma.form.findUnique({
      where: { id: parseInt(formId) },
      include: { fields: true }
    });
    if (!form) {
      return res.status(404).json({ message: "Formulaire introuvable." });
    }

    // 1️⃣ Enregistrer en base si configuré
    let submission = null;
    if (form.storeInDatabase) {
      submission = await prisma.formSubmission.create({
        data: { formId: form.id, data, emailSent: false }
      });
    }

    // 2️⃣ Charger la config SMTP
    const mailCfg = await prisma.mailSettings.findFirst();

    // 3️⃣ Déterminer le destinataire : priorité au bloc, sinon « fromAddress »
    const toAddress = form.emailTo || mailCfg?.fromAddress;
    let emailSent = false;

    if (mailCfg && toAddress) {
      // 4️⃣ Créer un transporter Nodemailer
      const transporter = nodemailer.createTransport({
        host: mailCfg.host,
        port: mailCfg.port,
        secure: mailCfg.port === 465,
        auth: { user: mailCfg.user, pass: mailCfg.pass },
        ...( !isProd && { tls: { rejectUnauthorized: false } } )
      });

      // 5️⃣ Construire le corps du mail
      const lines = form.fields.map(f =>
        `<p><strong>${f.label}:</strong> ${data[f.name] || "[vide]"}</p>`
      ).join("");

      // 6️⃣ Envoyer le mail
      await transporter.sendMail({
        from: mailCfg.fromAddress,
        to: toAddress,
        subject: `Nouvelle soumission: ${form.title}`,
        html: `<h2>${form.title}</h2>${lines}<p>Reçu le ${new Date().toLocaleString()}</p>`
      });

      emailSent = true;
    }

    // 7️⃣ Mettre à jour le flag emailSent si on a bien une soumission en base
    if (submission) {
      await prisma.formSubmission.update({
        where: { id: submission.id },
        data: { emailSent }
      });
    }

    res.status(200).json({
      submissionId: submission?.id ?? null,
      emailSent,
      message: `Soumission enregistrée${emailSent ? " et e-mail envoyé." : "."}`
    });
  } catch (error) {
    console.error("❌ Erreur lors de la soumission du formulaire :", error);
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
});

// 🔹 3) Récupérer un formulaire par son ID
router.get("/:formId", async (req, res) => {
  const { formId } = req.params;
  try {
    const form = await prisma.form.findUnique({
      where: { id: parseInt(formId) },
      include: { fields: true }
    });
    if (!form) {
      return res.status(404).json({ message: "Formulaire introuvable." });
    }
    res.json(form);
  } catch (error) {
    console.error("❌ Erreur récupération formulaire :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
});

// 🔹 4) Récupérer tous les formulaires (avec leurs champs)
router.get("/", async (req, res) => {
  try {
    const forms = await prisma.form.findMany({
      include: { fields: true }
    });
    res.json(forms);
  } catch (error) {
    console.error("❌ Erreur récupération formulaires :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
});

// 🔹 Supprimer une soumission par son ID
router.delete(
  "/submissions/:submissionId",
  verifyToken,
  isAdmin,
  async (req, res) => {
    const { submissionId } = req.params;
    try {
      await prisma.formSubmission.delete({
        where: { id: parseInt(submissionId) },
      });
      res.json({ message: "Soumission supprimée avec succès." });
    } catch (error) {
      console.error("❌ Erreur lors de la suppression de la soumission :", error);
      res.status(500).json({ message: "Erreur serveur." });
    }
  }
);
export default router;
