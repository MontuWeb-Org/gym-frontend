"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { programService } from "../services/program.service";
import { Button } from "@/components/ui/button";
import WeekBuilderView from "./WeekBuilderView";

export default function TemplateBuilderView() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const templateId = Number(params.templateId);
  const weekId = params.weekId ? Number(params.weekId) : null;
  const paramName = searchParams.get("name");
  const paramDesc = searchParams.get("desc");

  const [template, setTemplate] = useState<any>(null);
  const [weeks, setWeeks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTemplate() {
      if (paramName) {
        setTemplate({ name: paramName, description: paramDesc });
      }

      try {
        const res = await programService.getTemplateDetail(templateId);
        const fetchedTemplate = res.data.data;
        setTemplate(fetchedTemplate);
        setWeeks(fetchedTemplate.weeks || []);
      } catch (err) {
        console.error("Failed to load template layout", err);
      } finally {
        setLoading(false);
      }
    }
    if (templateId) loadTemplate();
  }, [templateId, paramName, paramDesc]);

  const handleSaveDraft = () => {
    const currentTemplates = JSON.parse(localStorage.getItem("msw_custom_templates") || "[]");
    const templateData = {
      id: templateId,
      name: displayTitle,
      description: displayDesc,
      status: "DRAFT",
      durationWeekTemplates: weeks.length || 1,
      isFav: false
    };

    // Upsert template into local storage drafts list
    const existingIndex = currentTemplates.findIndex((t: any) => t.id === templateId);
    if (existingIndex >= 0) {
      currentTemplates[existingIndex] = templateData;
    } else {
      currentTemplates.unshift(templateData);
    }
    localStorage.setItem("msw_custom_templates", JSON.stringify(currentTemplates));

    router.push(`/trainer/templates`);
  };

  const handlePublish = () => {
    const currentTemplates = JSON.parse(localStorage.getItem("msw_custom_templates") || "[]");
    const templateData = {
      id: templateId,
      name: displayTitle,
      description: displayDesc,
      status: "ACTIVE",
      durationWeekTemplates: weeks.length || 1,
      isFav: false
    };

    const existingIndex = currentTemplates.findIndex((t: any) => t.id === templateId);
    if (existingIndex >= 0) {
      currentTemplates[existingIndex] = templateData;
    } else {
      currentTemplates.unshift(templateData);
    }
    localStorage.setItem("msw_custom_templates", JSON.stringify(currentTemplates));

    router.push(`/trainer/templates`);
  };

  const handleAddWeek = async () => {
    try {
      const sequenceNumber = weeks.length;
      const res = await programService.createWeek({ sequenceNumber, planTemplateId: templateId });
      const newWeek = res.data.data;
      const newWeekId = newWeek.weekId || newWeek.id;
      
      const updatedWeeks = [...weeks, { id: newWeekId, sequenceNumber, workouts: [] }];
      setWeeks(updatedWeeks);
      
      router.push(`/trainer/template/${templateId}/${newWeekId}?${searchParams.toString()}`);
    } catch (err) {
      console.error("Failed to create week", err);
    }
  };

  if (loading) return <div className="p-6 text-sm text-muted-foreground">Loading template workspace...</div>;

  const displayTitle = paramName || template?.name || "Untitled Template";
  const displayDesc = paramDesc || template?.description || "No description provided.";

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{displayTitle}</h1>
          <p className="text-sm text-muted-foreground">{displayDesc}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSaveDraft}>Save Draft</Button>
          <Button onClick={handlePublish}>Publish Template →</Button>
        </div>
      </div>

      <div className="flex items-center gap-2 border-b pb-4 overflow-x-auto">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mr-2">Weeks:</span>
        {weeks.map((week, idx) => (
          <Button
            key={week.id}
            variant={weekId === week.id ? "default" : "secondary"}
            size="sm"
            onClick={() => router.push(`/trainer/template/${templateId}/${week.id}?${searchParams.toString()}`)}
          >
            Week {idx + 1}
          </Button>
        ))}
        <Button variant="outline" size="sm" onClick={handleAddWeek}>
          + Add Week
        </Button>
      </div>

      {weekId ? (
        <WeekBuilderView />
      ) : (
        <div className="rounded-xl border bg-card p-12 shadow-sm text-center">
          <p className="text-sm text-muted-foreground">Select a week above or click "+ Add Week" to start building your program.</p>
        </div>
      )}
    </div>
  );
}