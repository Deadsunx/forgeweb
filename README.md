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

## Tests

Le serveur de développement doit tourner, puis :

```bash
node test/audit.mjs
```

```bash
node test/a11y.mjs
```

Les captures d'écran sont écrites dans `test/shots/` (non versionné).

## Contact

forgeweb.ml@gmail.com
