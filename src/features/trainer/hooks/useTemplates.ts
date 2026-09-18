"use client";

import { useEffect, useState } from "react";
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
  const dispatch =
    useAppDispatch();

  const router =
    useRouter();

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
        ).trainerProgram?.templates ||
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

  const templates =
    Array.isArray(
      rawTemplates
    )
      ? rawTemplates
      : rawTemplates &&
          typeof rawTemplates ===
            "object" &&
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

  const [isCreating, setIsCreating] =
    useState(false);

  const [
    selectedPlanIdForAssign,
    setSelectedPlanIdForAssign,
  ] = useState<number | null>(
    null
  );

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

  /*
   * Always fetch fresh templates
   * when the page mounts.
   */
  useEffect(() => {
    dispatch(
      fetchTemplates()
    );
  }, [dispatch]);

  /*
   * Open the browser print dialog
   * once the printable component
   * has rendered.
   */
  useEffect(() => {
    if (!printableProgram) {
      return;
    }

    const handleAfterPrint =
      () => {
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

  /*
   * Create a new plan template.
   */
  const handleCreate = async (
    name: string,
    description: string
  ) => {
    if (!name.trim()) {
      return;
    }

    try {
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
          payloadData?.planId ||
          payloadData?.id ||
          payloadData?.data?.planId ||
          payloadData?.data?.id ||
          Date.now();

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

        router.push(
          `/trainer/template/${Date.now()}`
        );
      }
    } catch (err) {
      console.error(
        "Failed to create template:",
        err
      );

      setIsCreating(false);
    }
  };

  /*
   * Duplicate an existing template.
   */
  const handleDuplicate =
    async (
      id: number
    ) => {
      try {
        await programService.duplicateTemplate(
          id
        );

        await dispatch(
          fetchTemplates()
        );
      } catch (err) {
        console.error(
          "Failed to duplicate template:",
          err
        );
      }
    };

  /*
   * Update an existing template.
   */
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
    } catch (err) {
      console.error(
        "Failed to update template:",
        err
      );
    }
  };

  /*
   * Delete an existing template.
   */
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
    }  catch (err: unknown) {
  if (
    axios.isAxiosError(err) &&
    err.response?.status ===
      409
  ) {
        window.alert(
          "This template cannot be deleted because it is currently assigned to a trainee."
        );

        return;
      }

      console.error(
        "Failed to delete template:",
        err
      );

      window.alert(
        "Failed to delete the template. Please try again."
      );
    }
  };

  /*
   * Prepare a program for printing.
   */
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
    } catch (err) {
      console.error(
        "Failed to prepare program for PDF export:",
        err
      );

      setIsExporting(false);
    }
  };

  /*
   * Navigate to the template
   * configuration page.
   */
  const handleConfigure = (
    id: number
  ) => {
    router.push(
      `/trainer/template/${id}`
    );
  };

  /*
   * Open the assign modal.
   */
  const handleAssign = (
    id: number
  ) => {
    setSelectedPlanIdForAssign(
      id
    );
  };

  /*
   * Close the assign modal.
   */
  const closeAssignModal =
    () => {
      setSelectedPlanIdForAssign(
        null
      );
    };

  /*
   * Refresh templates after
   * successful assignment.
   */
  const handleAssignSuccess =
    () => {
      dispatch(
        fetchTemplates()
      );
    };

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