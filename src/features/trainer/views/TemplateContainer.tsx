"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { RootState } from "@/store";
import { fetchTemplates, createTemplate, PlanTemplate } from "../store/program.slice";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { TemplateCard } from "../components/program-builder/TemplateCard";
import { NewTemplateModal } from "../components/program-builder/NewTemplateModal";

interface PayloadData {
  planId?: number | string;
  id?: number | string;
  data?: {
    planId?: number | string;
    id?: number | string;
  };
}

export default function TemplatesContainer() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  
  const rawTemplates = useAppSelector((state: RootState) => (state as unknown as Record<string, { templates?: PlanTemplate[] | { plans?: PlanTemplate[] } }>).trainerProgram?.templates || (state as unknown as Record<string, { templates?: PlanTemplate[] | { plans?: PlanTemplate[] } }>).trainer?.templates);
  const templates = Array.isArray(rawTemplates) 
    ? rawTemplates 
    : (rawTemplates && typeof rawTemplates === 'object' && 'plans' in rawTemplates && Array.isArray((rawTemplates as { plans?: PlanTemplate[] }).plans) ? (rawTemplates as { plans: PlanTemplate[] }).plans : []);

  const [isCreating, setIsCreating] = useState(false);

  // Always fetch fresh templates when container mounts
  useEffect(() => {
    dispatch(fetchTemplates());
  }, [dispatch]);

  const handleCreate = async (name: string, description: string) => {
    if (!name.trim()) return;
    try {
      const resultAction = await dispatch(createTemplate({ name, description }));
      if (createTemplate.fulfilled.match(resultAction)) {
        const payloadData = resultAction.payload as PayloadData;
        const planId = payloadData?.planId || payloadData?.data?.planId || payloadData?.data?.id || payloadData?.id || Date.now();
        
        setIsCreating(false);
       
       router.push(`/trainer/template/${planId}`);   }
    } catch (err) {
      console.error("Failed to create template", err);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between border-b pb-4">
        <Button onClick={() => setIsCreating(true)}>
          + New Template
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {templates.map((template: PlanTemplate) => (
  <TemplateCard 
    key={template.id} 
    template={template} 
  />
))}
      </div>

      <NewTemplateModal
        isOpen={isCreating}
        onClose={() => setIsCreating(false)}
        onCreate={handleCreate}
      />
    </div>
  );
}