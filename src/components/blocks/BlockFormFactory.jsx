import TextBlockForm from "./TextBlockForm";
import ImageBlockForm from "./ImageBlockForm";
import ButtonBlockForm from "./ButtonBlockForm";

export default function BlockFormFactory({ type, content, onChange }) {
  const props = { content, onChange };

  const components = {
    text: <TextBlockForm {...props} />,
    image: <ImageBlockForm {...props} />,
    button: <ButtonBlockForm {...props} />,
  };

  return components[type] || <p>🛑 Type de bloc inconnu : {type}</p>;
}
