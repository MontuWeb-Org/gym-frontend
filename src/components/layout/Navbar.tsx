"use client";

import React, { useState } from "react";
import { Link } from "@/i18n/navigation";
import { Menu, X, LogOut } from "lucide-react";

export interface NavbarItemProps {
  id: string;
  label: React.ReactNode;
  href: string;
  icon?: React.ReactNode;
}

export interface NavbarProps {
  brand: {
    title: React.ReactNode;
    href: string;
  };
  publicLinks?: NavbarItemProps[];
  user?: {
    name: string;
    role: string;
    email?: string;
  } | null;
  onLogout?: () => void;
  signInLabel?: React.ReactNode;
  logoutLabel?: React.ReactNode;
  languageSwitcher?: React.ReactNode;
  notSignedInLabel?: React.ReactNode;
}

/**
 * Dumb Navbar Component - Accepts configuration, brand info, user state, and event handlers strictly via props.
 * Handles non-functional placeholder links smoothly without hash redirection.
 */
export function Navbar({
  brand,
  publicLinks = [],
  user,
  onLogout,
  signInLabel = "Sign In",
  logoutLabel = "Logout",
  languageSwitcher,
  notSignedInLabel = "Not signed in",
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLinkClick = (e: React.MouseEvent, href: string) => {
    if (href === "#" || !href) {
      e.preventDefault();
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 md:px-8">
        {/* Left Section: Mobile Menu Toggle & Brand Component */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close Menu" : "Open Menu"}
            className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground md:hidden"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <Link href={brand.href} className="flex items-center">
            {brand.title}
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 ms-6">
            {publicLinks.map((item) => (
              <a
                key={item.id}
                href={item.href}
                onClick={(e) => handleLinkClick(e, item.href)}
                className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                {item.icon}
                <span>{item.label}</span>
              </a>
            ))}
          </nav>
        </div>

        {/* Right Section: Language Switcher & Auth Actions */}
        <div className="hidden md:flex items-center gap-4">
          {languageSwitcher}

          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex flex-col text-end">
                <span className="text-sm font-medium text-foreground">{user.name}</span>
                <span className="text-xs text-muted-foreground capitalize">{user.role}</span>
              </div>
              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  className="inline-flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-1.5 text-sm font-medium text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  {logoutLabel}
                </button>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              {signInLabel}
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="border-b border-border bg-background px-4 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            {/* Mobile Nav Links */}
            <div className="flex flex-col gap-2 pb-3 border-b border-border">
              {publicLinks.map((item) => (
                <a
                  key={item.id}
                  href={item.href}
                  onClick={(e) => {
                    handleLinkClick(e, item.href);
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 px-2 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  {item.icon}
                  <span>{item.label}</span>
                </a>
              ))}
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-border">
              <span className="text-sm font-medium text-muted-foreground">Language</span>
              {languageSwitcher}
            </div>

            {user ? (
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium text-foreground">{user.name}</span>
                  <span className="text-xs text-muted-foreground capitalize">{user.role}</span>
                </div>
                {onLogout && (
                  <button
                    type="button"
                    onClick={() => {
                      onLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    {logoutLabel}
                  </button>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                {signInLabel}
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}