"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { useAppDispatch } from "@/store/hooks";
import { upsertTemplate, WeekTemplate } from "../store/program.slice";
import { programService } from "../services/program.service";
import { Button } from "@/components/ui/button";
import WeekBuilderView from "./WeekBuilderView";
import { PublishAssignModal } from "../components/program-builder/PublishAssignModal";

interface WeekItem {
  id: number;
  weekId?: number;
  sequenceNumber: number;
  workouts?: unknown[];
}

interface TemplateDetail {
  id?: number;
  name?: string;
  description?: string;
  status?: "DRAFT" | "ACTIVE";
  durationWeekTemplates?: number;
  isFav?: boolean;
  weeks?: WeekItem[];
}

export default function TemplateBuilderView() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  const templateId = Number(params.templateId);
  const weekId = params.weekId ? Number(params.weekId) : null;

  const [template, setTemplate] = useState<TemplateDetail | null>(null);
  const [weeks, setWeeks] = useState<WeekItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);

  useEffect(() => {
    async function loadTemplate() {
      if (!templateId) return;
      try {
        setLoading(true);
        const res = await programService.getTemplateDetail(templateId);
        const fetchedTemplate = res?.data?.data || res?.data || {};
        setTemplate(fetchedTemplate);
        setWeeks(fetchedTemplate.weeks || []);
      } catch (err) {
        console.error("Failed to load template layout", err);
      } finally {
        setLoading(false);
      }
    }
    loadTemplate();
  }, [templateId]);

  const displayTitle = template?.name || "Untitled Template";
  const displayDesc = template?.description || "No description provided.";

  const handleSaveDraft = () => {
    if (templateId) {
      dispatch(
        upsertTemplate({
          id: templateId,
          name: displayTitle,
          description: displayDesc,
          status: "DRAFT",
          durationWeekTemplates: weeks.length,
          isFav: false,
          weeks: weeks as unknown as WeekTemplate[],
        })
      );
    }
    router.push(`/trainer/templates`);
  };

  const handleAddWeek = async () => {
    try {
      const sequenceNumber = weeks.length;
      const res = await programService.createWeek({ sequenceNumber, planTemplateId: templateId });
      const newWeek = res?.data?.data || res?.data || {};
      const newWeekId = newWeek.weekId || newWeek.id || Date.now();
      
      const updatedWeeks = [...weeks, { id: newWeekId, sequenceNumber, workouts: [] }];
      setWeeks(updatedWeeks);
      
      router.push(`/trainer/template/${templateId}/${newWeekId}`);
    } catch (err) {
      console.error("Failed to create week", err);
    }
  };

  if (loading && !template) {
    return <div className="p-6 text-sm text-muted-foreground">Loading template workspace...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{displayTitle}</h1>
          <p className="text-sm text-muted-foreground">{displayDesc}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSaveDraft}>Save Draft</Button>
          <Button onClick={() => setIsPublishModalOpen(true)}>Publish Template &rarr;</Button>
        </div>
      </div>

      <div className="flex items-center gap-2 border-b pb-4 overflow-x-auto">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mr-2">Weeks:</span>
        {weeks.map((week, idx) => (
          <Button
            key={week.id}
            variant={weekId === week.id ? "default" : "secondary"}
            size="sm"
            onClick={() => router.push(`/trainer/template/${templateId}/${week.id}`)}
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
          <p className="text-sm text-muted-foreground">Select a week above or click &quot;+ Add Week&quot; to start building your program.</p>
        </div>
      )}

      <PublishAssignModal 
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        planId={templateId}
        onSuccess={() => {
          router.push(`/trainer/templates`);
        }}
      />
    </div>
  );
}