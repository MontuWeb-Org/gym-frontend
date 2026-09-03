// src/components/views/PlaceholderView.tsx
"use client";

import { useLocale } from "next-intl";

interface PlaceholderViewProps {
  title?: string;
}

export default function PlaceholderView({ title }: PlaceholderViewProps) {
  const locale = useLocale();
  const isArabic = locale === "ar";

  const defaultTitle = isArabic ? "قريباً" : "Coming Soon";
  const defaultDescription = isArabic
    ? "هذا القسم قيد التطوير حالياً وسيكون متاحاً قريباً."
    : "This section is currently under development and will be available soon.";

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-2">
        <h2 className="text-xl font-semibold">{title ?? defaultTitle}</h2>
        <p className="text-sm text-muted-foreground">
          {defaultDescription}
        </p>
      </div>
    </div>
  );
}