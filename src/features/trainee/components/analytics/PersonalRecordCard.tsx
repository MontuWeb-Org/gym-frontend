"use client";

import type { PersonalRecord } from "../../types/analytics.types";

interface PersonalRecordCardProps {
  record: PersonalRecord;
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

function formatWeight(weight: number) {
  return `${Number(weight).toLocaleString()} kg`;
}

export default function PersonalRecordCard({
  record,
}: PersonalRecordCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-base font-semibold text-gray-900">
            {record.exercise.name}
          </p>

          <p className="mt-1 text-xs text-gray-500">
            Updated {formatDate(record.updatedAt)}
          </p>
        </div>

        <span className="shrink-0 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
          PR
        </span>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Heaviest Weight
          </p>

          <p className="mt-1 text-xl font-semibold text-gray-900">
            {formatWeight(record.heaviestWeight)}
          </p>

          <p className="mt-1 text-xs text-gray-500">
            {record.heaviestWeightSet.reps}{" "}
            {record.heaviestWeightSet.reps === 1 ? "rep" : "reps"}
          </p>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Estimated 1RM
          </p>

          <p className="mt-1 text-xl font-semibold text-gray-900">
            {formatWeight(record.estimatedOneRm)}
          </p>

          <p className="mt-1 text-xs text-gray-500">
            Based on {record.estimatedOneRmSet.reps}{" "}
            {record.estimatedOneRmSet.reps === 1 ? "rep" : "reps"}
          </p>
        </div>
      </div>
    </div>
  );
}