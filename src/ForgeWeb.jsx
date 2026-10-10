import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import {
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  CalendarClock,
  Check,
  CheckCircle2,
  ChevronDown,
  Code2,
  Database,
  Gauge,
  Github,
  LayoutTemplate,
  LifeBuoy,
  Loader2,
  Mail,
  Menu,
  MessageCircle,
  Plane,
  Send,
  Share2,
  ShoppingBag,
  Sparkles,
  X,
} from "lucide-react";

/*
 * Palette — every colour on the page is one of these, written as a Tailwind
 * arbitrary value so the file drops into any Tailwind setup without config.
 *
 *   #0B0E14  page background        #F1EFE6  text
 *   #0E121B  alternating sections   #8791A6  muted text
 *   #121620  panels and cards       #7A85A0  dimmest text still AA (4.5:1+)
 *   #232A3A  hairline borders       #5D6579  decorative / large text only
 *   #39445C  hover borders          #E8A63E  gold accent
 *                                   #3FDDB0  mint accent
 */
const C = {
  gold: "#E8A63E",
  mint: "#3FDDB0",
};

const CONTACT_EMAIL = "contact@forgewebafrica.com";

/*
 * Form delivery. Posts to the serverless function in api/contact.js, which
 * holds the mail credentials server-side. If that endpoint is missing — local
 * `npm run dev`, or a deploy where the function is not live — the form falls
 * back to opening the visitor's mail client, so the submit button is never a
 * no-op. Run `npx vercel dev` to exercise the real endpoint locally.
 */
const FORM_ENDPOINT = "/api/contact";

/*
 * WhatsApp. International format, digits only — no "+", no spaces.
 * Left empty, the button is not rendered at all rather than shipping a
 * dead link.
 */
const WHATSAPP_NUMBER = "22363250943";

// Shared utility class strings, so spacing and focus stay consistent.
const FOCUS =
  "outline-none focus-visible:ring-2 focus-visible:ring-[#3FDDB0] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0E14]";
const CONTAINER = "mx-auto w-full max-w-6xl px-5 sm:px-8";
const SECTION = "relative py-20 sm:py-24 lg:py-32";
const CARD =
  "fw-spot rounded-[13px] border border-[#232A3A] bg-[#121620] transition-[transform,border-color] duration-200 motion-reduce:transition-none";
const CARD_HOVER = "hover:-translate-y-1 hover:border-[#39445C] motion-reduce:hover:translate-y-0";

/* ------------------------------------------------------------------ */
/*  Structure — language-independent. Text lives in COPY below and is  */
/*  matched to these by array position.                                */
/* ------------------------------------------------------------------ */

// Anchors stay in French so existing links keep working in both languages.
const NAV_HREFS = ["#services", "#methode", "#realisations", "#tarifs", "#contact"];

const SERVICE_ICONS = [LayoutTemplate, Code2, Database, Gauge, LifeBuoy];

const STACK = ["React.js", "JavaScript / TypeScript", "HTML5 & CSS3", "SQL", "Git & GitHub"];

const PROJECT_META = [
  {
    // Client project: the code is private, so the card shows no Code link.
    icon: ShoppingBag,
    live: "https://kanko-creation.vercel.app",
  },
  {
    icon: Plane,
    live: "https://aurevatravels.in",
  },
  {
    icon: Share2,
    live: "https://strand-silk.vercel.app",
    repo: "https://github.com/Deadsunx/strand",
  },
  {
    icon: CalendarClock,
    live: "https://daily-ephemeris.vercel.app",
    repo: "https://github.com/Deadsunx/daily-ephemeris",
  },
];

/*
 * Client sites shown in turn on the hero iPhone. Each screenshot is the live
 * site at 390px wide, 1.6x. `tour` names the keyframes that scroll it (stops
 * are in the CSS) and `duration` is how long one pass takes; the Dynamic Island
 * scales with it. `screen` is the site's own background, so the status bar
 * matches. `strip` is an optional horizontal carousel, captured in full and
 * laid over the screenshot at `top`, that swipes by `shift` (fw-swipe, timed
 * against fw-tour-aureva). Copy for each one lives in t.hero.showcases, in the
 * same order.
 */
const SHOWCASES = [
  {
    name: "Kanko Creation",
    href: "https://kanko-creation.vercel.app",
    src: "/showcase/kanko-creation.webp",
    width: 624,
    height: 2620,
    tour: "fw-tour-kanko",
    duration: "16s",
    screen: "#FBF7F1",
    Icon: WhatsAppGlyph,
  },
  {
    name: "Aureva Travels",
    href: "https://aurevatravels.in",
    src: "/showcase/aureva-travels.webp",
    width: 624,
    height: 3680,
    tour: "fw-tour-aureva",
    duration: "22s",
    screen: "#F6F1E7",
    Icon: Plane,
    // The destination arches, swiped from Armenia to Kazakhstan.
    strip: {
      src: "/showcase/aureva-travels-arches.webp",
      width: 1372,
      height: 418,
      top: "33.125%",
      shift: "-111.72cqw",
    },
  },
];

const PLAN_FEATURED = [false, true, false];

/* ------------------------------------------------------------------ */
/*  Copy                                                               */
/* ------------------------------------------------------------------ */

const COPY = {
  fr: {
    htmlLang: "fr",
    skipToContent: "Aller au contenu principal",
    openMenu: "Ouvrir le menu",
    closeMenu: "Fermer le menu",
    mainNav: "Navigation principale",
    mobileNav: "Navigation mobile",
    footerNav: "Navigation de bas de page",
    languageGroup: "Choisir la langue",
    languageNames: { fr: "Français", en: "Anglais" },
    newTab: " (nouvel onglet)",

    nav: ["Services", "Méthode", "Réalisations", "Tarifs", "Contact"],
    navCta: "Demander un devis",

    hero: {
      badge: "Disponible pour nouveaux projets",
      title: "Des sites web qui travaillent pour votre activité.",
      subtitle: "Développement Web Full-Stack · React & Next.js",
      body: "Nous concevons et développons des sites et applications web modernes, rapides et sur-mesure — du cahier des charges jusqu’à la mise en ligne.",
      primaryCta: "Demander un devis",
      secondaryCta: "Voir nos services",
      introSkip: "Cliquez pour passer",
      showcaseLabel: "Réalisation",
      showcaseLink: "Voir le site",
      showcasePick: (name) => `Afficher ${name}`,
      showcasePicker: "Choisir la réalisation affichée",
      showcases: [
        {
          note: "Boutique en ligne · commandes par WhatsApp",
          alt: "Le site de Kanko Creation, boutique de crochet fait main, affiché sur un iPhone",
          islandTitle: "Commande envoyée",
          islandSub: "via WhatsApp",
        },
        {
          note: "Agence de voyages · demandes en ligne",
          alt: "Le site d’Aureva Travels, agence de voyages, affiché sur un iPhone",
          islandTitle: "Demande envoyée",
          islandSub: "Géorgie · 2 adultes",
        },
      ],
    },

    services: {
      label: "Services",
      title: "Ce que nous faisons",
      intro:
        "Du site vitrine d’une page à l’application métier connectée à une base de données, nous prenons le projet en charge de bout en bout.",
      items: [
        {
          title: "Sites vitrines & landing pages",
          body: "Design responsive en HTML5/CSS3, pensé pour présenter une activité et convertir les visiteurs.",
          points: [
            "Une ou plusieurs pages, adaptées au mobile",
            "Textes et images structurés pour la conversion",
            "Formulaire de contact et appel direct",
          ],
        },
        {
          title: "Applications web sur-mesure",
          body: "Interfaces dynamiques et interactives développées avec React.js.",
          points: [
            "Tableaux de bord, espaces client, outils métier",
            "Composants réutilisables et code typé",
            "Logique adaptée à votre façon de travailler",
          ],
        },
        {
          title: "Bases de données & API",
          body: "Connexion à des bases SQL et à des API pour des sites réellement fonctionnels.",
          points: [
            "Modélisation et création de la base SQL",
            "Intégration d’API externes (paiement, cartes, e-mail)",
            "Authentification et gestion des accès",
          ],
        },
        {
          title: "Refonte & optimisation",
          body: "Modernisation de sites existants : vitesse, ergonomie et code propre.",
          points: [
            "Audit du site actuel et plan de reprise",
            "Temps de chargement et affichage mobile",
            "Bases techniques du référencement",
          ],
        },
        {
          title: "Maintenance & suivi après livraison",
          body: "Corrections, mises à jour et accompagnement une fois le site en ligne.",
          points: [
            "Corrections de bugs et mises à jour techniques",
            "Ajout de pages ou de fonctionnalités",
            "Sauvegardes et surveillance de la disponibilité",
          ],
        },
      ],
      otherTitle: "Un besoin différent ?",
      otherBody:
        "Boutique en ligne, tableau de bord, automatisation d’une tâche répétitive… Décrivez votre besoin, nous vous dirons si c’est réalisable.",
      otherCta: "Nous en parler",
    },

    method: {
      label: "Méthode",
      title: "Quatre étapes, aucune surprise",
      intro:
        "Le déroulement est le même sur chaque projet. Vous savez à tout moment où en est le vôtre.",
      steps: [
        {
          title: "Échange & cahier des charges",
          body: "Nous cernons votre activité, vos objectifs et vos contraintes, puis nous les traduisons en un document clair.",
        },
        {
          title: "Maquette & validation",
          body: "Vous recevez une maquette des écrans principaux. Rien n’est développé avant votre accord.",
        },
        {
          title: "Développement",
          body: "Intégration, développement des fonctionnalités et tests sur mobile, tablette et ordinateur.",
        },
        {
          title: "Mise en ligne & suivi",
          body: "Mise en ligne, configuration du domaine et accompagnement une fois le site actif.",
        },
      ],
    },

    stack: { label: "Stack technique", title: "Les outils que nous utilisons" },

    projects: {
      label: "Réalisations",
      title: "Des projets en ligne, pas des maquettes",
      intro:
        "Des sites de clients et nos propres projets, tous en ligne. Chacun est consultable : vous pouvez vérifier le travail avant de nous confier le vôtre.",
      liveBadge: "En ligne",
      viewSite: "Voir le site",
      viewCode: "Code",
      srViewSite: (title) => ` — ${title}, nouvel onglet`,
      srViewCode: (title) => ` source de ${title}, nouvel onglet`,
      items: [
        {
          kind: "Boutique en ligne",
          title: "Kanko Creation — crochet fait main",
          tags: ["Next.js", "Payload CMS", "Commandes WhatsApp"],
          body: "Boutique bilingue pour une marque de crochet fait main à Kinshasa. Chaque commande est enregistrée puis envoyée sur WhatsApp, et la créatrice met à jour ses pièces elle-même depuis son espace d’administration.",
        },
        {
          kind: "Site vitrine",
          title: "Aureva Travels — voyages sur mesure",
          tags: ["Next.js", "Tailwind CSS", "SEO"],
          body: "Site d’une agence de voyages en Inde : 12 destinations, chacune avec sa propre couleur, et un formulaire de demande qui indique de quelle page vient chaque contact.",
        },
        {
          kind: "Application web",
          title: "Strand — partage de fichiers",
          tags: ["TypeScript", "WebRTC", "Chiffrement E2E"],
          body: "Transfert de fichiers directement d’un navigateur à l’autre, sans passer par un serveur : aucune limite de taille et chiffrement de bout en bout.",
        },
        {
          kind: "Données & API",
          title: "Daily Ephemeris",
          tags: ["API", "GitHub Actions", "Automatisation"],
          body: "Quatre API publiques interrogées et archivées chaque jour, automatiquement. Le jeu de données s’enrichit seul, sans aucune intervention.",
        },
      ],
    },

    pricing: {
      label: "Tarifs",
      title: "Des points de départ clairs",
      intro:
        "Chaque projet est chiffré selon son contenu réel. Les montants ci-dessous servent de repère pour situer votre budget.",
      featuredBadge: "Le plus demandé",
      note: "Devis gratuit selon le projet.",
      plans: [
        {
          name: "Essentiel",
          price: "Dès 60 000 FCFA",
          tagline: "Pour lancer une présence en ligne rapidement.",
          features: [
            "Site vitrine une page",
            "Design responsive mobile et ordinateur",
            "Formulaire de contact",
            "Mise en ligne incluse",
          ],
          cta: "Demander un devis",
        },
        {
          name: "Professionnel",
          price: "Dès 150 000 FCFA",
          tagline: "Pour une activité qui a besoin de plusieurs pages.",
          features: [
            "Site multi-pages",
            "Design sur-mesure",
            "Optimisation SEO de base",
            "1 mois de suivi après livraison",
          ],
          cta: "Demander un devis",
        },
        {
          name: "Sur-mesure",
          price: "Sur devis",
          tagline: "Pour un outil métier ou une application complète.",
          features: [
            "Application web",
            "Base de données",
            "Intégrations API",
            "Maintenance continue",
          ],
          cta: "Discuter du projet",
        },
      ],
    },

    faq: {
      label: "FAQ",
      title: "Questions fréquentes",
      items: [
        {
          q: "Combien de temps prend un site ?",
          a: "Un site vitrine d’une page est généralement livré en 5 à 10 jours. Un site multi-pages ou une application web demande plutôt 3 à 6 semaines, selon le nombre de fonctionnalités et la rapidité de vos retours.",
        },
        {
          q: "Comment se passe le paiement ?",
          a: "50 % à la commande pour lancer le projet, 50 % à la mise en ligne. Le paiement se fait par mobile money ou par virement bancaire. Le devis est fixé avant le démarrage : pas de surprise en cours de route.",
        },
        {
          q: "Puis-je modifier le site moi-même après ?",
          a: "Oui. Sur demande, le site est livré avec une interface d’administration simple pour modifier vos textes, vos images et vos prix. Une session de prise en main est incluse à la livraison.",
        },
        {
          q: "Travaillez-vous à distance ?",
          a: "Oui, tout le projet se fait à distance : échanges par WhatsApp, e-mail ou visioconférence, avec un point d’avancement à chaque étape. Vous suivez l’avancement de votre site sans avoir à vous déplacer.",
        },
        {
          q: "Le nom de domaine et l’hébergement sont-ils inclus ?",
          a: "Ils ne sont pas compris dans le prix du site, car ils se paient chaque année auprès d’un prestataire. Nous nous chargeons de les réserver et de les configurer pour vous, et le coût annuel vous est annoncé dans le devis.",
        },
      ],
    },

    contact: {
      label: "Contact",
      title: "Parlons de votre projet.",
      intro:
        "Décrivez votre besoin en quelques lignes. Nous revenons vers vous avec une proposition et un délai sous 48 heures ouvrées.",
      whatsappIntro:
        "Vous préférez discuter de vive voix ? Écrivez-nous sur WhatsApp, nous répondons généralement dans la journée.",
      whatsappCta: "Écrire sur WhatsApp",
      whatsappMessage: "Bonjour FORGEWEB, je souhaite discuter d’un projet de site web.",
      labels: { name: "Nom", email: "E-mail", projectType: "Type de projet", message: "Message" },
      placeholders: {
        name: "Votre nom et prénom",
        email: "vous@exemple.com",
        projectType: "Choisir un type de projet",
        message: "Votre activité, ce que le site doit permettre de faire, votre délai souhaité…",
      },
      projectTypes: [
        "Site vitrine",
        "Application web sur-mesure",
        "Refonte d’un site existant",
        "Maintenance & suivi",
        "Autre besoin",
      ],
      submit: "Envoyer la demande",
      sending: "Envoi en cours…",
      honeypot: "Laissez ce champ vide — il sert à filtrer les envois automatiques.",
      errors: {
        nameRequired: "Merci d’indiquer votre nom.",
        nameShort: "Le nom doit contenir au moins 2 caractères.",
        emailRequired: "Merci d’indiquer votre adresse e-mail.",
        emailInvalid: "Cette adresse e-mail ne semble pas valide.",
        typeRequired: "Merci de choisir un type de projet.",
        messageRequired: "Décrivez votre projet en quelques mots.",
        messageShort: "Ajoutez un peu plus de détails (10 caractères minimum).",
      },
      sentTitle: "Message envoyé",
      sentBody:
        "Merci, nous avons bien reçu votre demande. Nous revenons vers vous sous 48 heures ouvrées à l’adresse que vous avez indiquée.",
      mailtoTitle: "Demande préparée",
      mailtoBodyStart:
        "Votre logiciel de messagerie devrait s’ouvrir avec le message pré-rempli — il ne reste qu’à l’envoyer. S’il ne s’ouvre pas, écrivez-nous directement à ",
      failedStart:
        "L’envoi a échoué. Vérifiez votre connexion et réessayez, ou écrivez-nous directement à ",
      writeAnother: "Écrire une autre demande",
      mailSubject: (type) => `Demande de devis — ${type}`,
      mailBody: { name: "Nom", email: "E-mail", projectType: "Type de projet", message: "Message" },
    },

    footer: {
      srTitle: "Informations de contact et navigation",
      pitch: "Sites et applications web sur-mesure, du cahier des charges à la mise en ligne.",
      navHeading: "Navigation",
      writeHeading: "Écrire",
      copyright: "© 2026 Forgeweb. Tous droits réservés.",
    },
  },

  en: {
    htmlLang: "en",
    skipToContent: "Skip to main content",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    mainNav: "Main navigation",
    mobileNav: "Mobile navigation",
    footerNav: "Footer navigation",
    languageGroup: "Choose language",
    languageNames: { fr: "French", en: "English" },
    newTab: " (new tab)",

    nav: ["Services", "Method", "Work", "Pricing", "Contact"],
    navCta: "Get a quote",

    hero: {
      badge: "Available for new projects",
      title: "Websites that work for your business.",
      subtitle: "Full-Stack Web Development · React & Next.js",
      body: "We design and build modern, fast, custom websites and web applications — from the brief through to launch.",
      primaryCta: "Get a quote",
      secondaryCta: "See our services",
      introSkip: "Click to skip",
      showcaseLabel: "Work",
      showcaseLink: "View site",
      showcasePick: (name) => `Show ${name}`,
      showcasePicker: "Choose which project is shown",
      showcases: [
        {
          note: "Online store · orders over WhatsApp",
          alt: "The Kanko Creation site, a handmade crochet shop, shown on an iPhone",
          islandTitle: "Order sent",
          islandSub: "via WhatsApp",
        },
        {
          note: "Travel agency · online inquiries",
          alt: "The Aureva Travels site, a travel agency, shown on an iPhone",
          islandTitle: "Inquiry sent",
          islandSub: "Georgia · 2 adults",
        },
      ],
    },

    services: {
      label: "Services",
      title: "What we do",
      intro:
        "From a one-page site to a business tool wired to a database, we take the project end to end.",
      items: [
        {
          title: "Landing pages & brochure sites",
          body: "Responsive HTML5/CSS3 design, built to present a business and convert visitors.",
          points: [
            "One page or several, built for mobile",
            "Copy and images structured to convert",
            "Contact form and click-to-call",
          ],
        },
        {
          title: "Custom web applications",
          body: "Dynamic, interactive interfaces built with React.js.",
          points: [
            "Dashboards, client portals, internal tools",
            "Reusable components and typed code",
            "Logic shaped around how you work",
          ],
        },
        {
          title: "Databases & APIs",
          body: "Wired to SQL databases and APIs, so the site actually does something.",
          points: [
            "SQL modelling and setup",
            "Third-party API integration (payments, maps, email)",
            "Authentication and access control",
          ],
        },
        {
          title: "Rebuilds & optimisation",
          body: "Modernising existing sites: speed, usability and clean code.",
          points: [
            "Audit of the current site and a plan to fix it",
            "Load time and mobile rendering",
            "Technical SEO foundations",
          ],
        },
        {
          title: "Maintenance & aftercare",
          body: "Fixes, updates and support once the site is live.",
          points: [
            "Bug fixes and technical updates",
            "New pages and features",
            "Backups and uptime monitoring",
          ],
        },
      ],
      otherTitle: "Something else?",
      otherBody:
        "Online store, dashboard, automating a repetitive task… Describe what you need and we’ll tell you whether it’s doable.",
      otherCta: "Talk to us",
    },

    method: {
      label: "Method",
      title: "Four steps, no surprises",
      intro: "Every project runs the same way. You always know where yours stands.",
      steps: [
        {
          title: "Brief & scope",
          body: "We work out what your business needs and what constrains it, then turn that into a clear written scope.",
        },
        {
          title: "Design & sign-off",
          body: "You get a mockup of the main screens. Nothing gets built before you approve it.",
        },
        {
          title: "Build",
          body: "Development, integration and testing on phone, tablet and desktop.",
        },
        {
          title: "Launch & aftercare",
          body: "Going live, domain setup, and support once the site is running.",
        },
      ],
    },

    stack: { label: "Tech stack", title: "The tools we use" },

    projects: {
      label: "Work",
      title: "Live projects, not mockups",
      intro:
        "Client sites and our own projects, all live. Each one can be visited, so you can check the work before trusting us with yours.",
      liveBadge: "Live",
      viewSite: "View site",
      viewCode: "Code",
      srViewSite: (title) => ` — ${title}, new tab`,
      srViewCode: (title) => ` source for ${title}, new tab`,
      items: [
        {
          kind: "Online store",
          title: "Kanko Creation — handmade crochet",
          tags: ["Next.js", "Payload CMS", "WhatsApp orders"],
          body: "Bilingual storefront for a handmade crochet brand in Kinshasa. Each order is recorded, then handed off to WhatsApp, and the maker updates her own pieces from her admin panel.",
        },
        {
          kind: "Business website",
          title: "Aureva Travels — tailor-made trips",
          tags: ["Next.js", "Tailwind CSS", "SEO"],
          body: "Site for a travel agency in India: 12 destinations, each in its own colour, and an inquiry form that records which page every lead came from.",
        },
        {
          kind: "Web application",
          title: "Strand — file sharing",
          tags: ["TypeScript", "WebRTC", "E2E encryption"],
          body: "Files move straight from one browser to another with no server in between: no size limit, and end-to-end encryption.",
        },
        {
          kind: "Data & APIs",
          title: "Daily Ephemeris",
          tags: ["API", "GitHub Actions", "Automation"],
          body: "Four public APIs queried and archived every day, automatically. The dataset grows on its own, with no intervention.",
        },
      ],
    },

    pricing: {
      label: "Pricing",
      title: "Clear starting points",
      intro:
        "Every project is quoted on what it actually involves. The figures below are there to help you place your budget.",
      featuredBadge: "Most popular",
      note: "Free quote based on your project.",
      plans: [
        {
          name: "Essential",
          price: "From 60,000 FCFA",
          tagline: "To get online quickly.",
          features: [
            "One-page brochure site",
            "Responsive on mobile and desktop",
            "Contact form",
            "Launch included",
          ],
          cta: "Get a quote",
        },
        {
          name: "Professional",
          price: "From 150,000 FCFA",
          tagline: "For a business that needs several pages.",
          features: [
            "Multi-page site",
            "Custom design",
            "Basic SEO setup",
            "1 month of aftercare",
          ],
          cta: "Get a quote",
        },
        {
          name: "Bespoke",
          price: "On request",
          tagline: "For a business tool or a full application.",
          features: [
            "Web application",
            "Database",
            "API integrations",
            "Ongoing maintenance",
          ],
          cta: "Discuss the project",
        },
      ],
    },

    faq: {
      label: "FAQ",
      title: "Common questions",
      items: [
        {
          q: "How long does a site take?",
          a: "A one-page brochure site is usually delivered in 5 to 10 days. A multi-page site or a web application takes more like 3 to 6 weeks, depending on the number of features and how quickly you come back to us.",
        },
        {
          q: "How does payment work?",
          a: "50% up front to start the project, 50% at launch. Payment by mobile money or bank transfer. The quote is fixed before we begin — no surprises along the way.",
        },
        {
          q: "Can I edit the site myself afterwards?",
          a: "Yes. On request, the site ships with a simple admin interface for changing your text, images and prices. A handover session is included at delivery.",
        },
        {
          q: "Do you work remotely?",
          a: "Yes, the whole project runs remotely: WhatsApp, email or video call, with a progress check at every stage. You follow your site’s progress without ever having to travel.",
        },
        {
          q: "Are the domain name and hosting included?",
          a: "They aren’t included in the price of the site, because they are paid yearly to a provider. We take care of registering and configuring them for you, and the annual cost is stated in your quote.",
        },
      ],
    },

    contact: {
      label: "Contact",
      title: "Let’s talk about your project.",
      intro:
        "Describe what you need in a few lines. We’ll come back to you with a proposal and a timeline within 2 working days.",
      whatsappIntro:
        "Prefer to talk it through? Message us on WhatsApp — we usually reply the same day.",
      whatsappCta: "Message on WhatsApp",
      whatsappMessage: "Hello FORGEWEB, I’d like to discuss a website project.",
      labels: { name: "Name", email: "Email", projectType: "Project type", message: "Message" },
      placeholders: {
        name: "Your first and last name",
        email: "you@example.com",
        projectType: "Choose a project type",
        message: "Your business, what the site needs to do, when you need it…",
      },
      projectTypes: [
        "Brochure site",
        "Custom web application",
        "Rebuild of an existing site",
        "Maintenance & support",
        "Something else",
      ],
      submit: "Send request",
      sending: "Sending…",
      honeypot: "Leave this field empty — it filters out automated submissions.",
      errors: {
        nameRequired: "Please tell us your name.",
        nameShort: "Your name needs at least 2 characters.",
        emailRequired: "Please give us your email address.",
        emailInvalid: "That email address doesn’t look right.",
        typeRequired: "Please choose a project type.",
        messageRequired: "Tell us about your project in a few words.",
        messageShort: "Add a little more detail (10 characters minimum).",
      },
      sentTitle: "Message sent",
      sentBody:
        "Thanks — we have your request. We’ll come back to you within 2 working days at the address you gave.",
      mailtoTitle: "Request ready",
      mailtoBodyStart:
        "Your email app should open with the message filled in — all that’s left is to send it. If it doesn’t open, write to us directly at ",
      failedStart: "Sending failed. Check your connection and try again, or write to us directly at ",
      writeAnother: "Write another request",
      mailSubject: (type) => `Quote request — ${type}`,
      mailBody: { name: "Name", email: "Email", projectType: "Project type", message: "Message" },
    },

    footer: {
      srTitle: "Contact information and navigation",
      pitch: "Custom websites and web applications, from the brief through to launch.",
      navHeading: "Navigation",
      writeHeading: "Write",
      copyright: "© 2026 Forgeweb. All rights reserved.",
    },
  },
};

const LANGS = ["fr", "en"];

const LangContext = createContext({ lang: "fr", setLang: () => {}, t: COPY.fr });
const useLang = () => useContext(LangContext);

/* ------------------------------------------------------------------ */
/*  Motion helpers                                                     */
/* ------------------------------------------------------------------ */

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Fades content in once it scrolls into view. Falls back to "always visible"
 * when reduced motion is requested or IntersectionObserver is unavailable.
 */
function Reveal({ children, delay = 0, className = "", as: Tag = "div" }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(() => prefersReducedMotion());

  useEffect(() => {
    if (shown) return undefined;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setShown(true);
      return undefined;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true);
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [shown]);

  return (
    <Tag
      ref={ref}
      className={`fw-reveal ${shown ? "fw-reveal-in" : ""} ${className}`}
      style={shown && delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}

function hasFinePointer() {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches
  );
}

const clamp01 = (v) => Math.min(1, Math.max(0, v));

/**
 * Heading text whose words rise out of a mask when the surrounding Reveal
 * enters. Screen readers get the plain sentence; the split copy is hidden.
 */
function SplitWords({ text }) {
  if (prefersReducedMotion()) return text;
  const words = text.split(" ");
  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" key={text}>
        {words.map((word, i) => (
          <React.Fragment key={i}>
            <span className="fw-wmask">
              <span className="fw-word-in" style={{ "--i": i }}>
                {word}
              </span>
            </span>
            {i < words.length - 1 ? " " : null}
          </React.Fragment>
        ))}
      </span>
    </>
  );
}

/**
 * Hero title, letter by letter: each one lands hot (amber) and cools to cream.
 * Keyed on the text, so switching language forges the new title again.
 */
function ForgedTitle({ text, animate, className }) {
  if (!animate) return <h1 className={className}>{text}</h1>;
  const words = text.split(" ");
  let n = 0;
  return (
    <h1 className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" key={text}>
        {words.map((word, i) => (
          <React.Fragment key={i}>
            <span className="fw-forge-word">
              {[...word].map((ch, j) => (
                <span key={j} className="fw-forge-char" style={{ "--i": n++ }}>
                  {ch}
                </span>
              ))}
            </span>
            {i < words.length - 1 ? " " : null}
          </React.Fragment>
        ))}
      </span>
    </h1>
  );
}

/**
 * Embers drifting up through the hero; the cursor pushes them aside. Runs
 * only while the hero is on screen.
 */
function Embers() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const mouse = { x: -1e4, y: -1e4 };
    let w = 0;
    let h = 0;
    let parts = [];
    let raf = 0;

    const spawn = (anywhere) => ({
      x: Math.random() * w,
      y: anywhere ? Math.random() * h : h + 10,
      r: 0.6 + Math.random() * 1.8,
      vy: 0.25 + Math.random() * 0.75,
      vx: 0,
      phase: Math.random() * Math.PI * 2,
      mint: Math.random() < 0.22,
      a: 0.35 + Math.random() * 0.55,
    });

    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      parts = Array.from({ length: Math.min(80, Math.round(w / 18)) }, () => spawn(true));
    };

    const frame = (t) => {
      raf = requestAnimationFrame(frame);
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      for (const p of parts) {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 140) p.vx += (dx / (dist + 1)) * (1 - dist / 140) * 0.35;
        p.vx *= 0.94;
        p.x += Math.sin(t / 900 + p.phase) * 0.3 + p.vx;
        p.y -= p.vy;
        if (p.y < -10 || p.x < -20 || p.x > w + 20) Object.assign(p, spawn(false));

        const alpha = p.a * clamp01(p.y / (h * 0.55)) * (0.75 + Math.sin(t / 120 + p.phase * 5) * 0.25);
        ctx.fillStyle = p.mint ? `rgba(63,221,176,${alpha * 0.18})` : `rgba(232,166,62,${alpha * 0.18})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = p.mint ? `rgba(170,255,230,${alpha})` : `rgba(255,214,140,${alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const onMove = (e) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([entry]) => {
      cancelAnimationFrame(raf);
      if (entry.isIntersecting) raf = requestAnimationFrame(frame);
    });
    io.observe(canvas);
    window.addEventListener("pointermove", onMove, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return <canvas ref={ref} className="absolute inset-0 h-full w-full" />;
}

/**
 * Hero depth on desktop: text and code window scroll at different speeds,
 * the code window tilts toward the mouse and the background glows drift with
 * it. Uses the independent `translate`/`scale` properties so it never fights
 * the entrance animations, which own `transform`.
 */
function useHeroDepth(enabled, refs) {
  useEffect(() => {
    if (!enabled) return undefined;
    const { section, column, visual, tilt, glowA, glowB } = refs;
    const fine = hasFinePointer();
    const target = { x: 0, y: 0 };
    const eased = { x: 0, y: 0 };
    let raf = 0;

    const frame = () => {
      raf = requestAnimationFrame(frame);
      if (window.innerWidth < 1024) return;
      eased.x += (target.x - eased.x) * 0.06;
      eased.y += (target.y - eased.y) * 0.06;
      const y = window.scrollY;
      const p = clamp01(y / window.innerHeight);

      column.current.style.translate = `0 ${(-y * 0.28).toFixed(1)}px`;
      column.current.style.opacity = String(clamp01(1 - p * 1.3));
      visual.current.style.translate = `0 ${(y * 0.1).toFixed(1)}px`;
      visual.current.style.scale = String(1 - p * 0.1);
      if (fine) {
        tilt.current.style.transform = `perspective(1100px) rotateY(${(eased.x * 8).toFixed(2)}deg) rotateX(${(-eased.y * 6).toFixed(2)}deg)`;
      }
      glowA.current.style.translate = `${(eased.x * 60).toFixed(1)}px ${(eased.y * 40 + y * 0.35).toFixed(1)}px`;
      glowB.current.style.translate = `${(-eased.x * 70).toFixed(1)}px ${(-eased.y * 40 + y * 0.2).toFixed(1)}px`;
    };

    const onMove = (e) => {
      target.x = (e.clientX / window.innerWidth) * 2 - 1;
      target.y = (e.clientY / window.innerHeight) * 2 - 1;
    };

    const io = new IntersectionObserver(([entry]) => {
      cancelAnimationFrame(raf);
      if (entry.isIntersecting) raf = requestAnimationFrame(frame);
    });
    io.observe(section.current);
    window.addEventListener("pointermove", onMove, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      // Only the properties set here: the glows keep their React-owned background.
      for (const r of [column, visual, tilt, glowA, glowB]) {
        if (!r.current) continue;
        for (const prop of ["translate", "scale", "opacity", "transform"]) {
          r.current.style.removeProperty(prop);
        }
      }
    };
    // Refs are stable; the effect only depends on whether motion is allowed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);
}

/** CTA buttons lean toward the cursor (mouse only). Spread onto the wrapper. */
const magnetHandlers = {
  onPointerMove(e) {
    if (e.pointerType !== "mouse") return;
    const a = e.target.closest?.(".fw-magnet");
    if (!a) return;
    const r = a.getBoundingClientRect();
    a.style.transition = "translate 120ms ease-out";
    a.style.translate = `${((e.clientX - r.left - r.width / 2) * 0.25).toFixed(1)}px ${(
      (e.clientY - r.top - r.height / 2) *
      0.35
    ).toFixed(1)}px`;
  },
  onPointerOut(e) {
    const a = e.target.closest?.(".fw-magnet");
    if (!a || a.contains(e.relatedTarget)) return;
    a.style.transition = "translate 600ms cubic-bezier(0.34, 1.56, 0.64, 1)";
    a.style.translate = "";
  },
};

/** Mint progress line under the header, scaled to how far down the page is. */
function ScrollProgress() {
  const ref = useRef(null);

  useEffect(() => {
    let queued = false;
    const update = () => {
      queued = false;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (ref.current) ref.current.style.transform = `scaleX(${max > 0 ? clamp01(window.scrollY / max) : 0})`;
    };
    const onScroll = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[55] h-0.5 origin-left scale-x-0 bg-[#3FDDB0]"
    />
  );
}

/** Card spotlight: feeds the pointer position to the hovered .fw-spot card. */
function trackSpotlight(e) {
  if (e.pointerType !== "mouse") return;
  const card = e.target.closest?.(".fw-spot");
  if (!card) return;
  const r = card.getBoundingClientRect();
  card.style.setProperty("--mx", `${e.clientX - r.left}px`);
  card.style.setProperty("--my", `${e.clientY - r.top}px`);
}

/* ------------------------------------------------------------------ */
/*  Intro: the cursor strikes the anvil, sparks fly, the page opens    */
/* ------------------------------------------------------------------ */

const INTRO_KEY = "fw-intro-seen";

function introSeen() {
  try {
    return window.sessionStorage.getItem(INTRO_KEY) === "1";
  } catch {
    return false;
  }
}

function burstSparks(canvas, x, y) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);
  ctx.globalCompositeOperation = "lighter";
  ctx.lineWidth = 1.6;

  const colors = ["rgb(255,241,201)", "rgb(255,210,122)", C.gold, C.gold, C.mint];
  const parts = Array.from({ length: 90 }, () => {
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.25;
    const speed = 3 + Math.random() * 10;
    return {
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      decay: 0.012 + Math.random() * 0.025,
      color: colors[Math.floor(Math.random() * colors.length)],
    };
  });

  const step = () => {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    let alive = 0;
    for (const p of parts) {
      if (p.life <= 0) continue;
      alive += 1;
      p.vy += 0.28;
      p.vx *= 0.985;
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;
      ctx.globalAlpha = clamp01(p.life);
      ctx.strokeStyle = p.color;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x - p.vx * 2.2, p.y - p.vy * 2.2);
      ctx.stroke();
    }
    if (alive) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/**
 * Plays once per browser session. Any click, tap or key skips straight to the
 * opening. `onOpen` fires as the halves part (start the hero entrance);
 * `onDone` once the overlay has fully cleared.
 */
function ForgeIntro({ onOpen, onDone }) {
  const { t } = useLang();
  const [phase, setPhase] = useState(0); // 0 strike, 1 hit, 2 seam, 3 open
  const anvilRef = useRef(null);
  const sparksRef = useRef(null);
  const callbacks = useRef({ onOpen, onDone });
  callbacks.current = { onOpen, onDone };

  useEffect(() => {
    const timers = [];
    let opened = false;

    const open = () => {
      if (opened) return;
      opened = true;
      timers.forEach(window.clearTimeout);
      try {
        window.sessionStorage.setItem(INTRO_KEY, "1");
      } catch {
        // Storage blocked: the intro simply plays again next visit.
      }
      setPhase(2);
      timers.push(
        window.setTimeout(() => {
          setPhase(3);
          callbacks.current.onOpen();
        }, 260),
        window.setTimeout(() => callbacks.current.onDone(), 950)
      );
    };

    // Start the clock on the first painted frame, not on mount. If that frame
    // is slow (a heavy first paint), timers started at mount are already
    // overdue when the overlay appears, and the strike gets skipped.
    let raf = window.requestAnimationFrame(() => {
      raf = window.requestAnimationFrame(() => {
        if (opened) return;
        timers.push(
          window.setTimeout(() => {
            setPhase(1);
            const r = anvilRef.current.getBoundingClientRect();
            // The strike lands on the anvil's face, 12.4 units down its 32-unit box.
            burstSparks(sparksRef.current, r.left + r.width / 2, r.top + r.height * (12.4 / 32));
          }, 430),
          window.setTimeout(open, 950)
        );
      });
    });
    window.addEventListener("pointerdown", open);
    window.addEventListener("keydown", open);

    return () => {
      window.cancelAnimationFrame(raf);
      timers.forEach(window.clearTimeout);
      window.removeEventListener("pointerdown", open);
      window.removeEventListener("keydown", open);
    };
  }, []);

  // Portalled to <body>: inside <main> it would sit under the fixed header.
  return createPortal(
    <div
      aria-hidden="true"
      className={`fw-intro ${phase >= 1 ? "is-hit" : ""} ${phase >= 2 ? "is-seam" : ""} ${
        phase >= 3 ? "is-open" : ""
      }`}
    >
      <div className="fw-intro-half is-top" />
      <div className="fw-intro-half is-bot" />
      <div className="fw-intro-seam" />
      <div className="fw-intro-core">
        <div ref={anvilRef} className="fw-intro-anvil">
          <div className="fw-intro-flash" />
          <LogoMark className="h-full w-full overflow-visible" bodyClassName="fw-anvil-body" cursorClassName="fw-anvil-cursor" />
        </div>
        <div className="fw-intro-word">
          {[..."FORGEWEB"].map((ch, i) => (
            <span key={i} style={{ "--i": i }} className={i > 4 ? "text-[#3FDDB0]" : undefined}>
              {ch}
            </span>
          ))}
        </div>
      </div>
      <canvas ref={sparksRef} className="fw-intro-sparks" />
      <p className="fw-intro-skip">{t.hero.introSkip}</p>
    </div>,
    document.body
  );
}

/* ------------------------------------------------------------------ */
/*  Small presentational pieces                                        */
/* ------------------------------------------------------------------ */

/**
 * The mark: an anvil (forge) topped by a mint I-beam text cursor (web).
 * Untiled here — it sits on the page's own dark background. public/favicon.svg
 * carries the same shapes on a rounded tile so they read on light browser
 * chrome too; keep the two in step. Decorative: the wordmark beside it carries
 * the accessible name.
 */
function LogoMark({ className = "", bodyClassName, cursorClassName }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false" className={className}>
      <g fill="#F1EFE6" className={bodyClassName}>
        <path d="M8.4 13.1 H2.8 L8.4 18.7 Z" />
        <path d="M23.6 13.1 H29.2 L23.6 18.1 Z" />
        <rect x="8.4" y="12.4" width="15.2" height="6.4" rx="0.7" />
        <rect x="12.6" y="18.8" width="6.8" height="2.8" />
        <path d="M12.6 21.6 H19.4 L22.8 24.6 H9.2 Z" />
        <rect x="6.2" y="24.6" width="19.6" height="3.2" rx="0.7" />
      </g>
      <g fill="#3FDDB0" className={cursorClassName}>
        <rect x="13.7" y="4.4" width="4.6" height="1.6" rx="0.5" />
        <rect x="15.1" y="5.6" width="1.8" height="5.2" />
        <rect x="13.7" y="10.4" width="4.6" height="1.6" rx="0.5" />
      </g>
    </svg>
  );
}

function Wordmark({ className = "" }) {
  return (
    <span className={`font-mono font-bold tracking-[0.18em] text-[#F1EFE6] ${className}`}>
      FORGE<span className="text-[#3FDDB0]">WEB</span>
    </span>
  );
}

function SectionLabel({ children }) {
  return (
    <p className="font-mono text-[0.6875rem] uppercase tracking-[0.2em] text-[#8791A6]">
      <span aria-hidden="true">{"// "}</span>
      <span className="text-[#E8A63E]">{children}</span>
    </p>
  );
}

function SectionHeading({ label, title, intro, id, align = "left" }) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <Reveal>
        <SectionLabel>{label}</SectionLabel>
        <h2
          id={id}
          className="mt-4 text-3xl font-bold tracking-[-0.03em] text-[#F1EFE6] sm:text-4xl lg:text-[2.875rem] lg:leading-[1.08]"
        >
          <SplitWords text={title} />
        </h2>
        {intro ? (
          <p className="mt-5 text-[0.9375rem] leading-[1.55] text-[#8791A6] sm:text-base">{intro}</p>
        ) : null}
      </Reveal>
    </div>
  );
}

function PrimaryButton({ children, className = "", ...rest }) {
  return (
    <button
      type="button"
      className={`fw-shine inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[10px] bg-[#3FDDB0] px-5 py-3 text-sm font-semibold text-[#0B0E14] transition-colors duration-200 hover:bg-[#5CE8C1] motion-reduce:transition-none ${FOCUS} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

function PrimaryLink({ children, className = "", ...rest }) {
  return (
    <a
      className={`fw-shine inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[10px] bg-[#3FDDB0] px-5 py-3 text-center text-sm font-semibold text-[#0B0E14] transition-colors duration-200 hover:bg-[#5CE8C1] motion-reduce:transition-none ${FOCUS} ${className}`}
      {...rest}
    >
      {children}
    </a>
  );
}

function GhostLink({ children, className = "", ...rest }) {
  return (
    <a
      className={`inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[10px] border border-[#232A3A] bg-transparent px-5 py-3 text-center text-sm font-semibold text-[#F1EFE6] transition-colors duration-200 hover:border-[#39445C] hover:bg-[#121620] motion-reduce:transition-none ${FOCUS} ${className}`}
      {...rest}
    >
      {children}
    </a>
  );
}

/* ------------------------------------------------------------------ */
/*  Language toggle                                                    */
/* ------------------------------------------------------------------ */

function LanguageToggle({ className = "" }) {
  const { lang, setLang, t } = useLang();

  return (
    <div
      role="group"
      aria-label={t.languageGroup}
      className={`inline-flex shrink-0 items-center rounded-[10px] border border-[#232A3A] bg-[#121620] p-0.5 ${className}`}
    >
      {LANGS.map((code) => {
        const active = code === lang;
        return (
          <button
            key={code}
            type="button"
            lang={code}
            onClick={() => setLang(code)}
            aria-pressed={active}
            className={`inline-flex h-9 min-w-[38px] items-center justify-center rounded-[7px] px-2 font-mono text-xs font-semibold uppercase tracking-[0.08em] transition-colors duration-200 motion-reduce:transition-none ${FOCUS} ${
              active
                ? "bg-[#3FDDB0] text-[#0B0E14]"
                : "text-[#8791A6] hover:text-[#F1EFE6]"
            }`}
          >
            {code}
            <span className="sr-only"> — {t.languageNames[code]}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Header                                                             */
/* ------------------------------------------------------------------ */

function Header() {
  const { t } = useLang();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile panel on Escape, and when the viewport grows past the
  // breakpoint that hides it — otherwise the toggle state goes stale.
  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKeyDown = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    // Must match the `lg:hidden` on the panel, or the menu closes itself
    // while the burger that opens it is still on screen.
    const onResize = () => {
      if (window.innerWidth >= 1024) setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onResize);
    };
  }, [menuOpen]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-200 motion-reduce:transition-none ${
        scrolled || menuOpen
          ? "border-b border-[#232A3A] bg-[#0B0E14]/85 backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className={`${CONTAINER} flex h-16 items-center justify-between gap-3`}>
        <a
          href="#top"
          className={`-ml-1 inline-flex min-h-[44px] shrink-0 items-center gap-2.5 rounded-md px-1 ${FOCUS}`}
        >
          <LogoMark className="h-8 w-8 shrink-0" />
          {/*
            Below ~350px the header runs out of room, so the wordmark drops to
            sr-only rather than `hidden` — the mark alone carries the brand
            visually, but the link keeps its accessible name.
          */}
          <Wordmark className="text-base max-[349px]:sr-only" />
        </a>

        <nav aria-label={t.mainNav} className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV_HREFS.map((href, i) => (
              <li key={href}>
                <a
                  href={href}
                  className={`inline-flex min-h-[40px] items-center rounded-md px-3 text-sm text-[#8791A6] transition-colors duration-200 hover:text-[#F1EFE6] motion-reduce:transition-none ${FOCUS}`}
                >
                  {t.nav[i]}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <LanguageToggle />
          <PrimaryLink href="#contact" className="hidden whitespace-nowrap sm:inline-flex">
            {t.navCta}
          </PrimaryLink>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? t.closeMenu : t.openMenu}
            className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] border border-[#232A3A] text-[#F1EFE6] transition-colors duration-200 hover:border-[#39445C] motion-reduce:transition-none lg:hidden ${FOCUS}`}
          >
            {menuOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Always mounted so the button's aria-controls always resolves. */}
      <div
        id="mobile-menu"
        hidden={!menuOpen}
        className="border-t border-[#232A3A] bg-[#0B0E14]/95 backdrop-blur-md lg:hidden"
      >
        <nav aria-label={t.mobileNav} className={`${CONTAINER} py-3`}>
          <ul className="flex flex-col">
            {NAV_HREFS.map((href, i) => (
              <li key={href}>
                <a
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className={`flex min-h-[48px] items-center justify-between rounded-md px-2 text-[0.9375rem] text-[#F1EFE6] transition-colors duration-200 hover:bg-[#121620] motion-reduce:transition-none ${FOCUS}`}
                >
                  {t.nav[i]}
                  <ArrowRight className="h-4 w-4 text-[#3FDDB0]" aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
          <PrimaryLink
            href="#contact"
            onClick={() => setMenuOpen(false)}
            className="mt-3 flex w-full sm:hidden"
          >
            {t.navCta}
          </PrimaryLink>
        </nav>
      </div>
    </header>
  );
}

const whatsappHref = (t) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(t.contact.whatsappMessage)}`;

/** WhatsApp's own glyph (Simple Icons, CC0): instantly recognisable, unlike a generic bubble. */
function WhatsAppGlyph({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="currentColor" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

/**
 * Client sites on an iPhone, one after the other. Each screen is a screenshot
 * of the live site, not an iframe, so the hero doesn't load whole extra sites
 * on slow connections. Each site plays its own tour once (Kanko: down to the
 * product grid; Aureva: down to the arches, swipe, down to the destination
 * list), and while it rests on its last view the Dynamic Island shows what
 * that site does with a visitor (Kanko hands every order to WhatsApp, Aureva
 * takes trip inquiries). When a tour ends, back at the top, the next site
 * fades in and starts its own. Keyboard focus inside the figure pauses it, and
 * the picker lets visitors choose. Under reduced motion it stays still and
 * only the picker changes the site.
 * Sizes are in cqw (1% of the phone's width) so the device scales as a unit.
 */
function PhoneShowcase() {
  const { t } = useLang();
  const [active, setActive] = useState(0);
  // Bumped when a visitor picks a site, to restart the pan from the top.
  const [pass, setPass] = useState(0);
  const site = SHOWCASES[active];
  const copy = t.hero.showcases[active];
  const IslandIcon = site.Icon;

  return (
    <figure className="fw-phone-wrap mx-auto w-[248px] sm:w-[280px] lg:w-[300px]">
      <div className="fw-phone">
        <span aria-hidden="true" className="fw-phone-btn is-action" />
        <span aria-hidden="true" className="fw-phone-btn is-vol-up" />
        <span aria-hidden="true" className="fw-phone-btn is-vol-down" />
        <span aria-hidden="true" className="fw-phone-btn is-power" />
        <div
          key={pass}
          className="fw-phone-screen"
          style={{ "--screen": site.screen, "--dur": site.duration }}
        >
          {SHOWCASES.map((s, i) => (
            <div
              key={s.src}
              className={`fw-phone-site${i === active ? " is-active" : ""}`}
              style={{ "--tour": s.tour }}
              onAnimationEnd={(e) => {
                // Only the site's own tour, not the strip or island inside it.
                if (i === active && e.target === e.currentTarget) {
                  setActive((a) => (a + 1) % SHOWCASES.length);
                }
              }}
            >
              <img
                src={s.src}
                width={s.width}
                height={s.height}
                alt={i === active ? copy.alt : ""}
                loading="lazy"
                decoding="async"
                className="fw-phone-shot"
              />
              {s.strip ? (
                <img
                  src={s.strip.src}
                  width={s.strip.width}
                  height={s.strip.height}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="fw-phone-strip"
                  style={{
                    top: s.strip.top,
                    width: `${(s.strip.width / s.width) * 100}%`,
                    "--shift": s.strip.shift,
                  }}
                />
              ) : null}
            </div>
          ))}
          <div aria-hidden="true" className="fw-phone-status">
            <span>9:41</span>
            <span className="fw-phone-icons">
              <svg viewBox="0 0 18 12">
                <rect x="0" y="8" width="3.4" height="4" rx="0.8" />
                <rect x="4.6" y="6" width="3.4" height="6" rx="0.8" />
                <rect x="9.2" y="3.5" width="3.4" height="8.5" rx="0.8" />
                <rect x="13.8" y="1" width="3.4" height="11" rx="0.8" />
              </svg>
              <svg viewBox="0 0 16 12">
                <path
                  d="M2.2 4.6a8.2 8.2 0 0 1 11.6 0M4.6 7.1a4.8 4.8 0 0 1 6.8 0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
                <circle cx="8" cy="10" r="1.45" />
              </svg>
              <svg viewBox="0 0 27 12">
                <rect x="0.6" y="0.6" width="22" height="10.8" rx="3" fill="none" stroke="currentColor" strokeOpacity="0.45" strokeWidth="1.2" />
                <rect x="2.6" y="2.6" width="18" height="6.8" rx="1.6" />
                <rect x="24" y="4" width="1.8" height="4" rx="0.9" fillOpacity="0.45" />
              </svg>
            </span>
          </div>
          {/* Keyed by site so its clock restarts with each tour. */}
          <div key={active} aria-hidden="true" className="fw-island">
            <span className="fw-island-content">
              <span className="fw-island-icon">
                <IslandIcon aria-hidden="true" strokeWidth={2.4} className="h-[56%] w-[56%]" />
              </span>
              <span className="fw-island-text">
                <span className="fw-island-title">{copy.islandTitle}</span>
                <span className="fw-island-sub">{copy.islandSub}</span>
              </span>
              <Check className="fw-island-check" strokeWidth={3} />
            </span>
          </div>
          <span aria-hidden="true" className="fw-phone-home" />
        </div>
      </div>
      <div role="group" aria-label={t.hero.showcasePicker} className="mt-3 flex justify-center">
        {SHOWCASES.map((s, i) => (
          <button
            key={s.name}
            type="button"
            aria-pressed={i === active}
            aria-label={t.hero.showcasePick(s.name)}
            onClick={() => {
              setActive(i);
              setPass((p) => p + 1);
            }}
            className={`group inline-flex h-11 w-11 items-center justify-center rounded-md ${FOCUS}`}
          >
            <span
              aria-hidden="true"
              className={`block h-1.5 rounded-full transition-[width,background-color] duration-300 motion-reduce:transition-none ${
                i === active ? "w-6 bg-[#3FDDB0]" : "w-1.5 bg-[#39445C] group-hover:bg-[#8791A6]"
              }`}
            />
          </button>
        ))}
      </div>
      <figcaption className="mt-1 text-center">
        <span className="block font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-[#8791A6]">
          {t.hero.showcaseLabel} · <span className="text-[#F1EFE6]">{site.name}</span>
        </span>
        {/* Every site's line sits in the same cell, so the caption is as tall
            as the longest one and the page doesn't jump when the site changes. */}
        <span className="mt-1 grid text-sm text-[#8791A6]">
          {SHOWCASES.map((s, i) => (
            <span
              key={s.name}
              className={`flex flex-wrap items-center justify-center gap-x-3 [grid-area:1/1] ${
                i === active ? "" : "invisible"
              }`}
            >
              {t.hero.showcases[i].note}
              <a
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex min-h-[44px] items-center gap-1 rounded font-semibold text-[#3FDDB0] transition-colors duration-200 hover:text-[#5CE8C1] motion-reduce:transition-none ${FOCUS}`}
              >
                {t.hero.showcaseLink}
                <span className="sr-only">{t.projects.srViewSite(s.name)}</span>
                <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
              </a>
            </span>
          ))}
        </span>
      </figcaption>
    </figure>
  );
}

/**
 * Floating WhatsApp button for phones, where WhatsApp is how clients reach
 * you. It stays out of the way of the hero's own buttons, and of the contact
 * section and footer, which already carry the same link.
 */
function WhatsAppFab() {
  const { t } = useLang();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("top");
    const blockers = [document.getElementById("contact"), document.querySelector("footer")].filter(Boolean);
    if (!hero || typeof IntersectionObserver === "undefined") {
      setShow(true);
      return undefined;
    }
    let heroVisible = true;
    const blocking = new Set();
    const update = () => setShow(!heroVisible && blocking.size === 0);
    // The hero counts as "in the way" until less than 40% of it is on screen.
    const heroIo = new IntersectionObserver(
      ([entry]) => {
        heroVisible = entry.intersectionRatio >= 0.4;
        update();
      },
      { threshold: [0, 0.4, 1] }
    );
    // Contact and footer only count once they reach the upper 65% of the
    // screen; a sliver of the contact heading at the bottom shouldn't hide it.
    const blockIo = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) blocking.add(entry.target);
          else blocking.delete(entry.target);
        }
        update();
      },
      { rootMargin: "0px 0px -35% 0px" }
    );
    heroIo.observe(hero);
    blockers.forEach((el) => blockIo.observe(el));
    return () => {
      heroIo.disconnect();
      blockIo.disconnect();
    };
  }, []);

  if (!WHATSAPP_NUMBER) return null;
  return (
    <a
      href={whatsappHref(t)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${t.contact.whatsappCta}${t.newTab}`}
      aria-hidden={!show}
      tabIndex={show ? 0 : -1}
      className={`fixed bottom-5 right-4 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#3FDDB0] text-[#0B0E14] shadow-[0_10px_30px_-8px_rgba(63,221,176,0.65),0_4px_12px_rgba(0,0,0,0.5)] transition-[opacity,transform] duration-200 motion-reduce:transition-none md:hidden ${FOCUS} ${
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0 motion-reduce:translate-y-0"
      }`}
    >
      <WhatsAppGlyph className="h-7 w-7" />
    </a>
  );
}

/* ------------------------------------------------------------------ */
/*  Hero                                                               */
/* ------------------------------------------------------------------ */

/**
 * The hero is the one cinematic moment on the page. Stages:
 *   "intro"  — first visit this session: ForgeIntro covers the hero
 *   "enter"  — the hero plays its entrance (badge, forged title, phone…)
 *   "static" — reduced motion: everything is simply there
 */
// Phones skip the full-screen intro: on slow mobile data it held the
// headline back by ~2 s, and phones are where most visitors are.
function introEnabled() {
  return typeof window.matchMedia === "function" && window.matchMedia("(min-width: 1024px) and (pointer: fine)").matches;
}

function initialHeroStage() {
  if (prefersReducedMotion()) return "static";
  return introSeen() || !introEnabled() ? "enter" : "intro";
}

function Hero() {
  const { t } = useLang();
  const [stage, setStage] = useState(initialHeroStage);
  const [showIntro, setShowIntro] = useState(stage === "intro");
  const animate = stage !== "static";

  const refs = {
    section: useRef(null),
    column: useRef(null),
    visual: useRef(null),
    tilt: useRef(null),
    glowA: useRef(null),
    glowB: useRef(null),
  };
  useHeroDepth(animate, refs);

  return (
    <section
      ref={refs.section}
      id="top"
      data-stage={stage}
      className="fw-hero relative flex min-h-[100svh] items-center overflow-hidden pb-20 pt-28 sm:pb-24 sm:pt-32 lg:pb-24 lg:pt-28"
    >
      {showIntro ? (
        <ForgeIntro onOpen={() => setStage("enter")} onDone={() => setShowIntro(false)} />
      ) : null}

      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div
          ref={refs.glowA}
          className="absolute -top-40 left-[-15%] h-[520px] w-[520px] rounded-full opacity-70 blur-[110px]"
          style={{ background: "radial-gradient(circle, rgba(232,166,62,0.16), transparent 68%)" }}
        />
        <div
          ref={refs.glowB}
          className="absolute -top-24 right-[-20%] h-[560px] w-[560px] rounded-full opacity-70 blur-[120px]"
          style={{ background: "radial-gradient(circle, rgba(63,221,176,0.14), transparent 68%)" }}
        />
        {animate ? <Embers /> : null}
      </div>

      <div className={`${CONTAINER} w-full`}>
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-14">
          <div ref={refs.column}>
            <div className="fw-h fw-h-down">
              <p className="inline-flex items-center gap-2.5 rounded-full border border-[#232A3A] bg-[#121620] px-3.5 py-2">
                <span className="relative flex h-2 w-2 shrink-0" aria-hidden="true">
                  <span className="fw-ping absolute inline-flex h-full w-full rounded-full bg-[#3FDDB0] opacity-70" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#3FDDB0]" />
                </span>
                <span className="font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-[#8791A6]">
                  {t.hero.badge}
                </span>
              </p>
            </div>

            <ForgedTitle
              text={t.hero.title}
              animate={animate}
              className="mt-7 text-[2.125rem] font-extrabold leading-[1.05] tracking-[-0.035em] text-[#F1EFE6] sm:text-[3.25rem] lg:text-[4rem]"
            />

            <p
              className="fw-h fw-h-wipe mt-5 font-mono text-sm tracking-[0.02em] text-[#E8A63E] sm:text-[0.9375rem]"
              style={{ "--d": "320ms" }}
            >
              {t.hero.subtitle}
            </p>

            <p
              className="fw-h fw-h-up mt-5 max-w-xl text-[0.9375rem] leading-[1.55] text-[#8791A6] sm:text-[1.0625rem]"
              style={{ "--d": "380ms" }}
            >
              {t.hero.body}
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap" {...magnetHandlers}>
              <PrimaryLink href="#contact" className="fw-h fw-h-pop fw-magnet" style={{ "--d": "440ms" }}>
                {t.hero.primaryCta}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </PrimaryLink>
              <GhostLink href="#services" className="fw-h fw-h-pop fw-magnet" style={{ "--d": "500ms" }}>
                {t.hero.secondaryCta}
              </GhostLink>
            </div>
          </div>

          <div ref={refs.visual} className="fw-h fw-h-flip lg:pl-2" style={{ "--d": "150ms" }}>
            <div ref={refs.tilt}>
              <PhoneShowcase />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Services                                                           */
/* ------------------------------------------------------------------ */

function Services() {
  const { t } = useLang();

  return (
    <section id="services" className={`${SECTION} bg-[#0E121B]`} aria-labelledby="services-title">
      <div className={CONTAINER}>
        <SectionHeading
          id="services-title"
          label={t.services.label}
          title={t.services.title}
          intro={t.services.intro}
        />

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3">
          {t.services.items.map((service, i) => {
            const Icon = SERVICE_ICONS[i];
            return (
              <Reveal key={service.title} delay={i * 60} className="h-full">
                <article className={`${CARD} ${CARD_HOVER} flex h-full flex-col p-6`}>
                  <span
                    aria-hidden="true"
                    className="inline-flex h-11 w-11 items-center justify-center rounded-[10px] border border-[#232A3A] bg-[#0E121B] text-[#3FDDB0]"
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 text-[1.0625rem] font-semibold leading-snug tracking-[-0.01em] text-[#F1EFE6]">
                    {service.title}
                  </h3>
                  <p className="mt-3 text-[0.9375rem] leading-[1.55] text-[#8791A6]">{service.body}</p>
                  <ul className="mt-5 space-y-2.5 border-t border-[#232A3A] pt-5">
                    {service.points.map((point) => (
                      <li key={point} className="flex gap-2.5 text-sm leading-[1.5] text-[#8791A6]">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#3FDDB0]" aria-hidden="true" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              </Reveal>
            );
          })}

          <Reveal delay={t.services.items.length * 60} className="h-full">
            <a
              href="#contact"
              className={`group flex h-full flex-col justify-between rounded-[13px] border border-dashed border-[#39445C] bg-transparent p-6 transition-[transform,border-color,background-color] duration-200 hover:-translate-y-1 hover:border-[#E8A63E] hover:bg-[#121620] motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${FOCUS}`}
            >
              <div>
                <span
                  aria-hidden="true"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-[10px] border border-[#232A3A] bg-[#0E121B] text-[#E8A63E]"
                >
                  <Sparkles className="h-5 w-5" />
                </span>
                <h3 className="mt-5 text-[1.0625rem] font-semibold tracking-[-0.01em] text-[#F1EFE6]">
                  {t.services.otherTitle}
                </h3>
                <p className="mt-3 text-[0.9375rem] leading-[1.55] text-[#8791A6]">
                  {t.services.otherBody}
                </p>
              </div>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#E8A63E]">
                {t.services.otherCta}
                <ArrowUpRight
                  className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0 motion-reduce:group-hover:translate-y-0"
                  aria-hidden="true"
                />
              </span>
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Method                                                             */
/* ------------------------------------------------------------------ */

function Method() {
  const { t } = useLang();

  return (
    <section id="methode" className={SECTION} aria-labelledby="methode-title">
      <div className={CONTAINER}>
        <SectionHeading
          id="methode-title"
          label={t.method.label}
          title={t.method.title}
          intro={t.method.intro}
        />

        <ol className="mt-12 grid gap-9 lg:mt-16 lg:grid-cols-4 lg:gap-6">
          {t.method.steps.map((step, i) => {
            const isLast = i === t.method.steps.length - 1;
            const n = String(i + 1).padStart(2, "0");
            return (
              <Reveal key={step.title} delay={i * 80} as="li" className="relative pl-12 lg:pl-0">
                {/* Mobile: dot marker plus a rail down to the next step. */}
                {!isLast ? (
                  <span
                    aria-hidden="true"
                    className="fw-draw-y absolute left-[15px] top-9 h-[calc(100%+1rem)] w-px bg-[#232A3A] lg:hidden"
                    style={{ transitionDelay: `${i * 80 + 300}ms` }}
                  />
                ) : null}
                <span
                  aria-hidden="true"
                  className="absolute left-0 top-0 flex h-8 w-8 items-center justify-center rounded-full border border-[#232A3A] bg-[#121620] lg:hidden"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-[#3FDDB0]" />
                </span>

                {/* Desktop: dot marker then a track running to the next step. */}
                <div className="hidden items-center gap-3 lg:flex" aria-hidden="true">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#3FDDB0]" />
                  <span
                    className={`fw-draw-x h-px flex-1 ${
                      isLast ? "bg-gradient-to-r from-[#232A3A] to-transparent" : "bg-[#232A3A]"
                    }`}
                    style={{ transitionDelay: `${i * 80 + 300}ms` }}
                  />
                </div>

                <p className="font-mono text-[1.75rem] font-bold leading-none tracking-[-0.02em] text-[#5D6579] lg:mt-7">
                  {n}
                </p>
                <h3 className="mt-4 text-[1.0625rem] font-semibold leading-snug tracking-[-0.01em] text-[#F1EFE6]">
                  {step.title}
                </h3>
                <p className="mt-3 text-[0.9375rem] leading-[1.55] text-[#8791A6] lg:pr-4">{step.body}</p>
              </Reveal>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Tech stack                                                         */
/* ------------------------------------------------------------------ */

function Stack() {
  const { t } = useLang();

  return (
    <section
      className="relative border-y border-[#232A3A] bg-[#0E121B] py-14 sm:py-16"
      aria-labelledby="stack-title"
    >
      <div className={CONTAINER}>
        <Reveal className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
          <div className="lg:max-w-xs">
            <SectionLabel>{t.stack.label}</SectionLabel>
            <h2
              id="stack-title"
              className="mt-3 text-xl font-bold tracking-[-0.02em] text-[#F1EFE6] sm:text-2xl"
            >
              <SplitWords text={t.stack.title} />
            </h2>
          </div>

          <ul className="flex flex-wrap gap-2.5">
            {STACK.map((tech, i) => (
              <li key={tech} className="fw-pop" style={{ "--i": i }}>
                <span className="inline-flex items-center rounded-[10px] border border-[#232A3A] bg-[#121620] px-3.5 py-2.5 font-mono text-[0.8125rem] text-[#F1EFE6] transition-colors duration-200 hover:border-[#3FDDB0] hover:text-[#3FDDB0] motion-reduce:transition-none">
                  <span className="text-[#7A85A0]" aria-hidden="true">
                    #
                  </span>
                  {tech}
                </span>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Work                                                               */
/* ------------------------------------------------------------------ */

function Projects() {
  const { t } = useLang();

  return (
    <section id="realisations" className={SECTION} aria-labelledby="realisations-title">
      <div className={CONTAINER}>
        <SectionHeading
          id="realisations-title"
          label={t.projects.label}
          title={t.projects.title}
          intro={t.projects.intro}
        />

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:mt-16">
          {t.projects.items.map((project, i) => {
            const meta = PROJECT_META[i];
            // Alternate accents by position, not per project, so order changes
            // and new projects keep the mint / gold rhythm.
            const accent = i % 2 === 0 ? C.mint : C.gold;
            const Icon = meta.icon;
            return (
              <Reveal key={project.title} delay={i * 70} className="h-full">
                <article className={`${CARD} ${CARD_HOVER} flex h-full flex-col overflow-hidden`}>
                  <div className="relative flex h-40 items-center justify-center border-b border-[#232A3A] bg-[#0E121B]">
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 opacity-60"
                      style={{
                        background: `radial-gradient(120% 90% at 50% 0%, ${accent}1F, transparent 70%)`,
                      }}
                    />
                    <Icon
                      aria-hidden="true"
                      className="relative h-10 w-10"
                      style={{ color: accent }}
                    />
                    <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-md border border-[#232A3A] bg-[#0B0E14]/80 px-2 py-1 font-mono text-[0.625rem] uppercase tracking-[0.14em] text-[#8791A6]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#3FDDB0]" aria-hidden="true" />
                      {t.projects.liveBadge}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col p-6">
                    <p className="font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-[#8791A6]">
                      {project.kind}
                    </p>
                    <h3 className="mt-2.5 text-[1.0625rem] font-semibold tracking-[-0.01em] text-[#F1EFE6]">
                      {project.title}
                    </h3>
                    <p className="mt-3 flex-1 text-[0.9375rem] leading-[1.55] text-[#8791A6]">
                      {project.body}
                    </p>
                    <ul className="mt-5 flex flex-wrap gap-2">
                      {project.tags.map((tag) => (
                        <li
                          key={tag}
                          className="rounded-md border border-[#232A3A] px-2.5 py-1 font-mono text-[0.6875rem] text-[#8791A6]"
                        >
                          {tag}
                        </li>
                      ))}
                    </ul>

                    <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-1 border-t border-[#232A3A] pt-4">
                      <a
                        href={meta.live}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`group inline-flex min-h-[44px] items-center gap-1.5 rounded text-sm font-semibold text-[#3FDDB0] transition-colors duration-200 hover:text-[#5CE8C1] motion-reduce:transition-none ${FOCUS}`}
                      >
                        {t.projects.viewSite}
                        <span className="sr-only">{t.projects.srViewSite(project.title)}</span>
                        <ArrowUpRight
                          aria-hidden="true"
                          className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0 motion-reduce:group-hover:translate-y-0"
                        />
                      </a>
                      {meta.repo ? (
                        <a
                          href={meta.repo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex min-h-[44px] items-center gap-1.5 rounded text-sm text-[#8791A6] transition-colors duration-200 hover:text-[#F1EFE6] motion-reduce:transition-none ${FOCUS}`}
                        >
                          <Github className="h-4 w-4" aria-hidden="true" />
                          {t.projects.viewCode}
                          <span className="sr-only">{t.projects.srViewCode(project.title)}</span>
                        </a>
                      ) : null}
                    </div>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Pricing                                                            */
/* ------------------------------------------------------------------ */

function Pricing() {
  const { t } = useLang();

  return (
    <section id="tarifs" className={`${SECTION} bg-[#0E121B]`} aria-labelledby="tarifs-title">
      <div className={CONTAINER}>
        <SectionHeading
          id="tarifs-title"
          label={t.pricing.label}
          title={t.pricing.title}
          intro={t.pricing.intro}
          align="center"
        />

        <div className="mt-12 grid items-start gap-5 lg:mt-16 lg:grid-cols-3">
          {t.pricing.plans.map((plan, i) => {
            const featured = PLAN_FEATURED[i];
            return (
              <Reveal key={plan.name} delay={i * 70} className="h-full">
                <article
                  className={`fw-spot flex h-full flex-col rounded-[13px] border bg-[#121620] p-6 transition-[transform,border-color] duration-200 motion-reduce:transition-none sm:p-7 ${
                    featured
                      ? "border-[#3FDDB0] shadow-[0_0_0_1px_rgba(63,221,176,0.25),0_28px_70px_-40px_rgba(63,221,176,0.55)] lg:-translate-y-2"
                      : `border-[#232A3A] ${CARD_HOVER}`
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-semibold tracking-[-0.01em] text-[#F1EFE6]">
                      {plan.name}
                    </h3>
                    {featured ? (
                      <span className="shrink-0 rounded-full bg-[#3FDDB0] px-2.5 py-1 font-mono text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-[#0B0E14]">
                        {t.pricing.featuredBadge}
                      </span>
                    ) : null}
                  </div>

                  <p className="mt-2 text-sm leading-[1.5] text-[#8791A6]">{plan.tagline}</p>

                  <p className="mt-6 font-mono text-[1.375rem] font-bold min-[360px]:text-2xl tracking-[-0.02em] text-[#E8A63E] sm:text-[1.75rem] lg:text-[1.375rem] xl:text-[1.75rem]">
                    {plan.price}
                  </p>

                  <ul className="mt-6 flex-1 space-y-3 border-t border-[#232A3A] pt-6">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex gap-2.5 text-sm leading-[1.5] text-[#8791A6]">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#3FDDB0]" aria-hidden="true" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {featured ? (
                    <PrimaryLink href="#contact" className="mt-7 w-full">
                      {plan.cta}
                    </PrimaryLink>
                  ) : (
                    <GhostLink href="#contact" className="mt-7 w-full">
                      {plan.cta}
                    </GhostLink>
                  )}
                </article>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={220}>
          <p className="mt-8 text-center font-mono text-[0.8125rem] text-[#8791A6]">
            {t.pricing.note}
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  FAQ                                                                */
/* ------------------------------------------------------------------ */

function Faq() {
  const { t } = useLang();
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section id="faq" className={SECTION} aria-labelledby="faq-title">
      <div className={CONTAINER}>
        <SectionHeading id="faq-title" label={t.faq.label} title={t.faq.title} />

        <div className="mt-10 lg:mt-14">
          <div className="mx-auto max-w-3xl divide-y divide-[#232A3A] border-y border-[#232A3A]">
            {t.faq.items.map((item, i) => {
              const isOpen = openIndex === i;
              return (
                <Reveal key={item.q} delay={i * 50}>
                  <h3>
                    <button
                      type="button"
                      onClick={() => setOpenIndex(isOpen ? null : i)}
                      aria-expanded={isOpen}
                      aria-controls={`faq-panel-${i}`}
                      id={`faq-button-${i}`}
                      className={`flex w-full items-start justify-between gap-5 py-5 text-left transition-colors duration-200 hover:text-[#3FDDB0] motion-reduce:transition-none ${FOCUS}`}
                    >
                      <span className="text-[0.9375rem] font-semibold leading-snug text-[#F1EFE6] sm:text-base">
                        {item.q}
                      </span>
                      <ChevronDown
                        aria-hidden="true"
                        className={`mt-0.5 h-5 w-5 shrink-0 text-[#3FDDB0] transition-transform duration-200 motion-reduce:transition-none ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  </h3>
                  <div
                    id={`faq-panel-${i}`}
                    role="region"
                    aria-labelledby={`faq-button-${i}`}
                    hidden={!isOpen}
                  >
                    <p className="pb-6 pr-8 text-[0.9375rem] leading-[1.55] text-[#8791A6]">
                      {item.a}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Contact                                                            */
/* ------------------------------------------------------------------ */

const EMPTY_FORM = { name: "", email: "", projectType: "", message: "" };
const FIELD_ORDER = ["name", "email", "projectType", "message"];

function validate(values, t) {
  const e = t.contact.errors;
  const errors = {};

  const name = values.name.trim();
  if (!name) errors.name = e.nameRequired;
  else if (name.length < 2) errors.name = e.nameShort;

  const email = values.email.trim();
  if (!email) errors.email = e.emailRequired;
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) errors.email = e.emailInvalid;

  if (!values.projectType) errors.projectType = e.typeRequired;

  const message = values.message.trim();
  if (!message) errors.message = e.messageRequired;
  else if (message.length < 10) errors.message = e.messageShort;

  return errors;
}

function FieldError({ id, children }) {
  if (!children) return null;
  return (
    <p id={id} className="mt-2 flex items-start gap-1.5 text-[0.8125rem] leading-snug text-[#FF9B8A]">
      <AlertCircle className="mt-px h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
}

function Contact() {
  const { lang, t } = useLang();
  const [values, setValues] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  // "idle" | "sending" | "sent" | "mailto" | "error"
  const [status, setStatus] = useState("idle");
  // Honeypot: bots fill hidden fields, humans never see this one.
  const [trap, setTrap] = useState("");
  const fieldRefs = useRef({});
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  // The select's stored value is a translated string, so a language switch
  // would leave it pointing at an option that no longer exists. Carry the
  // choice across by index instead of dropping it.
  const prevLang = useRef(lang);
  useEffect(() => {
    if (prevLang.current === lang) return;
    const from = COPY[prevLang.current].contact.projectTypes;
    const to = t.contact.projectTypes;
    prevLang.current = lang;
    setValues((v) => {
      if (!v.projectType) return v;
      const i = from.indexOf(v.projectType);
      return i === -1 ? { ...v, projectType: "" } : { ...v, projectType: to[i] };
    });
    // Messages are language-specific; re-derive any that are on screen.
    setErrors((prev) => (Object.keys(prev).length ? {} : prev));
  }, [lang, t]);

  const inputClass = (hasError) =>
    `w-full rounded-[10px] border bg-[#0B0E14] px-3.5 py-3 text-[0.9375rem] text-[#F1EFE6] placeholder:text-[#7A85A0] transition-colors duration-200 motion-reduce:transition-none ${FOCUS} ${
      hasError ? "border-[#FF9B8A]" : "border-[#232A3A] hover:border-[#39445C]"
    }`;

  const setField = useCallback((key, value) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const handleSubmit = useCallback(async () => {
    if (status === "sending") return;

    const found = validate(values, t);
    setErrors(found);

    const firstInvalid = FIELD_ORDER.find((key) => found[key]);
    if (firstInvalid) {
      fieldRefs.current[firstInvalid]?.focus();
      return;
    }

    // Silently accept and drop anything that filled the honeypot.
    if (trap) {
      setStatus("sent");
      return;
    }

    const openMailClient = () => {
      const l = t.contact.mailBody;
      const body = [
        `${l.name} : ${values.name.trim()}`,
        `${l.email} : ${values.email.trim()}`,
        `${l.projectType} : ${values.projectType}`,
        "",
        `${l.message} :`,
        values.message.trim(),
      ].join("\n");
      window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
        t.contact.mailSubject(values.projectType)
      )}&body=${encodeURIComponent(body)}`;
      setStatus("mailto");
    };

    setStatus("sending");
    try {
      const response = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name: values.name.trim(),
          email: values.email.trim(),
          projectType: values.projectType,
          message: values.message.trim(),
          locale: lang,
          botcheck: "",
        }),
      });

      if (!mounted.current) return;

      // No function deployed (local `npm run dev`, or a static-only deploy):
      // hand off to the mail client rather than failing.
      if (response.status === 404) {
        openMailClient();
        return;
      }

      const data = await response.json().catch(() => ({}));
      if (!mounted.current) return;
      setStatus(response.ok && data.success ? "sent" : "error");
    } catch {
      // Network failure, offline, or the request was blocked.
      if (mounted.current) setStatus("error");
    }
  }, [values, trap, status, t, lang]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  const reset = () => {
    setValues(EMPTY_FORM);
    setErrors({});
    setTrap("");
    setStatus("idle");
  };

  const emailLink = (className) => (
    <a href={`mailto:${CONTACT_EMAIL}`} className={className}>
      {CONTACT_EMAIL}
    </a>
  );

  return (
    <section id="contact" className={`${SECTION} bg-[#0E121B]`} aria-labelledby="contact-title">
      <div className={CONTAINER}>
        <Reveal>
          <div className="relative overflow-hidden rounded-[14px] border border-[#232A3A] bg-[#121620] p-6 sm:p-10 lg:p-14">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0">
              <div
                className="absolute -top-32 left-1/2 h-[420px] w-[620px] -translate-x-1/2 rounded-full blur-[100px]"
                style={{ background: "radial-gradient(circle, rgba(63,221,176,0.13), transparent 70%)" }}
              />
              <div
                className="absolute -bottom-40 right-[-10%] h-[380px] w-[380px] rounded-full blur-[100px]"
                style={{ background: "radial-gradient(circle, rgba(232,166,62,0.11), transparent 70%)" }}
              />
            </div>

            <div className="relative grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
              <div>
                <SectionLabel>{t.contact.label}</SectionLabel>
                <h2
                  id="contact-title"
                  className="mt-4 text-3xl font-bold tracking-[-0.03em] text-[#F1EFE6] sm:text-4xl lg:text-[2.75rem] lg:leading-[1.08]"
                >
                  <SplitWords text={t.contact.title} />
                </h2>
                <p className="mt-5 max-w-md text-[0.9375rem] leading-[1.55] text-[#8791A6]">
                  {t.contact.intro}
                </p>

                <p className="mt-8 overflow-x-auto whitespace-nowrap rounded-[10px] border border-[#232A3A] bg-[#0B0E14] px-4 py-3.5 font-mono text-[0.8125rem]">
                  <span className="text-[#3FDDB0]" aria-hidden="true">
                    ${" "}
                  </span>
                  <span className="text-[#8791A6]">mail </span>
                  {emailLink(
                    `rounded text-[#F1EFE6] underline decoration-[#39445C] underline-offset-4 transition-colors duration-200 hover:decoration-[#3FDDB0] motion-reduce:transition-none ${FOCUS}`
                  )}
                </p>

                {WHATSAPP_NUMBER ? (
                  <>
                    <p className="mt-6 text-sm leading-[1.55] text-[#8791A6]">
                      {t.contact.whatsappIntro}
                    </p>
                    <a
                      href={whatsappHref(t)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`mt-4 inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[10px] border border-[#232A3A] bg-[#0B0E14] px-5 py-3 text-sm font-semibold text-[#F1EFE6] transition-colors duration-200 hover:border-[#3FDDB0] hover:text-[#3FDDB0] motion-reduce:transition-none ${FOCUS}`}
                    >
                      <MessageCircle className="h-4 w-4 text-[#3FDDB0]" aria-hidden="true" />
                      {t.contact.whatsappCta}
                      <span className="sr-only">{t.newTab}</span>
                    </a>
                  </>
                ) : null}
              </div>

              <div>
                {status === "sent" || status === "mailto" ? (
                  <div
                    className="rounded-[13px] border border-[#3FDDB0]/45 bg-[#0B0E14] p-6"
                    role="status"
                  >
                    <CheckCircle2 className="h-7 w-7 text-[#3FDDB0]" aria-hidden="true" />
                    <h3 className="mt-4 text-lg font-semibold tracking-[-0.01em] text-[#F1EFE6]">
                      {status === "sent" ? t.contact.sentTitle : t.contact.mailtoTitle}
                    </h3>
                    <p className="mt-3 text-[0.9375rem] leading-[1.55] text-[#8791A6]">
                      {status === "sent" ? (
                        t.contact.sentBody
                      ) : (
                        <>
                          {t.contact.mailtoBodyStart}
                          {emailLink(
                            `rounded font-mono text-[#F1EFE6] underline decoration-[#39445C] underline-offset-4 hover:decoration-[#3FDDB0] ${FOCUS}`
                          )}
                          .
                        </>
                      )}
                    </p>
                    <button
                      type="button"
                      onClick={reset}
                      className={`mt-6 inline-flex min-h-[44px] items-center gap-2 rounded-[10px] border border-[#232A3A] px-4 py-2.5 text-sm font-semibold text-[#F1EFE6] transition-colors duration-200 hover:border-[#39445C] motion-reduce:transition-none ${FOCUS}`}
                    >
                      {t.contact.writeAnother}
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-5">
                    <div>
                      <label
                        htmlFor="contact-name"
                        className="mb-2 block font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-[#8791A6]"
                      >
                        {t.contact.labels.name}
                      </label>
                      <input
                        id="contact-name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        ref={(el) => {
                          fieldRefs.current.name = el;
                        }}
                        value={values.name}
                        onChange={(e) => setField("name", e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={t.contact.placeholders.name}
                        aria-invalid={Boolean(errors.name)}
                        aria-describedby={errors.name ? "contact-name-error" : undefined}
                        className={inputClass(Boolean(errors.name))}
                      />
                      <FieldError id="contact-name-error">{errors.name}</FieldError>
                    </div>

                    <div>
                      <label
                        htmlFor="contact-email"
                        className="mb-2 block font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-[#8791A6]"
                      >
                        {t.contact.labels.email}
                      </label>
                      <input
                        id="contact-email"
                        name="email"
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        ref={(el) => {
                          fieldRefs.current.email = el;
                        }}
                        value={values.email}
                        onChange={(e) => setField("email", e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={t.contact.placeholders.email}
                        aria-invalid={Boolean(errors.email)}
                        aria-describedby={errors.email ? "contact-email-error" : undefined}
                        className={inputClass(Boolean(errors.email))}
                      />
                      <FieldError id="contact-email-error">{errors.email}</FieldError>
                    </div>

                    <div>
                      <label
                        htmlFor="contact-type"
                        className="mb-2 block font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-[#8791A6]"
                      >
                        {t.contact.labels.projectType}
                      </label>
                      <div className="relative">
                        <select
                          id="contact-type"
                          name="projectType"
                          ref={(el) => {
                            fieldRefs.current.projectType = el;
                          }}
                          value={values.projectType}
                          onChange={(e) => setField("projectType", e.target.value)}
                          aria-invalid={Boolean(errors.projectType)}
                          aria-describedby={errors.projectType ? "contact-type-error" : undefined}
                          className={`${inputClass(Boolean(errors.projectType))} appearance-none pr-11 ${
                            values.projectType ? "" : "text-[#7A85A0]"
                          }`}
                        >
                          <option value="">{t.contact.placeholders.projectType}</option>
                          {t.contact.projectTypes.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          aria-hidden="true"
                          className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8791A6]"
                        />
                      </div>
                      <FieldError id="contact-type-error">{errors.projectType}</FieldError>
                    </div>

                    <div>
                      <label
                        htmlFor="contact-message"
                        className="mb-2 block font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-[#8791A6]"
                      >
                        {t.contact.labels.message}
                      </label>
                      <textarea
                        id="contact-message"
                        name="message"
                        rows={5}
                        ref={(el) => {
                          fieldRefs.current.message = el;
                        }}
                        value={values.message}
                        onChange={(e) => setField("message", e.target.value)}
                        placeholder={t.contact.placeholders.message}
                        aria-invalid={Boolean(errors.message)}
                        aria-describedby={errors.message ? "contact-message-error" : undefined}
                        className={`${inputClass(Boolean(errors.message))} resize-y leading-[1.55]`}
                      />
                      <FieldError id="contact-message-error">{errors.message}</FieldError>
                    </div>

                    {/*
                      Honeypot. Visually hidden rather than aria-hidden: an
                      aria-hidden field that is still focusable breaks ARIA, so
                      screen readers get a real instruction to skip it instead.
                      Bots fill it; people never do.
                    */}
                    <div className="sr-only">
                      <label htmlFor="contact-botcheck">{t.contact.honeypot}</label>
                      <input
                        id="contact-botcheck"
                        type="text"
                        name="botcheck"
                        tabIndex={-1}
                        autoComplete="off"
                        value={trap}
                        onChange={(e) => setTrap(e.target.value)}
                      />
                    </div>

                    <PrimaryButton
                      onClick={handleSubmit}
                      disabled={status === "sending"}
                      className="w-full disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {status === "sending" ? (
                        <>
                          {t.contact.sending}
                          <Loader2
                            className="h-4 w-4 animate-spin motion-reduce:animate-none"
                            aria-hidden="true"
                          />
                        </>
                      ) : (
                        <>
                          {t.contact.submit}
                          <Send className="h-4 w-4" aria-hidden="true" />
                        </>
                      )}
                    </PrimaryButton>

                    {status === "error" ? (
                      <p
                        role="alert"
                        className="flex items-start gap-2 rounded-[10px] border border-[#FF9B8A]/40 bg-[#0B0E14] px-3.5 py-3 text-[0.8125rem] leading-[1.5] text-[#FF9B8A]"
                      >
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                        <span>
                          {t.contact.failedStart}
                          {emailLink(
                            `rounded font-mono underline decoration-[#FF9B8A]/50 underline-offset-4 hover:decoration-[#FF9B8A] ${FOCUS}`
                          )}
                          .
                        </span>
                      </p>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Footer                                                             */
/* ------------------------------------------------------------------ */

function Footer() {
  const { t } = useLang();

  return (
    <footer
      className="relative z-10 border-t border-[#232A3A] bg-[#0B0E14]"
      aria-labelledby="footer-title"
    >
      <h2 id="footer-title" className="sr-only">
        {t.footer.srTitle}
      </h2>
      <div className={`${CONTAINER} py-12 sm:py-16`}>
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)] lg:gap-12">
          <div>
            <p className="flex items-center gap-2.5">
              <LogoMark className="h-8 w-8 shrink-0" />
              <Wordmark className="text-base" />
            </p>
            <p className="mt-4 max-w-sm text-[0.9375rem] leading-[1.55] text-[#8791A6]">
              {t.footer.pitch}
            </p>
          </div>

          <nav aria-label={t.footerNav}>
            <p className="font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-[#8791A6]">
              {t.footer.navHeading}
            </p>
            <ul className="mt-4 space-y-1">
              {NAV_HREFS.map((href, i) => (
                <li key={href}>
                  <a
                    href={href}
                    className={`inline-flex min-h-[36px] items-center rounded text-[0.9375rem] text-[#F1EFE6] transition-colors duration-200 hover:text-[#3FDDB0] motion-reduce:transition-none ${FOCUS}`}
                  >
                    {t.nav[i]}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-[#8791A6]">
              {t.footer.writeHeading}
            </p>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className={`mt-4 inline-flex min-h-[44px] items-center gap-2 rounded font-mono text-[0.875rem] text-[#F1EFE6] transition-colors duration-200 hover:text-[#3FDDB0] motion-reduce:transition-none ${FOCUS}`}
            >
              <Mail className="h-4 w-4 shrink-0 text-[#3FDDB0]" aria-hidden="true" />
              <span className="break-all">{CONTACT_EMAIL}</span>
            </a>
          </div>
        </div>

        <div className="mt-12 border-t border-[#232A3A] pt-6">
          <p className="font-mono text-[0.75rem] text-[#8791A6]">{t.footer.copyright}</p>
        </div>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function ForgeWeb() {
  // French first: the primary audience is francophone.
  const [lang, setLang] = useState("fr");
  const t = COPY[lang];
  const value = useMemo(() => ({ lang, setLang, t }), [lang, t]);

  // Keep the document language in sync so screen readers switch voice and
  // browsers offer the right translation prompts.
  useEffect(() => {
    document.documentElement.lang = t.htmlLang;
  }, [t.htmlLang]);

  return (
    <LangContext.Provider value={value}>
      <div
        className="fw-root min-h-screen bg-[#0B0E14] text-[#F1EFE6] antialiased"
        onPointerMove={trackSpotlight}
      >
        <style>{`
          .fw-root {
            font-family: "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI",
              Roboto, "Helvetica Neue", Arial, sans-serif;
            font-feature-settings: "kern" 1;
          }
          .fw-root .font-mono,
          .fw-root code,
          .fw-root pre {
            font-family: ui-monospace, "SF Mono", "JetBrains Mono", "Fira Code",
              "Cascadia Mono", Menlo, Consolas, "Liberation Mono", monospace;
          }

          html { scroll-behavior: smooth; }
          /* Sticky header is 64px tall; keep anchored sections clear of it. */
          .fw-root [id] { scroll-margin-top: 5.5rem; }

          /* Faint dot texture over the whole page. */
          .fw-dots {
            position: fixed;
            inset: 0;
            z-index: 0;
            pointer-events: none;
            background-image: radial-gradient(rgba(93, 101, 121, 0.30) 1px, transparent 1px);
            background-size: 34px 34px;
            mask-image: radial-gradient(120% 100% at 50% 0%, #000 25%, transparent 85%);
            -webkit-mask-image: radial-gradient(120% 100% at 50% 0%, #000 25%, transparent 85%);
          }

          .fw-root, .fw-intro { --fw-ease: cubic-bezier(0.16, 1, 0.3, 1); }

          /* ---- Below the hero: calm scroll reveals ---- */
          .fw-reveal {
            opacity: 0;
            transform: translateY(24px);
            transition: opacity 700ms var(--fw-ease), transform 900ms var(--fw-ease);
            will-change: opacity, transform;
          }
          .fw-reveal-in { opacity: 1; transform: none; }

          /* Heading words rise out of a mask. */
          .fw-wmask {
            display: inline-block;
            overflow: hidden;
            vertical-align: top;
            padding-bottom: 0.12em;
            margin-bottom: -0.12em;
          }
          .fw-word-in {
            display: inline-block;
            transform: translateY(110%);
            transition: transform 1000ms var(--fw-ease);
            transition-delay: calc(80ms + var(--i) * 45ms);
          }
          .fw-reveal-in .fw-word-in { transform: none; }

          /* Method: the track draws between steps. */
          .fw-draw-x, .fw-draw-y { transition: transform 1100ms var(--fw-ease); }
          .fw-draw-x { transform: scaleX(0); transform-origin: left center; }
          .fw-draw-y { transform: scaleY(0); transform-origin: center top; }
          .fw-reveal-in .fw-draw-x, .fw-reveal-in .fw-draw-y { transform: none; }

          /* Stack chips pop in one after another. */
          .fw-pop {
            opacity: 0;
            transform: translateY(10px) scale(0.9);
            transition: opacity 500ms ease, transform 700ms cubic-bezier(0.34, 1.56, 0.64, 1);
            transition-delay: calc(200ms + var(--i) * 45ms);
          }
          .fw-reveal-in .fw-pop { opacity: 1; transform: none; }

          /* Cards: a soft light follows the mouse. */
          .fw-spot { position: relative; }
          .fw-spot::after {
            content: "";
            position: absolute;
            inset: 0;
            border-radius: inherit;
            pointer-events: none;
            opacity: 0;
            transition: opacity 300ms ease;
            background: radial-gradient(380px circle at var(--mx, 50%) var(--my, 50%), rgba(63, 221, 176, 0.09), transparent 60%);
          }
          .fw-spot:hover::after { opacity: 1; }

          /* Primary buttons: a light sweep on hover. */
          .fw-shine { position: relative; overflow: hidden; }
          .fw-shine::after {
            content: "";
            position: absolute;
            inset: 0;
            pointer-events: none;
            transform: translateX(-120%) skewX(-20deg);
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.55), transparent);
          }
          .fw-shine:hover::after { transform: translateX(120%) skewX(-20deg); transition: transform 700ms var(--fw-ease); }

          /* ---- Hero: the cinematic part ---- */
          .fw-hero[data-stage="intro"] .fw-h,
          .fw-hero[data-stage="intro"] .fw-forge-char { opacity: 0; }
          .fw-hero[data-stage="enter"] .fw-h {
            animation-duration: 600ms;
            animation-timing-function: var(--fw-ease);
            animation-fill-mode: both;
            animation-delay: var(--d, 0ms);
          }
          .fw-hero[data-stage="enter"] .fw-h-down { animation-name: fw-down; }
          .fw-hero[data-stage="enter"] .fw-h-up { animation-name: fw-up; }
          .fw-hero[data-stage="enter"] .fw-h-wipe {
            animation-name: fw-wipe;
            animation-duration: 650ms;
            animation-timing-function: cubic-bezier(0.65, 0, 0.35, 1);
          }
          .fw-hero[data-stage="enter"] .fw-h-pop {
            animation-name: fw-pop;
            animation-duration: 450ms;
            animation-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1);
          }
          .fw-hero[data-stage="enter"] .fw-h-flip { animation-name: fw-flip; animation-duration: 900ms; }
          @keyframes fw-down { from { opacity: 0; transform: translateY(-18px); } to { opacity: 1; transform: none; } }
          @keyframes fw-up { from { opacity: 0; transform: translateY(28px); } to { opacity: 1; transform: none; } }
          @keyframes fw-wipe { from { clip-path: inset(0 100% 0 0); } to { clip-path: inset(0 0 0 0); } }
          @keyframes fw-pop { from { opacity: 0; transform: scale(0.85) translateY(10px); } to { opacity: 1; transform: none; } }
          @keyframes fw-flip {
            from { opacity: 0; transform: perspective(1200px) translateX(80px) rotateY(-32deg) rotateX(8deg) scale(0.9); }
            to { opacity: 1; transform: none; }
          }

          /* Title letters land hot and cool down. */
          .fw-forge-word { display: inline-block; white-space: nowrap; perspective: 600px; }
          .fw-forge-char { display: inline-block; transform-origin: 50% 100%; }
          .fw-hero[data-stage="enter"] .fw-forge-char {
            animation: fw-forge 1000ms var(--fw-ease) both;
            animation-delay: calc(40ms + var(--i) * 9ms);
          }
          @keyframes fw-forge {
            0% { opacity: 0; transform: translateY(0.7em) rotateX(-95deg) scale(1.15); color: #E8A63E; text-shadow: 0 0 0 rgba(232, 166, 62, 0); }
            30% { opacity: 1; transform: none; color: rgb(255, 210, 122); text-shadow: 0 0 22px rgba(232, 166, 62, 0.9), 0 0 4px rgba(255, 210, 122, 0.9); }
            100% { opacity: 1; transform: none; color: #F1EFE6; text-shadow: 0 0 0 rgba(232, 166, 62, 0); }
          }

          .fw-hero .fw-shine:hover { box-shadow: 0 10px 40px -8px rgba(63, 221, 176, 0.7); }

          /* iPhone mockup (hero). 1cqw = 1% of the phone's width. */
          .fw-phone-wrap { container-type: inline-size; }
          .fw-phone {
            position: relative;
            aspect-ratio: 71.6 / 146.6;
            padding: 3.4cqw;
            border-radius: 15cqw;
            background: linear-gradient(145deg, #3A3F48 0%, #1B1E24 34%, #2B2F37 66%, #121418 100%);
            box-shadow:
              inset 0 0 0 0.55cqw #0A0B0E,
              inset 0 0 0 0.9cqw rgba(255, 255, 255, 0.05),
              0 0 0 1px rgba(255, 255, 255, 0.07),
              0 40px 80px -30px rgba(0, 0, 0, 0.9),
              0 0 70px -14px rgba(63, 221, 176, 0.2);
          }
          .fw-phone-btn { position: absolute; width: 1cqw; border-radius: 1cqw; background: #2B2F37; }
          .fw-phone-btn.is-action { left: -0.8cqw; top: 19%; height: 6%; }
          .fw-phone-btn.is-vol-up { left: -0.8cqw; top: 28%; height: 10%; }
          .fw-phone-btn.is-vol-down { left: -0.8cqw; top: 40%; height: 10%; }
          .fw-phone-btn.is-power { right: -0.8cqw; top: 31%; height: 15%; }
          .fw-phone-screen {
            position: relative;
            height: 100%;
            overflow: hidden;
            border-radius: 11.6cqw;
            background: var(--screen, #FBF7F1);
            transition: background-color 0.7s ease;
          }
          .fw-phone-site {
            position: absolute;
            top: 12.5cqw;
            left: 0;
            width: 100%;
            height: auto;
            opacity: 0;
            transition: opacity 0.7s ease;
          }
          /* Only the site on screen plays its tour, once; its end hands over to the next site. */
          .fw-phone-site.is-active {
            opacity: 1;
            animation: var(--tour) var(--dur) ease-in-out both;
          }
          .fw-phone-shot { display: block; width: 100%; height: auto; }
          .fw-phone-strip {
            position: absolute;
            left: 0;
            max-width: none;
            height: auto;
          }
          .fw-phone-site.is-active .fw-phone-strip { animation: fw-swipe var(--dur) ease-in-out both; }
          /* Kanko: rest on the landing view, glide down to the product grid, rest, glide back. */
          @keyframes fw-tour-kanko {
            0%, 12% { transform: translateY(0); }
            42%, 70% { transform: translateY(-205cqw); }
            92%, 100% { transform: translateY(0); }
          }
          /* Aureva: down to the destination arches, hold while they swipe (fw-swipe),
             down to the destination list, rest there with the island, glide back up. */
          @keyframes fw-tour-aureva {
            0%, 7% { transform: translateY(0); }
            20%, 33% { transform: translateY(-168cqw); }
            46%, 76% { transform: translateY(-361.4cqw); }
            93%, 100% { transform: translateY(0); }
          }
          /* Timed against fw-tour-aureva: swipe while the arches are in view, and reset
             only once the screen has scrolled past them, so the jump is never seen. */
          @keyframes fw-swipe {
            0%, 23% { transform: translateX(0); }
            30%, 60% { transform: translateX(var(--shift)); }
            60.5%, 100% { transform: translateX(0); }
          }
          .fw-phone-wrap:has(:focus-visible) :is(.fw-phone-site, .fw-phone-strip, .fw-island, .fw-island-content) {
            animation-play-state: paused;
          }
          .fw-phone-status {
            position: absolute;
            inset: 0 0 auto 0;
            z-index: 1;
            height: 12.5cqw;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 1.6cqw 8.5cqw 0 10cqw;
            background: var(--screen, #FBF7F1);
            transition: background-color 0.7s ease;
            color: #111111;
            font: 600 4cqw/1 ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
          }
          .fw-phone-icons { display: flex; align-items: center; gap: 1.4cqw; }
          .fw-phone-icons svg { height: 2.9cqw; width: auto; fill: currentColor; }
          .fw-island {
            position: absolute;
            top: 2.9cqw;
            left: 50%;
            z-index: 2;
            width: 30cqw;
            height: 8.8cqw;
            border-radius: 4.4cqw;
            background: #000000;
            transform: translateX(-50%);
            overflow: hidden;
            animation: fw-island var(--dur, 16s) cubic-bezier(0.32, 0.72, 0, 1) both;
          }
          /* While the screen rests on its last view, a live activity ("commande envoyée"…). Runs on the tour's clock. */
          @keyframes fw-island {
            0%, 50% { width: 30cqw; height: 8.8cqw; border-radius: 4.4cqw; }
            54%, 63% { width: 84cqw; height: 15.5cqw; border-radius: 7.75cqw; }
            67%, 100% { width: 30cqw; height: 8.8cqw; border-radius: 4.4cqw; }
          }
          .fw-island-content {
            position: absolute;
            left: 50%;
            top: 50%;
            width: 84cqw;
            display: flex;
            align-items: center;
            gap: 2.8cqw;
            padding: 0 3.4cqw;
            transform: translate(-50%, -50%);
            opacity: 0;
            animation: fw-island-content var(--dur, 16s) ease both;
          }
          @keyframes fw-island-content {
            0%, 52% { opacity: 0; }
            55%, 62% { opacity: 1; }
            64%, 100% { opacity: 0; }
          }
          .fw-island-icon {
            display: flex;
            flex: none;
            align-items: center;
            justify-content: center;
            width: 9cqw;
            height: 9cqw;
            border-radius: 50%;
            background: #3FDDB0;
            color: #0B0E14;
          }
          .fw-island-text { display: flex; flex: 1; flex-direction: column; gap: 0.6cqw; min-width: 0; }
          .fw-island-title { color: #F1EFE6; font: 600 3.4cqw/1.1 ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif; }
          .fw-island-sub { color: #8791A6; font: 500 2.7cqw/1.1 ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif; }
          .fw-island-check { flex: none; width: 4.8cqw; height: 4.8cqw; color: #3FDDB0; }
          .fw-phone-home {
            position: absolute;
            bottom: 1.6cqw;
            left: 50%;
            z-index: 1;
            width: 33cqw;
            height: 1.25cqw;
            border-radius: 1cqw;
            background: rgba(17, 17, 17, 0.85);
            transform: translateX(-50%);
          }

          /* Intro overlay. */
          .fw-intro { position: fixed; inset: 0; z-index: 100; cursor: pointer; }
          .fw-intro-word, .fw-intro-skip {
            font-family: ui-monospace, "SF Mono", "JetBrains Mono", "Fira Code",
              "Cascadia Mono", Menlo, Consolas, "Liberation Mono", monospace;
          }
          .fw-intro-half {
            position: absolute;
            left: 0;
            right: 0;
            height: 50.5%;
            background: #0B0E14;
            transition: transform 650ms cubic-bezier(0.76, 0, 0.24, 1);
          }
          .fw-intro-half.is-top { top: 0; }
          .fw-intro-half.is-bot { bottom: 0; }
          .fw-intro.is-open .fw-intro-half.is-top { transform: translateY(-100%); }
          .fw-intro.is-open .fw-intro-half.is-bot { transform: translateY(100%); }
          .fw-intro-seam {
            position: absolute;
            left: 0;
            right: 0;
            top: 50%;
            height: 2px;
            margin-top: -1px;
            background: linear-gradient(90deg, transparent, #3FDDB0, #E8A63E, #3FDDB0, transparent);
            box-shadow: 0 0 24px rgba(63, 221, 176, 0.8);
            transform: scaleX(0);
            opacity: 0;
          }
          .fw-intro.is-seam .fw-intro-seam { transition: transform 300ms var(--fw-ease), opacity 140ms; transform: scaleX(1); opacity: 1; }
          .fw-intro.is-open .fw-intro-seam { transition: opacity 320ms 120ms; opacity: 0; }
          .fw-intro-core {
            position: absolute;
            inset: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 22px;
            transition: opacity 250ms ease, transform 550ms var(--fw-ease);
          }
          .fw-intro.is-seam .fw-intro-core { opacity: 0; transform: scale(1.15); }
          .fw-intro-anvil { position: relative; width: 132px; height: 132px; }
          .fw-anvil-body {
            transform-box: fill-box;
            transform-origin: 50% 100%;
            animation: fw-anvil-in 360ms var(--fw-ease) both, fw-anvil-hit 200ms ease-out 430ms both;
          }
          .fw-anvil-cursor { animation: fw-cursor-drop 230ms cubic-bezier(0.55, 0, 1, 0.45) 200ms both; }
          @keyframes fw-anvil-in { from { opacity: 0; transform: translateY(14px) scale(0.92); } to { opacity: 1; transform: none; } }
          @keyframes fw-anvil-hit { 0% { transform: none; } 35% { transform: translateY(1.2px) scaleY(0.94) scaleX(1.03); } 100% { transform: none; } }
          @keyframes fw-cursor-drop { 0% { opacity: 0; transform: translateY(-26px); } 20% { opacity: 1; } 100% { opacity: 1; transform: none; } }
          .fw-intro-flash {
            position: absolute;
            left: 50%;
            top: 38.75%;
            width: 260px;
            height: 260px;
            margin: -130px 0 0 -130px;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(255, 214, 140, 0.55), rgba(232, 166, 62, 0.15) 40%, transparent 70%);
            opacity: 0;
          }
          .fw-intro.is-hit .fw-intro-flash { animation: fw-flash 450ms ease-out both; }
          @keyframes fw-flash { 0% { opacity: 0; transform: scale(0.3); } 15% { opacity: 1; } 100% { opacity: 0; transform: scale(1.6); } }
          .fw-intro-sparks { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
          .fw-intro-word {
            font-weight: 700;
            font-size: 1.375rem;
            letter-spacing: 0.32em;
            margin-right: -0.32em;
            color: #F1EFE6;
          }
          .fw-intro-word span { display: inline-block; opacity: 0; }
          .fw-intro.is-hit .fw-intro-word span {
            animation: fw-stamp 300ms var(--fw-ease) both;
            animation-delay: calc(40ms + var(--i) * 26ms);
          }
          @keyframes fw-stamp {
            from { opacity: 0; transform: translateY(12px) scale(1.4); filter: blur(4px); }
            to { opacity: 1; transform: none; filter: none; }
          }
          .fw-intro-skip {
            position: absolute;
            bottom: 28px;
            left: 0;
            right: 0;
            text-align: center;
            font-size: 11px;
            letter-spacing: 0.2em;
            text-transform: uppercase;
            color: #5D6579;
          }
          .fw-intro.is-seam .fw-intro-skip { opacity: 0; }


          .fw-ping { animation: fw-ping-kf 1.9s cubic-bezier(0, 0, 0.2, 1) infinite; }
          @keyframes fw-ping-kf {
            0% { transform: scale(1); opacity: 0.7; }
            75%, 100% { transform: scale(2.4); opacity: 0; }
          }

          .fw-root select option { background-color: #121620; color: #F1EFE6; }

          @media (prefers-reduced-motion: reduce) {
            html { scroll-behavior: auto; }
            .fw-reveal { opacity: 1; transform: none; transition: none; }
            .fw-word-in, .fw-draw-x, .fw-draw-y, .fw-pop { opacity: 1; transform: none; transition: none; }
            .fw-shine::after, .fw-spot::after { display: none; }
            .fw-ping { animation: none; }
            .fw-phone-site.is-active, .fw-phone-site.is-active .fw-phone-strip, .fw-island, .fw-island-content { animation: none; }
            .fw-phone-screen, .fw-phone-status, .fw-phone-site { transition: none; }
            .fw-ping { opacity: 0; }
          }
        `}</style>

        <div className="fw-dots" aria-hidden="true" />

        <a
          href="#main-content"
          className={`sr-only rounded-[10px] bg-[#3FDDB0] px-4 py-2 text-sm font-semibold text-[#0B0E14] focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] ${FOCUS}`}
        >
          {t.skipToContent}
        </a>

        <ScrollProgress />
        <Header />

        <main id="main-content" className="relative z-10 overflow-x-clip">
          <Hero />
          <Services />
          <Method />
          <Stack />
          <Projects />
          <Pricing />
          <Faq />
          <Contact />
        </main>

        <Footer />
        <WhatsAppFab />
      </div>
    </LangContext.Provider>
  );
}
