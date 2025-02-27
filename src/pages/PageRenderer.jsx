import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"

export default function PageRenderer({ pageId }) {
  const [blocks, setBlocks] = useState([])
  const { slug } = useParams()

  useEffect(() => {
    fetch(`http://localhost:5000/api/pages/${pageId}`)
      .then(res => res.json())
      .then(data => setBlocks(data.blocks))
      .catch(err => console.error("Erreur lors du chargement des blocs :", err))
  }, [pageId])

  return (
    <div className="container-fluid mt-5"> {/* 🔹 Remplacé container par container-fluid */}
      <h1>{slug}</h1>
      {blocks.map((block) => (
        <div key={block.id} className="mb-3">
          {block.type === "text" && <p>{block.content}</p>}
          {block.type === "image" && <img src={block.content} alt="Illustration" className="img-fluid" />}
        </div>
      ))}
    </div>
  )
}
