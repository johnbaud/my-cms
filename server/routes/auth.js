import express from "express"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import prisma from "../prismaClient.js"

const router = express.Router()

// Inscription
router.post("/register", async (req, res) => {
  const { email, password, name } = req.body

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) return res.status(400).json({ message: "L'utilisateur existe déjà." })

    const hashedPassword = await bcrypt.hash(password, 10)
    const newUser = await prisma.user.create({
      data: { email, password: hashedPassword, name }
    })

    res.status(201).json({ message: "Utilisateur créé." })
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur." })
  }
})

// Connexion avec access token + refresh token
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ message: "Utilisateur non trouvé." });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ message: "Mot de passe incorrect." });

    // Access token = court (15min)
    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    // Refresh token = long (7j)
    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    // Envoi du refresh token dans un cookie HttpOnly
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 jours
    });

    // Access token renvoyé au client
    res.json({
      token: accessToken,
      role: user.role
    });
  } catch (error) {
    console.error("Erreur login :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
});
// 🔁 Rafraîchir le token
router.post("/refresh-token", async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) return res.status(401).json({ message: "Aucun refresh token trouvé." });

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé." });

    // Nouveau access token (valable 15 min par exemple)
    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.json({ accessToken }); // renvoi uniquement le nouveau access token
  } catch (err) {
    return res.status(403).json({ message: "Refresh token invalide." });
  }
});

// 🔒 Déconnexion
router.post("/logout", (req, res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // 🔒 true en prod, false en dev
    sameSite: "Strict",
    path: "/", // ✅ important pour que le bon cookie soit supprimé
  });
  res.status(200).json({ message: "Déconnecté." });
});


  

export default router
