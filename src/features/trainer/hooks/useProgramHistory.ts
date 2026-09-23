"use client";

import { useEffect, useMemo, useState } from "react";
import { programService } from "../services/program.service";
import type { ProgramHistoryRow } from "../components/programs/ProgramHistoryTable";

interface Trainee {
  id: number;
  name: string;
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

interface Template {
  id: number;
  planId?: number;
  name: string;
  trainerId: number;
}

export function useProgramsHistory() {
  const [rows, setRows] = useState<ProgramHistoryRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = () => {
    setRefreshKey((value) => value + 1);
  };

  useEffect(() => {
    let isMounted = true;

    const loadPrograms = async () => {
      try {
        setIsLoading(true);
        setError(null);

        /*
         * The assignments endpoint does not include traineeId
         * in each assignment.
         *
         * Therefore we first load the trainer's trainees and
         * then request assignments for each trainee separately.
         */
        const traineesResponse =
  await programService.getTrainees(1, 100);

console.log(
  "[Programs] trainees:",
  traineesResponse.data
);

const templatesResponse =
  await programService.getTemplates(1, 100);

console.log(
  "[Programs] templates:",
  templatesResponse.data
);

        if (!isMounted) {
          return;
        }

        /*
         * /api/users/trainer/trainees returns:
         *
         * {
         *   data: [
         *     {
         *       traineeId,
         *       traineeName,
         *       ...
         *     }
         *   ],
         *   pagination: ...
         * }
         */
        const trainees: Trainee[] = (
          traineesResponse.data?.data ?? []
        ).map((trainee: any) => ({
          id: Number(trainee.traineeId),
          name: trainee.traineeName,
        }));

        /*
         * /api/plans/templates returns the trainer's plan templates.
         */
        const templates: Template[] =
          templatesResponse.data?.data?.plans ?? [];

        const templateMap = new Map<number, string>();

        templates.forEach((template) => {
          templateMap.set(
            Number(template.id),
            template.name
          );

          /*
           * Keep support for APIs that expose the template
           * identifier under planId as well.
           */
          if (template.planId !== undefined) {
            templateMap.set(
              Number(template.planId),
              template.name
            );
          }
        });

        /*
         * Fetch assignments per trainee.
         *
         * The backend assignment response does not contain
         * traineeId, so the trainee currently being queried
         * provides that relationship.
         */
        const traineeAssignments =
          await Promise.all(
            trainees.map(async (trainee) => {
              try {
                const response =
                  await programService.getAssignments({
                    traineeId: trainee.id,
                    pageNumber: 1,
                    pageSize: 100,
                    sortBy: "createdAt",
                    sortOrder: "desc",
                  });

                const assignments: Assignment[] =
                  response.data?.data ?? [];

                return {
                  trainee,
                  assignments,
                };
              } catch (error) {
                console.error(
                  `Failed to load assignments for trainee ${trainee.id}:`,
                  error
                );

                return {
                  trainee,
                  assignments: [],
                };
              }
            })
          );

        if (!isMounted) {
          return;
        }

        const historyRows: ProgramHistoryRow[] = [];

        traineeAssignments.forEach(
          ({ trainee, assignments }) => {
            assignments.forEach((assignment) => {
              const templateName =
                templateMap.get(
                  Number(assignment.planTemplateId)
                );

              /*
               * We cannot show a real assignment creation date
               * because the backend assignment response does not
               * expose createdAt.
               *
               * startedAt is the closest available date.
               * For IDLE assignments it will be null.
               */
              const createdAt =
                assignment.startedAt ?? "";

              const endedAt =
                assignment.endedAt ?? "";

              historyRows.push({
                id: Number(assignment.id),

                traineeId: trainee.id,
                traineeName: trainee.name,

                templateId: Number(
                  assignment.planTemplateId
                ),
                templateName:
                  templateName ??
                  `Plan ${assignment.planTemplateId}`,

                createdAt,
                endedAt,
              });
            });
          }
        );

        /*
         * Put newest started assignments first.
         *
         * IDLE assignments have no startedAt, so they naturally
         * go after assignments that have actually started.
         */
        historyRows.sort((a, b) => {
          const aTime = a.createdAt
            ? new Date(a.createdAt).getTime()
            : 0;

          const bTime = b.createdAt
            ? new Date(b.createdAt).getTime()
            : 0;

          return bTime - aTime;
        });

        setRows(historyRows);
      } catch (err) {
        console.error(
          "Failed to load program history",
          err
        );

        if (isMounted) {
          setError(
            "Failed to load program history."
          );
          setRows([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadPrograms();

    return () => {
      isMounted = false;
    };
  }, [refreshKey]);

  const templateOptions = useMemo(() => {
    const uniqueTemplates = new Map<number, string>();

    rows.forEach((row) => {
      uniqueTemplates.set(
        row.templateId,
        row.templateName
      );
    });

    return Array.from(
      uniqueTemplates.entries()
    ).map(([id, name]) => ({
      id,
      name,
    }));
  }, [rows]);

  return {
    rows,
    templateOptions,
    isLoading,
    error,
    refresh,
  };
}