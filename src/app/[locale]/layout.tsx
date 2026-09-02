// src/app/[locale]/layout.tsx
import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";
import StoreProvider from "@/store/StoreProvider";
import { Navbar } from "@/components/layout/Navbar";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { buildMetadata } from "@/lib/metadata";
import { siteConfig } from "@/config/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    metadataBase: new URL(siteConfig.url),
    ...buildMetadata({
      title: t("title"),
      description: t("description"),
      locale,
    }),
    icons: {
      icon: "/favicon.ico",
      apple: "/apple-touch-icon.png",
    },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  const messages = await getMessages();
  const t = await getTranslations({ locale, namespace: "Nav" });

  const localizedPublicLinks = [
    { href: "/", label: t("home") },
    { href: "/offerings", label: t("offerings") },
    { href: "/partners", label: t("partners") },
    { href: "/subscription", label: t("subscription") },
  ];

  return (
    <html
      lang={locale}
      dir={locale === "ar" ? "rtl" : "ltr"}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <StoreProvider>
          <NextIntlClientProvider locale={locale} messages={messages}>
            {/* Navbar is back globally across the entire app */}
            <Navbar
              brand={{ title: t("brandName"), href: "/" }}
              publicLinks={localizedPublicLinks}
              languageSwitcher={<LocaleSwitcher />}
            />
            <div className="flex-1 flex flex-col">{children}</div>
            <ThemeToggle />
          </NextIntlClientProvider>
        </StoreProvider>
      </body>
    </html>
  );
}