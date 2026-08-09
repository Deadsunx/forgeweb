# FORGEWEB

Site vitrine one-page pour FORGEWEB — studio de développement web full-stack.
Contenu en français, interface sombre type éditeur de code.

## Stack

- React 18 + Vite
- Tailwind CSS 3
- lucide-react (icônes)

## Démarrer

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Le build est généré dans `dist/`.

## Structure

Toute la page vit dans un seul composant autonome :

| Fichier | Rôle |
| --- | --- |
| `src/ForgeWeb.jsx` | La page complète (sections, état, styles) |
| `src/main.jsx` | Point d'entrée React |
| `src/index.css` | Directives Tailwind |
| `test/audit.mjs` | Audit Playwright : débordement, cibles tactiles, interactions |
| `test/a11y.mjs` | Audit WCAG 2.1 AA : contraste, libellés, focus, reflow |
| `test/deadcode.mjs` | Détection d'imports, constantes et couleurs inutilisés |
| `test/form.mjs` | Formulaire : envoi, rejet serveur, panne réseau, honeypot |

## Configuration avant mise en production

Deux constantes en haut de `src/ForgeWeb.jsx` doivent être renseignées :

| Constante | À faire |
| --- | --- |
| `WEB3FORMS_ACCESS_KEY` | Récupérer une clé gratuite sur [web3forms.com](https://web3forms.com) et la coller. Tant qu'elle n'est pas définie, le formulaire retombe sur `mailto:`. |
| `WHATSAPP_NUMBER` | Numéro au format international, chiffres uniquement (ex. `223XXXXXXXX`). Laissé vide, le bouton WhatsApp n'est pas affiché. |

## Tests

Le serveur de développement doit tourner, puis :

```bash
node test/audit.mjs
```

```bash
node test/a11y.mjs
```

`BASE_URL` permet de viser un autre port :

```bash
BASE_URL=http://localhost:5180/ node test/audit.mjs
```

`test/form.mjs` nécessite une clé Web3Forms configurée ; il intercepte
l'endpoint et n'envoie jamais de courriel réel.

Les captures d'écran sont écrites dans `test/shots/` (non versionné).

## Contact

forgeweb.ml@gmail.com
