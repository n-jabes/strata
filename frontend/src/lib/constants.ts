export const APP_NAME = "STRATA";
export const APP_TAGLINE = "Smart Terraced Agriculture for Africa";

export const PUBLIC_NAV_LINKS = [
  { label: "Features", href: "/#features" },
  { label: "About", href: "/#about" },
  { label: "Analyze Land", href: "/dashboard/analyze" },
] as const;

export const AUTH_NAV_LINKS = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Analyze Land", href: "/dashboard/analyze" },
] as const;

export const SIDEBAR_LINKS = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Analyze Land", href: "/dashboard/analyze" },
  { label: "My Farms", href: "/dashboard/farms" },
  { label: "Recommendations", href: "/dashboard/recommendations" },
] as const;

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
