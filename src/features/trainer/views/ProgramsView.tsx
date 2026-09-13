"use client";

import { useSearchParams } from "next/navigation";
import TemplateBuilderView from "./TemplateBuilderView";

export default function ProgramsView() {
  const searchParams = useSearchParams();
  const templateId = searchParams.get("templateId");

  // Only render the template builder if a templateId explicitly exists in the URL
  if (templateId) {
    return <TemplateBuilderView />;
  }

  // Otherwise, render an empty state or workspace placeholder
  return (
    <div className="p-12 text-center rounded-xl border border-dashed bg-card/50 m-6">
      <h3 className="text-lg font-semibold mb-1">No Program Selected</h3>
      <p className="text-sm text-muted-foreground">
        Go to Templates and select or create a template to start building your program workspace.
      </p>
    </div>
  );
}