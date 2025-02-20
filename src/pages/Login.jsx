import { useState } from "react"
import { useNavigate } from "react-router-dom"

export default function Login() {
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    const email = e.target.email.value
    const password = e.target.password.value
  
    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      })
  
      const data = await response.json()
      if (!response.ok) return setError(data.message)
  
      localStorage.setItem("token", data.token)
      localStorage.setItem("role", data.role)
  
      navigate("/admin") // 🔹 Redirige vers l'admin
    } catch (error) {
      console.error("Erreur lors de la connexion :", error)
      setError("Une erreur est survenue. Vérifiez votre connexion.")
    }
  }
  

  return (
    <div className="container mt-5">
      <h2>Connexion</h2>
      {error && <p className="text-danger">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>Email</label>
          <input name="email" type="email" className="form-control" required />
        </div>
        <div className="mb-3">
          <label>Mot de passe</label>
          <input name="password" type="password" className="form-control" required />
        </div>
        <button type="submit" className="btn btn-primary">Se connecter</button>
      </form>
    </div>
  )
}
