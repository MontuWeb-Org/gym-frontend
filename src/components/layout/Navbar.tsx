"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter, Link } from "@/i18n/navigation";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { logout } from "@/features/auth/store/auth.slice";
import { authService } from "@/features/auth/services/auth.service";
import { Button } from "@/components/ui/button";
import { tokenStorage } from "@/lib/storage";

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
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const safeBrand = brand ?? { title: t("brandName"), href: "/" };
  const safeLinks = publicLinks ?? [];

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await authService.logout();
    } catch (error) {
      console.error("Logout request failed, cleaning local state anyway:", error);
    } finally {
      tokenStorage.clearTokens();
      dispatch(logout());
      setMobileMenuOpen(false);
      setIsLoggingOut(false);
      router.push("/login");
    }
  };

  const formatRole = (role?: string) => {
    if (!role) return "";
    return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
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
          {safeLinks.map((link) => (
            <Link 
              key={`desktop-${link.href}`} 
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
              <div className="flex flex-col text-right">
                <span className="text-sm font-medium">{user.name}</span>
                <span className="text-xs text-muted-foreground">{formatRole(user.role)}</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? "..." : t("logout")}
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
          {safeLinks.map((link) => (
            <Link 
              key={`mobile-${link.href}`} 
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
                <span className="text-xs text-muted-foreground">{formatRole(user.role)}</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                >
                  {isLoggingOut ? "..." : t("logout")}
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