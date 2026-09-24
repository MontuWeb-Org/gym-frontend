"use client";

interface AnalyticsHeaderProps {
  exerciseCount: number;
  personalRecordCount: number;
  title?: string;
  description?: string;
}

export default function AnalyticsHeader({
  exerciseCount,
  personalRecordCount,
  title = "My Progress",
  description = "Track your personal records and PR history.",
}: AnalyticsHeaderProps) {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
          {title}
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          {description}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">
            Exercises Tracked
          </p>

          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {exerciseCount}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">
            Personal Records
          </p>

          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {personalRecordCount}
          </p>
        </div>
      </div>
    </div>
  );
}