// src/themes/modern-light/index.js
export default {
  id: "modern-light",
  name: "Moderne Clair",
  cssFile: "/themes/modern-light/theme.css", // Attention : SCSS devra être compilé
  variables: {
    "--primary-color": "#007bff",
    "--secondary-color": "#f8f9fa",
    "--font-family": "Montserrat, sans-serif"
  },
  scripts: ["/themes/modern-light/animations.js"],
  components: {
    Button: "ThemedButton"
  }
};
