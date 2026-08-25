export const siteConfig = {
  name: "Gym App",
  description: "Track workouts, manage memberships, and reach your fitness goals.",
  url: process.env.NEXT_PUBLIC_SITE_URL!,
  ogImage: "/og-image.png",
  keywords: ["gym", "fitness", "workout tracker", "membership management"],
  author: "Montu",
} as const;