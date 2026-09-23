"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { programService } from "../services/program.service";
import type { ProgramHistoryRow } from "../components/programs/ProgramHistoryTable";

interface Template {
  id: number;
  name: string;
  trainerId: number;
  durationWeekTemplates: number;
}

interface Assignment {
  id: number;
  status: "IDLE" | "ACTIVE" | "COMPLETED";
  startedAt: string | null;
  endedAt: string | null;
  currentWeekIdx: number;
  currentWorkoutIdx: number;
  adherencePercentage: string | number;
  planTemplateId: number;
}

interface Trainee {
  traineeId: number;
  traineeName: string;
}

export function useProgramsHistory() {
  const [rows, setRows] =
    useState<ProgramHistoryRow[]>([]);

  const [templates, setTemplates] =
    useState<Template[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const loadData = useCallback(
    async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [
          templatesResponse,
          traineesResponse,
          assignmentsResponse,
        ] = await Promise.all([
          programService.getTemplates(
            1,
            100
          ),
          programService.getTrainees(
            1,
            100
          ),
          programService.getAssignments(),
        ]);

        const planTemplates: Template[] =
          templatesResponse.data?.data
            ?.plans ?? [];

        const trainees: Trainee[] =
          traineesResponse.data?.data ??
          [];

        const assignments: Assignment[] =
          assignmentsResponse.data?.data ??
          [];

        setTemplates(planTemplates);

        const templateMap = new Map<
          number,
          Template
        >();

        planTemplates.forEach(
          (template) => {
            templateMap.set(
              Number(template.id),
              template
            );
          }
        );

        /*
         * The current /api/plans/assignments response does not
         * contain traineeId.
         *
         * Therefore we cannot reliably associate an assignment
         * with a trainee from this endpoint alone.
         *
         * For now, use the trainee roster's plans information
         * to determine which trainee owns each assignment.
         */

        const assignmentToTrainee =
          new Map<
            number,
            Trainee
          >();

        trainees.forEach(
          (trainee) => {
            /*
             * The trainee endpoint returns a `plans` array.
             * Each plan contains `planId`.
             */
            const traineeWithPlans =
              trainee as Trainee & {
                plans?: Array<{
                  planId: number;
                }>;
              };

            traineeWithPlans.plans?.forEach(
              (plan) => {
                assignmentToTrainee.set(
                  Number(plan.planId),
                  trainee
                );
              }
            );
          }
        );

        const historyRows:
          ProgramHistoryRow[] =
          assignments
            .map((assignment) => {
              const trainee =
                assignmentToTrainee.get(
                  Number(assignment.id)
                );

              const template =
                templateMap.get(
                  Number(
                    assignment.planTemplateId
                  )
                );

              /*
               * If the assignment cannot be associated with
               * a trainee, don't create a fake row.
               */
              if (!trainee) {
                console.warn(
                  `No trainee found for assignment ${assignment.id}`
                );

                return null;
              }

              return {
                id: Number(
                  assignment.id
                ),
                traineeId: Number(
                  trainee.traineeId
                ),
                traineeName:
                  trainee.traineeName,
                templateId: Number(
                  assignment.planTemplateId
                ),
                templateName:
                  template?.name ??
                  `Plan ${assignment.planTemplateId}`,
                durationWeeks:
                  template?.durationWeekTemplates ??
                  0,
                startedAt:
                  assignment.startedAt,
                endedAt:
                  assignment.endedAt,
              };
            })
            .filter(
              (
                row
              ): row is ProgramHistoryRow =>
                row !== null
            );

        historyRows.sort(
          (a, b) => {
            const aTime = a.startedAt
              ? new Date(
                  a.startedAt
                ).getTime()
              : 0;

            const bTime = b.startedAt
              ? new Date(
                  b.startedAt
                ).getTime()
              : 0;

            return bTime - aTime;
          }
        );

        setRows(historyRows);
      } catch (loadError) {
        console.error(
          "Failed to load programs history:",
          loadError
        );

        setError(
          "Failed to load programs history."
        );

        setRows([]);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    // Data fetching intentionally updates local loading/data state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadData();
  }, [loadData]);

  const templateOptions =
    useMemo(
      () =>
        templates.map(
          (template) => ({
            id: template.id,
            name: template.name,
          })
        ),
      [templates]
    );

  return {
    rows,
    templateOptions,
    isLoading,
    error,
    refresh: loadData,
  };
}