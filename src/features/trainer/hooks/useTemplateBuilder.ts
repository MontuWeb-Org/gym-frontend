"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { useAppDispatch } from "@/store/hooks";
import {
  upsertTemplate,
  PlanTemplate,
  WeekTemplate,
} from "../store/program.slice";
import { programService } from "../services/program.service";

export function useTemplateBuilder() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const templateId =
    Number(params.templateId);

  const weekId =
    params.weekId
      ? Number(params.weekId)
      : null;

  const [template, setTemplate] =
    useState<PlanTemplate | null>(
      null
    );

  const [weeks, setWeeks] =
    useState<WeekTemplate[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [
    isPublishModalOpen,
    setIsPublishModalOpen,
  ] = useState(false);

  // ---------------------------------------------------------------------------
  // Load Template
  // ---------------------------------------------------------------------------

  useEffect(() => {
    async function loadTemplate() {
      if (!templateId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const res =
          await programService.getTemplateDetail(
            templateId
          );

        const fetchedTemplate =
          res?.data?.data ||
          res?.data ||
          {};

        setTemplate(
          fetchedTemplate
        );

        setWeeks(
          fetchedTemplate.weeks ||
            []
        );
      } catch (err) {
        console.error(
          "Failed to load template layout",
          err
        );
      } finally {
        setLoading(false);
      }
    }

    loadTemplate();
  }, [templateId]);

  // ---------------------------------------------------------------------------
  // Display Data
  // ---------------------------------------------------------------------------

  const displayTitle =
    template?.name ||
    "Untitled Template";

  const displayDesc =
    template?.description ||
    "No description provided.";

  // ---------------------------------------------------------------------------
  // Save Draft
  // ---------------------------------------------------------------------------

  const handleSaveDraft = () => {
    if (templateId) {
      dispatch(
        upsertTemplate({
          id: templateId,
          name: displayTitle,
          description: displayDesc,
          status: "DRAFT",
          durationWeekTemplates:
            weeks.length,
          isFav:
            template?.isFav ??
            false,
          weeks,
        })
      );
    }

    router.push(
      `/trainer/templates`
    );
  };

  // ---------------------------------------------------------------------------
  // Add Week
  // ---------------------------------------------------------------------------

  const handleAddWeek =
    async () => {
      try {
        const sequenceNumber =
          weeks.length;

        const res =
          await programService.createWeek(
            {
              sequenceNumber,
              planTemplateId:
                templateId,
            }
          );

        const newWeek =
          res?.data?.data ||
          res?.data ||
          {};

        const newWeekId =
          newWeek.weekId ||
          newWeek.id ||
          Date.now();

        const updatedWeeks: WeekTemplate[] =
          [
            ...weeks,
            {
              id: newWeekId,
              name:
                newWeek.name ||
                `Week ${
                  weeks.length + 1
                }`,
              sequenceNumber,
              durationMinutes:
                newWeek.durationMinutes ||
                0,
              workoutTemplateCount:
                newWeek.workoutTemplateCount ||
                0,
              workouts:
                newWeek.workouts ||
                [],
            },
          ];

        setWeeks(
          updatedWeeks
        );

        router.push(
          `/trainer/template/${templateId}/${newWeekId}`
        );
      } catch (err) {
        console.error(
          "Failed to create week",
          err
        );
      }
    };

  // ---------------------------------------------------------------------------
  // Duplicate Week
  // ---------------------------------------------------------------------------

  const handleDuplicateWeek =
    async (
      weekIdToDuplicate: number
    ) => {
      try {
        await programService.duplicateWeek(
          weekIdToDuplicate
        );

        const res =
          await programService.getTemplateDetail(
            templateId
          );

        const fetchedTemplate =
          res?.data?.data ||
          res?.data ||
          {};

        setTemplate(
          fetchedTemplate
        );

        setWeeks(
          fetchedTemplate.weeks ||
            []
        );
      } catch (err) {
        console.error(
          "Failed to duplicate week",
          err
        );
      }
    };

  // ---------------------------------------------------------------------------
  // Delete Week
  // ---------------------------------------------------------------------------

  const handleDeleteWeek =
    async (
      weekIdToDelete: number
    ) => {
      const weekIndex =
        weeks.findIndex(
          (week) =>
            week.id ===
            weekIdToDelete
        );

      if (
        !window.confirm(
          `Delete Week ${
            weekIndex + 1
          }? This will also delete all workout days inside it.`
        )
      ) {
        return;
      }

      try {
        await programService.deleteWeek(
          weekIdToDelete
        );

        const updatedWeeks =
          weeks.filter(
            (week) =>
              week.id !==
              weekIdToDelete
          );

        setWeeks(
          updatedWeeks
        );

        if (
          weekId ===
          weekIdToDelete
        ) {
          router.push(
            `/trainer/template/${templateId}`
          );
        }
      } catch (err) {
        console.error(
          "Failed to delete week",
          err
        );
      }
    };

  // ---------------------------------------------------------------------------
  // Publish Modal
  // ---------------------------------------------------------------------------

  const openPublishModal =
    () => {
      setIsPublishModalOpen(
        true
      );
    };

  const closePublishModal =
    () => {
      setIsPublishModalOpen(
        false
      );
    };

  const handlePublishSuccess =
    () => {
      router.push(
        `/trainer/templates`
      );
    };

  return {
    templateId,
    weekId,

    template,
    weeks,
    loading,

    displayTitle,
    displayDesc,

    isPublishModalOpen,

    setIsPublishModalOpen,
    openPublishModal,
    closePublishModal,

    handleSaveDraft,
    handleAddWeek,
    handleDuplicateWeek,
    handleDeleteWeek,
    handlePublishSuccess,

    router,
  };
}