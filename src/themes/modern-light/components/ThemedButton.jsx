// src/themes/modern-light/components/ThemedButton.jsx
import React from "react";

export default function ThemedButton({ children, onClick }) {
  return (
    <button
      className="btn btn-primary"
      style={{ backgroundColor: "var(--primary-color)" }}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
