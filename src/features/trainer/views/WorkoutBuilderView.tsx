"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { programService } from "../services/program.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ExerciseSet {
  setNumber: number;
  reps: number;
  weight: number;
}

interface AssignedExercise {
  id: number;
  exerciseId?: number;
  name: string;
  difficulty?: string;
  equipment?: string[];
  sets: ExerciseSet[] | number;
  reps?: number;
  rest: number;
}

interface LibraryExercise {
  id: number;
  name: string;
  difficulty: string;
  equipment: string[];
  instructions: string;
  illustrations: string[];
}

interface WorkoutDetail {
  id: number;
  name: string;
  exercises?: AssignedExercise[];
}

export default function WorkoutBuilderView() {
  const params = useParams();
  const workoutId = Number(params.workoutId);

  const [workout, setWorkout] = useState<WorkoutDetail | null>(null);
  const [exercises, setExercises] = useState<AssignedExercise[]>([]);
  const [libraryExercises, setLibraryExercises] = useState<LibraryExercise[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExerciseIds, setSelectedExerciseIds] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [editingExercise, setEditingExercise] = useState<AssignedExercise | null>(null);
  const [setsCount, setSetsCount] = useState<number | string>(3);
  const [repsCount, setRepsCount] = useState<number | string>(10);
  const [restTime, setRestTime] = useState<number | string>(60);

  const [isEditingWorkoutName, setIsEditingWorkoutName] = useState(false);
  const [workoutNameInput, setWorkoutNameInput] = useState("");

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    async function loadWorkoutData() {
      try {
        setLoading(true);
        const [workoutRes, exercisesRes] = await Promise.all([
          programService.getWorkoutDetail(workoutId),
          programService.getExercises()
        ]);
        
        const fetchedWorkout = workoutRes.data.data;
        setWorkout(fetchedWorkout);
        setWorkoutNameInput(fetchedWorkout.name || "Workout Session");
        
        const fetchedLib = exercisesRes.data.data.exercises || exercisesRes.data.data || [];
        setLibraryExercises(fetchedLib);

        const rawExercises = fetchedWorkout.exercises || [];
        const formattedExercises = rawExercises.map((ex: AssignedExercise) => {
          const matchLib = fetchedLib.find((l: LibraryExercise) => l.id === ex.exerciseId);
          return {
            ...ex,
            name: ex.name || matchLib?.name || "Exercise",
            sets: ex.sets || [{ setNumber: 1, reps: 10, weight: 0 }],
            rest: ex.rest || 60
          };
        });
        setExercises(formattedExercises);
      } catch (err) {
        console.error("Failed to load workout details", err);
      } finally {
        setLoading(false);
      }
    }
    if (workoutId) loadWorkoutData();
  }, [workoutId]);

  const toggleSelectExercise = (id: number) => {
    if (selectedExerciseIds.includes(id)) {
      setSelectedExerciseIds(selectedExerciseIds.filter(item => item !== id));
    } else {
      setSelectedExerciseIds([...selectedExerciseIds, id]);
    }
  };

  const handleAddSelectedExercises = async () => {
    if (selectedExerciseIds.length === 0) return;

    try {
      for (const exerciseId of selectedExerciseIds) {
        const exerciseDef = libraryExercises.find(e => e.id === exerciseId);
        
        if (exercises.some(ex => ex.exerciseId === exerciseId || ex.id === exerciseId)) continue;

        const res = await programService.addExerciseToWorkout({
          workoutTemplateId: workoutId,
          exerciseId: exerciseId,
          sequenceNumber: exercises.length + 1,
          defaultSets: 3,
          defaultReps: "10",
          defaultRestTimeSeconds: 60,
          defaultDurationMinutes: 0,
          defaultWeight: 0
        } as {
          workoutTemplateId: number;
          exerciseId: number;
          sequenceNumber: number;
          defaultSets: number;
          defaultReps: string;
          defaultRestTimeSeconds: number;
          defaultDurationMinutes: number;
          defaultWeight: number;
        });

        const newEx = res.data.data;
        setExercises(prev => [...prev, {
          id: newEx.id || Date.now(),
          exerciseId: exerciseId,
          name: exerciseDef?.name || "Custom Exercise",
          difficulty: exerciseDef?.difficulty || "Intermediate",
          equipment: exerciseDef?.equipment || ["Dumbbell"],
          sets: [{ setNumber: 1, reps: 10, weight: 0 }],
          rest: 60
        }]);
      }

      setSelectedExerciseIds([]);
      setSearchQuery("");
      setIsModalOpen(false);
    } catch (err) {
      console.error("Failed to add exercises", err);
    }
  };

  const handleRemoveExercise = (exerciseId: number) => {
    setExercises(exercises.filter(ex => ex.id !== exerciseId));
  };

  const handleMoveExercise = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= exercises.length) return;

    const updated = [...exercises];
    const temp = updated[index];
    updated[index] = updated[newIndex];
    updated[newIndex] = temp;
    setExercises(updated);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const updated = [...exercises];
    const [movedItem] = updated.splice(draggedIndex, 1);
    updated.splice(dropIndex, 0, movedItem);

    setExercises(updated);
    setDraggedIndex(null);
  };

  const handleSaveWorkoutName = () => {
    if (!workoutNameInput.trim() || !workout) return;
    setWorkout({ ...workout, name: workoutNameInput.trim() });
    setIsEditingWorkoutName(false);
  };

  const handleSaveReps = () => {
    if (!editingExercise) return;
    const finalSetsCount = setsCount === "" ? 3 : Number(setsCount);
    const finalRepsCount = repsCount === "" ? 10 : Number(repsCount);
    const finalRestTime = restTime === "" ? 60 : Number(restTime);

    setExercises(exercises.map(ex => {
      if (ex.id === editingExercise.id) {
        return { 
          ...ex, 
          sets: Array.from({ length: finalSetsCount }, (_, i) => ({
            setNumber: i + 1,
            reps: finalRepsCount,
            weight: 0
          })),
          rest: finalRestTime
        };
      }
      return ex;
    }));
    setEditingExercise(null);
  };

  if (loading) return <div className="p-6 text-sm text-muted-foreground">Loading workout workspace...</div>;

  const assignedExerciseIds = exercises.map(ex => ex.exerciseId || ex.id);
  const filteredLibrary = libraryExercises.filter(libEx => 
    libEx.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 p-6 rounded-xl border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b pb-4">
        <div className="space-y-1">
          {isEditingWorkoutName ? (
            <div className="flex items-center gap-2">
              <Input 
                value={workoutNameInput} 
                onChange={(e) => setWorkoutNameInput(e.target.value)} 
                className="h-8 text-base font-bold w-64"
                autoFocus
              />
              <Button size="sm" onClick={handleSaveWorkoutName}>Save</Button>
              <Button size="sm" variant="outline" onClick={() => setIsEditingWorkoutName(false)}>Cancel</Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setIsEditingWorkoutName(true)}>
              <h3 className="text-xl font-bold tracking-tight">{workout?.name || "Workout Session"}</h3>
              <span className="text-xs text-muted-foreground underline opacity-0 group-hover:opacity-100 transition-opacity">Edit Name</span>
            </div>
          )}
          <p className="text-sm text-muted-foreground">Configure sets, reps, and exercises for this session.</p>
        </div>
        <Button size="sm" onClick={() => setIsModalOpen(true)}>
          + Add Exercise
        </Button>
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Assigned Exercises</h4>
        
        {exercises.length === 0 ? (
          <div className="rounded-xl border border-dashed p-12 text-center">
            <p className="text-sm text-muted-foreground mb-4">No exercises added to this workout session yet.</p>
            <Button size="sm" variant="secondary" onClick={() => setIsModalOpen(true)}>
              + Add Exercise
            </Button>
          </div>
        ) : (
          exercises.map((exercise, index) => {
            const setsLen = Array.isArray(exercise.sets) ? exercise.sets.length : 3;
            const repsVal = Array.isArray(exercise.sets) && exercise.sets[0]?.reps ? exercise.sets[0].reps : 10;
            const restVal = exercise.rest || 60;

            return (
              <div 
                key={exercise.id} 
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e)}
                onDrop={(e) => handleDrop(e, index)}
                className="flex items-center justify-between p-4 rounded-lg border bg-background shadow-sm cursor-grab active:cursor-grabbing hover:border-primary/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="flex flex-col gap-0.5">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                      disabled={index === 0}
                      onClick={() => handleMoveExercise(index, 'up')}
                    >
                      ▲
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                      disabled={index === exercises.length - 1}
                      onClick={() => handleMoveExercise(index, 'down')}
                    >
                      ▼
                    </Button>
                  </div>
                  <div>
                    <h5 className="font-semibold text-base">{exercise.name}</h5>
                    <p className="text-xs text-muted-foreground mt-1">
                      Sets: {setsLen} | Reps: {repsVal} | Rest: {restVal}s
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setEditingExercise(exercise);
                      setSetsCount(setsLen);
                      setRepsCount(repsVal);
                      setRestTime(restVal);
                    }}
                  >
                    Edit Reps
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleRemoveExercise(exercise.id)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/85 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl border bg-card p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-semibold">Exercise Library</h3>
              <Button variant="ghost" size="sm" onClick={() => { setIsModalOpen(false); setSearchQuery(""); }}>✕</Button>
            </div>

            <div>
              <Input 
                placeholder="Search exercises by name..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
              {filteredLibrary.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-6">No exercises found.</p>
              ) : (
                filteredLibrary.map((libEx) => {
                  const isAlreadyAdded = assignedExerciseIds.includes(libEx.id);
                  const isSelected = selectedExerciseIds.includes(libEx.id);

                  return (
                    <div 
                      key={libEx.id} 
                      onClick={() => !isAlreadyAdded && toggleSelectExercise(libEx.id)}
                      className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                        isAlreadyAdded ? "opacity-50 bg-muted/20 cursor-not-allowed" :
                        isSelected ? "border-primary bg-primary/10 cursor-pointer" : "hover:bg-muted/50 cursor-pointer"
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="font-medium text-sm">{libEx.name}</h5>
                          {isAlreadyAdded && <span className="text-[10px] bg-muted px-2 py-0.5 rounded text-muted-foreground font-semibold">Added</span>}
                        </div>
                        <p className="text-xs text-muted-foreground">{libEx.difficulty} &bull; {libEx.equipment?.join(", ")}</p>
                      </div>
                      {!isAlreadyAdded && (
                        <input 
                          type="checkbox" 
                          checked={isSelected} 
                          onChange={() => {}} 
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex justify-between items-center pt-3 border-t">
              <span className="text-xs text-muted-foreground">
                {selectedExerciseIds.length} selected
              </span>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => { setIsModalOpen(false); setSearchQuery(""); }}>Cancel</Button>
                <Button onClick={handleAddSelectedExercises} disabled={selectedExerciseIds.length === 0}>
                  Add Selected
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editingExercise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/85 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl border bg-card p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-semibold">Edit Sets & Reps</h3>
              <Button variant="ghost" size="sm" onClick={() => setEditingExercise(null)}>✕</Button>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Sets</label>
                <Input 
                  type="number" 
                  value={setsCount} 
                  onChange={(e) => setSetsCount(e.target.value === "" ? "" : Number(e.target.value))} 
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Reps</label>
                <Input 
                  type="number" 
                  value={repsCount} 
                  onChange={(e) => setRepsCount(e.target.value === "" ? "" : Number(e.target.value))} 
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Rest (seconds)</label>
                <Input 
                  type="number" 
                  value={restTime} 
                  onChange={(e) => setRestTime(e.target.value === "" ? "" : Number(e.target.value))} 
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setEditingExercise(null)}>Cancel</Button>
              <Button onClick={handleSaveReps}>Save Changes</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}