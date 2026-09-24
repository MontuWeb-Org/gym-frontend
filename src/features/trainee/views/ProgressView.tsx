"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import AnalyticsHeader from "../components/analytics/AnalyticsHeader";
import AnalyticsSkeleton from "../components/analytics/AnalyticsSkeleton";
import ExerciseSelector from "../components/analytics/ExerciseSelector";
import PersonalRecords from "../components/analytics/PersonalRecords";
import ProgressionChart from "../components/analytics/ProgressionChart";
import { analyticsService } from "../services/analytics.service";
import type {
  ProgressionEvent,
  TraineePerformanceAnalytics,
} from "../types/analytics.types";

export default function ProgressView() {
  const [analytics, setAnalytics] =
    useState<TraineePerformanceAnalytics | null>(null);

  const [selectedExerciseId, setSelectedExerciseId] = useState<number | null>(
    null,
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await analyticsService.getMyPerformance();

      setAnalytics(data);

      if (data.personalRecords.length > 0) {
        setSelectedExerciseId(data.personalRecords[0].exercise.id);
      } else if (data.progression.length > 0) {
        setSelectedExerciseId(data.progression[0].exercise.id);
      } else {
        setSelectedExerciseId(null);
      }
    } catch (err) {
      console.error("Failed to load trainee analytics:", err);

      setError(
        "We couldn't load your progress right now. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // This effect intentionally starts the API synchronization on mount.
    // The async function updates local state when the request resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadAnalytics();
  }, [loadAnalytics]);

  const exercises = useMemo(() => {
    if (!analytics) {
      return [];
    }

    const exerciseMap = new Map<
      number,
      { id: number; name: string }
    >();

    analytics.personalRecords.forEach((record) => {
      exerciseMap.set(record.exercise.id, record.exercise);
    });

    analytics.progression.forEach((event) => {
      exerciseMap.set(event.exercise.id, event.exercise);
    });

    return Array.from(exerciseMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }, [analytics]);

  const selectedProgression = useMemo<ProgressionEvent[]>(() => {
    if (!analytics || selectedExerciseId === null) {
      return [];
    }

    return analytics.progression
      .filter((event) => event.exercise.id === selectedExerciseId)
      .sort(
        (a, b) =>
          new Date(a.achievedAt).getTime() -
          new Date(b.achievedAt).getTime(),
      );
  }, [analytics, selectedExerciseId]);

  if (loading) {
    return <AnalyticsSkeleton />;
  }

  if (error) {
    return (
      <div className="w-full max-w-full min-w-0 rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <h2 className="text-base font-semibold text-gray-900">
          Unable to load progress
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          {error}
        </p>

        <button
          type="button"
          onClick={loadAnalytics}
          className="mt-5 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  return (
    <div className="w-full max-w-full min-w-0 space-y-8">
      <AnalyticsHeader
        exerciseCount={exercises.length}
        personalRecordCount={analytics.personalRecords.length}
      />

      <PersonalRecords records={analytics.personalRecords} />

      <section className="w-full max-w-full min-w-0 space-y-4">
        <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-gray-900">
              PR Progression
            </h2>
          </div>

          <ExerciseSelector
            exercises={exercises}
            selectedExerciseId={selectedExerciseId}
            onChange={setSelectedExerciseId}
          />
        </div>

        <div className="w-full max-w-full min-w-0">
          <ProgressionChart events={selectedProgression} />
        </div>
      </section>
    </div>
  );
}

