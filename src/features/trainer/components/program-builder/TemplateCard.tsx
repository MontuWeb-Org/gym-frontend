"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Settings,
  UserPlus,
  MoreVertical,
  Copy,
  Pencil,
  FileDown,
  Trash2,
} from "lucide-react";

interface TemplateCardProps {
  id: number;
  name: string;
  description: string;
  durationWeeks: number;
  status?: string;
  onConfigure: (id: number) => void;
  onAssign: (id: number) => void;
  onDuplicate: (id: number) => void;
  onEdit: (
    id: number,
    name: string,
    description: string
  ) => void;
  onExport: (id: number) => void;
  onDelete: (id: number) => void;
}

export function TemplateCard({
  id,
  name,
  description,
  durationWeeks,
  status = "DRAFT",
  onConfigure,
  onAssign,
  onDuplicate,
  onEdit,
  onExport,
  onDelete,
}: TemplateCardProps) {
  const [isMenuOpen, setIsMenuOpen] =
    useState(false);

  const [isEditOpen, setIsEditOpen] =
    useState(false);

  const [editName, setEditName] =
    useState(name);

  const [editDescription, setEditDescription] =
    useState(description || "");

  const handleDuplicate = () => {
    setIsMenuOpen(false);
    onDuplicate(id);
  };

  const handleEdit = () => {
    setIsMenuOpen(false);

    setEditName(name);
    setEditDescription(
      description || ""
    );

    setIsEditOpen(true);
  };

  const handleExport = () => {
    setIsMenuOpen(false);
    onExport(id);
  };

  const handleDelete = () => {
    setIsMenuOpen(false);

    const confirmed = window.confirm(
      `Are you sure you want to delete "${name}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    onDelete(id);
  };

  const handleSaveEdit = () => {
    if (!editName.trim()) return;

    onEdit(
      id,
      editName.trim(),
      editDescription.trim()
    );

    setIsEditOpen(false);
  };

  const handleCancelEdit = () => {
    setEditName(name);
    setEditDescription(
      description || ""
    );
    setIsEditOpen(false);
  };

  return (
    <>
      <div className="flex flex-col justify-between rounded-xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="rounded-lg bg-primary/10 p-2 text-primary">
                <FileText className="h-5 w-5" />
              </div>

              <div>
                <h4 className="text-base font-semibold leading-snug">
                  {name}
                </h4>

                <span className="text-xs text-muted-foreground">
                  {durationWeeks} Weeks •{" "}
                  <span className="font-medium uppercase">
                    {status}
                  </span>
                </span>
              </div>
            </div>

            {/* Template actions menu */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  setIsMenuOpen(
                    !isMenuOpen
                  )
                }
                className="h-8 w-8"
                title="Template actions"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>

              {isMenuOpen && (
                <>
                  {/* Click outside */}
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() =>
                      setIsMenuOpen(
                        false
                      )
                    }
                  />

                  <div className="absolute right-0 top-9 z-20 w-44 rounded-md border bg-popover p-1 shadow-md">
                    <button
                      type="button"
                      onClick={
                        handleEdit
                      }
                      className="flex w-full cursor-pointer items-center gap-2 rounded-sm px-3 py-2 text-sm hover:bg-muted"
                    >
                      <Pencil className="h-4 w-4" />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={
                        handleDuplicate
                      }
                      className="flex w-full cursor-pointer items-center gap-2 rounded-sm px-3 py-2 text-sm hover:bg-muted"
                    >
                      <Copy className="h-4 w-4" />
                      Duplicate
                    </button>

                    <div className="my-1 border-t" />

                    <button
                      type="button"
                      onClick={
                        handleExport
                      }
                      className="flex w-full cursor-pointer items-center gap-2 rounded-sm px-3 py-2 text-sm hover:bg-muted"
                    >
                      <FileDown className="h-4 w-4" />
                      Export as PDF
                    </button>

                    <div className="my-1 border-t" />

                    <button
                      type="button"
                      onClick={
                        handleDelete
                      }
                      className="flex w-full cursor-pointer items-center gap-2 rounded-sm px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          <p className="line-clamp-2 text-sm text-muted-foreground">
            {description ||
              "No description provided for this workout plan template."}
          </p>
        </div>

        <div className="mt-4 flex items-center justify-end gap-2 border-t border-border pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              onConfigure(id)
            }
            className="gap-1.5 text-xs"
          >
            <Settings className="h-3.5 w-3.5" />
            Configure
          </Button>

          <Button
            size="sm"
            onClick={() =>
              onAssign(id)
            }
            className="gap-1.5 text-xs"
          >
            <UserPlus className="h-3.5 w-3.5" />
            Assign
          </Button>
        </div>
      </div>

      {/* Edit Template Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-xl border bg-background p-6 shadow-lg">
            <div className="mb-5">
              <h2 className="text-lg font-semibold">
                Edit Template
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Update the name and description of this workout plan.
              </p>
            </div>

            <div className="space-y-4">
              {/* Name */}
              <div className="space-y-2">
                <label
                  htmlFor={`template-name-${id}`}
                  className="text-sm font-medium"
                >
                  Template Name
                </label>

                <input
                  id={`template-name-${id}`}
                  type="text"
                  value={editName}
                  onChange={(e) =>
                    setEditName(
                      e.target.value
                    )
                  }
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter template name"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label
                  htmlFor={`template-description-${id}`}
                  className="text-sm font-medium"
                >
                  Description
                </label>

                <textarea
                  id={`template-description-${id}`}
                  value={
                    editDescription
                  }
                  onChange={(e) =>
                    setEditDescription(
                      e.target.value
                    )
                  }
                  rows={4}
                  className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter template description"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={
                  handleCancelEdit
                }
              >
                Cancel
              </Button>

              <Button
                onClick={
                  handleSaveEdit
                }
                disabled={
                  !editName.trim()
                }
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}