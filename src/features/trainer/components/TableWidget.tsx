"use client";

import { useTranslations, useLocale } from "next-intl";

interface TableWidgetProps {
  data: {
    titleKey?: string;
    title?: string;
    columns?: string[];
    rows: Array<{
      id: string;
      name: string;
      adherence: string;
      lastSession: string;
    }>;
  };
}

export default function TableWidget({ data }: TableWidgetProps) {
  const tDashboard = useTranslations("Trainer.dashboard");
  const tTable = useTranslations("TraineesTable");
  const locale = useLocale();
  const isRtl = locale === "ar";

  const title = data.titleKey ? tDashboard(data.titleKey as any) : (data.title || tDashboard("fallingBehindTitle"));
  
  // Standard columns order: [Name, Adherence, Last Active]
  const baseColumns = data.columns || [
    tTable("columns.name"),
    tTable("columns.adherence"),
    tTable("columns.lastActive"),
  ];

  // Flip column order for RTL so Last Active is on the left and Name is on the right
  const columns = isRtl ? [...baseColumns] : baseColumns;

  return (
    <div className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm" dir={isRtl ? "rtl" : "ltr"}>
      <h3 className={`mb-4 text-lg font-semibold ${isRtl ? "text-right" : "text-left"}`}>{title}</h3>
      <div className="overflow-x-auto">
        <table className={`w-full text-sm ${isRtl ? "text-right" : "text-left"}`}>
          <thead>
            <tr className="border-b text-muted-foreground uppercase text-xs tracking-wider">
              {columns.map((col, idx) => (
                <th key={idx} className={`pb-3 font-medium ${isRtl ? "text-right" : "text-left"}`}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {data.rows && data.rows.length > 0 ? (
              data.rows.map((row) => {
                // Keep raw ISO timestamp format to match the trainees table view
                const cells = isRtl ? [
                  <div key="name" className="font-medium flex items-center gap-2 justify-start">
                    {row.name}
                    <span className="h-2 w-2 rounded-full bg-destructive" />
                  </div>,
                  <span key="adherence">{row.adherence}</span>,
                  <span key="last" className="text-muted-foreground">{row.lastSession}</span>
                ] : [
                  <div key="name" className="font-medium flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-destructive" />
                    {row.name}
                  </div>,
                  <span key="adherence">{row.adherence}</span>,
                  <span key="last" className="text-muted-foreground">{row.lastSession}</span>
                ];

                return (
                  <tr key={row.id} className="hover:bg-muted/50">
                    {cells.map((cell, cIdx) => (
                      <td key={cIdx} className={`py-3 ${isRtl ? "text-right" : "text-left"}`}>{cell}</td>
                    ))}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={columns.length} className="py-6 text-center text-muted-foreground">
                  {tTable("states.empty")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}