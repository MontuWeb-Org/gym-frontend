import React from "react";
import { Home, Layers, Users, CreditCard } from "lucide-react";

export interface NavbarItem {
  id: string;
  label: React.ReactNode;
  href: string;
  icon?: React.ReactNode;
}

export interface NavbarData {
  brand: {
    title: React.ReactNode;
    href: string;
  };
  publicLinks: NavbarItem[];
  labels: {
    signIn: React.ReactNode;
    logout: React.ReactNode;
    language: React.ReactNode;
    notSignedIn: React.ReactNode;
  };
}

export const NAVBAR_DATA: NavbarData = {
  brand: {
    title: (
      <span className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
        <span className="rounded-md bg-primary px-2.5 py-0.5 text-primary-foreground text-sm font-extrabold uppercase">GYM</span>
        <span>Platform</span>
      </span>
    ),
    href: "/",
  },
  publicLinks: [
    {
      id: "home",
      label: "Home",
      href: "#",
      icon: <Home className="h-4 w-4" />,
    },
    {
      id: "offerings",
      label: "Our Offerings",
      href: "#",
      icon: <Layers className="h-4 w-4" />,
    },
    {
      id: "partners",
      label: "Partners",
      href: "#",
      icon: <Users className="h-4 w-4" />,
    },
    {
      id: "subscription",
      label: "Subscription",
      href: "#",
      icon: <CreditCard className="h-4 w-4" />,
    },
  ],
  labels: {
    signIn: <span className="font-semibold">Sign In</span>,
    logout: <span>Logout</span>,
    language: <span>Language</span>,
    notSignedIn: <span>Not signed in</span>,
  },
};
