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
| `api/contact.js` | Fonction serverless Vercel : validation et envoi du courriel |
| `test/audit.mjs` | Audit Playwright : débordement, cibles tactiles, interactions |
| `test/a11y.mjs` | Audit WCAG 2.1 AA : contraste, libellés, focus, reflow |
| `test/deadcode.mjs` | Détection d'imports, constantes et couleurs inutilisés |
| `test/form.mjs` | Formulaire côté navigateur : envoi, erreurs, honeypot, repli |
| `test/api.mjs` | Fonction serverless : validation, honeypot, fuites de secrets |

## Formulaire de contact

Le formulaire poste vers `/api/contact`, qui envoie le courriel via
[Resend](https://resend.com). La clé reste côté serveur et n'est jamais
envoyée au navigateur.

Variables d'environnement à définir dans Vercel
(*Settings → Environment Variables*) :

| Variable | Requise | Rôle |
| --- | --- | --- |
| `RESEND_API_KEY` | oui | Clé API Resend |
| `MAIL_TO` | non | Boîte qui reçoit les demandes (défaut : `forgeweb.ml@gmail.com`) |
| `MAIL_FROM` | non | Expéditeur vérifié (défaut : `onboarding@resend.dev`) |

Sans domaine vérifié chez Resend, l'envoi n'est possible que **depuis**
`onboarding@resend.dev` et **vers** l'adresse du compte Resend.

Si la fonction n'est pas disponible (`npm run dev`, ou déploiement statique),
le formulaire retombe automatiquement sur `mailto:` : le bouton n'est jamais
inopérant. Pour tester la vraie fonction en local :

```bash
npx vercel dev
```

Une seule constante reste à renseigner dans `src/ForgeWeb.jsx` :
`WHATSAPP_NUMBER`, au format international sans `+` ni espaces. Laissée vide,
le bouton WhatsApp n'est pas affiché.

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

`test/form.mjs` intercepte `/api/contact` et n'envoie jamais de courriel réel.
`test/api.mjs` teste la fonction serverless directement, sans navigateur ni
serveur :

```bash
node test/api.mjs
```

Les captures d'écran sont écrites dans `test/shots/` (non versionné).

## Contact

forgeweb.ml@gmail.com
