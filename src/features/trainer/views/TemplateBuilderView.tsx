"use client";

import { useTemplateBuilder } from "../hooks/useTemplateBuilder";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import WeekBuilderView from "./WeekBuilderView";
import { PublishAssignModal } from "../components/program-builder/PublishAssignModal";

export default function TemplateBuilderView() {
  const {
    templateId,
    weekId,

    weeks,
    loading,

    displayTitle,
    displayDesc,

    isPublishModalOpen,
    setIsPublishModalOpen,

    handleSaveDraft,
    handleAddWeek,
    handleDuplicateWeek,
    handleDeleteWeek,
    handlePublishSuccess,

    router,
  } = useTemplateBuilder();

  if (loading) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        Loading template workspace...
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {displayTitle}
          </h1>

          <p className="text-sm text-muted-foreground">
            {displayDesc}
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={
              handleSaveDraft
            }
          >
            Save Draft
          </Button>

          <Button
            onClick={() =>
              setIsPublishModalOpen(
                true
              )
            }
          >
            Publish Template &rarr;
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3 border-b pb-4 overflow-x-auto">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mr-1 shrink-0">
          Weeks:
        </span>

        {weeks.map(
          (
            week,
            idx
          ) => {
            const isActive =
              weekId ===
              week.id;

            return (
              <div
                key={week.id}
                className={`group flex items-center rounded-md border px-1 transition-colors shrink-0 ${
                  isActive
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background hover:bg-muted"
                }`}
              >
                <button
                  type="button"
                  className="px-3 py-2 text-sm font-medium"
                  onClick={() =>
                    router.push(
                      `/trainer/template/${templateId}/${week.id}`
                    )
                  }
                >
                  Week {idx + 1}
                </button>

                <DropdownMenu>
                  <DropdownMenuTrigger
                    asChild
                  >
                    <button
                      type="button"
                      className={`flex h-7 w-7 items-center justify-center rounded-sm text-lg leading-none opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100 ${
                        isActive
                          ? "hover:bg-primary-foreground/10"
                          : "hover:bg-muted-foreground/10"
                      }`}
                      title={`Week ${
                        idx + 1
                      } actions`}
                    >
                      ⋮
                    </button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent
                    align="end"
                    className="w-40"
                  >
                    <DropdownMenuItem
                      onClick={() =>
                        handleDuplicateWeek(
                          week.id
                        )
                      }
                    >
                      ⧉ Duplicate
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() =>
                        handleDeleteWeek(
                          week.id
                        )
                      }
                    >
                      🗑 Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            );
          }
        )}

        <Button
          variant="outline"
          size="sm"
          className="shrink-0"
          onClick={
            handleAddWeek
          }
        >
          + Add Week
        </Button>
      </div>

      {weekId ? (
        <WeekBuilderView />
      ) : (
        <div className="rounded-xl border bg-card p-12 shadow-sm text-center">
          <p className="text-sm text-muted-foreground">
            Select a week above or click
            &quot;+ Add Week&quot; to
            start building your program.
          </p>
        </div>
      )}

      <PublishAssignModal
        isOpen={
          isPublishModalOpen
        }
        onClose={() =>
          setIsPublishModalOpen(
            false
          )
        }
        planId={templateId}
        onSuccess={
          handlePublishSuccess
        }
      />
    </div>
  );
}