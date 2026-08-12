import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
  MonitorSmartphone,
  Send,
  Share2,
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
  text: "#F1EFE6",
  muted: "#8791A6",
  gold: "#E8A63E",
  mint: "#3FDDB0",
};

const CONTACT_EMAIL = "forgeweb.ml@gmail.com";

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
  "rounded-[13px] border border-[#232A3A] bg-[#121620] transition-[transform,border-color] duration-200 motion-reduce:transition-none";
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
    icon: Share2,
    live: "https://strand-silk.vercel.app",
    repo: "https://github.com/Deadsunx/strand",
    accent: C.mint,
  },
  {
    icon: MonitorSmartphone,
    live: "https://oumar-tirera.vercel.app",
    repo: "https://github.com/Deadsunx/portfolio",
    accent: C.gold,
  },
  {
    icon: CalendarClock,
    live: "https://daily-ephemeris.vercel.app",
    repo: "https://github.com/Deadsunx/daily-ephemeris",
    accent: C.mint,
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
    },

    // Rendered in the hero code window. `service` and the boolean key change
    // per language; the stack values are proper nouns and stay put.
    code: { serviceKey: "service", serviceValue: "Développement Web Full-Stack", availableKey: "disponible" },

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
        "Trois projets que nous avons développés et mis en ligne. Chacun est consultable et son code est public — vous pouvez vérifier le travail avant de nous confier le vôtre.",
      liveBadge: "En ligne",
      viewSite: "Voir le site",
      viewCode: "Code",
      srViewSite: (title) => ` — ${title}, nouvel onglet`,
      srViewCode: (title) => ` source de ${title}, nouvel onglet`,
      items: [
        {
          kind: "Application web",
          title: "Strand — partage de fichiers",
          tags: ["TypeScript", "WebRTC", "Chiffrement E2E"],
          body: "Transfert de fichiers directement d’un navigateur à l’autre, sans passer par un serveur : aucune limite de taille et chiffrement de bout en bout.",
        },
        {
          kind: "Site vitrine",
          title: "Portfolio personnel",
          tags: ["React.js", "Vite", "Tailwind CSS"],
          body: "Site vitrine une page, avec animations au défilement et identité visuelle sur-mesure. Pensé d’abord pour le mobile, jusqu’au grand écran.",
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
          price: "Sur devis",
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
          a: "Oui. L’ensemble du projet peut se faire à distance : échanges par WhatsApp, e-mail ou visioconférence, avec un point d’avancement à chaque étape. Une rencontre sur place reste possible selon votre situation.",
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
    },

    code: { serviceKey: "service", serviceValue: "Full-Stack Web Development", availableKey: "available" },

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
        "Three projects we built and shipped. Each one is live and its code is public — you can check the work before trusting us with yours.",
      liveBadge: "Live",
      viewSite: "View site",
      viewCode: "Code",
      srViewSite: (title) => ` — ${title}, new tab`,
      srViewCode: (title) => ` source for ${title}, new tab`,
      items: [
        {
          kind: "Web application",
          title: "Strand — file sharing",
          tags: ["TypeScript", "WebRTC", "E2E encryption"],
          body: "Files move straight from one browser to another with no server in between: no size limit, and end-to-end encryption.",
        },
        {
          kind: "Brochure site",
          title: "Personal portfolio",
          tags: ["React.js", "Vite", "Tailwind CSS"],
          body: "One-page site with scroll animations and a custom visual identity. Built mobile-first, all the way up to large screens.",
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
          price: "On request",
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
          a: "Yes. The whole project can run remotely: WhatsApp, email or video call, with a progress check at every stage. Meeting in person is still possible depending on where you are.",
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
/*  Hero code window                                                   */
/* ------------------------------------------------------------------ */

const TOKEN_COLOR = {
  kw: C.gold,
  bool: C.gold,
  id: C.text,
  key: C.mint,
  str: C.text,
  op: C.muted,
  punc: C.muted,
};

function buildCode(t) {
  const lines = [
    [
      ["const ", "kw"],
      ["forgeweb", "id"],
      [" = ", "op"],
      ["{", "punc"],
    ],
    [
      [`  ${t.code.serviceKey}`, "key"],
      [": ", "op"],
      [`"${t.code.serviceValue}"`, "str"],
      [",", "punc"],
    ],
    [
      ["  stack", "key"],
      [": ", "op"],
      ["[", "punc"],
      ['"React.js"', "str"],
      [", ", "punc"],
      ['"TypeScript"', "str"],
      [", ", "punc"],
      ['"SQL"', "str"],
      ["]", "punc"],
      [",", "punc"],
    ],
    [
      [`  ${t.code.availableKey}`, "key"],
      [": ", "op"],
      ["true", "bool"],
      [",", "punc"],
    ],
    [["};", "punc"]],
  ];

  // Character offset at which each line starts; the newline counts as one
  // char so the caret pauses at the end of a line before dropping down.
  const starts = [];
  let n = 0;
  for (const line of lines) {
    starts.push(n);
    n += line.reduce((sum, [text]) => sum + text.length, 0) + 1;
  }
  return { lines, starts, length: n };
}

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

/* ------------------------------------------------------------------ */
/*  Small presentational pieces                                        */
/* ------------------------------------------------------------------ */

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
          {title}
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
      className={`inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[10px] bg-[#3FDDB0] px-5 py-3 text-sm font-semibold text-[#0B0E14] transition-colors duration-200 hover:bg-[#5CE8C1] motion-reduce:transition-none ${FOCUS} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

function PrimaryLink({ children, className = "", ...rest }) {
  return (
    <a
      className={`inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[10px] bg-[#3FDDB0] px-5 py-3 text-center text-sm font-semibold text-[#0B0E14] transition-colors duration-200 hover:bg-[#5CE8C1] motion-reduce:transition-none ${FOCUS} ${className}`}
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
          className={`-ml-1 inline-flex min-h-[44px] shrink-0 items-center rounded-md px-1 font-mono text-base font-bold tracking-[0.18em] text-[#F1EFE6] ${FOCUS}`}
        >
          FORGE<span className="text-[#3FDDB0]">WEB</span>
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

/* ------------------------------------------------------------------ */
/*  Hero                                                               */
/* ------------------------------------------------------------------ */

function CodeWindow() {
  const { lang, t } = useLang();
  const code = useMemo(() => buildCode(t), [t]);
  const [typed, setTyped] = useState(() => (prefersReducedMotion() ? code.length : 0));
  const firstRun = useRef(true);

  // Type out on first mount only. Switching language swaps the text in fully
  // formed — re-running the animation would just delay reading it.
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return undefined;
    }
    setTyped(code.length);
    return undefined;
  }, [lang, code.length]);

  useEffect(() => {
    if (typed >= code.length) return undefined;
    const id = window.setInterval(() => {
      setTyped((prev) => {
        if (prev >= code.length) {
          window.clearInterval(id);
          return prev;
        }
        return prev + 1;
      });
    }, 22);
    return () => window.clearInterval(id);
    // Starts once; the interval clears itself when the text is complete.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const done = typed >= code.length;
  const activeLine = useMemo(() => {
    if (done) return code.lines.length - 1;
    for (let i = code.lines.length - 1; i >= 0; i -= 1) {
      if (typed >= code.starts[i]) return i;
    }
    return 0;
  }, [typed, done, code]);

  return (
    <div className="overflow-hidden rounded-[13px] border border-[#232A3A] bg-[#0E121B] shadow-[0_24px_60px_-24px_rgba(0,0,0,0.9)]">
      <div className="flex items-center gap-3 border-b border-[#232A3A] bg-[#121620] px-4 py-3">
        <div className="flex items-center gap-1.5" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
        </div>
        <span className="font-mono text-xs text-[#8791A6]">forgeweb.js</span>
      </div>

      <div className="overflow-x-auto px-4 py-5 sm:px-5">
        <pre className="font-mono text-[0.75rem] leading-[1.9] sm:text-[0.8125rem]">
          <code>
            {code.lines.map((line, lineIndex) => {
              let cursor = code.starts[lineIndex];
              return (
                <div key={lineIndex} className="flex whitespace-pre">
                  <span
                    aria-hidden="true"
                    className="mr-4 hidden w-4 shrink-0 select-none text-right text-[#7A85A0] sm:inline-block"
                  >
                    {lineIndex + 1}
                  </span>
                  <span>
                    {line.map(([text, kind], tokenIndex) => {
                      const start = cursor;
                      cursor += text.length;
                      const visible = Math.max(0, Math.min(text.length, typed - start));
                      if (visible === 0) return null;
                      return (
                        <span key={tokenIndex} style={{ color: TOKEN_COLOR[kind] }}>
                          {text.slice(0, visible)}
                        </span>
                      );
                    })}
                    {lineIndex === activeLine ? (
                      <span
                        aria-hidden="true"
                        className={`fw-caret ${done ? "fw-caret-blink" : ""}`}
                      />
                    ) : null}
                  </span>
                </div>
              );
            })}
          </code>
        </pre>
      </div>
    </div>
  );
}

function Hero() {
  const { t } = useLang();

  return (
    <section
      id="top"
      className="relative flex min-h-[100svh] items-center overflow-hidden pb-20 pt-28 sm:pb-24 sm:pt-32 lg:pb-24 lg:pt-28"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute -top-40 left-[-15%] h-[520px] w-[520px] rounded-full opacity-70 blur-[110px]"
          style={{ background: "radial-gradient(circle, rgba(232,166,62,0.16), transparent 68%)" }}
        />
        <div
          className="absolute -top-24 right-[-20%] h-[560px] w-[560px] rounded-full opacity-70 blur-[120px]"
          style={{ background: "radial-gradient(circle, rgba(63,221,176,0.14), transparent 68%)" }}
        />
      </div>

      <div className={`${CONTAINER} w-full`}>
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-14">
          <div>
            <Reveal>
              <p className="inline-flex items-center gap-2.5 rounded-full border border-[#232A3A] bg-[#121620] px-3.5 py-2">
                <span className="relative flex h-2 w-2 shrink-0" aria-hidden="true">
                  <span className="fw-ping absolute inline-flex h-full w-full rounded-full bg-[#3FDDB0] opacity-70" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#3FDDB0]" />
                </span>
                <span className="font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-[#8791A6]">
                  {t.hero.badge}
                </span>
              </p>
            </Reveal>

            <Reveal delay={60}>
              <h1 className="mt-7 text-[2.125rem] font-extrabold leading-[1.05] tracking-[-0.035em] text-[#F1EFE6] sm:text-[3.25rem] lg:text-[4rem]">
                {t.hero.title}
              </h1>
            </Reveal>

            <Reveal delay={120}>
              <p className="mt-5 font-mono text-sm tracking-[0.02em] text-[#E8A63E] sm:text-[0.9375rem]">
                {t.hero.subtitle}
              </p>
            </Reveal>

            <Reveal delay={180}>
              <p className="mt-5 max-w-xl text-[0.9375rem] leading-[1.55] text-[#8791A6] sm:text-[1.0625rem]">
                {t.hero.body}
              </p>
            </Reveal>

            <Reveal delay={240}>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <PrimaryLink href="#contact">
                  {t.hero.primaryCta}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </PrimaryLink>
                <GhostLink href="#services">{t.hero.secondaryCta}</GhostLink>
              </div>
            </Reveal>
          </div>

          <Reveal delay={200} className="lg:pl-2">
            <CodeWindow />
          </Reveal>
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
                    className="absolute left-[15px] top-9 h-[calc(100%+1rem)] w-px bg-[#232A3A] lg:hidden"
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
                    className={`h-px flex-1 ${
                      isLast ? "bg-gradient-to-r from-[#232A3A] to-transparent" : "bg-[#232A3A]"
                    }`}
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
              {t.stack.title}
            </h2>
          </div>

          <ul className="flex flex-wrap gap-2.5">
            {STACK.map((tech) => (
              <li key={tech}>
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

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3">
          {t.projects.items.map((project, i) => {
            const meta = PROJECT_META[i];
            const Icon = meta.icon;
            return (
              <Reveal key={project.title} delay={i * 70} className="h-full">
                <article className={`${CARD} ${CARD_HOVER} flex h-full flex-col overflow-hidden`}>
                  <div className="relative flex h-40 items-center justify-center border-b border-[#232A3A] bg-[#0E121B]">
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 opacity-60"
                      style={{
                        background: `radial-gradient(120% 90% at 50% 0%, ${meta.accent}1F, transparent 70%)`,
                      }}
                    />
                    <Icon
                      aria-hidden="true"
                      className="relative h-10 w-10"
                      style={{ color: meta.accent }}
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
                  className={`flex h-full flex-col rounded-[13px] border bg-[#121620] p-6 transition-[transform,border-color] duration-200 motion-reduce:transition-none sm:p-7 ${
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

                  <p className="mt-6 font-mono text-2xl font-bold tracking-[-0.02em] text-[#E8A63E] sm:text-[1.75rem]">
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
                  {t.contact.title}
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
                      href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                        t.contact.whatsappMessage
                      )}`}
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
            <p className="font-mono text-base font-bold tracking-[0.18em] text-[#F1EFE6]">
              FORGE<span className="text-[#3FDDB0]">WEB</span>
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
      <div className="fw-root min-h-screen bg-[#0B0E14] text-[#F1EFE6] antialiased">
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

          .fw-reveal {
            opacity: 0;
            transform: translateY(14px);
            transition: opacity 300ms ease-out, transform 300ms ease-out;
            will-change: opacity, transform;
          }
          .fw-reveal-in { opacity: 1; transform: none; }

          .fw-caret {
            display: inline-block;
            width: 0.55em;
            height: 1.05em;
            margin-left: 1px;
            vertical-align: text-bottom;
            background-color: #3FDDB0;
          }
          .fw-caret-blink { animation: fw-blink 1.05s steps(1, end) infinite; }
          @keyframes fw-blink { 0%, 50% { opacity: 1; } 50.01%, 100% { opacity: 0; } }

          .fw-ping { animation: fw-ping-kf 1.9s cubic-bezier(0, 0, 0.2, 1) infinite; }
          @keyframes fw-ping-kf {
            0% { transform: scale(1); opacity: 0.7; }
            75%, 100% { transform: scale(2.4); opacity: 0; }
          }

          .fw-root select option { background-color: #121620; color: #F1EFE6; }

          @media (prefers-reduced-motion: reduce) {
            html { scroll-behavior: auto; }
            .fw-reveal { opacity: 1; transform: none; transition: none; }
            .fw-caret-blink, .fw-ping { animation: none; }
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
      </div>
    </LangContext.Provider>
  );
}
