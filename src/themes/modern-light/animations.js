// src/themes/modern-light/animations.js
document.addEventListener("DOMContentLoaded", () => {
  console.log("Animations Modern Light chargées");
  // Exemple : petit effet sur tous les boutons
  document.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("mouseenter", () => {
      btn.style.transform = "scale(1.03)";
    });
    btn.addEventListener("mouseleave", () => {
      btn.style.transform = "scale(1)";
    });
  });
});
