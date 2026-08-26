"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { useTransition } from "react";

export default function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleLocaleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextLocale = e.target.value;
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  };

  return (
    <div className="relative inline-block">
      <select
        defaultValue={locale}
        disabled={isPending}
        onChange={handleLocaleChange}
        className="px-3 py-1.5 text-sm font-medium rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
        suppressHydrationWarning
      >
        <option value="en">English</option>
        <option value="ar">العربية</option>
      </select>
    </div>
  );
}