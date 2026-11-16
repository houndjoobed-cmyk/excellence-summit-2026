import type { Locale } from "@/data/event";

export interface Dictionary {
  meta: {
    homeTitle: string;
    speakersTitle: string;
    badgeTitle: string;
    dashboardTitle: string;
    loginTitle: string;
  };
  nav: {
    home: string;
    programme: string;
    speakers: string;
    register: string;
    badge: string;
    dashboard: string;
    openMenu: string;
    closeMenu: string;
    switchLang: string;
  };
  hero: {
    kicker: string;
    title: string;
    themePrefix: string;
    themeQuote: string;
    subtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
    ctaBadge: string;
    datePill: string;
    venuePill: string;
    scrollCue: string;
  };
  facts: {
    daysValue: string;
    daysLabel: string;
    scheduleValue: string;
    scheduleLabel: string;
    venuesValue: string;
    venuesLabel: string;
    accessValue: string;
    accessLabel: string;
  };
  themeSection: {
    eyebrow: string;
    quote: string;
    description: string;
    pillarsHeading: string;
    pillarsIntro: string;
    pillars: {
      title: string;
      text: string;
    }[];
  };
  programme: {
    eyebrow: string;
    heading: string;
    subheading: string;
    viewFlyer: string;
    closeFlyer: string;
    allSessionsIncluded: string;
  };
  speakersSection: {
    eyebrow: string;
    heading: string;
    subheading: string;
    hostsEyebrow: string;
    hostsHeading: string;
    hostsSubtitle: string;
    viewBio: string;
    seeAllLink: string;
    focusLabel: string;
    closeModal: string;
    registerCta: string;
  };
  onboarding: {
    eyebrow: string;
    heading: string;
    subheading: string;
    steps: [string, string, string];
    step1Title: string;
    step1Desc: string;
    step2Title: string;
    step2Desc: string;
    step3Title: string;
    step3Desc: string;
    fields: {
      firstName: string;
      lastName: string;
      email: string;
      emailHint: string;
      phone: string;
      countryCode: string;
      city: string;
      country: string;
      domain: string;
      domainPlaceholder: string;
      roleTitle: string;
      rolePlaceholder: string;
      organization: string;
      organizationPlaceholder: string;
      preferredSpeakers: string;
      preferredSpeakersHint: string;
      preferredTimeSlot: string;
      timeSlots: {
        all: string;
        morning: string;
        evening: string;
      };
      attendingSunday: string;
      expectations: string;
      expectationsPlaceholder: string;
      expectationsMinHint: string;
      referralSource: string;
      referralPlaceholder: string;
      acceptedCommitment: string;
      acceptedPrivacy: string;
    };
    actions: {
      next: string;
      back: string;
      submit: string;
      submitting: string;
      downloadPng: string;
      printPass: string;
      viewBadgePage: string;
      newRegistration: string;
    };
    summary: {
      reviewTitle: string;
      identityLabel: string;
      profileLabel: string;
      focusLabel: string;
      instantNote: string;
    };
    success: {
      title: string;
      subtitle: string;
      emailSent: string;
      emailPending: string;
      badgeNumberLabel: string;
      accessLabel: string;
      accessValue: string;
      keepNotice: string;
    };
    errors: {
      generic: string;
      duplicateEmail: string;
      duplicateLink: string;
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      city: string;
      domain: string;
      roleTitle: string;
      expectations: string;
      masterclassRequired: string;
      referralSource: string;
      commitments: string;
      dbNotConfigured: string;
    };
  };
  badgePage: {
    eyebrow: string;
    heading: string;
    subheading: string;
    inputLabel: string;
    inputPlaceholder: string;
    inputHint: string;
    searchBtn: string;
    searching: string;
    notFound: string;
    invalidInput: string;
    backHome: string;
    statusConfirmed: string;
    statusCancelled: string;
    checkInHistoryTitle: string;
    noCheckInsYet: string;
    verifiedBanner: string;
    passHeader: string;
    passHolder: string;
    passRef: string;
    passDates: string;
    passLocation: string;
    downloadPng: string;
    printPass: string;
    savePreviewTitle: string;
    iosSaveHint: string;
    shareOrSaveBtn: string;
    downloadFallbackLink: string;
    downloadError: string;
    closePreview: string;
  };
  support: {
    fabLabel: string;
    title: string;
    subtitle: string;
    nameLabel: string;
    emailLabel: string;
    phoneLabel: string;
    messageLabel: string;
    messagePlaceholder: string;
    sendBtn: string;
    sending: string;
    successTitle: string;
    successText: string;
    sendAnother: string;
    whatsappCta: string;
    close: string;
  };
  footer: {
    presentedBy: string;
    venuePrimaryLabel: string;
    venueSundayLabel: string;
    contactsLabel: string;
    quickLinksLabel: string;
    adminAccess: string;
    rights: string;
    legalNote: string;
  };
}

const FR_DICT: Dictionary = {
  meta: {
    homeTitle: "Excellence Summit 2026 · Masterclasses & Convention — Houekin Ministries Int.",
    speakersTitle: "Orateurs & Hôtes · Excellence Summit 2026",
    badgeTitle: "Retrouver mon Badge QR · Excellence Summit 2026",
    dashboardTitle: "Dashboard de suivi & Vérification QR · Excellence Summit 2026",
    loginTitle: "Connexion Équipe · Excellence Summit 2026",
  },
  nav: {
    home: "Accueil",
    programme: "Programme",
    speakers: "Orateurs",
    register: "S'inscrire",
    badge: "Mon Badge",
    dashboard: "Dashboard",
    openMenu: "Ouvrir le menu",
    closeMenu: "Fermer le menu",
    switchLang: "Changer de langue",
  },
  hero: {
    kicker: "Houekin Ministries Int. · Église La Cité d'Excellence",
    title: "Excellence Summit",
    themePrefix: "1re Convention/26 · Thème :",
    themeQuote: "« Bâtir une génération prophétique & royale »",
    subtitle:
      "Six jours de convention et de masterclasses d'exception animées par 4 orateurs internationaux. Obtenez votre numéro unique et votre badge QR actif immédiatement.",
    ctaPrimary: "M'inscrire aux Masterclasses",
    ctaSecondary: "Découvrir les 4 orateurs",
    ctaBadge: "Retrouver mon badge",
    datePill: "01 – 06 Décembre 2026",
    venuePill: "Cité d'Excellence · Abomey-Calavi & Majestic Cadjehoun",
    scrollCue: "Découvrir le programme et les masterclasses",
  },
  facts: {
    daysValue: "01 – 06 Déc.",
    daysLabel: "6 jours de convention 2026",
    scheduleValue: "09h–12h · 19h–21h",
    scheduleLabel: "Masterclasses & Plénières (Mer–Ven)",
    venuesValue: "2 Lieux",
    venuesLabel: "Cité d'Excellence & Majestic Cadjehoun",
    accessValue: "Pass QR Unique",
    accessLabel: "Accès gratuit · Confirmation immédiate",
  },
  themeSection: {
    eyebrow: "Vision & Mandat 2026",
    quote: "« Bâtir une génération prophétique & royale »",
    description:
      "Ancré dans 2 Timothée 2:2 — Adoration, Enseignement, Impact — Excellence Summit rassemble responsables, entrepreneurs, ministres et porteurs de vision pour recevoir une transmission pratique, prophétique et royale.",
    pillarsHeading: "Une convention structurée autour de 4 piliers",
    pillarsIntro:
      "Un seul pass gratuit vous donne accès à l'ensemble des sessions animées par nos quatre orateurs invités d'Europe et d'Afrique.",
    pillars: [
      {
        title: "Vision Prophétique",
        text: "Discerner les temps et bâtir sa destinée avec clarté spirituelle et justesse.",
      },
      {
        title: "Autorité Royale",
        text: "Exercer un leadership d'intégrité et d'influence durable dans votre sphère.",
      },
      {
        title: "Masterclasses Pratiques",
        text: "Des sessions matinales ciblées avec les 4 orateurs pour ancrer la mise en œuvre.",
      },
      {
        title: "Transmission & Impact",
        text: "Équiper des hommes et des femmes capables d'en former d'autres (2 Tim. 2:2).",
      },
    ],
  },
  programme: {
    eyebrow: "Calendrier officiel",
    heading: "Programme de la Convention",
    subheading:
      "Votre inscription vous ouvre l'accès complet à chaque temps fort, de l'ouverture officielle au Culte Spécial du dimanche.",
    viewFlyer: "Voir l'affiche programme",
    closeFlyer: "Fermer l'aperçu",
    allSessionsIncluded: "Inclus dans votre pass unique ES26",
  },
  speakersSection: {
    eyebrow: "Les 4 Orateurs Invités",
    heading: "Dirigée par 4 voix d'impact international",
    subheading:
      "Découvrez les quatre orateurs principaux qui animeront les masterclasses et sessions plénières d'Excellence Summit 2026.",
    hostsEyebrow: "Couple Prophétique Hôte",
    hostsHeading: "Drs Augustine & Fidèle HOUEKIN",
    hostsSubtitle:
      "Fondateurs et hôtes d'Excellence Summit · Église La Cité d'Excellence, Bénin",
    viewBio: "Voir la présentation",
    seeAllLink: "Explorer tous les profils",
    focusLabel: "Axe Masterclass",
    closeModal: "Fermer",
    registerCta: "Réserver ma place",
  },
  onboarding: {
    eyebrow: "Onboarding Masterclasses",
    heading: "Obtenez votre Pass QR en 3 étapes",
    subheading:
      "Inscription gratuite avec génération immédiate de votre numéro d'accès unique ES26 et envoi par e-mail.",
    steps: [
      "Identité & Contact",
      "Profil & Masterclasses",
      "Confirmation & Badge",
    ],
    step1Title: "Faisons connaissance",
    step1Desc:
      "Vos coordonnées permettent de générer votre pass nominatif et de vous l'envoyer par e-mail.",
    step2Title: "Votre profil & préférences",
    step2Desc:
      "Votre pass inclut toutes les sessions des 4 orateurs. Indiquez ce que vous attendez le plus.",
    step3Title: "Vérification & Engagement",
    step3Desc:
      "Relisez vos informations puis validez pour révéler instantanément votre numéro et votre QR code.",
    fields: {
      firstName: "Prénom",
      lastName: "Nom",
      email: "Adresse e-mail",
      emailHint: "Votre numéro ES26 et votre badge QR y seront envoyés.",
      phone: "Téléphone / WhatsApp",
      countryCode: "Indicatif",
      city: "Ville de résidence",
      country: "Pays",
      domain: "Domaine d'activité",
      domainPlaceholder: "Choisir votre domaine",
      roleTitle: "Fonction ou rôle actuel",
      rolePlaceholder: "Ex. Entrepreneur, Pasteur, Cadre, Étudiant...",
      organization: "Église / Entreprise / Organisation (optionnel)",
      organizationPlaceholder: "Nom de votre structure",
      preferredSpeakers: "Choisissez votre / vos Masterclass(es)",
      preferredSpeakersHint:
        "Sélectionnez au moins une masterclass parmi les 3 thèmes proposés (choix multiple possible).",
      preferredTimeSlot: "Disponibilité principale pour les sessions Mer–Ven",
      timeSlots: {
        all: "Matin & Soir (Programme complet)",
        morning: "Sessions matinales (09h – 12h)",
        evening: "Sessions du soir (19h – 21h)",
      },
      attendingSunday:
        "Je prévois d'assister au Culte Spécial du dimanche 06 déc. au Majestic de Cadjehoun (dès 10h00)",
      expectations: "Ce que vous attendez de cette masterclass (facultatif)",
      expectationsPlaceholder:
        "Partagez en quelques lignes ce que vous souhaitez recevoir et bâtir durant la convention...",
      expectationsMinHint: "Minimum 15 caractères",
      referralSource: "Comment avez-vous découvert Excellence Summit ?",
      referralPlaceholder: "Sélectionner une source",
      acceptedCommitment:
        "Je confirme mon engagement à participer avec assiduité aux sessions de la convention.",
      acceptedPrivacy:
        "J'accepte que mes informations soient utilisées pour la gestion de mon badge et de l'accueil sur site.",
    },
    actions: {
      next: "Continuer",
      back: "Retour",
      submit: "Générer mon Pass QR",
      submitting: "Création de votre badge...",
      downloadPng: "Télécharger le badge (PNG)",
      printPass: "Imprimer le pass",
      viewBadgePage: "Ouvrir ma page badge",
      newRegistration: "Inscrire une autre personne",
    },
    summary: {
      reviewTitle: "Récapitulatif de votre inscription",
      identityLabel: "Participant",
      profileLabel: "Profil",
      focusLabel: "Masterclasses",
      instantNote: "Délivrance immédiate : votre QR code sera actif dès validation.",
    },
    success: {
      title: "Inscription confirmée !",
      subtitle: "Votre badge officiel Excellence Summit 2026 est prêt.",
      emailSent: "Une copie de votre badge et de votre QR code a été envoyée à votre adresse e-mail.",
      emailPending:
        "Votre badge est enregistré et actif. Téléchargez-le ci-dessous pour le présenter à l'accueil.",
      badgeNumberLabel: "Numéro d'inscription",
      accessLabel: "Accès inclus",
      accessValue: "Pass Global · 4 Orateurs · 01–06 Déc. 2026",
      keepNotice:
        "Présentez ce QR code (ou votre numéro ES26) à l'entrée de chaque session à la Cité d'Excellence et au Majestic de Cadjehoun.",
    },
    errors: {
      generic: "Une erreur est survenue. Veuillez vérifier vos informations.",
      duplicateEmail: "Cette adresse e-mail possède déjà un badge actif.",
      duplicateLink: "Retrouver mon badge existant",
      firstName: "Veuillez saisir votre prénom (2 caractères min.).",
      lastName: "Veuillez saisir votre nom (2 caractères min.).",
      email: "Veuillez saisir une adresse e-mail valide.",
      phone: "Veuillez saisir un numéro de téléphone valide.",
      city: "Veuillez indiquer votre ville.",
      domain: "Veuillez choisir un domaine d'activité.",
      roleTitle: "Veuillez préciser votre fonction ou rôle.",
      expectations: "Veuillez décrire vos attentes (15 caractères minimum).",
      masterclassRequired: "Veuillez sélectionner au moins une masterclass.",
      referralSource: "Veuillez indiquer comment vous avez connu l'événement.",
      commitments: "Veuillez cocher les deux cases de confirmation.",
      dbNotConfigured:
        "Base de données Neon non encore connectée : ajoutez DATABASE_URL dans .env.local pour enregistrer les inscriptions.",
    },
  },
  badgePage: {
    eyebrow: "Espace Participant",
    heading: "Retrouver & Télécharger mon Badge",
    subheading:
      "Saisissez votre numéro de référence (ex. ES26-7K9P2M), votre adresse e-mail ou votre numéro de téléphone.",
    inputLabel: "Référence ES26, E-mail ou Téléphone",
    inputPlaceholder: "Ex. ES26-7K9P2M ou nom@exemple.com",
    inputHint:
      "Astuce : les codes ES26 utilisent uniquement les chiffres 2–9 et des lettres sans ambiguïté (pas de 0, O, 1, I ou L).",
    searchBtn: "Rechercher mon badge",
    searching: "Recherche en cours...",
    notFound: "Aucun badge trouvé pour cette recherche. Vérifiez la référence ou l'e-mail utilisé.",
    invalidInput: "Saisissez au moins 4 caractères (référence ES26, e-mail ou téléphone).",
    backHome: "Retour à l'accueil",
    statusConfirmed: "Badge Confirmé · Actif",
    statusCancelled: "Badge Annulé",
    checkInHistoryTitle: "Pointages enregistrés à l'entrée",
    noCheckInsYet: "Aucun passage encore enregistré pour cette convention.",
    verifiedBanner: "Vérification cryptographique valide",
    passHeader: "PASS OFFICIEL · MASTERCLASSES",
    passHolder: "Participant",
    passRef: "Référence",
    passDates: "01 – 06 Déc. 2026",
    passLocation: "Cité d'Excellence & Majestic Cadjehoun",
    downloadPng: "Télécharger en PNG",
    printPass: "Imprimer",
    savePreviewTitle: "Enregistrer votre badge",
    iosSaveHint:
      "Sur iPhone/iPad : touchez « Partager / Enregistrer » ou maintenez le doigt sur l'image ci-dessous puis choisissez « Enregistrer dans Photos ».",
    shareOrSaveBtn: "Partager / Enregistrer",
    downloadFallbackLink: "Télécharger le fichier PNG",
    downloadError:
      "Impossible de générer l'image du badge. Essayez « Imprimer » ou rechargez la page.",
    closePreview: "Fermer",
  },
  support: {
    fabLabel: "Poser une question à l'équipe",
    title: "Équipe Excellence Summit",
    subtitle: "Une question sur les masterclasses, l'accueil ou votre badge ?",
    nameLabel: "Nom complet",
    emailLabel: "Adresse e-mail",
    phoneLabel: "Téléphone / WhatsApp (optionnel)",
    messageLabel: "Votre message",
    messagePlaceholder: "Comment pouvons-nous vous aider ?",
    sendBtn: "Envoyer ma question",
    sending: "Envoi en cours...",
    successTitle: "Message envoyé !",
    successText: "Notre équipe d'accueil vous répondra très rapidement.",
    sendAnother: "Envoyer un autre message",
    whatsappCta: "Contacter par téléphone / WhatsApp",
    close: "Fermer",
  },
  footer: {
    presentedBy: "Présenté par Houekin Ministries Int. · Église La Cité d'Excellence",
    venuePrimaryLabel: "Cité d'Excellence (Mar. 01 – Sam. 05)",
    venueSundayLabel: "Culte Spécial (Dim. 06 dès 10h)",
    contactsLabel: "Contacts Accueil",
    quickLinksLabel: "Navigation",
    adminAccess: "Dashboard Équipe",
    rights: "© 2026 Excellence Summit · Houekin Ministries Int. Tous droits réservés.",
    legalNote: "Données utilisées uniquement pour l'organisation et l'accueil de la convention.",
  },
};

const EN_DICT: Dictionary = {
  meta: {
    homeTitle: "Excellence Summit 2026 · Masterclasses & Convention — Houekin Ministries Int.",
    speakersTitle: "Speakers & Hosts · Excellence Summit 2026",
    badgeTitle: "Find My QR Badge · Excellence Summit 2026",
    dashboardTitle: "Tracking & QR Verification Dashboard · Excellence Summit 2026",
    loginTitle: "Team Sign In · Excellence Summit 2026",
  },
  nav: {
    home: "Home",
    programme: "Schedule",
    speakers: "Speakers",
    register: "Register",
    badge: "My Badge",
    dashboard: "Dashboard",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    switchLang: "Switch language",
  },
  hero: {
    kicker: "Houekin Ministries Int. · La Cité d'Excellence Church",
    title: "Excellence Summit",
    themePrefix: "1st Convention/26 · Theme:",
    themeQuote: "“Building a Prophetic & Royal Generation”",
    subtitle:
      "Six days of convention and high-impact masterclasses led by 4 international guest speakers. Receive your unique reference ID and active QR badge immediately.",
    ctaPrimary: "Register for Masterclasses",
    ctaSecondary: "Meet the 4 Speakers",
    ctaBadge: "Find my badge",
    datePill: "December 01 – 06, 2026",
    venuePill: "Cité d'Excellence · Abomey-Calavi & Majestic Cadjehoun",
    scrollCue: "Explore the schedule and masterclasses",
  },
  facts: {
    daysValue: "Dec 01 – 06",
    daysLabel: "6-day 2026 convention",
    scheduleValue: "09:00–12:00 · 19:00–21:00",
    scheduleLabel: "Masterclasses & Plenaries (Wed–Fri)",
    venuesValue: "2 Venues",
    venuesLabel: "Cité d'Excellence & Majestic Cadjehoun",
    accessValue: "Single QR Pass",
    accessLabel: "Free access · Instant confirmation",
  },
  themeSection: {
    eyebrow: "Vision & Mandate 2026",
    quote: "“Building a Prophetic & Royal Generation”",
    description:
      "Rooted in 2 Timothy 2:2 — Worship, Teaching, Impact — Excellence Summit gathers leaders, entrepreneurs, ministers, and visionaries for practical, prophetic, and royal impartation.",
    pillarsHeading: "A convention built on 4 pillars",
    pillarsIntro:
      "One complimentary pass grants full entry to all sessions led by our four guest speakers from Europe and Africa.",
    pillars: [
      {
        title: "Prophetic Vision",
        text: "Discern the times and build your calling with spiritual clarity and precision.",
      },
      {
        title: "Royal Authority",
        text: "Lead with integrity, excellence, and lasting influence across your sphere.",
      },
      {
        title: "Hands-on Masterclasses",
        text: "Focused morning sessions with the 4 speakers designed for real execution.",
      },
      {
        title: "Impartation & Legacy",
        text: "Equipping faithful men and women able to teach and raise others (2 Tim. 2:2).",
      },
    ],
  },
  programme: {
    eyebrow: "Official Schedule",
    heading: "Convention Programme",
    subheading:
      "Your registration grants complete access to every gathering, from Tuesday's opening night through Sunday's Special Service.",
    viewFlyer: "View programme flyer",
    closeFlyer: "Close preview",
    allSessionsIncluded: "Included with your ES26 single pass",
  },
  speakersSection: {
    eyebrow: "The 4 Guest Speakers",
    heading: "Led by 4 voices of global impact",
    subheading:
      "Meet the four keynote speakers leading the masterclasses and plenary gatherings of Excellence Summit 2026.",
    hostsEyebrow: "Prophetic Host Couple",
    hostsHeading: "Drs Augustine & Fidèle HOUEKIN",
    hostsSubtitle:
      "Founders & Hosts of Excellence Summit · La Cité d'Excellence Church, Benin",
    viewBio: "Read profile",
    seeAllLink: "Explore all profiles",
    focusLabel: "Masterclass Focus",
    closeModal: "Close",
    registerCta: "Reserve my seat",
  },
  onboarding: {
    eyebrow: "Masterclass Onboarding",
    heading: "Get your QR Pass in 3 steps",
    subheading:
      "Complimentary registration with instant generation of your unique ES26 access number and email confirmation.",
    steps: [
      "Identity & Contact",
      "Profile & Masterclasses",
      "Confirmation & Badge",
    ],
    step1Title: "Tell us who you are",
    step1Desc:
      "Your details are used to generate your personal pass and deliver it to your inbox.",
    step2Title: "Your profile & preferences",
    step2Desc:
      "Your pass covers all 4 speakers' sessions. Share which tracks excite you most.",
    step3Title: "Review & Commitment",
    step3Desc:
      "Review your summary and submit to reveal your registration number and QR badge right away.",
    fields: {
      firstName: "First name",
      lastName: "Last name",
      email: "Email address",
      emailHint: "Your ES26 reference and QR badge will be sent here.",
      phone: "Phone / WhatsApp",
      countryCode: "Code",
      city: "City of residence",
      country: "Country",
      domain: "Field of activity",
      domainPlaceholder: "Select your field",
      roleTitle: "Current role or title",
      rolePlaceholder: "e.g., Entrepreneur, Pastor, Executive, Student...",
      organization: "Church / Company / Organization (optional)",
      organizationPlaceholder: "Organization name",
      preferredSpeakers: "Choose your Masterclass(es)",
      preferredSpeakersHint:
        "Select at least one masterclass from the 3 tracks below (multiple selection allowed).",
      preferredTimeSlot: "Main availability for Wed–Fri sessions",
      timeSlots: {
        all: "Morning & Evening (Full programme)",
        morning: "Morning sessions (09:00 – 12:00)",
        evening: "Evening sessions (19:00 – 21:00)",
      },
      attendingSunday:
        "I plan to attend the Special Service on Sunday Dec 06 at Majestic de Cadjehoun (from 10:00)",
      expectations: "What you expect from this masterclass (optional)",
      expectationsPlaceholder:
        "Briefly share what you hope to learn, build, or receive during the convention...",
      expectationsMinHint: "Minimum 15 characters",
      referralSource: "How did you hear about Excellence Summit?",
      referralPlaceholder: "Select an option",
      acceptedCommitment:
        "I commit to attending the masterclasses and convention sessions faithfully.",
      acceptedPrivacy:
        "I agree that my details may be used to issue my badge and manage event check-in.",
    },
    actions: {
      next: "Continue",
      back: "Back",
      submit: "Generate my QR Pass",
      submitting: "Creating your badge...",
      downloadPng: "Download badge (PNG)",
      printPass: "Print pass",
      viewBadgePage: "Open my badge page",
      newRegistration: "Register another person",
    },
    summary: {
      reviewTitle: "Registration Summary",
      identityLabel: "Participant",
      profileLabel: "Profile",
      focusLabel: "Masterclasses",
      instantNote: "Instant issuance: your QR code activates immediately upon submission.",
    },
    success: {
      title: "Registration Confirmed!",
      subtitle: "Your official Excellence Summit 2026 badge is ready.",
      emailSent: "A copy of your badge and QR code has been sent to your email address.",
      emailPending:
        "Your badge is active and saved. Download it below to present it at check-in.",
      badgeNumberLabel: "Registration Number",
      accessLabel: "Included Access",
      accessValue: "All-Access Pass · 4 Speakers · Dec 01–06, 2026",
      keepNotice:
        "Present this QR code (or your ES26 reference) at the entrance for each session at Cité d'Excellence and Majestic de Cadjehoun.",
    },
    errors: {
      generic: "Something went wrong. Please check your details and try again.",
      duplicateEmail: "This email address already has an active badge.",
      duplicateLink: "Retrieve my existing badge",
      firstName: "Please enter your first name (min. 2 characters).",
      lastName: "Please enter your last name (min. 2 characters).",
      email: "Please enter a valid email address.",
      phone: "Please enter a valid phone number.",
      city: "Please enter your city.",
      domain: "Please select your field of activity.",
      roleTitle: "Please enter your current role.",
      expectations: "Please describe your expectations (min. 15 characters).",
      masterclassRequired: "Please select at least one masterclass.",
      referralSource: "Please tell us how you heard about the event.",
      commitments: "Please check both confirmation boxes.",
      dbNotConfigured:
        "Neon database is not connected yet: add DATABASE_URL in .env.local to store registrations.",
    },
  },
  badgePage: {
    eyebrow: "Attendee Portal",
    heading: "Find & Download My Badge",
    subheading:
      "Enter your reference number (e.g., ES26-7K9P2M), email address, or phone number.",
    inputLabel: "ES26 Reference, Email or Phone",
    inputPlaceholder: "e.g., ES26-7K9P2M or name@example.com",
    inputHint:
      "Tip: ES26 codes only use digits 2–9 and unambiguous letters (never 0, O, 1, I, or L).",
    searchBtn: "Find my badge",
    searching: "Searching...",
    notFound: "No badge matched your query. Double-check your reference code or email.",
    invalidInput: "Enter at least 4 characters (ES26 code, email, or phone).",
    backHome: "Back to home",
    statusConfirmed: "Badge Confirmed · Active",
    statusCancelled: "Badge Cancelled",
    checkInHistoryTitle: "Recorded Session Check-ins",
    noCheckInsYet: "No check-ins recorded yet for this convention.",
    verifiedBanner: "Cryptographic verification valid",
    passHeader: "OFFICIAL PASS · MASTERCLASSES",
    passHolder: "Attendee",
    passRef: "Reference",
    passDates: "Dec 01 – 06, 2026",
    passLocation: "Cité d'Excellence & Majestic Cadjehoun",
    downloadPng: "Download PNG",
    printPass: "Print",
    savePreviewTitle: "Save Your Pass",
    iosSaveHint:
      "On iPhone/iPad: tap \"Share / Save\" or press and hold the image below, then choose \"Save to Photos\".",
    shareOrSaveBtn: "Share / Save",
    downloadFallbackLink: "Download PNG file",
    downloadError:
      "Could not generate the badge PNG right now. Try \"Print\" or reload the page.",
    closePreview: "Close",
  },
  support: {
    fabLabel: "Ask the team a question",
    title: "Excellence Summit Team",
    subtitle: "Need help with the masterclasses, venue, or your badge?",
    nameLabel: "Full name",
    emailLabel: "Email address",
    phoneLabel: "Phone / WhatsApp (optional)",
    messageLabel: "Your message",
    messagePlaceholder: "How can we help you?",
    sendBtn: "Send question",
    sending: "Sending...",
    successTitle: "Message sent!",
    successText: "Our welcome team will get back to you shortly.",
    sendAnother: "Send another message",
    whatsappCta: "Call / WhatsApp Welcome Desk",
    close: "Close",
  },
  footer: {
    presentedBy: "Presented by Houekin Ministries Int. · La Cité d'Excellence Church",
    venuePrimaryLabel: "Cité d'Excellence (Tue Dec 01 – Sat Dec 05)",
    venueSundayLabel: "Special Service (Sun Dec 06 from 10:00)",
    contactsLabel: "Welcome Desk",
    quickLinksLabel: "Navigation",
    adminAccess: "Team Dashboard",
    rights: "© 2026 Excellence Summit · Houekin Ministries Int. All rights reserved.",
    legalNote: "Your information is strictly used for convention registration and on-site check-in.",
  },
};

export const DICTIONARIES: Record<Locale, Dictionary> = {
  fr: FR_DICT,
  en: EN_DICT,
};

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale] ?? FR_DICT;
}

