import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

export const routing = defineRouting({
  locales: ["en", "ar"],
  defaultLocale: "en",
});

// Export navigation utilities created from routing config
export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);