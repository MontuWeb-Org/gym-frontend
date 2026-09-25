"use client";

import { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/layout/PageHeader";

// Sub-components
import { CurrentSubscriptionCard } from "../components/billing/CurrentSubscriptionCard";
import { BillingFilters } from "../components/billing/BillingFilters";
import { BillingHistoryTable } from "../components/billing/BillingHistoryTable";

// Types & Services
import { trainerService } from "../services/trainer.service";
import type {
  BillingHistoryQuery,
  LifecycleStatus,
  PaymentStatus,
  TrainerSubscription,
} from "../types/billing.types";

export default function BillingView() {
  const t = useTranslations("Trainer.billing");

  const [current, setCurrent] = useState<TrainerSubscription | null>(null);
  const [history, setHistory] = useState<TrainerSubscription[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [payment, setPayment] = useState<PaymentStatus | "ALL">("ALL");
  const [lifecycle, setLifecycle] = useState<LifecycleStatus | "ALL">("ALL");

  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load Current Subscription
  useEffect(() => {
    let cancelled = false;
    trainerService
      .getCurrentSubscription()
      .then((value) => {
        if (!cancelled) setCurrent(value);
      })
      .catch(() => {
        if (!cancelled) setError(t("errors.loadCurrent"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [t]);

  // Load Subscription History
  useEffect(() => {
    let cancelled = false;
    setHistoryLoading(true);
    const query: BillingHistoryQuery = {
      pageNumber: page,
      pageSize: 10,
      paymentStatus: payment === "ALL" ? undefined : payment,
      lifecycleStatus: lifecycle === "ALL" ? undefined : lifecycle,
    };

    trainerService
      .getSubscriptionHistory(query)
      .then((result) => {
        if (!cancelled) {
          setHistory(result.data);
          setTotalPages(result.pagination.totalPages);
        }
      })
      .catch(() => {
        if (!cancelled) setError(t("errors.loadHistory"));
      })
      .finally(() => {
        if (!cancelled) setHistoryLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [lifecycle, page, payment, t]);

  return (
    <div className="space-y-8 text-start">
      <PageHeader title={t("title")} />

      {/* Global Error Banner */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm font-medium text-destructive">
          <AlertCircle className="size-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* CURRENT SUBSCRIPTION SECTION */}
      <section className="space-y-3">
        <h2 className="font-heading text-md font-bold uppercase tracking-wider text-muted-foreground">
          {t("current.label")}
        </h2>
        <CurrentSubscriptionCard subscription={current} loading={loading} />
      </section>

      {/* BILLING HISTORY SECTION */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border/60 pb-3">
          <div>
            <h2 className="font-heading text-lg tracking-wider font-bold text-foreground">
              {t("history.title")}
            </h2>
            <p className="text-xs text-muted-foreground">
              {t("history.description")}
            </p>
          </div>

          <BillingFilters
            payment={payment}
            lifecycle={lifecycle}
            onPaymentChange={(val) => {
              setPayment(val);
              setPage(1);
            }}
            onLifecycleChange={(val) => {
              setLifecycle(val);
              setPage(1);
            }}
          />
        </div>

        <BillingHistoryTable
          history={history}
          loading={historyLoading}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </section>
    </div>
  );
}