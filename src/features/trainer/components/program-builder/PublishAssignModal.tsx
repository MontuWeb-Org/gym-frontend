"use client";

import React, { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

import {
  useAppDispatch,
  useAppSelector,
} from "@/store/hooks";

import {
  fetchTrainerTrainees,
} from "@/features/trainer/store/trainer.slice";

import {
  programService,
} from "../../services/program.service";

import {
  SelectedTraineesChips,
} from "./SelectedTraineesChips";

import {
  TraineeSelectList,
} from "./TraineeSelectList";

import {
  fetchTemplates,
} from "../../store/program.slice";

interface PublishAssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  planId: number;
  onSuccess: () => void;
}

interface ApiError {
  response?: {
    status?: number;
    data?: {
      message?: string;
      code?: string;
      error?: string;
    };
  };
  message?: string;
  config?: {
    url?: string;
    method?: string;
  };
}

export function PublishAssignModal({
  isOpen,
  onClose,
  planId,
  onSuccess,
}: PublishAssignModalProps) {
  const dispatch = useAppDispatch();

  const {
    trainees = [],
    isLoading: loading,
  } = useAppSelector(
    (state) => state.trainer
  );

  const [selectedTraineeIds, setSelectedTraineeIds] =
    useState<number[]>([]);

  const [submitting, setSubmitting] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    /* eslint-disable react-hooks/set-state-in-effect */
    setSelectedTraineeIds([]);
    setErrorMessage(null);
    /* eslint-enable react-hooks/set-state-in-effect */

    void dispatch(
      fetchTrainerTrainees({
        page: 1,
        limit: 10,
      })
    );
  }, [isOpen, dispatch]);

  const toggleSelectTrainee = (
    traineeId: number
  ) => {
    setErrorMessage(null);

    setSelectedTraineeIds((prev) => {
      if (prev.includes(traineeId)) {
        return prev.filter(
          (id) => id !== traineeId
        );
      }

      return [...prev, traineeId];
    });
  };

  const handleRemoveTrainee = (
    traineeId: number
  ) => {
    setSelectedTraineeIds((prev) =>
      prev.filter(
        (id) => id !== traineeId
      )
    );
  };

  const handlePublishAndAssign =
    async () => {
      setErrorMessage(null);

      if (
        selectedTraineeIds.length === 0
      ) {
        setErrorMessage(
          "Please select at least one trainee."
        );
        return;
      }

      try {
        setSubmitting(true);

        await programService.updatePlanTemplate(
          planId,
          {
            status: "ACTIVE",
          }
        );

        const assignmentResults =
          await Promise.allSettled(
            selectedTraineeIds.map(
              (traineeId) =>
                programService.assignPlan({
                  planTemplateId:
                    Number(planId),
                  traineeId:
                    Number(traineeId),
                })
            )
          );

        const failedAssignments =
          assignmentResults.filter(
            (
              result
            ): result is PromiseRejectedResult =>
              result.status === "rejected"
          );

        if (
          failedAssignments.length > 0
        ) {
          console.error(
            "Some plan assignments failed:",
            failedAssignments
          );

          failedAssignments.forEach(
            (result, index) => {
              const error =
                result.reason as ApiError;

              console.error(
                `Assignment failure ${index + 1}:`,
                {
                  message:
                    error?.message,
                  status:
                    error?.response?.status,
                  response:
                    error?.response?.data,
                  url:
                    error?.config?.url,
                  method:
                    error?.config?.method,
                }
              );

              console.error(
                "Full error:",
                result.reason
              );
            }
          );

          const conflictCount =
            failedAssignments.filter(
              (result) => {
                const error =
                  result.reason as ApiError;

                return (
                  error?.response?.status ===
                  409
                );
              }
            ).length;

          if (
            conflictCount ===
            failedAssignments.length
          ) {
            setErrorMessage(
              "The plan was published, but the selected trainee(s) already have this plan assigned."
            );
          } else if (
            conflictCount > 0
          ) {
            setErrorMessage(
              `${failedAssignments.length} trainee assignment${
                failedAssignments.length === 1
                  ? ""
                  : "s"
              } could not be created. Some trainees may already have this plan assigned.`
            );
          } else {
            setErrorMessage(
              failedAssignments.length ===
                selectedTraineeIds.length
                ? "The plan was published, but the assignments could not be created. Please try again."
                : `${failedAssignments.length} trainee assignment${
                    failedAssignments.length ===
                    1
                      ? ""
                      : "s"
                  } could not be created.`
            );
          }

          await dispatch(
            fetchTemplates()
          );

          return;
        }

        await dispatch(
          fetchTemplates()
        );

        setSelectedTraineeIds([]);
        setErrorMessage(null);

        onSuccess();
        onClose();
      } catch (error: unknown) {
        console.error(
          "Failed to publish and assign plan:",
          error
        );

        const apiError =
          error as ApiError;

        const backendMessage =
          apiError?.response?.data
            ?.message;

        setErrorMessage(
          backendMessage ||
            apiError?.message ||
            "Failed to publish and assign the plan. Please try again."
        );
      } finally {
        setSubmitting(false);
      }
    };

  if (!isOpen) {
    return null;
  }

  /*
   * Hide only trainees that are explicitly known
   * to already have this exact plan assigned.
   */
  const availableTrainees =
    trainees.filter((trainee) => {
      const assignedPlanIds =
        trainee.assignedPlanTemplateIds ?? [];

      return !assignedPlanIds.includes(
        Number(planId)
      );
    });

  const selectedTraineesList =
    availableTrainees.filter((trainee) =>
      selectedTraineeIds.includes(
        Number(trainee.id)
      )
    );

  const hasNoTrainees =
    !loading &&
    availableTrainees.length === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/85 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto space-y-6 rounded-xl border bg-card p-6 shadow-xl">
        <div className="flex items-center justify-between border-b pb-3">
          <h3 className="text-lg font-semibold">
            Publish & Assign Plan
          </h3>

          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close"
          >
            ✕
          </Button>
        </div>

        {errorMessage && (
          <div
            role="alert"
            className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {errorMessage}
          </div>
        )}

        <SelectedTraineesChips
          selectedTrainees={
            selectedTraineesList
          }
          onRemove={
            handleRemoveTrainee
          }
        />

        <div className="space-y-2">
          <TraineeSelectList
            trainees={availableTrainees}
            selectedIds={
              selectedTraineeIds
            }
            loading={loading}
            onToggle={
              toggleSelectTrainee
            }
          />

          {hasNoTrainees && (
            <p className="text-center text-xs text-muted-foreground">
              No trainees available for this plan.
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t pt-3">
          <Button
            variant="outline"
            type="button"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={
              handlePublishAndAssign
            }
            disabled={
              selectedTraineeIds.length ===
                0 ||
              submitting ||
              loading
            }
          >
            {submitting
              ? "Publishing..."
              : "Confirm & Publish"}
          </Button>
        </div>
      </div>
    </div>
  );
}