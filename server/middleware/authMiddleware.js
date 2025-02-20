import jwt from "jsonwebtoken"

export const verifyToken = (req, res, next) => {
  const token = req.header("Authorization")
  if (!token) return res.status(403).json({ message: "Accès refusé." })

  try {
    const verified = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET)
    req.user = verified
    next()
  } catch (error) {
    res.status(401).json({ message: "Token invalide." })
  }
}

export const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Accès réservé aux administrateurs." })
  next()
}
