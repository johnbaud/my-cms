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
        console.log("🧱 Blocs récupérés :", data.blocks)
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
      return (
        <div className="my-3 text-center">
          <img src={block.content} alt="Illustration" style={{ maxWidth: "100%", maxHeight: "400px", objectFit: "contain" }} />
        </div>
      )
    }

    if (block.type === "button") {
      try {
        const { label, url, type, style, styles = {} } = JSON.parse(block.content);

        const finalUrl = type === "external" && url && !/^https?:\/\//.test(url)
          ? `https://${url}`
          : url;

        const baseStyle = {
          color: styles.textColor,
          fontSize: styles.fontSize,
          borderRadius: styles.borderRadius + "px",
          transition: "all 0.2s ease"
        };

        if (style === "commun") {
          Object.assign(baseStyle, {
            backgroundColor: styles.backgroundColor,
            border: "none",
          });
        } else if (style === "border") {
          Object.assign(baseStyle, {
            backgroundColor: "transparent",
            border: `1px solid ${styles.borderColor}`,
          });
        } else if (style === "underline") {
          Object.assign(baseStyle, {
            backgroundColor: "transparent",
            border: "none",
            textDecoration: "underline"
          });
        }

        const linkProps = type === "external"
          ? { href: finalUrl, target: "_blank", rel: "noopener noreferrer" }
          : { href: finalUrl };

        return (
          <div className="my-3 text-center">
            <a
              {...linkProps}
              style={baseStyle}
              onMouseOver={(e) => { if (styles.hoverColor) e.currentTarget.style.color = styles.hoverColor; }}
              onMouseOut={(e) => { if (styles.hoverColor) e.currentTarget.style.color = styles.textColor; }}
              className="btn"
            >
              {label}
            </a>
          </div>
        );
      } catch (e) {
        return <p>⚠️ Erreur de rendu du bouton</p>;
      }
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
