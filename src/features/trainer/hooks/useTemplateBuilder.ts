"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

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
  // Load template from backend
  // ---------------------------------------------------------------------------

  const loadTemplate =
    useCallback(async () => {
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
          res?.data?.data ??
          res?.data ??
          {};

        const fetchedWeeks =
          Array.isArray(
            fetchedTemplate.weeks
          )
            ? fetchedTemplate.weeks
            : [];

        setTemplate({
          ...fetchedTemplate,

          // Always keep this field synchronized
          // with the actual detail response.
          durationWeekTemplates:
            fetchedWeeks.length,
        });

        setWeeks(
          fetchedWeeks
        );
      } catch (err) {
        console.error(
          "Failed to load template layout",
          err
        );
      } finally {
        setLoading(false);
      }
    }, [templateId]);

  useEffect(() => {
    void loadTemplate();
  }, [loadTemplate]);

  // ---------------------------------------------------------------------------
  // Display data
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

  const handleSaveDraft =
    async () => {
      if (!templateId) {
        return;
      }

      try {
        /*
         * The backend already owns the weeks.
         *
         * Refresh once more before leaving so the local
         * representation is based on the real backend state.
         */
        const res =
          await programService.getTemplateDetail(
            templateId
          );

        const freshTemplate =
          res?.data?.data ??
          res?.data ??
          {};

        const freshWeeks =
          Array.isArray(
            freshTemplate.weeks
          )
            ? freshTemplate.weeks
            : [];

        dispatch(
          upsertTemplate({
            id: templateId,

            name:
              freshTemplate.name ??
              displayTitle,

            description:
              freshTemplate.description ??
              displayDesc,

            status:
              freshTemplate.status ??
              "DRAFT",

            durationWeekTemplates:
              freshWeeks.length,

            isFav:
              freshTemplate.isFav ??
              template?.isFav ??
              false,

            weeks:
              freshWeeks,
          })
        );

        router.push(
          `/trainer/templates`
        );
      } catch (err) {
        console.error(
          "Failed to refresh template before leaving",
          err
        );

        /*
         * Keep the existing local state as a fallback.
         */
        dispatch(
          upsertTemplate({
            id: templateId,

            name:
              displayTitle,

            description:
              displayDesc,

            status:
              "DRAFT",

            durationWeekTemplates:
              weeks.length,

            isFav:
              template?.isFav ??
              false,

            weeks,
          })
        );

        router.push(
          `/trainer/templates`
        );
      }
    };

  // ---------------------------------------------------------------------------
  // Add Week
  // ---------------------------------------------------------------------------

  const handleAddWeek =
    async () => {
      if (!templateId) {
        return;
      }

      try {
        /*
         * Backend sequence numbers are 1-based.
         */
        const sequenceNumber =
          weeks.length + 1;

        const res =
          await programService.createWeek(
            {
              sequenceNumber,

              planTemplateId:
                templateId,
            }
          );

        const newWeek =
          res?.data?.data ??
          res?.data ??
          {};

        const newWeekId =
          Number(
            newWeek.weekId ??
              newWeek.id
          );

        if (
          !Number.isFinite(
            newWeekId
          ) ||
          newWeekId <= 0
        ) {
          throw new Error(
            "Create week response did not contain a valid week ID."
          );
        }

        /*
         * Do not manufacture a local week object.
         *
         * Re-fetch the template so both the week list and
         * durationWeekTemplates come from the backend.
         */
        const refreshed =
          await programService.getTemplateDetail(
            templateId
          );

        const refreshedTemplate =
          refreshed?.data?.data ??
          refreshed?.data ??
          {};

        const refreshedWeeks =
          Array.isArray(
            refreshedTemplate.weeks
          )
            ? refreshedTemplate.weeks
            : [];

        setTemplate({
          ...refreshedTemplate,

          durationWeekTemplates:
            refreshedWeeks.length,
        });

        setWeeks(
          refreshedWeeks
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

        await loadTemplate();
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
            Number(week.id) ===
            Number(
              weekIdToDelete
            )
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

        /*
         * Refresh from backend rather than only removing the
         * week from local state. This guarantees the count
         * matches the actual database.
         */
        await loadTemplate();

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
  // Publish modal
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

  // ---------------------------------------------------------------------------
  // Return
  // ---------------------------------------------------------------------------

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