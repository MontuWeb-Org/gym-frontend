"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useWorkoutBuilder } from "../hooks/useWorkoutBuilder";
import { WorkoutHeader } from "../components/program-builder/workout-builder/WorkoutHeader";
import { AssignedExerciseList } from "../components/program-builder/workout-builder/AssignedExerciseList";
import { AddExerciseModal } from "../components/program-builder/workout-builder/AddExerciseModal";
import { EditExerciseModal } from "../components/program-builder/workout-builder/EditExerciseModal";

export default function WorkoutBuilderView() {
  const params = useParams();

  const workoutId = Number(
    params.workoutId
  );

  const {
    workout,
    exercises,
    loading,

    isModalOpen,
    setIsModalOpen,

    selectedExerciseIds,

    searchQuery,
    setSearchQuery,

    editingExercise,
    setEditingExercise,

    setsCount,
    setSetsCount,

    repsCount,
    setRepsCount,

    restTime,
    setRestTime,

    weight,
    setWeight,

    isEditingWorkoutName,
    workoutNameInput,
    setWorkoutNameInput,
    setIsEditingWorkoutName,

    assignedExerciseIds,
    filteredLibrary,

    toggleSelectExercise,
    handleAddSelectedExercises,
    handleRemoveExercise,

    handleMoveExercise,
    handleDragStart,
    handleDragOver,
    handleDrop,

    handleSaveWorkoutName,
    handleEditExercise,
    handleSaveReps,
  } = useWorkoutBuilder(
    workoutId
  );

  if (loading) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        Loading workout workspace...
      </div>
    );
  }

  return (
    <div className="space-y-6 rounded-xl border bg-card p-6 shadow-sm">
      <WorkoutHeader
        workout={workout}
        isEditingWorkoutName={
          isEditingWorkoutName
        }
        workoutNameInput={
          workoutNameInput
        }
        setWorkoutNameInput={
          setWorkoutNameInput
        }
        setIsEditingWorkoutName={
          setIsEditingWorkoutName
        }
        handleSaveWorkoutName={
          handleSaveWorkoutName
        }
        setIsModalOpen={
          setIsModalOpen
        }
      />

      <AssignedExerciseList
        exercises={exercises}
        setIsModalOpen={
          setIsModalOpen
        }
        handleMoveExercise={
          handleMoveExercise
        }
        handleDragStart={
          handleDragStart
        }
        handleDragOver={
          handleDragOver
        }
        handleDrop={
          handleDrop
        }
        handleRemoveExercise={
          handleRemoveExercise
        }
        onEditExercise={
          handleEditExercise
        }
      />

      <AddExerciseModal
        isOpen={
          isModalOpen
        }
        onClose={() => {
          setIsModalOpen(false);
          setSearchQuery("");
        }}
        searchQuery={
          searchQuery
        }
        setSearchQuery={
          setSearchQuery
        }
        filteredLibrary={
          filteredLibrary
        }
        assignedExerciseIds={
          assignedExerciseIds
        }
        selectedExerciseIds={
          selectedExerciseIds
        }
        toggleSelectExercise={
          toggleSelectExercise
        }
        handleAddSelectedExercises={
          handleAddSelectedExercises
        }
      />

      <EditExerciseModal
        editingExercise={
          editingExercise
        }
        onClose={() =>
          setEditingExercise(
            null
          )
        }
        setsCount={
          setsCount
        }
        setSetsCount={
          setSetsCount
        }
        repsCount={
          repsCount
        }
        setRepsCount={
          setRepsCount
        }
        restTime={
          restTime
        }
        setRestTime={
          setRestTime
        }
        weight={
          weight
        }
        setWeight={
          setWeight
        }
        handleSaveReps={
          handleSaveReps
        }
      />
    </div>
  );
}