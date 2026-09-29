"use client";

import { PageHeader } from "@/components/layout/PageHeader";

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
    <div>
      <PageHeader title={title} />

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