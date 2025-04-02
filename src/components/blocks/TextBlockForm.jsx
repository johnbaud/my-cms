import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

export default function TextBlockForm({ content, onChange }) {
  return (
    <div className="border rounded">
      <ReactQuill
        theme="snow"
        value={content}
        onChange={onChange}
        modules={{
          toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{'list': 'ordered'}, {'list': 'bullet'}],
            [{ 'align': [] }],
            ['link'],
            ['clean']
          ]
        }}
        formats={[
          'header',
          'bold', 'italic', 'underline', 'strike',
          'list', 'bullet',
          'align',
          'link'
        ]}
        placeholder="Écris ici..."
      />
    </div>
  );
}
