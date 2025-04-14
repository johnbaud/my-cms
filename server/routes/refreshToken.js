// routes/refreshToken.js
import express from "express"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
dotenv.config()

const router = express.Router()

router.post("/", (req, res) => {
  const refreshToken = req.cookies.refreshToken
  if (!refreshToken) return res.status(401).json({ message: "Aucun refresh token." })

  try {
    const userData = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)

    const newAccessToken = jwt.sign(
      {
        id: userData.id,
        email: userData.email,
        role: userData.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "15m" } // ou "1h" selon ton choix
    )

    res.json({ accessToken: newAccessToken })
  } catch (err) {
    return res.status(403).json({ message: "Refresh token invalide." })
  }
})

export default router
