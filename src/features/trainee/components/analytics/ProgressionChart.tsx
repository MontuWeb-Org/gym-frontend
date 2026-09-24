"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { ProgressionEvent } from "../../types/analytics.types";

interface ProgressionChartProps {
  events: ProgressionEvent[];
}

interface ChartPoint {
  id: number;
  date: string;
  displayDate: string;
  estimatedOneRm: number;
  weight: number;
  isWeightPr: boolean;
  isOneRmPr: boolean;
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

function formatWeight(value: number) {
  return Number(value).toLocaleString(undefined, {
    maximumFractionDigits: 1,
  });
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{
    payload: ChartPoint;
  }>;
}) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const point = payload[0].payload;

  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-lg">
      <p className="text-xs font-medium text-gray-500">
        {point.displayDate}
      </p>

      <p className="mt-1 text-sm font-semibold text-gray-900">
        {formatWeight(point.estimatedOneRm)} kg
      </p>

      <p className="text-xs text-gray-500">Estimated 1RM</p>

      {point.isOneRmPr && (
        <p className="mt-1 text-xs font-medium text-gray-700">
          Personal record
        </p>
      )}
    </div>
  );
}

export default function ProgressionChart({
  events,
}: ProgressionChartProps) {
  if (events.length === 0) {
    return (
      <div className="box-border w-full min-w-0 max-w-full rounded-xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
        <p className="text-sm font-medium text-gray-700">
          No PR history yet
        </p>

        <p className="mt-1 text-sm text-gray-500">
          Set a personal record to start building your progression history.
        </p>
      </div>
    );
  }

  const sortedEvents = [...events].sort(
    (a, b) =>
      new Date(a.achievedAt).getTime() -
      new Date(b.achievedAt).getTime(),
  );

  if (sortedEvents.length === 1) {
    const event = sortedEvents[0];

    return (
      <div className="box-border w-full min-w-0 max-w-full overflow-hidden rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-6 min-w-0">
          <h3 className="text-base font-semibold text-gray-900">
            Estimated 1RM PR History
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            Your personal record history for this exercise.
          </p>
        </div>

        <div className="box-border w-full min-w-0 max-w-full overflow-hidden rounded-lg bg-gray-50 px-6 py-8 text-center">
          <p className="text-sm font-medium text-gray-500">
            First recorded PR
          </p>

          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {formatWeight(event.estimatedOneRm)} kg
          </p>

          <p className="mt-1 text-sm text-gray-500">
            Estimated 1RM · {formatDate(event.achievedAt)}
          </p>

          <p className="mx-auto mt-4 max-w-md text-sm text-gray-500">
            Set more personal records for this exercise to see how your
            estimated 1RM changes over time.
          </p>
        </div>
      </div>
    );
  }

  const chartData: ChartPoint[] = sortedEvents.map((event) => ({
    id: event.id,
    date: event.achievedAt,
    displayDate: formatDate(event.achievedAt),
    estimatedOneRm: event.estimatedOneRm,
    weight: event.heaviestWeight,
    isWeightPr: event.isWeightPr,
    isOneRmPr: event.isOneRmPr,
  }));

  const values = chartData.map((point) => point.estimatedOneRm);

  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);

  const range = maxValue - minValue || 1;

  /*
   * Add a little breathing room above and below the data.
   * This keeps the first/last values from sitting directly
   * on the chart boundaries.
   */
  const yAxisMin = Math.max(0, Math.floor(minValue - range * 0.15));
  const yAxisMax = Math.ceil(maxValue + range * 0.15);

  return (
    <div className="box-border w-full min-w-0 max-w-full overflow-hidden rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-5 min-w-0">
        <h3 className="text-base font-semibold text-gray-900">
          Estimated 1RM PR History
        </h3>

        <p className="mt-1 text-sm text-gray-500">
          How your estimated 1RM has changed across personal records.
        </p>
      </div>

      <div className="w-full min-w-0 max-w-full overflow-hidden">
        <ResponsiveContainer
          width="100%"
          height={280}
          minWidth={0}
        >
          <LineChart
            data={chartData}
            margin={{
              top: 10,
              right: 12,
              bottom: 10,
              left: 0,
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              className="stroke-gray-100"
            />

            <XAxis
              dataKey="displayDate"
              tick={{
                fontSize: 11,
              }}
              tickLine={false}
              axisLine={{
                stroke: "#e5e7eb",
              }}
              minTickGap={24}
            />

            <YAxis
              domain={[yAxisMin, yAxisMax]}
              tick={{
                fontSize: 11,
              }}
              tickLine={false}
              axisLine={false}
              width={42}
              tickFormatter={formatWeight}
            />

            <Tooltip
              content={<CustomTooltip />}
              cursor={{
                stroke: "#d1d5db",
                strokeDasharray: "4 4",
              }}
            />

            <Line
              type="monotone"
              dataKey="estimatedOneRm"
              stroke="#111827"
              strokeWidth={3}
              dot={{
                r: 5,
                fill: "#ffffff",
                stroke: "#111827",
                strokeWidth: 2,
              }}
              activeDot={{
                r: 7,
                fill: "#ffffff",
                stroke: "#111827",
                strokeWidth: 2,
              }}
              connectNulls
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 flex min-w-0 max-w-full flex-wrap gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 shrink-0 rounded-full border-2 border-gray-900 bg-white" />
          <span>Estimated 1RM</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="h-3 w-3 shrink-0 rounded-full border border-gray-400" />
          <span>Personal record</span>
        </div>
      </div>
    </div>
  );
}
