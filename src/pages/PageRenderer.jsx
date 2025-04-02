import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"

export default function PageRenderer({ pageId }) {
  const [blocks, setBlocks] = useState([])
  const { slug } = useParams()
  console.log("🧾 pageId reçu :", pageId)

  useEffect(() => {
    console.log("📡 Appel API sur pageId :", pageId)

    fetch(`http://localhost:5000/api/pages/${pageId}`)
      .then(res => res.json())
      .then(data => {
        setBlocks(data.blocks)
        console.log("🧱 Blocs récupérés :", data.blocks) // Ajoute ça
      })
      .catch(err => console.error("Erreur lors du chargement des blocs :", err))
  }, [pageId])

  const renderBlock = (block) => {
    if (block.type === "text") {
      return (
        <div
          className="mb-3"
          dangerouslySetInnerHTML={{ __html: block.content }}
        />
      )
    }
  
    if (block.type === "image") {
      return <img src={block.content} alt="Illustration" className="img-fluid" />
    }
  
    return <p>{block.content}</p>
  }
  

  return (
    <div className="container mt-5">
      {blocks.map((block) => (
        <div key={block.id}>{renderBlock(block)}</div>
      ))}
    </div>
  )
  
}
