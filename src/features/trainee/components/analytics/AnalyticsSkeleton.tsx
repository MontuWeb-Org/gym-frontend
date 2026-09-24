"use client";

export default function AnalyticsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-7 w-40 rounded bg-gray-200" />
        <div className="h-4 w-72 rounded bg-gray-200" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="h-28 rounded-xl bg-gray-200" />
        <div className="h-28 rounded-xl bg-gray-200" />
      </div>

      <div className="space-y-4">
        <div className="h-6 w-40 rounded bg-gray-200" />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="h-48 rounded-xl bg-gray-200" />
          <div className="h-48 rounded-xl bg-gray-200" />
        </div>
      </div>

      <div className="h-96 rounded-xl bg-gray-200" />
    </div>
  );
}