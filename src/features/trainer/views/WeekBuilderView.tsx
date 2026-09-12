"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { programService } from "../services/program.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import WorkoutBuilderView from "./WorkoutBuilderView";

interface WorkoutItem {
  id: number;
  workoutTemplateId?: number;
  name: string;
  sequenceNumber: number;
}

export default function WeekBuilderView() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const templateId = Number(params.templateId);
  const weekId = Number(params.weekId);
  const workoutId = params.workoutId ? Number(params.workoutId) : null;

  const [workouts, setWorkouts] = useState<WorkoutItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [workoutName, setWorkoutName] = useState("");

  useEffect(() => {
    async function loadWeek() {
      try {
        setLoading(true);
        const res = await programService.getWeekDetail(weekId);
        setWorkouts(res.data.data.workouts || []);
      } catch (err) {
        console.error("Failed to load week details", err);
      } finally {
        setLoading(false);
      }
    }
    if (weekId) loadWeek();
  }, [weekId]);

  const handleAddWorkout = async () => {
    if (!workoutName || !workoutName.trim()) return;

    try {
      const res = await programService.createWorkout({
        name: workoutName.trim(),
        sequenceNumber: workouts.length,
        weekTemplateId: weekId,
      });
      
      const newWorkout = res.data.data;
      const newWorkoutId = newWorkout.workoutTemplateId || newWorkout.id;
      
      setWorkouts([...workouts, { id: newWorkoutId, name: workoutName.trim(), sequenceNumber: workouts.length }]);
      
      setIsModalOpen(false);
      setWorkoutName("");
      
      router.push(`/trainer/template/${templateId}/${weekId}/${newWorkoutId}?${searchParams.toString()}`);
    } catch (err) {
      console.error("Failed to create workout", err);
    }
  };

  const openCreateModal = () => {
    setWorkoutName(`Day ${workouts.length + 1}`);
    setIsModalOpen(true);
  };

  if (loading) return <div className="p-6 text-sm text-muted-foreground">Loading week structure...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 border-b pb-4 overflow-x-auto bg-muted/10 p-3 rounded-lg">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mr-2">Workouts (Days):</span>
        {workouts.map((workout) => (
          <Button
            key={workout.id}
            variant={workoutId === workout.id ? "default" : "outline"}
            size="sm"
            onClick={() => router.push(`/trainer/template/${templateId}/${weekId}/${workout.id}?${searchParams.toString()}`)}
          >
            {workout.name}
          </Button>
        ))}
        <Button size="sm" variant="secondary" onClick={openCreateModal}>
          + Add Workout
        </Button>
      </div>

      {workoutId ? (
        <WorkoutBuilderView />
      ) : (
        <div className="rounded-xl border bg-card p-12 shadow-sm text-center">
          <p className="text-sm text-muted-foreground">Select a workout day above or click &quot;+ Add Workout&quot; to configure sets and exercises.</p>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/85 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl border bg-card p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-semibold">Name Workout Day</h3>
              <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>✕</Button>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Workout Name</label>
              <Input
                placeholder="e.g. Leg Day, Push A"
                value={workoutName}
                onChange={(e) => setWorkoutName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddWorkout()}
                autoFocus
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button onClick={handleAddWorkout}>Create</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}