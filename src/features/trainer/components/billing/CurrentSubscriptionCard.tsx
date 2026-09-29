"use client";

import {
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Loader2,
  Receipt,
  Users,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type {
  LifecycleStatus,
  PaymentStatus,
  TrainerSubscription,
} from "../../types/billing.types";

interface CurrentSubscriptionCardProps {
  subscription: TrainerSubscription | null;
  loading: boolean;
}

export function CurrentSubscriptionCard({
  subscription,
  loading,
}: CurrentSubscriptionCardProps) {
  const t = useTranslations("Trainer.billing");
  const locale = useLocale();

  const formatDate = (value: string) =>
    new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(
      new Date(value)
    );

  const formatPrice = (value: number) =>
    new Intl.NumberFormat(locale, { style: "currency", currency: "USD" }).format(
      value
    );

  const paymentText = (value: PaymentStatus) =>
    t(`payment.${value}` as Parameters<typeof t>[0]);

  const lifecycleText = (value: LifecycleStatus) =>
    t(`lifecycle.${value}` as Parameters<typeof t>[0]);

  if (loading) {
    return (
      <Card className="border-border/80 shadow-sm">
        <CardContent className="flex min-h-48 items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="size-5 animate-spin" />
          <span className="text-sm font-medium">{t("loading")}</span>
        </CardContent>
      </Card>
    );
  }

  if (!subscription) {
    return (
      <Card className="border-dashed border-2 border-border/80">
        <CardContent className="flex min-h-48 flex-col items-center justify-center p-6 text-center space-y-2">
          <div className="size-12 rounded-full bg-muted flex items-center justify-center">
            <Receipt className="size-6 text-muted-foreground" />
          </div>
          <p className="font-heading font-bold text-lg text-foreground">
            {t("current.emptyTitle")}
          </p>
          <p className="text-sm text-muted-foreground max-w-sm">
            {t("current.emptyDescription")}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-border/80 bg-card shadow-md text-start">
      {/* Header Banner */}
      <CardHeader className="border-b border-border/60 bg-muted/30 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <CardTitle className="font-heading text-2xl font-black tracking-wider text-foreground">
              {subscription.subscriptionPlan?.name ?? t("planFallback")}
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              {subscription.subscriptionPlan?.billingPeriod
                ? `${subscription.subscriptionPlan.billingPeriod} Plan`
                : t("current.label")}
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant={
                subscription.lifecycleStatus === "ACTIVE"
                  ? "default"
                  : subscription.lifecycleStatus === "COMPLETED"
                  ? "secondary"
                  : "outline"
              }
              className="font-bold text-[10px] uppercase tracking-wider px-2 py-0.5"
            >
              {lifecycleText(subscription.lifecycleStatus)}
            </Badge>

            <Badge
              variant={
                subscription.paymentStatus === "PAID" ? "default" : "destructive"
              }
              className="font-bold text-[10px] uppercase tracking-wider px-2 py-0.5"
            >
              {paymentText(subscription.paymentStatus)}
            </Badge>
          </div>
        </div>
      </CardHeader>

      {/* Plan Metrics */}
      <CardContent className="grid gap-6 p-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex items-center gap-3 rounded-lg border border-border/40 bg-muted/20 p-3">
          <CreditCard className="size-5 text-primary shrink-0" />
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase">
              {t("current.price")}
            </p>
            <p className="font-mono text-base font-bold text-foreground">
              {subscription.subscriptionPlan
                ? formatPrice(subscription.subscriptionPlan.price)
                : t("notAvailable")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-lg border border-border/40 bg-muted/20 p-3">
          <Users className="size-5 text-primary shrink-0" />
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase">
              {t("current.traineeLimit")}
            </p>
            <p className="font-mono text-base font-bold text-foreground">
              {subscription.subscriptionPlan?.maxTrainees ?? t("notAvailable")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-lg border border-border/40 bg-muted/20 p-3">
          <CalendarDays className="size-5 text-primary shrink-0" />
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase">
              {t("current.started")}
            </p>
            <p className="text-sm font-bold text-foreground">
              {formatDate(subscription.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-lg border border-border/40 bg-muted/20 p-3">
          <CheckCircle2 className="size-5 text-primary shrink-0" />
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase">
              {t("current.lastUpdated")}
            </p>
            <p className="text-sm font-bold text-foreground">
              {formatDate(subscription.updatedAt)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}