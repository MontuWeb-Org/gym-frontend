// src/components/layout/Navbar.tsx
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter, Link } from "@/i18n/navigation";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { logoutThunk } from "@/features/auth/store/auth.slice";
import { selectCurrentUser } from "@/features/user/store/user.slice";
import { ROUTES, getDashboardRoute } from "@/data/routes";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, Menu, X, LogOut, LogIn, LayoutDashboard } from "lucide-react";

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
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const user = useAppSelector(selectCurrentUser);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const safeBrand = brand ?? { title: t("brandName"), href: ROUTES.HOME };
  const safeLinks = publicLinks ?? [];

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await dispatch(logoutThunk()).unwrap();
    } catch (error) {
      console.error("Logout request failed, local state was cleared anyway:", error);
    } finally {
      setMobileMenuOpen(false);
      setIsLoggingOut(false);
      router.push(ROUTES.LOGIN);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "GY";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        
        {/* Brand / Logo */}
        <Link
          href={safeBrand.href ?? ROUTES.HOME}
          className="flex items-center gap-2 font-heading text-xl font-bold tracking-wider uppercase text-foreground hover:opacity-90 transition-opacity"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
            <Dumbbell className="h-5 w-5" />
          </div>
          <span>{safeBrand.title}</span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          {safeLinks.map((link) => (
            <Link
              key={`desktop-${link.href}`}
              href={link.href}
              className="font-heading text-sm font-semibold uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Actions (Desktop) */}
        <div className="hidden md:flex items-center gap-4">
          {languageSwitcher}

          {isAuthenticated && user ? (
            <div className="flex items-center gap-3 ps-3 border-s border-border/60">
              <Link 
                href={getDashboardRoute(user.role)}
                className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-accent/60 transition-colors group"
                title="Go to Dashboard"
              >
                <Avatar className="h-9 w-9 border border-primary/20 group-hover:border-primary transition-colors">
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex flex-col text-start">
                  <span className="text-xs font-bold leading-tight text-foreground group-hover:text-primary transition-colors">
                    {user.name}
                  </span>
                  <Badge variant="secondary" className="w-fit text-[10px] px-1.5 py-0 uppercase tracking-widest font-semibold mt-0.5">
                    {user.role}
                  </Badge>
                </div>
              </Link>

              <Button
                  variant="outline"
                  size="lg"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="border-destructive/30 text-destructive hover:bg-destructive hover:text-background"
                >
                  <LogOut className="h-4 w-4 me-2 rtl:rotate-180" />
                  {isLoggingOut ? "..." : t("logout")}
                </Button>
            </div>
          ) : (
            <Button asChild size="lg" className="py-4 font-heading text-md tracking-wider">
              <Link href={ROUTES.LOGIN}>
                <LogIn className="me-1.5 h-4 w-4" />
                {t("login")}
              </Link>
            </Button>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          {languageSwitcher}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Menu"
            className="text-foreground"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Dropdown Drawer */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 w-full md:hidden border-t border-border/60 bg-background/95 backdrop-blur-lg px-4 py-5 space-y-4 shadow-xl">
          <nav className="flex flex-col space-y-3">
            {safeLinks.map((link) => (
              <Link
                key={`mobile-${link.href}`}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="font-heading text-base font-semibold uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors py-1"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="pt-4 border-t border-border/60">
            {isAuthenticated && user ? (
              <div className="flex flex-col gap-3">
                <Link
                  href={getDashboardRoute(user.role)}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-3 rounded-xl bg-card border border-border/60 hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-primary/20">
                      <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col text-start">
                      <span className="text-sm font-bold text-foreground">{user.name}</span>
                      <Badge variant="outline" className="w-fit text-[10px] uppercase tracking-wider font-semibold">
                        {user.role}
                      </Badge>
                    </div>
                  </div>
                  <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                </Link>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full border-destructive/30 text-destructive hover:bg-destructive hover:text-background"
                >
                  <LogOut className="h-4 w-4 me-2 rtl:rotate-180" />
                  {isLoggingOut ? "..." : t("logout")}
                </Button>
              </div>
            ) : (
              <Button asChild size="lg" className="w-full py-4 font-heading text-md tracking-wider">
                <Link href={ROUTES.LOGIN} onClick={() => setMobileMenuOpen(false)}>
                  <LogIn className="me-2 h-4 w-4" />
                  {t("login")}
                </Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}