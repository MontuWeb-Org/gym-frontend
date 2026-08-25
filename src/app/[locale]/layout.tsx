import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import StoreProvider from "@/store/StoreProvider";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://yourdomain.com"),
  title: {
    default: "Gym App — Fitness Made Simple",
    template: "%s | Gym App",
  },
  description: "Track workouts, manage memberships, and reach your fitness goals.",
  keywords: ["gym", "fitness", "workout tracker", "membership management"],
  authors: [{ name: "Montu" }],
  creator: "Montu",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Gym App",
    title: "Gym App — Fitness Made Simple",
    description: "Track workouts, manage memberships, and reach your fitness goals.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Gym App",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Gym App — Fitness Made Simple",
    description: "Track workouts, manage memberships, and reach your fitness goals.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "../../../public/favicon.ico",
  },
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function RootLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) notFound();

  const messages = await getMessages();

  return (
    <html
      lang={locale}
      dir={locale === "ar" ? "rtl" : "ltr"}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <StoreProvider>
          <NextIntlClientProvider locale={locale} messages={messages}>
            {children}
            <ThemeToggle  />
          </NextIntlClientProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
