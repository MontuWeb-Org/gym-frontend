"use client";

import { useWeekBuilder } from "../hooks/useWeekBuilder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import WorkoutBuilderView from "./WorkoutBuilderView";

export default function WeekBuilderView() {
  const {
    templateId,
    weekId,
    workoutId,

    workouts,
    loading,

    isModalOpen,
    setIsModalOpen,

    workoutName,
    setWorkoutName,

    handleAddWorkout,
    handleDuplicateWorkout,
    handleDeleteWorkout,
    openCreateModal,

    router,
  } = useWeekBuilder();

  if (loading) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        Loading week structure...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 border-b pb-4 overflow-x-auto bg-muted/10 p-3 rounded-lg">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mr-1 shrink-0">
          Workouts (Days):
        </span>

        {workouts.map(
          (workout) => {
            const isActive =
              workoutId ===
              workout.id;

            return (
              <div
                key={workout.id}
                className={`group flex items-center rounded-md border px-1 transition-colors shrink-0 ${
                  isActive
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background hover:bg-muted"
                }`}
              >
                <button
                  type="button"
                  className="px-3 py-2 text-sm font-medium"
                  onClick={() =>
                    router.push(
                      `/trainer/template/${templateId}/${weekId}/${workout.id}`
                    )
                  }
                >
                  {workout.name}
                </button>

                <DropdownMenu>
                  <DropdownMenuTrigger
                    asChild
                  >
                    <button
                      type="button"
                      className={`flex h-7 w-7 items-center justify-center rounded-sm text-lg leading-none opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100 ${
                        isActive
                          ? "hover:bg-primary-foreground/10"
                          : "hover:bg-muted-foreground/10"
                      }`}
                      title={`${workout.name} actions`}
                    >
                      ⋮
                    </button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent
                    align="end"
                    className="w-40"
                  >
                    <DropdownMenuItem
                      onClick={() =>
                        handleDuplicateWorkout(
                          workout.id
                        )
                      }
                    >
                      ⧉ Duplicate
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() =>
                        handleDeleteWorkout(
                          workout.id
                        )
                      }
                    >
                      🗑 Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            );
          }
        )}

        <Button
          size="sm"
          variant="secondary"
          className="shrink-0"
          onClick={
            openCreateModal
          }
        >
          + Add Workout
        </Button>
      </div>

      {workoutId ? (
        <WorkoutBuilderView />
      ) : (
        <div className="rounded-xl border bg-card p-12 shadow-sm text-center">
          <p className="text-sm text-muted-foreground">
            Select a workout day above
            or click &quot;+ Add
            Workout&quot; to configure
            sets and exercises.
          </p>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/85 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl border bg-card p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-semibold">
                Name Workout Day
              </h3>

              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  setIsModalOpen(
                    false
                  )
                }
              >
                ✕
              </Button>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Workout Name
              </label>

              <Input
                placeholder="e.g. Leg Day, Push A"
                value={
                  workoutName
                }
                onChange={(e) =>
                  setWorkoutName(
                    e.target.value
                  )
                }
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  handleAddWorkout()
                }
                autoFocus
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() =>
                  setIsModalOpen(
                    false
                  )
                }
              >
                Cancel
              </Button>

              <Button
                onClick={
                  handleAddWorkout
                }
              >
                Create
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}