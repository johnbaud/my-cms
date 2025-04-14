import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import { Home, Settings, FileText, LogOut } from "lucide-react";
import { authFetch } from "../utils/authFetch";
import { useAuth } from "../context/AuthContext";

export default function Admin() {
  const { accessToken } = useAuth();
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const res = await authFetch("/admin", {}, accessToken);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setMessage(data.message);
      } catch (err) {
        setMessage("❌ Impossible de récupérer les infos du serveur.");
      }
    };

    fetchAdminData();
  }, [accessToken]);

  const handleLogout = async () => {
    await fetch("http://localhost:5000/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    navigate("/login");
  };

  return (
    <div className="d-flex">
      <AdminSidebar />
      <div className="container mt-5" style={{ marginLeft: "260px" }}>
        <h1>{message}</h1>

        <nav className="mt-4">
          <ul className="list-unstyled">
            <li>
              <Link to="/admin/settings" className="btn btn-primary">
                <Settings size={20} className="me-2" /> Gérer les paramètres
              </Link>
            </li>
            <li className="mt-2">
              <Link to="/admin/uploads" className="btn btn-success">
                <FileText size={20} className="me-2" /> Gérer les fichiers
              </Link>
            </li>
            <li className="mt-2">
              <Link to="/admin/pages" className="btn btn-success">
                <FileText size={20} className="me-2" /> Gérer les pages
              </Link>
            </li>
            <li className="mt-2">
              <Link to="/admin/blocks" className="btn btn-success">
                <FileText size={20} className="me-2" /> Gérer les blocks
              </Link>
            </li>
          </ul>
        </nav>

        <button className="btn btn-danger mt-3" onClick={handleLogout}>
          <LogOut size={20} className="me-2" /> Déconnexion
        </button>
      </div>
    </div>
  );
}
