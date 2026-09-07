// src/components/views/common/ComingSoonView.tsx
"use client";

import { useLocale } from "next-intl";
import { Construction } from "lucide-react";

export default function ComingSoonView() {
  const locale = useLocale();
  const isArabic = locale === "ar";

  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] p-8 text-center rounded-xl border border-border bg-card/50 shadow-sm space-y-4">
      <div className="p-4 rounded-full bg-primary/10 text-primary">
        <Construction className="size-8" />
      </div>
      <div className="space-y-1 max-w-sm">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          {isArabic ? "قريباً" : "Coming Soon"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {isArabic
            ? "هذا القسم قيد التطوير حالياً وسيكون متاحاً قريباً."
            : "This section is currently under development and will be available soon."}
        </p>
      </div>
    </div>
  );
}