export const sharedCollectionIncludes = [
  "Pre-session consultation",
  "Planning & styling guidance",
  "Your photography session",
  "Private online gallery",
  "Artwork & print options available",
];

export const miniSessionPackage = {
  icon: "✨",
  name: "Seasonal Magic Mini Session",
  price: "£120",
  duration: "20–30 minutes",
  includes: [
    "Pre-session information & guidance",
    "Professionally styled seasonal set",
    "10 edited high-resolution digital images",
    "Private online gallery",
    "Artwork & print options available",
    "Perfect for families, children, couples, pets & maternity",
  ],
};

export const weddingPackages = [
  {
    icon: "💍",
    name: "Half Day Collection",
    price: "£400",
    duration: "£80 booking fee",
    includes: [
      "Ceremony coverage",
      "Family portraits",
      "Couple portraits",
      "Speeches",
      "Cake cutting",
      "First–third dance",
      "Minimum 350 professionally edited digital images",
      "Private online gallery",
      "USB + print licence",
    ],
  },
  {
    icon: "💍",
    name: "Full Day Collection",
    price: "£550",
    duration: "£110 booking fee",
    includes: [
      "Bridal preparations",
      "Ceremony coverage",
      "Family portraits",
      "Couple portraits",
      "Speeches",
      "Cake cutting",
      "First–third dance",
      "Reception coverage",
      "Minimum 350 professionally edited digital images",
      "Private online gallery",
      "USB + print licence",
    ],
  },
];

export const newbornPackages = [
  {
    icon: "👶",
    name: "Tiny Toes Newborn Session",
    price: "£150–£200",
    duration: "Gentle & baby-led",
    includes: [
      "Gentle, natural and baby-led session",
      "Capture your newborn in their earliest days",
      ...sharedCollectionIncludes,
      "£50 booking fee to secure your date",
    ],
  },
  { ...miniSessionPackage, icon: "👶", name: "Seasonal Magic Mini Session" },
];

export const familyPackages = [
  {
    icon: "👨‍👩‍👧‍👦",
    name: "Family Session",
    price: "£175–£200",
    duration: "Natural & relaxed",
    includes: [
      "Natural, relaxed sessions that capture connection",
      "Your unique family story",
      ...sharedCollectionIncludes,
      "£50 booking fee to secure your date",
    ],
  },
  {
    icon: "👨‍👩‍👧‍👦",
    name: "Milestone Memories",
    price: "£175–£200",
    duration: "Growing personalities",
    includes: [
      "Designed to capture growing personalities & curiosity",
      "Those beautiful in-between moments",
      ...sharedCollectionIncludes,
      "£50 booking fee to secure your date",
    ],
  },
  { ...miniSessionPackage, icon: "👨‍👩‍👧‍👦" },
];

export const cakeSmashPackages = [
  {
    icon: "🎂",
    name: "Let's Celebrate Cake Smash",
    price: "£150",
    duration: "1.5–2 hours",
    includes: [
      "Pre-session consultation on vision, colours & details",
      "Use of outfits, cake stands, backdrops & props",
      "Cake smash, splash (if desired) and clean portraits",
      "Private online gallery",
      "Artwork & print options available",
      "£50 booking fee to secure your date",
    ],
  },
  { ...miniSessionPackage, icon: "🎂", name: "Seasonal Magic Mini Session" },
];

export const miniSessionIncludes = [
  {
    title: "Pre-session information",
    text: "You'll receive all the details and guidance you need to make your session perfect.",
  },
  {
    title: "Professionally styled set",
    text: "Beautiful, seasonal sets designed to create a magical experience.",
  },
  {
    title: "10 edited digital images",
    text: "Professionally edited, high-resolution images delivered in your private online gallery.",
  },
  {
    title: "Artwork & print options",
    text: "A range of heirloom-quality products available to purchase after your session.",
  },
  {
    title: "Private online gallery",
    text: "A curated gallery to view, download and share your images with family and friends.",
  },
  {
    title: "Limited availability",
    text: "Only available during selected dates — bookings are first-come, first-served.",
  },
];

export const miniPerfectFor = [
  "Families",
  "Children",
  "Couples",
  "Pets",
  "Maternity",
  "Celebrating this season",
];

export const journeySteps = [
  {
    title: "Enquire",
    text: "Get in touch via the website or social media to check availability and tell us what you're looking for.",
  },
  {
    title: "Book",
    text: "Secure your date with a signed contract and booking fee. We'll send all the details to help you prepare.",
  },
  {
    title: "Plan",
    text: "We'll guide you through styling, outfit ideas and what to expect so you feel confident and excited.",
  },
  {
    title: "Your session",
    text: "Relax and enjoy — we'll take care of everything and capture the genuine moments that matter most.",
  },
  {
    title: "View your images",
    text: "Within 1–2 weeks for portrait sessions, you'll receive access to your private online gallery.",
  },
  {
    title: "Cherish & display",
    text: "Choose your favourites and turn them into beautiful artwork to enjoy for years to come.",
  },
];
