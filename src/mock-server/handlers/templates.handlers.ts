import { http, HttpResponse } from "msw";

interface TemplatePlan {
  id: number;
  name: string;
  description: string;
  status: string;
  durationWeekTemplates: number;
  isFav: boolean;
}

const getStorage = <T>(key: string, fallback: T): T => {
  if (typeof window === "undefined") return fallback;
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : fallback;
};

const setStorage = <T>(key: string, data: T): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(data));
};

export const templateHandlers = [
  http.get('/api/plans/templates', () => {
    const customTemplates = getStorage<TemplatePlan[]>("msw_custom_templates", [
      { id: 1, name: "Master Hypertrophy Plan", description: "Advanced volume training block", status: "DRAFT", durationWeekTemplates: 4, isFav: true },
      { id: 2, name: "Custom Hypertrophy Plan", description: "Hypertrophy focus routine", status: "ACTIVE", durationWeekTemplates: 4, isFav: false }
    ]);
    return HttpResponse.json({
      data: { plans: customTemplates },
      pagination: { total: customTemplates.length, page: 1, limit: 10, totalPages: 1 }
    });
  }),

  http.post('/api/plans/templates', async ({ request }) => {
    const body = (await request.json()) as { name: string; description: string };
    const newPlanId = Date.now();
    const newPlan = {
      planId: newPlanId,
      id: newPlanId,
      name: body.name,
      description: body.description,
      status: "DRAFT",
      weeks: []
    };

    const templates = getStorage<TemplatePlan[]>("msw_custom_templates", []);
    setStorage("msw_custom_templates", [newPlan, ...templates]);

    return HttpResponse.json({ data: newPlan }, { status: 200 });
  }),

  http.put('/api/plans/templates/:id', async ({ params, request }) => {
    const { id } = params;
    const planIdNum = Number(id);
    const body = (await request.json()) as any;
    
    const customTemplates = getStorage<TemplatePlan[]>("msw_custom_templates", []);
    const index = customTemplates.findIndex(t => t.id === planIdNum);
    if (index !== -1) {
      customTemplates[index] = { ...customTemplates[index], ...body };
      setStorage("msw_custom_templates", customTemplates);
    }

    return HttpResponse.json({ data: { planId: planIdNum, ...body } }, { status: 200 });
  }),

  http.get('/api/plans/templates/:id', ({ params }) => {
    const { id } = params;
    const templateIdNum = Number(id);
    const customTemplates = getStorage<TemplatePlan[]>("msw_custom_templates", []);
    const foundTemplate = customTemplates.find(t => t.id === templateIdNum) || {
      id: templateIdNum,
      name: `Custom Template #${templateIdNum}`,
      description: "Program workspace",
      status: "DRAFT"
    };
    const weeksStore = getStorage<Record<number, unknown[]>>("msw_template_weeks", {});
    
    return HttpResponse.json({
      data: {
        ...foundTemplate,
        weeks: weeksStore[templateIdNum] || []
      }
    });
  }),

  http.post('/api/plans/templates/weeks', async ({ request }) => {
    const body = (await request.json()) as { sequenceNumber: number; planTemplateId: number };
    const newWeekId = Date.now();
    const newWeek = { id: newWeekId, weekId: newWeekId, ...body, workouts: [] };

    const weeksStore = getStorage<Record<number, unknown[]>>("msw_template_weeks", {});
    if (!weeksStore[body.planTemplateId]) {
      weeksStore[body.planTemplateId] = [];
    }
    weeksStore[body.planTemplateId].push(newWeek);
    setStorage("msw_template_weeks", weeksStore);

    return HttpResponse.json({ data: newWeek }, { status: 200 });
  }),

  http.get('/api/plans/templates/weeks/:id', ({ params }) => {
    const { id } = params;
    const weekIdNum = Number(id);
    const workoutsStore = getStorage<Record<number, unknown[]>>("msw_week_workouts", {});

    return HttpResponse.json({
      data: {
        id: weekIdNum,
        workouts: workoutsStore[weekIdNum] || []
      }
    });
  }),
  // Plan Assignments
  http.post('/api/plans/assignments', async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const newAssignmentId = Date.now();
    
    return HttpResponse.json({
      data: { 
        planAssignmentId: newAssignmentId,
        ...body
      }
    }, { status: 200 });
  }),
];