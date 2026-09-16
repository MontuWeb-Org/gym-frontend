"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchTrainerTrainees } from "@/features/trainer/store/trainer.slice";
import { programService } from "../../services/program.service";
import { SelectedTraineesChips } from "./SelectedTraineesChips";
import { TraineeSelectList } from "./TraineeSelectList";
import { fetchTemplates } from "../../store/program.slice"; 

interface PublishAssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  planId: number;
  onSuccess: () => void;
}

export interface TraineeAssignmentConfig {
  startDate: string; // YYYY-MM-DD
  durationWeeks: number | string; // Allow string temporarily while typing
}

export function PublishAssignModal({
  isOpen,
  onClose,
  planId,
  onSuccess,
}: PublishAssignModalProps) {
  const dispatch = useAppDispatch();
  const { trainees = [], isLoading: loading } = useAppSelector(
    (state) => state.trainer
  );

  const [assignments, setAssignments] = useState<Record<number, TraineeAssignmentConfig>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    dispatch(fetchTrainerTrainees({ page: 1, limit: 10 }));
  }, [isOpen, dispatch]);

  const toggleSelectTrainee = (id: number) => {
    setAssignments(prev => {
      const copy = { ...prev };
      if (copy[id]) {
        delete copy[id];
      } else {
        const today = new Date().toISOString().split("T")[0];
        copy[id] = { startDate: today, durationWeeks: 4 };
      }
      return copy;
    });
  };

  const handleRemoveTrainee = (id: number) => {
    setAssignments(prev => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  const handleUpdateConfig = (id: number, config: Partial<TraineeAssignmentConfig>) => {
    setAssignments(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        ...config,
      },
    }));
  };

  const handlePublishAndAssign = async () => {
    const selectedIds = Object.keys(assignments).map(Number);
    if (selectedIds.length === 0) return;

    try {
      setSubmitting(true);
      
      // 1. Update plan template status to ACTIVE
      await programService.updatePlanTemplate(planId, { status: "ACTIVE" });

      // 2. Assign the plan to each selected trainee with custom timelines
      await Promise.all(
        selectedIds.map(traineeId => {
          const config = assignments[traineeId];
          const start = new Date(config.startDate);
          const weeks = parseInt(String(config.durationWeeks), 10) || 1;
          const endedAt = new Date(start.getTime() + weeks * 7 * 24 * 60 * 60 * 1000).toISOString();

          return programService.assignPlan({
            planTemplateId: planId,
            traineeId,
            createdAt: start.toISOString(),
            endedAt,
          });
        })
      );

      // 3. Refresh Redux state
      dispatch(fetchTemplates());

      onSuccess();
      onClose();
    } catch (err) {
      console.error("Failed to publish and assign plan", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const selectedTraineeIds = Object.keys(assignments).map(Number);
  const selectedTraineesList = trainees.filter(t => selectedTraineeIds.includes(t.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/85 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-xl border bg-card p-6 shadow-xl space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b pb-3">
          <h3 className="text-lg font-semibold">Publish & Assign Plan</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>✕</Button>
        </div>

        <SelectedTraineesChips 
          selectedTrainees={selectedTraineesList} 
          assignments={assignments}
          onUpdateConfig={handleUpdateConfig}
          onRemove={handleRemoveTrainee} 
        />

        <TraineeSelectList 
          trainees={trainees}
          selectedIds={selectedTraineeIds}
          loading={loading}
          onToggle={toggleSelectTrainee}
        />

        <div className="flex justify-end gap-2 pt-3 border-t">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handlePublishAndAssign} disabled={selectedTraineeIds.length === 0 || submitting}>
            {submitting ? "Publishing..." : "Confirm & Publish"}
          </Button>
        </div>
      </div>
    </div>
  );
}