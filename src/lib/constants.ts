export const INDUSTRIES = [
  "Fashion & Apparel", "Beauty & Cosmetics", "Food & Beverage",
  "Fitness & Wellness", "Technology", "Entertainment", "Gaming",
  "Travel & Hospitality", "Education", "Finance", "Real Estate",
  "Automotive", "Healthcare", "E-commerce", "SaaS", "Media",
  "Sports", "Music", "Art & Design", "Sustainability",
] as const;

export type Industry = (typeof INDUSTRIES)[number];

export const TREND_CATEGORIES = [
  "Audio/Music", "Dance", "Comedy", "Tutorial", "Challenge",
  "Aesthetic", "Storytime", "Review", "Transformation", "POV",
  "GRWM", "Lifestyle", "Food", "Fashion", "Tech",
] as const;

export const TREND_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  emerging: { label: "Emerging", color: "#14B8A6" },
  active: { label: "Active", color: "#3B82F6" },
  peaking: { label: "Peaking", color: "#F59E0B" },
  declining: { label: "Declining", color: "#F97316" },
  expired: { label: "Expired", color: "#94A3B8" },
};

export const VELOCITY_THRESHOLDS = {
  low: 25,
  medium: 50,
  high: 75,
} as const;

export const BREAKOUT_THRESHOLDS = {
  auto_analyze: 40,
  high: 60,
  viral: 80,
} as const;

export const SCRAPE_INTERVAL_HOURS = 6;

export const RELEVANCE_THRESHOLDS = {
  low: 20,
  medium: 40,
  high: 60,
  auto_analyze: 20,
} as const;

export const INDUSTRY_TERMS: Record<string, string[]> = {
  "Fashion & Apparel": ["fashion", "style", "outfit", "ootd", "clothing", "streetwear", "designer", "model", "runway", "aesthetic", "fit", "drip", "thrift", "haul"],
  "Beauty & Cosmetics": ["beauty", "makeup", "skincare", "cosmetics", "grwm", "tutorial", "glow", "routine", "foundation", "lipstick", "serum", "skin", "concealer"],
  "Food & Beverage": ["food", "recipe", "cooking", "foodie", "restaurant", "chef", "baking", "meal", "drink", "cocktail", "coffee", "taste", "mukbang", "asmr"],
  "Fitness & Wellness": ["fitness", "workout", "gym", "health", "wellness", "yoga", "muscle", "gains", "exercise", "nutrition", "mindfulness", "protein"],
  "Technology": ["tech", "software", "ai", "coding", "startup", "app", "digital", "innovation", "gadget", "review", "programming", "developer"],
  "Entertainment": ["entertainment", "movie", "tv", "show", "celebrity", "drama", "streaming", "netflix", "film", "series", "trailer", "reaction"],
  "Gaming": ["gaming", "game", "gamer", "esports", "stream", "twitch", "console", "pc", "playstation", "xbox", "nintendo", "gameplay"],
  "Travel & Hospitality": ["travel", "vacation", "hotel", "flight", "destination", "explore", "adventure", "wanderlust", "trip", "tourism", "resort"],
  "Education": ["education", "learning", "study", "student", "school", "teacher", "knowledge", "tips", "howto", "tutorial", "lesson", "college"],
  "Finance": ["finance", "money", "investing", "crypto", "stocks", "budget", "savings", "wealth", "trading", "fintech", "economy", "passive"],
  "Real Estate": ["realestate", "property", "home", "house", "apartment", "interior", "decor", "renovation", "mortgage", "realtor"],
  "Automotive": ["car", "auto", "vehicle", "driving", "automotive", "electric", "ev", "race", "supercar", "motorcycle", "truck"],
  "Healthcare": ["healthcare", "medical", "doctor", "health", "hospital", "patient", "mental", "therapy", "diagnosis", "pharmaceutical"],
  "E-commerce": ["ecommerce", "shopping", "deals", "sale", "product", "review", "unboxing", "haul", "amazon", "dropshipping"],
  "SaaS": ["saas", "software", "b2b", "startup", "productivity", "automation", "tool", "platform", "workflow", "cloud"],
  "Media": ["media", "news", "journalism", "podcast", "content", "creator", "viral", "social", "digital", "broadcast"],
  "Sports": ["sports", "athlete", "football", "basketball", "soccer", "baseball", "training", "team", "championship", "highlights"],
  "Music": ["music", "song", "artist", "album", "concert", "band", "singer", "producer", "beat", "lyric", "spotify"],
  "Art & Design": ["art", "design", "creative", "illustration", "painting", "graphic", "drawing", "artist", "canvas", "digital"],
  "Sustainability": ["sustainability", "eco", "green", "climate", "environment", "recycle", "organic", "vegan", "zerowaste", "renewable"],
} as const;

export const FORMAT_TYPE_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
  sound_trend: { label: "Sound Trend", icon: "Music", color: "#EC4899" },
  meme_template: { label: "Meme Template", icon: "Image", color: "#F59E0B" },
  challenge: { label: "Challenge", icon: "Flame", color: "#EF4444" },
  tutorial_format: { label: "Tutorial", icon: "BookOpen", color: "#3B82F6" },
  pov_format: { label: "POV Format", icon: "Eye", color: "#8B5CF6" },
  grwm: { label: "GRWM", icon: "Sparkles", color: "#EC4899" },
  transition_trend: { label: "Transition", icon: "Shuffle", color: "#14B8A6" },
  storytime: { label: "Storytime", icon: "MessageCircle", color: "#F97316" },
  before_after: { label: "Before/After", icon: "ArrowRight", color: "#10B981" },
  other: { label: "Other", icon: "Hash", color: "#94A3B8" },
};

export const CAPTION_FORMAT_SIGNALS: Record<string, string[]> = {
  pov_format: ["pov:", "pov "],
  tutorial_format: ["how to", "tutorial", "step by step", "step 1", "here's how", "easy way to", "learn how"],
  grwm: ["grwm", "get ready with me", "getting ready"],
  storytime: ["storytime", "story time", "let me tell you", "so basically"],
  challenge: ["challenge", "try this", "can you", "duet this"],
  before_after: ["before and after", "before vs after", "glow up", "transformation"],
  transition_trend: ["wait for it", "watch this", "transition"],
  meme_template: ["when you", "when your", "me when", "that moment when", "nobody:", "no one:"],
  sound_trend: ["this sound", "use this sound", "this audio"],
};
