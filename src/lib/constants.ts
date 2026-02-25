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
