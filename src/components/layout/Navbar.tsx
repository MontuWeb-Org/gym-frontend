// src/components/layout/Navbar.tsx
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

interface NavbarProps {
  brand?: {
    title: React.ReactNode;
    href?: string;
  };
  publicLinks?: Array<{
    href: string;
    label: React.ReactNode;
  }>;
  languageSwitcher?: React.ReactNode;
}

export function Navbar({ brand, publicLinks, languageSwitcher }: NavbarProps) {
  const t = useTranslations("Nav");
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const safeBrand = brand ?? { title: t("brandName"), href: "/" };
  const safeLinks = publicLinks ?? [];

  const handleLogout = () => {
    dispatch(logout());
    router.push("/");
    router.refresh();
  };

  return (
    <header className="border-b border-border bg-background px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Brand / Logo */}
        <Link href={safeBrand.href ?? "/"} className="font-bold text-lg">
          {safeBrand.title}
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6">
          {safeLinks.map((link, index) => (
            <Link 
              key={`${link.href}-${index}`} 
              href={link.href} 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Actions (Desktop) */}
        <div className="hidden md:flex items-center gap-4">
          {languageSwitcher}

          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">{user.name}</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
              >
                {t("logout")}
              </Button>
            </div>
          ) : (
            <Link href="/login">
              <Button size="sm">{t("login")}</Button>
            </Link>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-3">
          {languageSwitcher}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-foreground focus:outline-none"
            aria-label="Toggle Menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-4 pt-4 border-t border-border flex flex-col gap-4 pb-2">
          {safeLinks.map((link, index) => (
            <Link 
              key={`mobile-${link.href}-${index}`} 
              href={link.href} 
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-border flex flex-col gap-2">
            {isAuthenticated && user ? (
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium">{user.name}</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                >
                  {t("logout")}
                </Button>
              </div>
            ) : (
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button size="sm" className="w-full">{t("login")}</Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}