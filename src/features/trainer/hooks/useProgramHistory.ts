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
  planTemplateId: number;
  traineeId: number;
  createdAt: string;
  endedAt: string;
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

        const [
          traineesResponse,
          assignmentsResponse,
          templatesResponse,
        ] = await Promise.all([
          programService.getTrainees(1, 100),
          programService.getAssignments(),
          programService.getTemplates(1, 100),
        ]);

        if (!isMounted) return;

        const trainees: Trainee[] =
          traineesResponse.data?.data?.trainees ?? [];

        const assignments: Assignment[] =
          assignmentsResponse.data?.data ?? [];

        const templates: Template[] =
          templatesResponse.data?.data?.plans ?? [];

        const traineeMap = new Map<number, string>();

        trainees.forEach((trainee) => {
          traineeMap.set(
            Number(trainee.id),
            trainee.name
          );
        });

        const templateMap = new Map<number, string>();

        templates.forEach((template) => {
          templateMap.set(
            Number(template.id),
            template.name
          );

          if (template.planId !== undefined) {
            templateMap.set(
              Number(template.planId),
              template.name
            );
          }
        });

        const historyRows: ProgramHistoryRow[] = assignments
          .map((assignment) => {
            const traineeName = traineeMap.get(
              Number(assignment.traineeId)
            );

            const templateName = templateMap.get(
              Number(assignment.planTemplateId)
            );

            if (!traineeName || !templateName) {
              return null;
            }

            return {
              id: Number(assignment.id),
              traineeId: Number(assignment.traineeId),
              traineeName,
              templateId: Number(
                assignment.planTemplateId
              ),
              templateName,
              createdAt: assignment.createdAt,
              endedAt: assignment.endedAt,
            };
          })
          .filter(
            (row): row is ProgramHistoryRow =>
              row !== null
          );

        historyRows.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
        );

        setRows(historyRows);
      } catch (err) {
        console.error(
          "Failed to load program history",
          err
        );

        if (isMounted) {
          setError("Failed to load program history.");
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

    return Array.from(uniqueTemplates.entries()).map(
      ([id, name]) => ({
        id,
        name,
      })
    );
  }, [rows]);

  return {
    rows,
    templateOptions,
    isLoading,
    error,
    refresh,
  };
}