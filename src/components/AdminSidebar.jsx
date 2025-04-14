import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { Menu, X, Home, Settings, FileText, LogOut, Eye } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth(); // 🔐 Utilise le AuthContext
  const [isExpanded, setIsExpanded] = useState(true);

  const handleLogout = async () => {
    await logout(); // ✅ Appelle la méthode de déconnexion centralisée
    navigate("/login");
  };

  const getNavLinkClass = (path) =>
    location.pathname === path
      ? "nav-link text-white fw-bold bg-primary disabled"
      : "nav-link text-white";

  return (
    <div
      className={`d-flex flex-column vh-100 bg-dark text-white p-3 ${
        isExpanded ? "sidebar-expanded" : "sidebar-collapsed"
      }`}
      style={{
        width: isExpanded ? "250px" : "80px",
        position: "fixed",
        left: 0,
        top: 0,
        transition: "width 0.3s",
      }}
    >
      <button
        className="btn btn-outline-light mb-3"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? <X size={20} /> : <Menu size={20} />}
      </button>
      <h3 className={`mb-4 ${isExpanded ? "" : "d-none"}`}>Admin Panel</h3>
      <ul className="nav flex-column">
        <li className="nav-item mb-2">
          <Link className={getNavLinkClass("/admin")} to="/admin">
            <Home
              size={20}
              className={isExpanded ? "me-2" : "d-block mx-auto"}
            />{" "}
            {isExpanded && "Dashboard"}
          </Link>
        </li>
        <li className="nav-item mb-2">
          <Link className={getNavLinkClass("/admin/uploads")} to="/admin/uploads">
            <FileText
              size={20}
              className={isExpanded ? "me-2" : "d-block mx-auto"}
            />{" "}
            {isExpanded && "Gérer les fichiers"}
          </Link>
        </li>
        <li className="nav-item mb-2">
          <Link className={getNavLinkClass("/admin/settings")} to="/admin/settings">
            <Settings
              size={20}
              className={isExpanded ? "me-2" : "d-block mx-auto"}
            />{" "}
            {isExpanded && "Paramètres"}
          </Link>
        </li>
        <li className="nav-item mb-2">
          <Link className={getNavLinkClass("/admin/pages")} to="/admin/pages">
            <FileText
              size={20}
              className={isExpanded ? "me-2" : "d-block mx-auto"}
            />{" "}
            {isExpanded && "Gérer les pages"}
          </Link>
        </li>
        <li className="nav-item mb-2">
          <Link className={getNavLinkClass("/admin/blocks")} to="/admin/blocks">
            <FileText
              size={20}
              className={isExpanded ? "me-2" : "d-block mx-auto"}
            />{" "}
            {isExpanded && "Gérer les blocks"}
          </Link>
        </li>
        <li className="nav-item mb-2">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-link text-white"
          >
            <Eye
              size={20}
              className={isExpanded ? "me-2" : "d-block mx-auto"}
            />
            {isExpanded && "Voir le site"}
          </a>
        </li>
      </ul>

      <div className="mt-auto">
        <p className={`text-white-50 ${isExpanded ? "" : "d-none"}`}>
          Connecté à l’espace admin
        </p>
        <button className="btn btn-danger w-100 mt-3" onClick={handleLogout}>
          <LogOut
            size={20}
            className={isExpanded ? "me-2" : "d-block mx-auto"}
          />{" "}
          {isExpanded && "Déconnexion"}
        </button>
      </div>
    </div>
  );
}
