"use client";

import { Button } from "@/components/ui/button";
import { TemplateCard } from "../components/program-builder/TemplateCard";
import { NewTemplateModal } from "../components/program-builder/NewTemplateModal";
import { PublishAssignModal } from "../components/program-builder/PublishAssignModal";
import { ProgramPrintView } from "../components/program-builder/ProgramPrintView";
import { useTemplates } from "../hooks/useTemplates";

export default function TemplatesContainer() {
  const {
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
  } = useTemplates();

  return (
    <>
      <div className="space-y-6 p-6">
        <Button
          onClick={() =>
            setIsCreating(true)
          }
        >
          + New Template
        </Button>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {templates.map(
            (template) => (
              <TemplateCard
                key={template.id}
                id={template.id}
                name={template.name}
                description={
                  template.description
                }
                durationWeeks={
                  template.weeks?.length ??
                  0
                }
                status={
                  template.status ??
                  "DRAFT"
                }
                onConfigure={
                  handleConfigure
                }
                onAssign={
                  handleAssign
                }
                onDuplicate={
                  handleDuplicate
                }
                onEdit={
                  handleEdit
                }
                onExport={
                  handleExport
                }
                onDelete={
                  handleDelete
                }
              />
            )
          )}
        </div>

        <NewTemplateModal
          isOpen={
            isCreating
          }
          onClose={() =>
            setIsCreating(false)
          }
          onCreate={
            handleCreate
          }
        />

        {selectedPlanIdForAssign !==
          null && (
          <PublishAssignModal
            isOpen={true}
            onClose={
              closeAssignModal
            }
            planId={
              selectedPlanIdForAssign
            }
            onSuccess={
              handleAssignSuccess
            }
          />
        )}
      </div>

      {printableProgram && (
        <ProgramPrintView
          program={
            printableProgram
          }
        />
      )}
    </>
  );
}