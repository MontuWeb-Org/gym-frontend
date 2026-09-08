"use client";

import { TableData } from "../types/dashboard.types";
import { AlertTriangle } from "lucide-react";

interface TableWidgetProps {
  data: TableData;
}

export default function TableWidget({ data }: TableWidgetProps) {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm col-span-1 md:col-span-2 lg:col-span-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2 text-amber-500 font-medium text-sm">
          <AlertTriangle className="h-4 w-4" />
          <span>{data.title}</span>
        </div>
        <span className="text-xs text-muted-foreground cursor-pointer hover:underline">View all</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b text-muted-foreground uppercase text-xs tracking-wider">
              {data.columns.map((col, idx) => (
                <th key={idx} className="pb-3 font-medium">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {data.rows.map((row) => (
              <tr key={row.id} className="hover:bg-muted/50 transition-colors">
                <td className="py-3 flex items-center space-x-2 font-medium">
                  <span className="h-2 w-2 rounded-full bg-rose-500" />
                  <span>{row.name}</span>
                </td>
                <td className="py-3">{row.adherence}</td>
                <td className="py-3 text-muted-foreground">{row.lastSession}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}