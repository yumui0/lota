# League of the Ancients

Site statique (HTML/CSS/JS) de classement de joueurs par algorithme des K plus proches voisins (k=7), port de l'application Flask d'origine. Aucun serveur requis : ouvrir `index.html` ou publier sur GitHub Pages.

- `index.html` accueil · `formulaire.html` → `resultat.html` analyse d'un joueur
- `upload.html` → `resultats.html` import CSV (`pseudo;frags;death;powerup;covdist`) ou 500 joueurs aléatoires, export CSV
- `js/kppv.js` algorithme · `js/data.js` données d'entraînement (issues de `data/LOTAstats.csv`)

Mini Projet NSI – Sabrine EL
