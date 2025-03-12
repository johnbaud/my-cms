import { useEffect, useState, useRef } from "react";
import { useDrag, useDrop, DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { GripVertical } from "lucide-react";

export default function NavigationLinksManager({ location }) {
  const [links, setLinks] = useState([]);
  const [pages, setPages] = useState([]);
  const [newLink, setNewLink] = useState({ label: "", type: "internal", url: "", pageId: "", parentId: null });
  const [message, setMessage] = useState(""); // 🔹 État pour afficher les messages

  useEffect(() => {
    const fetchData = async () => {
      try {
        const linksRes = await fetch(`http://localhost:5000/api/navigation/${location}`);
        const linksData = await linksRes.json();
        setLinks(linksData);

        const pagesRes = await fetch("http://localhost:5000/api/pages/public");
        const pagesData = await pagesRes.json();
        setPages(pagesData);
      } catch (error) {
        console.error(`❌ Erreur chargement liens/pages ${location} :`, error);
      }
    };
    fetchData();
  }, [location]);

  // 🔹 Fonction pour afficher un message temporaire
  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  };

  // 🔹 Ajouter un lien
  const handleAddLink = async () => {
    const response = await fetch("http://localhost:5000/api/navigation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify({ ...newLink, location, position: links.length })
    });

    if (response.ok) {
      const addedLink = await response.json();
      setLinks([...links, addedLink]);
      setNewLink({ label: "", type: "internal", url: "", pageId: "", parentId: null });
      showMessage("✅ Lien ajouté avec succès !");
    } else {
      showMessage("❌ Erreur lors de l'ajout du lien.");
    }
  };

  // 🔹 Supprimer un lien
  const handleDeleteLink = async (id) => {
    const response = await fetch(`http://localhost:5000/api/navigation/${id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
    });

    if (response.ok) {
      setLinks(links.filter(link => link.id !== id));
      showMessage("🗑️ Lien supprimé avec succès !");
    } else {
      showMessage("❌ Erreur lors de la suppression.");
    }
  };

  // 🔹 Réorganiser les liens (Drag & Drop)
  const moveLink = (dragIndex, hoverIndex) => {
    const updatedLinks = [...links];
    const [movedItem] = updatedLinks.splice(dragIndex, 1);
    updatedLinks.splice(hoverIndex, 0, movedItem);
    setLinks(updatedLinks);
  };

  // 🔹 Enregistrer l’ordre des liens
  const saveNewOrder = async () => {
    const updatedLinks = links.map((link, index) => ({ id: link.id, position: index }));

    const response = await fetch("http://localhost:5000/api/navigation/updateOrder", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify({ links: updatedLinks })
    });

    if (response.ok) {
      showMessage("📌 Ordre des liens mis à jour !");
    } else {
      showMessage("❌ Erreur lors de la mise à jour de l'ordre.");
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="mt-3">
        <h5>Gestion des liens de {location === "navbar" ? "la Navbar" : "le Footer"}</h5>

        {/* 🔹 Affichage du message */}
        {message && <div className="alert alert-success">{message}</div>}

        {/* Formulaire d’ajout */}
        <div className="mb-3">
          <label>Nom du lien</label>
          <input type="text" className="form-control" value={newLink.label} onChange={(e) => setNewLink({ ...newLink, label: e.target.value })} />
        </div>

        <div className="mb-3">
          <label>Type de lien</label>
          <select className="form-select" value={newLink.type} onChange={(e) => setNewLink({ ...newLink, type: e.target.value })}>
            <option value="internal">Lien Interne</option>
            <option value="external">Lien Externe</option>
            <option value="dropdown">Rubrique (Dropdown)</option>
          </select>
        </div>

        {newLink.type === "external" && (
          <div className="mb-3">
            <label>URL Externe</label>
            <input type="text" className="form-control" value={newLink.url} onChange={(e) => setNewLink({ ...newLink, url: e.target.value })} />
          </div>
        )}

        {newLink.type === "internal" && (
          <div className="mb-3">
            <label>Page du site</label>
            <select className="form-select" value={newLink.pageId} onChange={(e) => setNewLink({ ...newLink, pageId: e.target.value })}>
              <option value="">Sélectionner une page</option>
              {pages.map(page => (
                <option key={page.id} value={page.id}>{page.title}</option>
              ))}
            </select>
          </div>
        )}

        <button className="btn btn-primary" onClick={handleAddLink}>Ajouter</button>

        {/* Liste des liens avec Drag & Drop */}
        <ul className="mt-4 list-group">
          {links.map((link, index) => (
            <DraggableLink key={link.id} link={link} index={index} moveLink={moveLink} onDelete={handleDeleteLink} />
          ))}
        </ul>

        <button className="btn btn-success mt-3" onClick={saveNewOrder}>Enregistrer l'ordre</button>
      </div>
    </DndProvider>
  );
}

// 🔹 Composant pour chaque lien (Drag & Drop)
function DraggableLink({ link, index, moveLink, onDelete }) {
  const ref = useRef(null);

  const [, drop] = useDrop({
    accept: "LINK",
    hover(item) {
      if (item.index !== index) {
        moveLink(item.index, index);
        item.index = index;
      }
    }
  });

  const [{ isDragging }, drag] = useDrag({
    type: "LINK",
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  });

  drag(drop(ref));

  return (
    <li ref={ref} className="list-group-item d-flex align-items-center" style={{ opacity: isDragging ? 0.5 : 1 }}>
      <GripVertical size={20} className="me-2" style={{ cursor: "grab" }} />
      {link.label} - {link.type}
      <button className="btn btn-danger btn-sm ms-auto" onClick={() => onDelete(link.id)}>Supprimer</button>
    </li>
  );
}
