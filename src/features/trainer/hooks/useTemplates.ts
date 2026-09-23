"use client";

import {
  useEffect,
  useState,
} from "react";

import { useRouter } from "@/i18n/navigation";

import {
  useAppDispatch,
  useAppSelector,
} from "@/store/hooks";

import { RootState } from "@/store";

import {
  fetchTemplates,
  createTemplate,
  PlanTemplate,
} from "../store/program.slice";

import { programService } from "../services/program.service";

import {
  PrintableProgram,
} from "../components/program-builder/ProgramPrintView";

import {
  prepareProgramForExport,
} from "../services/program-export.service";

import axios from "axios";

interface PayloadData {
  planId?: number | string;
  id?: number | string;

  data?: {
    planId?: number | string;
    id?: number | string;
  };
}

export function useTemplates() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  // ---------------------------------------------------------------------------
  // Templates from Redux
  // ---------------------------------------------------------------------------

  const rawTemplates =
    useAppSelector(
      (state: RootState) =>
        (
          state as unknown as Record<
            string,
            {
              templates?:
                | PlanTemplate[]
                | {
                    plans?: PlanTemplate[];
                  };
            }
          >
        ).trainerProgram?.templates ??
        (
          state as unknown as Record<
            string,
            {
              templates?:
                | PlanTemplate[]
                | {
                    plans?: PlanTemplate[];
                  };
            }
          >
        ).trainer?.templates
    );

  const templates: PlanTemplate[] =
    Array.isArray(rawTemplates)
      ? rawTemplates
      : rawTemplates &&
          typeof rawTemplates === "object" &&
          "plans" in rawTemplates &&
          Array.isArray(
            (
              rawTemplates as {
                plans?: PlanTemplate[];
              }
            ).plans
          )
        ? (
            rawTemplates as {
              plans: PlanTemplate[];
            }
          ).plans
        : [];

  // ---------------------------------------------------------------------------
  // Local UI state
  // ---------------------------------------------------------------------------

  const [
    isCreating,
    setIsCreating,
  ] = useState(false);

  const [
    selectedPlanIdForAssign,
    setSelectedPlanIdForAssign,
  ] = useState<number | null>(null);

  const [
    printableProgram,
    setPrintableProgram,
  ] =
    useState<PrintableProgram | null>(
      null
    );

  const [
    isExporting,
    setIsExporting,
  ] = useState(false);

  // ---------------------------------------------------------------------------
  // Load templates
  //
  // IMPORTANT:
  // The list endpoint already returns durationWeekTemplates.
  //
  // Example:
  //
  // {
  //   "id": 1,
  //   "name": "Template 1",
  //   "durationWeekTemplates": 3
  // }
  //
  // We therefore use that value directly instead of making another request
  // and potentially replacing the correct value with 0.
  // ---------------------------------------------------------------------------

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const result =
          await dispatch(
            fetchTemplates()
          );

        if (cancelled) {
          return;
        }

        if (
          !fetchTemplates.fulfilled.match(
            result
          )
        ) {
          console.error(
            "Failed to load templates:",
            result.payload
          );
        }
      } catch (error) {
        if (!cancelled) {
          console.error(
            "Failed to load templates:",
            error
          );
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  // ---------------------------------------------------------------------------
  // Browser print lifecycle
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!printableProgram) {
      return;
    }

    const handleAfterPrint = () => {
      setPrintableProgram(null);
      setIsExporting(false);
    };

    window.addEventListener(
      "afterprint",
      handleAfterPrint
    );

    const printTimer =
      window.setTimeout(() => {
        window.print();
      }, 300);

    return () => {
      window.clearTimeout(
        printTimer
      );

      window.removeEventListener(
        "afterprint",
        handleAfterPrint
      );
    };
  }, [printableProgram]);

  // ---------------------------------------------------------------------------
  // Create
  // ---------------------------------------------------------------------------

  const handleCreate = async (
    name: string,
    description: string
  ) => {
    if (!name.trim()) {
      return;
    }

    try {
      setIsCreating(true);

      const resultAction =
        await dispatch(
          createTemplate({
            name,
            description,
          })
        );

      if (
        createTemplate.fulfilled.match(
          resultAction
        )
      ) {
        const payloadData =
          resultAction.payload as PayloadData;

        const planId =
          payloadData?.planId ??
          payloadData?.id ??
          payloadData?.data?.planId ??
          payloadData?.data?.id;

        if (
          planId === undefined
        ) {
          throw new Error(
            "Create template response did not contain a template ID."
          );
        }

        setIsCreating(false);

        router.push(
          `/trainer/template/${planId}`
        );
      } else {
        console.error(
          "Create template was rejected:",
          resultAction.payload
        );

        setIsCreating(false);
      }
    } catch (error) {
      console.error(
        "Failed to create template:",
        error
      );

      setIsCreating(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Duplicate
  // ---------------------------------------------------------------------------

  const handleDuplicate = async (
    id: number
  ) => {
    try {
      await programService.duplicateTemplate(
        id
      );

      await dispatch(
        fetchTemplates()
      );
    } catch (error) {
      console.error(
        "Failed to duplicate template:",
        error
      );
    }
  };

  // ---------------------------------------------------------------------------
  // Edit
  // ---------------------------------------------------------------------------

  const handleEdit = async (
    id: number,
    name: string,
    description: string
  ) => {
    try {
      await programService.updatePlanTemplate(
        id,
        {
          name,
          description,
        }
      );

      await dispatch(
        fetchTemplates()
      );
    } catch (error) {
      console.error(
        "Failed to update template:",
        error
      );
    }
  };

  // ---------------------------------------------------------------------------
  // Delete
  // ---------------------------------------------------------------------------

  const handleDelete = async (
    id: number
  ) => {
    try {
      await programService.deleteTemplate(
        id
      );

      await dispatch(
        fetchTemplates()
      );
    } catch (error: unknown) {
      if (
        axios.isAxiosError(error) &&
        error.response?.status === 409
      ) {
        window.alert(
          "This template cannot be deleted because it is currently assigned to a trainee."
        );

        return;
      }

      console.error(
        "Failed to delete template:",
        error
      );

      window.alert(
        "Failed to delete the template. Please try again."
      );
    }
  };

  // ---------------------------------------------------------------------------
  // Export
  // ---------------------------------------------------------------------------

  const handleExport = async (
    templateId: number
  ) => {
    if (isExporting) {
      return;
    }

    try {
      setIsExporting(true);

      const program =
        await prepareProgramForExport(
          templateId
        );

      setPrintableProgram(
        program
      );
    } catch (error) {
      console.error(
        "Failed to prepare program for PDF export:",
        error
      );

      setIsExporting(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Configure
  // ---------------------------------------------------------------------------

  const handleConfigure = (
    id: number
  ) => {
    router.push(
      `/trainer/template/${id}`
    );
  };

  // ---------------------------------------------------------------------------
  // Assign
  // ---------------------------------------------------------------------------

  const handleAssign = (
    id: number
  ) => {
    setSelectedPlanIdForAssign(
      id
    );
  };

  const closeAssignModal = () => {
    setSelectedPlanIdForAssign(
      null
    );
  };

  const handleAssignSuccess = () => {
    void dispatch(
      fetchTemplates()
    );
  };

  // ---------------------------------------------------------------------------
  // Return
  // ---------------------------------------------------------------------------

  return {
    templates,

    isCreating,
    setIsCreating,

    selectedPlanIdForAssign,
    closeAssignModal,

    printableProgram,

    handleCreate,
    handleDuplicate,
    handleEdit,
    handleDelete,
    handleExport,
    handleConfigure,
    handleAssign,
    handleAssignSuccess,
  };
}