import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

interface BuildMetadataOptions {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  locale?: string;
}

const localeMap: Record<string, string> = {
  en: "en_US",
  ar: "ar_EG",
};

export function buildMetadata({
  title,
  description = siteConfig.description,
  path = "/",
  image = siteConfig.ogImage,
  locale = "en",
}: BuildMetadataOptions = {}): Metadata {
  const fullTitle = title ? `${title} | ${siteConfig.name}` : siteConfig.name;

  return {
    title: fullTitle,
    description,
    keywords: [...siteConfig.keywords],
    authors: [{ name: siteConfig.author }],
    openGraph: {
      type: "website",
      locale: localeMap[locale] ?? "en_US",
      url: path,
      siteName: siteConfig.name,
      title: fullTitle,
      description,
      images: [{ url: image, width: 1200, height: 630, alt: siteConfig.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [image],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
    },
  };
}