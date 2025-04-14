import { useEffect, useState, useRef } from "react";
import { useDrag, useDrop, DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { GripVertical, Edit, Trash2 } from "lucide-react";
import { authFetch } from "../utils/authFetch"


export default function NavigationLinksManager({ location, onUpdate }) {
  const [links, setLinks] = useState([]);
  const [pages, setPages] = useState([]);
  const [newLink, setNewLink] = useState({ label: "", type: "internal", url: "", pageId: "", parentId: "" });
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const linksRes = await authFetch(`/navigation/${location}`);
        const linksData = await linksRes.json();
        // Fonction pour extraire tous les liens (y compris enfants) en une seule liste
        const flattenLinks = (links) => {
          let allLinks = [];

          links.forEach(link => {
            allLinks.push(link); // Ajoute le lien principal
            if (link.children && link.children.length > 0) {
              allLinks = [...allLinks, ...link.children]; // Ajoute ses enfants à la liste
            }
          });

          return allLinks;
        };

        // Met à jour la liste des liens avec une structure aplatie
        setLinks(flattenLinks(linksData));

        const pagesRes = await fetch("http://localhost:5000/api/pages/public");
        const pagesData = await pagesRes.json();
        setPages(pagesData);
      } catch (error) {
        console.error(`❌ Erreur chargement liens/pages ${location} :`, error);
      }
    };
    fetchData();
  }, [location]);

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  };

  // 🔹 Ajouter un lien
  const handleAddLink = async () => {
     const response = await authFetch("/navigation", {
         method: "POST",
         body: JSON.stringify({ ...newLink, location, position: links.length, parentId: newLink.parentId || null })
      });
    

    if (response.ok) {
      const addedLink = await response.json();
      setLinks([...links, addedLink]);
      setNewLink({ label: "", type: "internal", url: "", pageId: "", parentId: "" });
      showMessage("✅ Lien ajouté avec succès !");
    } else {
      showMessage("❌ Erreur lors de l'ajout du lien.");
    }
  };

  // 🔹 Supprimer un lien
  const handleDeleteLink = async (id) => {
    const response = await authFetch(`/navigation/${id}`, {
      method: "DELETE",
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
    const updatedLinks = links.map((link, index) => ({
      id: link.id,
      position: index,
      parentId: link.parentId || null
    }));

    const response = await authFetch("/navigation/updateOrder", {
      method: "POST",
      body: JSON.stringify({ links: updatedLinks })
    });

    if (response.ok) {
      showMessage("📌 Ordre des liens mis à jour !");
    } else {
      showMessage("❌ Erreur lors de la mise à jour de l'ordre.");
    }
  };

  const renderLinks = (links, parentId = null, level = 0) => {
    return links
      .filter(link => link.parentId === parentId) // On récupère les liens du bon niveau
      .map((link, index) => (
        <div key={link.id} style={{ marginLeft: `${level * 20}px`, borderLeft: level > 0 ? "2px solid #ccc" : "none", paddingLeft: "10px" }}>
          <DraggableLink 
            key={link.id} 
            link={link} 
            index={index} 
            moveLink={moveLink} 
            onDelete={handleDeleteLink} 
            pages={pages} links={links} 
            setLinks={setLinks} 
            onUpdate={onUpdate}
          />
          {renderLinks(links, link.id, level + 1)} {/* 🔁 Récursion pour afficher les sous-liens */}
        </div>
      ));
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="mt-3">
        <h5>Gestion des liens de {location === "navbar" ? "la Navbar" : "le Footer"}</h5>

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

        {/* Sélection du lien parent */}
        <div className="mb-3">
          <label>Lien Parent (optionnel)</label>
          <select className="form-select" value={newLink.parentId} onChange={(e) => setNewLink({ ...newLink, parentId: e.target.value })}>
            <option value="">Aucun (Lien principal)</option>
            {links.map(link => (
              <option key={link.id} value={link.id}>{link.label}</option>
            ))}
          </select>
        </div>

        <button className="btn btn-primary" onClick={handleAddLink}>Ajouter</button>

        {/* Liste des liens avec Drag & Drop */}
        <ul className="mt-4 list-group">
          {renderLinks(links)}
        </ul>

        <button className="btn btn-success mt-3" onClick={saveNewOrder}>Enregistrer l'ordre</button>
      </div>
    </DndProvider>
  );
}

// 🔹 Composant pour chaque lien (Drag & Drop)
function DraggableLink({ link, index, moveLink, onDelete, pages, links, setLinks, onUpdate }) {
  const ref = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedLink, setEditedLink] = useState({ ...link });

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

  // 🔹 Fonction pour enregistrer les modifications
  const handleSaveEdit = async () => {
    const response = await authFetch("/navigation/update", {
      method: "POST",
      body: JSON.stringify(editedLink)
    });

    if (response.ok) {
      const updatedLink = await response.json();

      // 🔹 Met à jour l'état `links` pour éviter le reload
      setLinks((prevLinks) => 
        prevLinks.map((l) => (l.id === updatedLink.id ? updatedLink : l))
      );
      setIsEditing(false);
      if (onUpdate) onUpdate();
    } else {
      console.error("❌ Erreur lors de la mise à jour du lien.");
    }
  };

  return (
    <li ref={ref} className="list-group-item d-flex align-items-center" style={{ opacity: isDragging ? 0.5 : 1 }}>
      <GripVertical size={20} className="me-2" style={{ cursor: "grab" }} />

      {isEditing ? (
        <>
          <input
            type="text"
            className="form-control form-control-sm"
            value={editedLink.label}
            onChange={(e) => setEditedLink({ ...editedLink, label: e.target.value })}
          />

          <select
            className="form-select form-select-sm ms-2"
            value={editedLink.type}
            onChange={(e) => setEditedLink({ ...editedLink, type: e.target.value })}
          >
            <option value="internal">Lien Interne</option>
            <option value="external">Lien Externe</option>
            <option value="dropdown">Rubrique (Dropdown)</option>
          </select>

          {editedLink.type === "external" && (
            <input
              type="text"
              className="form-control form-control-sm ms-2"
              value={editedLink.url || ""}
              onChange={(e) => setEditedLink({ ...editedLink, url: e.target.value })}
            />
          )}

          {editedLink.type === "internal" && (
            <select
              className="form-select form-select-sm ms-2"
              value={editedLink.pageId || ""}
              onChange={(e) => setEditedLink({ ...editedLink, pageId: e.target.value })}
            >
              <option value="">Sélectionner une page</option>
              {pages.map((page) => (
                <option key={page.id} value={page.id}>{page.title}</option>
              ))}
            </select>
          )}

          <select
            className="form-select form-select-sm ms-2"
            value={editedLink.parentId || ""}
            onChange={(e) => setEditedLink({ ...editedLink, parentId: e.target.value })}
          >
            <option value="">Aucun (Lien principal)</option>
            {links
              .filter((l) => l.id !== editedLink.id) // 🔹 Empêche de s'auto-sélectionner comme parent
              .map((l) => (
                <option key={l.id} value={l.id}>{l.label}</option>
              ))}
          </select>

          <button className="btn btn-success btn-sm ms-2" onClick={handleSaveEdit}>✅</button>
          <button className="btn btn-secondary btn-sm ms-2" onClick={() => setIsEditing(false)}>❌</button>
        </>
      ) : (
        <>
          {link.label} - {link.type}
          <button className="btn btn-warning btn-sm ms-auto" onClick={() => setIsEditing(true)} title="Modifier">
            <Edit size={16}/>
          </button>
          <button className="btn btn-danger btn-sm ms-2" onClick={() => onDelete(link.id)} title="Supprimer">
            <Trash2 size={16}/>
          </button>
        </>
      )}
    </li>
  );
}

