import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast"; // <-- ajoute cette ligne
import { AuthProvider } from "./context/AuthContext.jsx";
import "./index.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { HelmetProvider } from "react-helmet-async";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <HelmetProvider>
          <Toaster position="top-center" />
          <App />
        </HelmetProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
