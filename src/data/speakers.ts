export interface SpeakerProfile {
  id: string;
  kind: "speaker" | "host";
  name: string;
  roleTitle: { fr: string; en: string };
  country: { fr: string; en: string };
  flagEmoji: string;
  image: string;
  isCutout?: boolean;
  masterclassFocus: { fr: string; en: string };
  bio: { fr: string[]; en: string[] };
}

/**
 * Centralized speakers & host couple profiles.
 * Text presentations are clearly structured so you can update them anytime with full official bios.
 */
export const GUEST_SPEAKERS: SpeakerProfile[] = [
  {
    id: "pierre-gospiel",
    kind: "speaker",
    name: "Pierre Gospiel",
    roleTitle: {
      fr: "Évangéliste",
      en: "Evangelist",
    },
    country: { fr: "France", en: "France" },
    flagEmoji: "🇫🇷",
    image: "/images/speakers/pierre-gospiel.webp",
    masterclassFocus: {
      fr: "Impact évangélique & audace de la foi",
      en: "Evangelistic Impact & Boldness of Faith",
    },
    bio: {
      fr: [
        "Évangéliste basé en France, Pierre Gospiel exerce un ministère dynamique axé sur la proclamation de l'Évangile, le réveil spirituel et la formation d'une nouvelle génération de témoins audacieux.",
        "Au cours des masterclasses d'Excellence Summit, il partagera des clés pratiques pour opérer avec puissance, clarté et fidélité dans les sphères publiques contemporaines.",
      ],
      en: [
        "An evangelist based in France, Pierre Gospiel leads a vibrant ministry centered on preaching the Gospel, spiritual awakening, and equipping a new generation of bold witnesses.",
        "During the Excellence Summit masterclasses, he will share practical keys to operating with spiritual power, clarity, and faithfulness in contemporary public life.",
      ],
    },
  },
  {
    id: "mike-jocktane",
    kind: "speaker",
    name: "Mike Jocktane",
    roleTitle: {
      fr: "Évêque",
      en: "Bishop",
    },
    country: { fr: "Gabon", en: "Gabon" },
    flagEmoji: "🇬🇦",
    image: "/images/speakers/mike-jocktane.webp",
    masterclassFocus: {
      fr: "Leadership royal, gouvernance & excellence",
      en: "Royal Leadership, Governance & Excellence",
    },
    bio: {
      fr: [
        "Évêque et figure influente originaire du Gabon, Mike Jocktane est reconnu pour son enseignement structurant sur le leadership d'autorité, l'intégrité morale et la transformation sociétale.",
        "Ses sessions de masterclass aborderont l'exercice responsable de la royauté spirituelle et stratégique face aux défis du leadership moderne.",
      ],
      en: [
        "A bishop and prominent leader from Gabon, Mike Jocktane is known for his foundational teaching on principled leadership, moral integrity, and societal transformation.",
        "His masterclass sessions address how to exercise spiritual and strategic authority responsibly amid modern leadership challenges.",
      ],
    },
  },
  {
    id: "dieunedort-kamdem",
    kind: "speaker",
    name: "Dieunedort KAMDEM",
    roleTitle: {
      fr: "Archevêque",
      en: "Archbishop",
    },
    country: { fr: "Côte d'Ivoire", en: "Côte d'Ivoire" },
    flagEmoji: "🇨🇮",
    image: "/images/speakers/dieunedort-kamdem.webp",
    masterclassFocus: {
      fr: "Dimension prophétique & alignement de destinée",
      en: "Prophetic Dimension & Destiny Alignment",
    },
    bio: {
      fr: [
        "Archevêque exerçant en Côte d'Ivoire, Dieunedort Kamdem accompagne de nombreux responsables et ministères dans l'édification spirituelle, la sagesse prophétique et la structuration d'œuvres durables.",
        "À l'Excellence Summit, il enseignera comment bâtir avec discernement prophétique et rigueur d'exécution pour marquer durablement sa génération.",
      ],
      en: [
        "An archbishop serving in Côte d'Ivoire, Dieunedort Kamdem mentors leaders and ministries in spiritual edification, prophetic wisdom, and building enduring works.",
        "At Excellence Summit, he will teach how to build with prophetic discernment and disciplined execution to leave a lasting generational mark.",
      ],
    },
  },
  {
    id: "mawuena-drah",
    kind: "speaker",
    name: "Mawuena DRAH",
    roleTitle: {
      fr: "Apôtre",
      en: "Apostle",
    },
    country: { fr: "Togo", en: "Togo" },
    flagEmoji: "🇹🇬",
    image: "/images/speakers/mawuena-drah.webp",
    masterclassFocus: {
      fr: "Fondements apostoliques & transmission (2 Tim. 2:2)",
      en: "Apostolic Foundations & Mentorship (2 Tim. 2:2)",
    },
    bio: {
      fr: [
        "Apôtre originaire du Togo, Mawuena Drah se consacre à la formation de leaders solides, enracinés dans les Écritures et engagés dans l'expansion du Royaume.",
        "Ses interventions mettront en lumière la transmission fidèle de l'appel et les principes apostoliques pour bâtir une génération prophétique et royale.",
      ],
      en: [
        "An apostle from Togo, Mawuena Drah is dedicated to raising grounded leaders rooted in Scripture and committed to Kingdom advancement.",
        "His masterclass sessions highlight faithful mentorship and apostolic principles for building a prophetic and royal generation.",
      ],
    },
  },
];

export const HOST_COUPLE: SpeakerProfile[] = [
  {
    id: "fidele-houekin",
    kind: "host",
    name: "Dr Fidèle HOUEKIN",
    roleTitle: {
      fr: "Hôte · Couple Prophétique",
      en: "Host · Prophetic Couple",
    },
    country: { fr: "Bénin", en: "Benin" },
    flagEmoji: "🇧🇯",
    image: "/images/hosts/fidele-houekin.webp",
    masterclassFocus: {
      fr: "Vision Houekin Ministries Int. & La Cité d'Excellence",
      en: "Houekin Ministries Int. & La Cité d'Excellence Vision",
    },
    bio: {
      fr: [
        "Fondateur de Houekin Ministries Int. et pasteur principal à l'Église La Cité d'Excellence (Abomey-Calavi), Dr Fidèle Houekin porte la vision d'une génération équipée dans l'adoration, l'enseignement et l'impact (2 Timothée 2:2).",
        "Aux côtés de son épouse Dr Augustine Houekin, il accueille cette première convention annuelle Excellence Summit au Bénin.",
      ],
      en: [
        "Founder of Houekin Ministries Int. and senior pastor at La Cité d'Excellence Church (Abomey-Calavi), Dr Fidèle Houekin carries a vision to raise a generation equipped in worship, teaching, and impact (2 Timothy 2:2).",
        "Alongside his wife Dr Augustine Houekin, he hosts this inaugural Excellence Summit convention in Benin.",
      ],
    },
  },
  {
    id: "augustine-houekin",
    kind: "host",
    name: "Dr Augustine HOUEKIN",
    roleTitle: {
      fr: "Hôte · Couple Prophétique",
      en: "Host · Prophetic Couple",
    },
    country: { fr: "Bénin", en: "Benin" },
    flagEmoji: "🇧🇯",
    image: "/images/hosts/augustine-houekin.webp",
    isCutout: true,
    masterclassFocus: {
      fr: "Accompagnement spirituel, intercession & excellence",
      en: "Spiritual Mentorship, Intercession & Excellence",
    },
    bio: {
      fr: [
        "Co-hôte de la Convention Excellence Summit au sein du Couple Prophétique Houekin, Dr Augustine Houekin œuvre activement pour l'édification des leaders, des familles et de la jeunesse au Bénin et à l'international.",
      ],
      en: [
        "Co-host of the Excellence Summit Convention within the Houekin Prophetic Couple, Dr Augustine Houekin serves actively in mentoring leaders, families, and young believers in Benin and internationally.",
      ],
    },
  },
];

