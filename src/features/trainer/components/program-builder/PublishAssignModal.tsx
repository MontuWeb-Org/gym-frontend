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

  const [selectedTraineeIds, setSelectedTraineeIds] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    dispatch(fetchTrainerTrainees({ page: 1, limit: 10 }));
  }, [isOpen, dispatch]);

  const toggleSelectTrainee = (id: number) => {
    setSelectedTraineeIds(prev =>
      prev.includes(id) ? prev.filter(tId => tId !== id) : [...prev, id]
    );
  };

  const handleRemoveTrainee = (id: number) => {
    setSelectedTraineeIds(prev => prev.filter(tId => tId !== id));
  };

  const handlePublishAndAssign = async () => {
    if (selectedTraineeIds.length === 0) return;

    try {
      setSubmitting(true);
      
      // 1. Update plan template status to ACTIVE in MSW/localStorage[cite: 1]
      await programService.updatePlanTemplate(planId, { status: "ACTIVE" });

      const createdAt = new Date().toISOString();
      const endedAt = new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString();

      // 2. Assign the plan to each selected trainee[cite: 1]
      await Promise.all(
        selectedTraineeIds.map(traineeId =>
          programService.assignPlan({
            planTemplateId: planId,
            traineeId,
            createdAt,
            endedAt,
          })
        )
      );

      // 3. Refresh Redux state so the UI reflects the active status and assignments immediately
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

  const selectedTraineesList = trainees.filter(t => selectedTraineeIds.includes(t.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/85 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-xl border bg-card p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b pb-3">
          <h3 className="text-lg font-semibold">Publish & Assign Plan</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>✕</Button>
        </div>

        <SelectedTraineesChips 
          selectedTrainees={selectedTraineesList} 
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