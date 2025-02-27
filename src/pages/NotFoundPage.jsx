import { Link } from "react-router-dom"

export default function NotFoundPage() {
  return (
    <div className="container mt-5 text-center">
      <h1>404 - Page non trouvée</h1>
      <p>Oups, la page que vous recherchez n'existe pas.</p>
      <Link to="/" className="btn btn-primary">Retour à l'accueil</Link>
    </div>
  )
}
