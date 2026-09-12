"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { programService } from "../services/program.service";
import { AssignedExercise, LibraryExercise, WorkoutDetail } from "../types/workout-builder.types";
import { WorkoutHeader } from "../components/workout-builder/WorkoutHeader";
import { AssignedExerciseList } from "../components/workout-builder/AssignedExerciseList";
import { AddExerciseModal } from "../components/workout-builder/AddExerciseModal";
import { EditExerciseModal } from "../components/workout-builder/EditExerciseModal";

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
      <WorkoutHeader 
        workout={workout}
        isEditingWorkoutName={isEditingWorkoutName}
        workoutNameInput={workoutNameInput}
        setWorkoutNameInput={setWorkoutNameInput}
        setIsEditingWorkoutName={setIsEditingWorkoutName}
        handleSaveWorkoutName={handleSaveWorkoutName}
        setIsModalOpen={setIsModalOpen}
      />

      <AssignedExerciseList 
        exercises={exercises}
        setIsModalOpen={setIsModalOpen}
        handleMoveExercise={handleMoveExercise}
        handleDragStart={handleDragStart}
        handleDragOver={handleDragOver}
        handleDrop={handleDrop}
        handleRemoveExercise={handleRemoveExercise}
        onEditExercise={(exercise, setsLen, repsVal, restVal) => {
          setEditingExercise(exercise);
          setSetsCount(setsLen);
          setRepsCount(repsVal);
          setRestTime(restVal);
        }}
      />

      <AddExerciseModal 
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSearchQuery(""); }}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filteredLibrary={filteredLibrary}
        assignedExerciseIds={assignedExerciseIds}
        selectedExerciseIds={selectedExerciseIds}
        toggleSelectExercise={toggleSelectExercise}
        handleAddSelectedExercises={handleAddSelectedExercises}
      />

      <EditExerciseModal 
        editingExercise={editingExercise}
        onClose={() => setEditingExercise(null)}
        setsCount={setsCount}
        setSetsCount={setSetsCount}
        repsCount={repsCount}
        setRepsCount={setRepsCount}
        restTime={restTime}
        setRestTime={setRestTime}
        handleSaveReps={handleSaveReps}
      />
    </div>
  );
}