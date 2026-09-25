"use client";

import { Filter } from "lucide-react";
import { useTranslations } from "next-intl";
import type { LifecycleStatus, PaymentStatus } from "../../types/billing.types";

const payments: Array<PaymentStatus | "ALL"> = ["ALL", "PAID", "NOT_PAID"];
const lifecycles: Array<LifecycleStatus | "ALL"> = [
  "ALL",
  "ACTIVE",
  "COMPLETED",
  "CANCELED",
];

interface BillingFiltersProps {
  payment: PaymentStatus | "ALL";
  lifecycle: LifecycleStatus | "ALL";
  onPaymentChange: (value: PaymentStatus | "ALL") => void;
  onLifecycleChange: (value: LifecycleStatus | "ALL") => void;
}

export function BillingFilters({
  payment,
  lifecycle,
  onPaymentChange,
  onLifecycleChange,
}: BillingFiltersProps) {
  const t = useTranslations("Trainer.billing");

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground me-1">
        <Filter className="size-3.5" />
      </div>

      {/* Payment Filter */}
      <select
        aria-label={t("filters.payment")}
        value={payment}
        onChange={(e) => onPaymentChange(e.target.value as PaymentStatus | "ALL")}
        className="h-9 rounded-lg border border-border/80 bg-background px-3 text-xs font-semibold text-foreground transition-colors hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-ring"
      >
        {payments.map((value) => (
          <option key={value} value={value}>
            {value === "ALL"
              ? t("filters.all")
              : t(`payment.${value}` as Parameters<typeof t>[0])}
          </option>
        ))}
      </select>

      {/* Lifecycle Filter */}
      <select
        aria-label={t("filters.lifecycle")}
        value={lifecycle}
        onChange={(e) => onLifecycleChange(e.target.value as LifecycleStatus | "ALL")}
        className="h-9 rounded-lg border border-border/80 bg-background px-3 text-xs font-semibold text-foreground transition-colors hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-ring"
      >
        {lifecycles.map((value) => (
          <option key={value} value={value}>
            {value === "ALL"
              ? t("filters.all")
              : t(`lifecycle.${value}` as Parameters<typeof t>[0])}
          </option>
        ))}
      </select>
    </div>
  );
}