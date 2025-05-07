import dotenv from "dotenv";
dotenv.config();
import express from "express";
import prisma from "../prismaClient.js";
import nodemailer from "nodemailer";
const router = express.Router();
const isProd = process.env.NODE_ENV === "production";  

// 🔹 1) Récupérer toutes les soumissions (du plus récent au plus vieux)
router.get("/submissions", async (req, res) => {
  try {
    const raw = await prisma.formSubmission.findMany({
      include: {
        form: { select: { id: true, title: true } }
      },
      orderBy: { createdAt: "desc" }
    });
    const cleaned = raw.map(sub => ({
      id: sub.id,
      createdAt: sub.createdAt,
      formId: sub.form?.id || null,
      formTitle: sub.form?.title || "Formulaire inconnu",
      data: sub.data,
      emailSent: sub.emailSent
    }));
    res.json(cleaned);
  } catch (error) {
    console.error("❌ ERREUR RÉCUPÉRATION SUBMISSIONS :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
});

// 🔹 Export CSV des soumissions (optionnellement filtré par formId)
router.get("/submissions/export", async (req, res) => {
  try {
    const { formId } = req.query;
    // Préparer le filtre si fourni
    const where = formId ? { formId: parseInt(formId) } : {};

    const subs = await prisma.formSubmission.findMany({
      where,
      include: { form: { select: { title: true } } },
      orderBy: { createdAt: "desc" },
    });

    // Colonnes CSV
    const header = ["id", "createdAt", "formTitle", "data"].join(",");

    // Génère chaque ligne
    const rows = subs.map(s => {
      // on échappe le JSON pour qu'il tienne dans une cellule
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
    if (form.storeInDatabase) {
      await prisma.formSubmission.create({
        data: { formId: form.id, data, emailSent: false }
      });
    }

    // 2️⃣ Charger la config SMTP
    const mailCfg = await prisma.mailSettings.findFirst();
    // on envoie si on a une adresse dans le bloc, sinon la valeur par défaut
    const toAddress = form.emailTo || mailCfg?.defaultRecipient
    if (mailCfg && toAddress) {
      // 3️⃣ Créer un transporter Nodemailer
      const transporter = nodemailer.createTransport({
        host: mailCfg.host,
        port: mailCfg.port,
        secure: mailCfg.port === 465,   // true pour 465, false pour 587
        auth: {
          user: mailCfg.user,
          pass: mailCfg.pass
        },
        ...( !isProd && { tls: { rejectUnauthorized: false } } )
      });

      // 4️⃣ Construire le corps du mail (en HTML ou texte)
      const lines = form.fields.map(f => 
        `<p><strong>${f.label}:</strong> ${data[f.name] || "[vide]"}</p>`
      ).join("");

      await transporter.sendMail({
        from: mailCfg.fromAddress,
        to: toAddress,
        subject: `Nouvelle soumission: ${form.title}`,
        html: `
          <h2>${form.title}</h2>
          ${lines}
          <p>Reçu le ${new Date().toLocaleString()}</p>
        `
      });

      // 5️⃣ Si succès, basculer emailSent à true
      await prisma.formSubmission.update({
        where: { id: submission.id },
        data: { emailSent: true }
      });
    }

    res.status(200).json({message: "Soumission enregistrée et e-mail envoyé (ou tenté)." });
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

export default router;
