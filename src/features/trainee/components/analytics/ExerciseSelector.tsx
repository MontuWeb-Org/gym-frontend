"use client";

import type { AnalyticsExercise } from "../../types/analytics.types";

interface ExerciseSelectorProps {
  exercises: AnalyticsExercise[];
  selectedExerciseId: number | null;
  onChange: (exerciseId: number) => void;
}

export default function ExerciseSelector({
  exercises,
  selectedExerciseId,
  onChange,
}: ExerciseSelectorProps) {
  if (exercises.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-3">
      <label
        htmlFor="analytics-exercise"
        className="text-sm font-medium text-gray-700"
      >
        Exercise
      </label>

      <select
        id="analytics-exercise"
        value={selectedExerciseId ?? ""}
        onChange={(event) => onChange(Number(event.target.value))}
        className="min-w-[220px] rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
      >
        {exercises.map((exercise) => (
          <option key={exercise.id} value={exercise.id}>
            {exercise.name}
          </option>
        ))}
      </select>
    </div>
  );
}