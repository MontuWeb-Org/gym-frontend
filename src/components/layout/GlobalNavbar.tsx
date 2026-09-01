"use client";

import { useTranslations } from "next-intl";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";
import { useRouter } from "@/i18n/navigation";
import { Navbar } from "./Navbar";
import { NAVBAR_DATA } from "@/data/navbar.data";
import LocaleSwitcher from "@/components/LocaleSwitcher";

export function GlobalNavbar() {
  const t = useTranslations("Nav");
  const dispatch = useAppDispatch();
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);

  const handleLogout = () => {
    dispatch(logout());
    router.push("/login");
  };

  // Localize public links using translations
  const localizedLinks = NAVBAR_DATA.publicLinks.map((item) => {
    let label = item.label;
    if (item.id === "home") label = t("home");
    else if (item.id === "offerings") label = t("offerings");
    else if (item.id === "partners") label = t("partners");
    else if (item.id === "subscription") label = t("subscription");

    return {
      ...item,
      label,
    };
  });

  return (
    <Navbar
      brand={NAVBAR_DATA.brand}
      publicLinks={localizedLinks}
      user={user}
      onLogout={handleLogout}
      signInLabel={t("login")}
      logoutLabel={t("logout")}
      languageSwitcher={<LocaleSwitcher />}
      notSignedInLabel={t("login")}
    />
  );
}
