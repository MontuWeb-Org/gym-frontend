"use client";

import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  LifecycleStatus,
  PaymentStatus,
  TrainerSubscription,
} from "../../types/billing.types";

interface BillingHistoryTableProps {
  history: TrainerSubscription[];
  loading: boolean;
  page: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
}

export function BillingHistoryTable({
  history,
  loading,
  page,
  totalPages,
  onPageChange,
}: BillingHistoryTableProps) {
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

  const renderPaymentBadge = (status: PaymentStatus) => (
    <Badge
      variant={status === "PAID" ? "default" : "destructive"}
      className="font-bold text-[10px] uppercase tracking-wider px-2 py-0.5"
    >
      {t(`payment.${status}` as Parameters<typeof t>[0])}
    </Badge>
  );

  const renderLifecycleBadge = (status: LifecycleStatus) => (
    <Badge
      variant={
        status === "ACTIVE"
          ? "default"
          : status === "COMPLETED"
          ? "secondary"
          : "outline"
      }
      className="font-bold text-[10px] uppercase tracking-wider px-2 py-0.5"
    >
      {t(`lifecycle.${status}` as Parameters<typeof t>[0])}
    </Badge>
  );

  return (
    <div className="space-y-4 text-start">
      <Card className="overflow-hidden border-border/80 shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex min-h-44 items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="size-5 animate-spin" />
              <span className="text-sm font-medium">{t("history.loading")}</span>
            </div>
          ) : history.length === 0 ? (
            <div className="py-12 text-center space-y-1">
              <p className="text-sm font-semibold text-foreground">
                {t("history.empty")}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="border-b border-border/60">
                  <TableHead className="font-heading text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Plan Name
                  </TableHead>
                  <TableHead className="font-heading text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Price
                  </TableHead>
                  <TableHead className="font-heading text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Lifecycle
                  </TableHead>
                  <TableHead className="font-heading text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Payment
                  </TableHead>
                  <TableHead className="font-heading text-xs font-bold uppercase tracking-wider text-muted-foreground text-end">
                    Date
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((item, idx) => (
                  <TableRow
                    key={`${item.subscriptionPlanId}-${item.createdAt}-${idx}`}
                    className="border-b border-border/60 hover:bg-muted/20 transition-colors"
                  >
                    <TableCell className="font-bold text-foreground">
                      {item.subscriptionPlan?.name ??
                        `${t("planFallback")} #${item.subscriptionPlanId}`}
                    </TableCell>

                    <TableCell className="font-mono text-xs font-semibold text-foreground">
                      {item.subscriptionPlan
                        ? formatPrice(item.subscriptionPlan.price)
                        : "—"}
                    </TableCell>

                    <TableCell>
                      {renderLifecycleBadge(item.lifecycleStatus)}
                    </TableCell>

                    <TableCell>
                      {renderPaymentBadge(item.paymentStatus)}
                    </TableCell>

                    <TableCell className="text-end font-mono text-xs text-muted-foreground">
                      {formatDate(item.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs pt-2">
          <span className="text-muted-foreground font-medium">
            {t("history.page", { page, totalPages })}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className="h-8 gap-1 font-semibold"
            >
              <ChevronLeft className="size-3.5 rtl:rotate-180" />
              {t("history.previous")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              className="h-8 gap-1 font-semibold"
            >
              {t("history.next")}
              <ChevronRight className="size-3.5 rtl:rotate-180" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}