export type Locale = "fr" | "en";

export interface ConventionSession {
  key: string;
  dayShort: { fr: string; en: string };
  dateLabel: { fr: string; en: string };
  timeLabel: string;
  title: { fr: string; en: string };
  venue: { fr: string; en: string };
  isSpecial?: boolean;
}

export interface ProgrammeBlock {
  id: string;
  dateBadge: { fr: string; en: string };
  dayRange: { fr: string; en: string };
  title: { fr: string; en: string };
  slots: {
    time: string;
    label: { fr: string; en: string };
  }[];
  venue: { fr: string; en: string };
  highlight?: "gold" | "crimson";
}

export const EVENT_INFO = {
  brand: "Excellence Summit",
  edition: {
    fr: "1re Convention · Édition 2026",
    en: "1st Convention · 2026 Edition",
  },
  organizer: "Houekin Ministries Int.",
  churchName: "Église La Cité d'Excellence",
  verse: "2 Timothée 2:2",
  theme: {
    fr: "Bâtir une génération prophétique & royale",
    en: "Building a Prophetic & Royal Generation",
  },
  dateRange: {
    fr: "Du 01 au 06 décembre 2026",
    en: "December 01 – 06, 2026",
  },
  venues: {
    primary: {
      name: "Cité d'Excellence",
      address: {
        fr: "Cité d'Excellence, en face du portail secondaire de l'Université d'Abomey-Calavi",
        en: "Cité d'Excellence, opposite the secondary gate of the University of Abomey-Calavi",
      },
    },
    sunday: {
      name: "Salle des fêtes Gratitude",
      address: {
        fr: "Salle des fêtes Gratitude, Arconville",
        en: "Salle des fêtes Gratitude, Arconville",
      },
    },
  },
  contacts: [
    { display: "+229 0196 320 444", href: "tel:+2290196320444", wa: "2290196320444" },
    { display: "+229 01 65 185 630", href: "tel:+2290165185630", wa: "2290165185630" },
  ],
} as const;

export const CONVENTION_SESSIONS: ConventionSession[] = [
  {
    key: "day1-opening",
    dayShort: { fr: "Mar. 01", en: "Tue Dec 01" },
    dateLabel: { fr: "Mardi 01 déc. 2026", en: "Tuesday, Dec 01, 2026" },
    timeLabel: "18h00",
    title: { fr: "Ouverture officielle", en: "Official Opening" },
    venue: {
      fr: "Cité d'Excellence · Abomey-Calavi",
      en: "Cité d'Excellence · Abomey-Calavi",
    },
    isSpecial: true,
  },
  {
    key: "day2-morning",
    dayShort: { fr: "Mer. 02 · Matin", en: "Wed Dec 02 · AM" },
    dateLabel: { fr: "Mercredi 02 déc. 2026", en: "Wednesday, Dec 02, 2026" },
    timeLabel: "Dès 09h00",
    title: {
      fr: "Matinée Masterclass · Mike Jocktane",
      en: "Morning Masterclass · Mike Jocktane",
    },
    venue: {
      fr: "Cité d'Excellence · Abomey-Calavi",
      en: "Cité d'Excellence · Abomey-Calavi",
    },
  },
  {
    key: "day2-evening",
    dayShort: { fr: "Mer. 02 · Soir", en: "Wed Dec 02 · PM" },
    dateLabel: { fr: "Mercredi 02 déc. 2026", en: "Wednesday, Dec 02, 2026" },
    timeLabel: "19h00 – 21h00",
    title: { fr: "Session du soir · Plénière", en: "Evening Session · Plenary" },
    venue: {
      fr: "Cité d'Excellence · Abomey-Calavi",
      en: "Cité d'Excellence · Abomey-Calavi",
    },
  },
  {
    key: "day3-morning",
    dayShort: { fr: "Jeu. 03 · Matin", en: "Thu Dec 03 · AM" },
    dateLabel: { fr: "Jeudi 03 déc. 2026", en: "Thursday, Dec 03, 2026" },
    timeLabel: "Dès 09h00",
    title: {
      fr: "Matinée Masterclass · Dieunedort Kamdem",
      en: "Morning Masterclass · Dieunedort Kamdem",
    },
    venue: {
      fr: "Cité d'Excellence · Abomey-Calavi",
      en: "Cité d'Excellence · Abomey-Calavi",
    },
  },
  {
    key: "day3-evening",
    dayShort: { fr: "Jeu. 03 · Soir", en: "Thu Dec 03 · PM" },
    dateLabel: { fr: "Jeudi 03 déc. 2026", en: "Thursday, Dec 03, 2026" },
    timeLabel: "19h00 – 21h00",
    title: { fr: "Session du soir · Plénière", en: "Evening Session · Plenary" },
    venue: {
      fr: "Cité d'Excellence · Abomey-Calavi",
      en: "Cité d'Excellence · Abomey-Calavi",
    },
  },
  {
    key: "day4-morning",
    dayShort: { fr: "Ven. 04 · Matin", en: "Fri Dec 04 · AM" },
    dateLabel: { fr: "Vendredi 04 déc. 2026", en: "Friday, Dec 04, 2026" },
    timeLabel: "Dès 09h00",
    title: {
      fr: "Matinée Masterclass · Mawuena Drah",
      en: "Morning Masterclass · Mawuena Drah",
    },
    venue: {
      fr: "Cité d'Excellence · Abomey-Calavi",
      en: "Cité d'Excellence · Abomey-Calavi",
    },
  },
  {
    key: "day4-evening",
    dayShort: { fr: "Ven. 04 · Soir", en: "Fri Dec 04 · PM" },
    dateLabel: { fr: "Vendredi 04 déc. 2026", en: "Friday, Dec 04, 2026" },
    timeLabel: "19h00 – 21h00",
    title: { fr: "Session du soir · Plénière", en: "Evening Session · Plenary" },
    venue: {
      fr: "Cité d'Excellence · Abomey-Calavi",
      en: "Cité d'Excellence · Abomey-Calavi",
    },
  },
  {
    key: "day5-royal",
    dayShort: { fr: "Sam. 05 · Impactation", en: "Sat Dec 05 · Impartation" },
    dateLabel: { fr: "Samedi 05 déc. 2026", en: "Saturday, Dec 05, 2026" },
    timeLabel: "09h00 – 13h00",
    title: { fr: "Culte d'Impactation", en: "Impartation Service" },
    venue: {
      fr: "Cité d'Excellence · Abomey-Calavi",
      en: "Cité d'Excellence · Abomey-Calavi",
    },
    isSpecial: true,
  },
  {
    key: "day6-majestic",
    dayShort: { fr: "Dim. 06 · Gratitude", en: "Sun Dec 06 · Gratitude" },
    dateLabel: { fr: "Dimanche 06 déc. 2026", en: "Sunday, Dec 06, 2026" },
    timeLabel: "Dès 10h00",
    title: { fr: "Culte Spécial de clôture", en: "Closing Special Service" },
    venue: {
      fr: "Salle des fêtes Gratitude · Arconville",
      en: "Salle des fêtes Gratitude · Arconville",
    },
    isSpecial: true,
  },
];

export const PROGRAMME_BLOCKS: ProgrammeBlock[] = [
  {
    id: "opening",
    dateBadge: { fr: "MAR. 01 DÉC.", en: "TUE DEC 01" },
    dayRange: { fr: "Soirée inaugurale", en: "Opening Night" },
    title: { fr: "Ouverture officielle", en: "Official Opening" },
    slots: [
      {
        time: "18h00",
        label: {
          fr: "Cérémonie d'ouverture, louange prophétique & première plénière",
          en: "Opening ceremony, prophetic worship & inaugural plenary",
        },
      },
    ],
    venue: EVENT_INFO.venues.primary.address,
    highlight: "crimson",
  },
  {
    id: "masterclasses",
    dateBadge: { fr: "MER. 02 – VEN. 04 DÉC.", en: "WED 02 – FRI 04 DEC" },
    dayRange: { fr: "3 jours intensifs", en: "3 Intensive Days" },
    title: {
      fr: "Masterclass & Plénières",
      en: "Masterclass & Plenaries",
    },
    slots: [
      {
        time: "Mer. 02 · 09h",
        label: {
          fr: "Matinée Masterclass · Évêque Mike Jocktane : « Révéler les talents, propulser les entrepreneurs »",
          en: "Morning Masterclass · Bishop Mike Jocktane: “Revealing Talents, Propelling Entrepreneurs”",
        },
      },
      {
        time: "Jeu. 03 · 09h",
        label: {
          fr: "Matinée Masterclass · Archevêque Dieunedort Kamdem : « Commencer l'entrepreneuriat avec 0 franc »",
          en: "Morning Masterclass · Archbishop Dieunedort Kamdem: “Starting Entrepreneurship with 0 Francs”",
        },
      },
      {
        time: "Ven. 04 · 09h",
        label: {
          fr: "Matinée Masterclass · Apôtre Mawuena Drah : « Ministère prophétique »",
          en: "Morning Masterclass · Apostle Mawuena Drah: “Prophetic Ministry”",
        },
      },
      {
        time: "19h – 21h",
        label: {
          fr: "Sessions du soir (Mer–Ven) · Enseignement, impactation & ministère prophétique",
          en: "Evening Sessions (Wed–Fri) · Teaching, impartation & prophetic ministry",
        },
      },
    ],
    venue: EVENT_INFO.venues.primary.address,
    highlight: "gold",
  },
  {
    id: "culte-royal",
    dateBadge: { fr: "SAM. 05 DÉC.", en: "SAT DEC 05" },
    dayRange: { fr: "Matinée solennelle", en: "Solemn Morning" },
    title: { fr: "Culte d'Impactation", en: "Impartation Service" },
    slots: [
      {
        time: "09h – 13h",
        label: {
          fr: "Culte d'impactation, consécration & activation des appels",
          en: "Impartation service, consecration & calling activation",
        },
      },
    ],
    venue: EVENT_INFO.venues.primary.address,
    highlight: "gold",
  },
  {
    id: "culte-special",
    dateBadge: { fr: "DIM. 06 DÉC.", en: "SUN DEC 06" },
    dayRange: { fr: "Grande clôture", en: "Grand Finale" },
    title: { fr: "Culte Spécial à la Salle Gratitude", en: "Special Service at Salle Gratitude" },
    slots: [
      {
        time: "Dès 10h00",
        label: {
          fr: "Grand rassemblement de clôture à la Salle des fêtes Gratitude à Arconville",
          en: "Grand closing gathering at Salle des fêtes Gratitude in Arconville",
        },
      },
    ],
    venue: EVENT_INFO.venues.sunday.address,
    highlight: "crimson",
  },
];

export const DOMAINS = [
  { value: "ministry", fr: "Ministère / Église", en: "Ministry / Church" },
  { value: "entrepreneurship", fr: "Entrepreneuriat & Business", en: "Entrepreneurship & Business" },
  { value: "management", fr: "Leadership & Management", en: "Leadership & Management" },
  { value: "corporate", fr: "Cadre / Fonction publique", en: "Executive / Public Sector" },
  { value: "education", fr: "Éducation & Recherche", en: "Education & Research" },
  { value: "media", fr: "Arts, Culture & Médias", en: "Arts, Culture & Media" },
  { value: "student", fr: "Étudiant / Jeune leader", en: "Student / Emerging Leader" },
  { value: "other", fr: "Autre sphère d'influence", en: "Other Sphere of Influence" },
] as const;

export const REFERRAL_SOURCES = [
  { value: "church", fr: "Église La Cité d'Excellence", en: "La Cité d'Excellence Church" },
  { value: "social", fr: "Réseaux sociaux (Facebook, Instagram, TikTok)", en: "Social Media (Facebook, Instagram, TikTok)" },
  { value: "whatsapp", fr: "WhatsApp / Partage d'affiche", en: "WhatsApp / Poster Share" },
  { value: "friend", fr: "Invitation d'un proche / leader", en: "Invitation from a friend / leader" },
  { value: "speaker", fr: "Communauté d'un intervenant", en: "Speaker's community" },
  { value: "other", fr: "Autre source", en: "Other" },
] as const;

