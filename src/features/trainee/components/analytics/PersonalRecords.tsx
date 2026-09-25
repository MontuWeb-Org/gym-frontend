"use client";

import type { PersonalRecord } from "../../types/analytics.types";
import PersonalRecordCard from "./PersonalRecordCard";

interface PersonalRecordsProps {
  records: PersonalRecord[];
  title?: string;
  description?: string;
}

export default function PersonalRecords({
  records,
  title = "Personal Records",
  description = "Your current best performance for each exercise.",
}: PersonalRecordsProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            {title}
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            {description}
          </p>
        </div>

        <span className="text-sm text-gray-500">
          {records.length}{" "}
          {records.length === 1 ? "record" : "records"}
        </span>
      </div>

      {records.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-10 text-center">
          <p className="text-sm font-medium text-gray-700">
            No personal records yet
          </p>

          <p className="mt-1 text-sm text-gray-500">
            Complete workouts to start building your records.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {records.map((record) => (
            <PersonalRecordCard
              key={record.exercise.id}
              record={record}
            />
          ))}
        </div>
      )}
    </section>
  );
}