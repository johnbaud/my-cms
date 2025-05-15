import React, { useState, useRef } from "react";
import { X } from "lucide-react";

/**
 * TagsInput
 * Props:
 * - value: array of strings (current tags)
 * - onChange: function(updatedTags: string[]) => void
 * - placeholder: string
 */
export default function TagsInput({ value = [], onChange, placeholder = "Ajouter un mot-clé" }) {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef(null);

  // Add a tag if valid
  const addTag = (tag) => {
    const trimmed = tag.trim();
    if (!trimmed) return;
    if (value.includes(trimmed)) return;
    onChange([...value, trimmed]);
  };

  // Remove a tag by index
  const removeTag = (index) => {
    const newTags = value.filter((_, i) => i !== index);
    onChange(newTags);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(inputValue);
      setInputValue("");
    } else if (e.key === "Backspace" && !inputValue) {
      // remove last tag
      removeTag(value.length - 1);
    }
  };

  const handleBlur = () => {
    addTag(inputValue);
    setInputValue("");
  };

  return (
    <div
      className="d-flex flex-wrap align-items-center border rounded p-2"
      onClick={() => inputRef.current && inputRef.current.focus()}
      style={{ gap: '0.5rem' }}
    >
      {value.map((tag, idx) => (
        <span key={idx} className="badge bg-secondary d-flex align-items-center">
          {tag}
          <X
            size={12}
            className="ms-1"
            style={{ cursor: "pointer" }}
            onClick={() => removeTag(idx)}
          />
        </span>
      ))}
      <input
        ref={inputRef}
        type="text"
        className="form-control border-0 m-0 p-0"
        style={{ flex: '1 0 120px', minWidth: '120px', boxShadow: 'none' }}
        placeholder={placeholder}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
      />
    </div>
  );
}
