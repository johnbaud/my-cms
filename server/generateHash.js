import bcrypt from "bcrypt";

const passwordToHash = "mpdtest1"; // Remplace par ton vrai mot de passe

bcrypt.hash(passwordToHash, 10, (err, hash) => {
  if (err) {
    console.error("Erreur lors du hashage :", err);
    return;
  }
  console.log("Mot de passe hashé :", hash);
});
