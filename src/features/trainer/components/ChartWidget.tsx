"use client";

import { ChartData } from "../types/dashboard.types";
import { ResponsiveContainer, LineChart, BarChart, Line, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { useTranslations } from "next-intl";

interface ChartDataset {
  label?: string;
  labelKey?: string;
  data: number[];
}

interface ChartWidgetProps {
  data: ChartData & {
    titleKey?: string;
    datasets: ChartDataset[];
  };
}

export default function ChartWidget({ data }: ChartWidgetProps) {
  const t = useTranslations("Trainer.dashboard");

  const title = data.titleKey ? t(data.titleKey as Parameters<typeof t>[0]) : (data.title || "");

  // Explicitly cast datasets to override the imported strict type from ChartData
  const typedDatasets = (data.datasets || []) as ChartDataset[];

  // Format data for Recharts
  const chartFormattedData = data.labels.map((label, index) => {
    const entry: Record<string, string | number> = { name: label };
    typedDatasets.forEach((dataset) => {
      const key = dataset.labelKey ? t(dataset.labelKey as Parameters<typeof t>[0]) : (dataset.label || "Value");
      entry[key] = dataset.data[index];
    });
    return entry;
  });

  return (
    <div className="col-span-1 rounded-xl border bg-card p-6 shadow-sm lg:col-span-2">
      <h3 className="mb-4 text-sm font-medium text-muted-foreground">{title}</h3>
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {data.chartType === 'line' ? (
            <LineChart data={chartFormattedData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip />
              {typedDatasets.map((ds, idx) => {
                const key = ds.labelKey ? t(ds.labelKey as Parameters<typeof t>[0]) : (ds.label || "Value");
                return <Line key={idx} type="monotone" dataKey={key} stroke="#2563eb" strokeWidth={2} />;
              })}
            </LineChart>
          ) : (
            <BarChart data={chartFormattedData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip />
              {typedDatasets.map((ds, idx) => {
                const key = ds.labelKey ? t(ds.labelKey as Parameters<typeof t>[0]) : (ds.label || "Value");
                return <Bar key={idx} dataKey={key} fill="#2563eb" radius={[4, 4, 0, 0]} />;
              })}
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}