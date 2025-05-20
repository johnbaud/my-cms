import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { Helmet } from "react-helmet-async";
import FormBlock from "../components/blocks/FormBlock";

function extractSnippetFromBlocks(blocks) {
  const allText = blocks
    .filter(b => b.type === "text")
    .map(b => {
      const html = typeof b.content === "object"
        ? JSON.stringify(b.content)
        : b.content
      return html
    })
    .join(" ")
  const plain = allText.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
  const cut = plain.slice(0, 157).trim()
  return cut + (plain.length > 157 ? " …" : "")
}

export default function PageRenderer({ pageId }) {
  const [blocks, setBlocks] = useState([])
  const [pageMeta, setPageMeta] = useState(null) 
  const [settings, setSettings] = useState(null)  
  const { slug } = useParams()



  useEffect(() => {

    fetch(`http://localhost:5000/api/pages/${pageId}`)
      .then(res => res.json())
      .then(data => {
        setBlocks(data.blocks)
        setPageMeta({
          title:           data.metaTitle,
          description:     data.metaDescription,
          keywords:        data.metaKeywords,
          image:           data.metaImage,
          robots:          data.metaRobots
        })        
      })
      .catch(err => console.error("Erreur lors du chargement des blocs :", err))

     fetch("http://localhost:5000/api/settings/public")
      .then(res => res.json())
      .then(data => setSettings(data))
      .catch(err => console.error("Erreur lors du chargement des settings :", err))     

  }, [pageId])

    // Tant que tout n’est pas chargé, on affiche un loader
  if (!pageMeta || !settings) return <p>Chargement…</p>

    // ─── PRÉPARATION DES VALEURS SEO ────────────────────────────────────────────
  const baseTitle   = pageMeta.title       || slug       || ""
  const titleSuffix = settings.defaultTitleSuffix || ""
  const title       = titleSuffix ? `${baseTitle}${titleSuffix}` : baseTitle
  const description = (pageMeta.description && pageMeta.description.trim()) || extractSnippetFromBlocks(blocks) || ""
  const keywords    = pageMeta.keywords        || settings.defaultMetaKeywords    || ""
  const robots      = pageMeta.robots          || settings.defaultRobots           || "index,follow"
  let ogImage = pageMeta.image || ""
  if (!ogImage) {
    // cherche premier bloc image si pas de metaImage
    const firstImageBlock = blocks.find(b => b.type === "image")
    if (firstImageBlock) {
      ogImage = firstImageBlock.content
    }
  }
  if (!ogImage) {
    ogImage = settings.defaultMetaImage || ""
  }


    // ─── FONCTION DE RENDER DES BLOCS ──────────────────
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
    if (block.type === "form") {
      try {
        const parsedContent = typeof block.content === "string"
          ? JSON.parse(block.content)
          : block.content;
        return <FormBlock content={parsedContent} />;
      } catch (e) {
        return <p>⚠️ Erreur de lecture du formulaire</p>;
      }
    }
       
    return <p>{block.content}</p>
  }

  // ─── RENDU FINAL ─────────────────────────────────────────────────────────────
  return (
    <>
      {/* ─── SEO ───────────────────────────────────────────────────────────────*/}
      <Helmet>
        <title>{title}</title>
        {description && <meta name="description" content={description} />}
        {keywords    && <meta name="keywords"    content={keywords} />}
        <meta name="robots" content={robots} />

        {/* Open Graph */}
        <meta property="og:title"     content={title} />
        {description && <meta property="og:description" content={description} />}
        <meta property="og:type"      content="website" />
        <meta property="og:url"       content={window.location.href} />
        {ogImage     && <meta property="og:image" content={ogImage} />}
        <meta property="og:site_name" content={settings.siteName} />

        {/* Twitter Card */}
        <meta name="twitter:card"        content="summary_large_image" />
        <meta name="twitter:title"       content={title} />
        {description && <meta name="twitter:description" content={description} />}
        {ogImage     && <meta name="twitter:image"       content={ogImage} />}
      </Helmet>

      {/* ─── CONTENU (ta logique de rendu des blocs) ───────────────────────────*/}
      <div className="container mt-5">
        {blocks.map(block => (
          <div key={block.id}>{renderBlock(block)}</div>
        ))}
      </div>
    </>
  )
}
