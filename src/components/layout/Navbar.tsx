"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { LAYOUT_CONFIG } from "@/data/layout-config";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";
import { Menu, X, LogOut } from "lucide-react";
import LocaleSwitcher from "@/components/LocaleSwitcher"; 

export function Navbar() {
  const t = useTranslations("Nav");
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const user = useAppSelector((state) => state.auth.user);

  const handleLogout = () => {
    dispatch(logout());
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 md:px-8">
        
        {/* Left Section: Mobile Menu Button & Brand Title */}
        <div className="flex items-center gap-3">
          {/* Mobile Hamburger Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close Menu" : "Open Menu"}
            className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground md:hidden"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <Link href="/" className="text-xl font-bold tracking-tight text-foreground">
            {t(LAYOUT_CONFIG.brand.titleKey)}
          </Link>
        </div>

        {/* Right Section / Controls (Desktop) */}
        <div className="hidden md:flex items-center gap-4">
          <LocaleSwitcher /> {/* <-- Added to Desktop Navbar */}

          {user && (
            <>
              <span className="text-sm font-medium text-muted-foreground">
                {user.name} ({user.role})
              </span>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-1.5 text-sm font-medium text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile Dropdown Menu Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-border bg-background px-4 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <span className="text-sm font-medium text-muted-foreground">Language</span>
              <LocaleSwitcher /> {/* <-- Added to Mobile Menu Drawer */}
            </div>

            {user && (
              <>
                <div className="flex flex-col gap-1 border-b border-border pb-3">
                  <span className="text-sm font-medium text-foreground">{user.name}</span>
                  <span className="text-xs text-muted-foreground capitalize">{user.role}</span>
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </>
            )}
            {!user && (
              <span className="text-sm text-muted-foreground">Not signed in</span>
            )}
          </div>
        </div>
      )}
    </header>
  );
}