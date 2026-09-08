"use client";

import { ChartData } from "../types/dashboard.types";
import { ResponsiveContainer, LineChart, BarChart, Line, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

interface ChartWidgetProps {
  data: ChartData;
}

export default function ChartWidget({ data }: ChartWidgetProps) {
  // Format data for Recharts
  const chartFormattedData = data.labels.map((label, index) => {
    const entry: Record<string, any> = { name: label };
    data.datasets.forEach((dataset) => {
      entry[dataset.label] = dataset.data[index];
    });
    return entry;
  });

  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm col-span-1 lg:col-span-2">
      <h3 className="text-sm font-medium text-muted-foreground mb-4">{data.title}</h3>
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {data.chartType === 'line' ? (
            <LineChart data={chartFormattedData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip />
              {data.datasets.map((ds, idx) => (
                <Line key={idx} type="monotone" dataKey={ds.label} stroke="#2563eb" strokeWidth={2} />
              ))}
            </LineChart>
          ) : (
            <BarChart data={chartFormattedData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip />
              {data.datasets.map((ds, idx) => (
                <Bar key={idx} dataKey={ds.label} fill="#2563eb" radius={[4, 4, 0, 0]} />
              ))}
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}