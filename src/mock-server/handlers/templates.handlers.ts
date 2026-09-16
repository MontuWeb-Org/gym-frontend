import { http, HttpResponse } from "msw";
import planTemplatesData from "../data/planTemplates.json";

interface TemplatePlan {
  id: number;
  planId?: number;
  name: string;
  description: string;
  status: string;
  trainerId: number;
  durationWeekTemplates: number;
  isFav: boolean;
}

interface TemplateBody {
  name: string;
  description: string;
}

interface WeekBody {
  sequenceNumber: number;
  planTemplateId: number;
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

// Helper to extract userId from "Bearer mock_jwt_{userId}_{timestamp}"
function getUserIdFromToken(request: Request): string | null {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;

  const token = authHeader.replace("Bearer ", "");
  const parts = token.split("_");
  return parts.length >= 3 ? parts[2] : null;
}

// Shared update logic handler with clean 'any' typing
const updateTemplateResolver = async ({ request, params }: any) => {
  const { id } = params;
  const templateIdNum = Number(id);
  const body = (await request.json().catch(() => ({}))) as Record<string, any>;

  const allTemplates = getStorage<TemplatePlan[]>("msw_custom_templates", planTemplatesData as TemplatePlan[]);
  const index = allTemplates.findIndex(t => t.id === templateIdNum || Number(t.planId) === templateIdNum);

  let updatedPlan: TemplatePlan;
  if (index !== -1) {
    updatedPlan = {
      ...allTemplates[index],
      ...body,
      status: body.status || "ACTIVE",
    };
    allTemplates[index] = updatedPlan;
  } else {
    updatedPlan = {
      id: templateIdNum,
      planId: templateIdNum,
      name: body.name || `Template #${templateIdNum}`,
      description: body.description || "",
      status: body.status || "ACTIVE",
      trainerId: 1,
      durationWeekTemplates: 4,
      isFav: false,
      ...body,
    };
    allTemplates.unshift(updatedPlan);
  }

  setStorage("msw_custom_templates", allTemplates);

  return HttpResponse.json({ data: updatedPlan }, { status: 200 });
};

export const templateHandlers = [
  // 1. List Templates (Ensures distinct plans per trainer index)[cite: 1]
  http.get('*/api/plans/templates', ({ request }) => {
    const userId = getUserIdFromToken(request);
    const trainerId = userId ? Number(userId) : 1;

    const allTemplates = getStorage<TemplatePlan[]>("msw_custom_templates", planTemplatesData as TemplatePlan[]);
    let trainerTemplates = allTemplates.filter(t => Number(t.trainerId) === Number(trainerId));
    
    if (trainerTemplates.length === 0 || trainerTemplates.every(t => t.id === 1)) {
      const index = (trainerId - 1) % allTemplates.length;
      trainerTemplates = [allTemplates[index] || allTemplates[0]];
    }

    return HttpResponse.json({
      data: { plans: trainerTemplates },
      pagination: { total: trainerTemplates.length, page: 1, limit: 10, totalPages: 1 }
    });
  }),
  http.get('/api/plans/templates', ({ request }) => {
    const userId = getUserIdFromToken(request);
    const trainerId = userId ? Number(userId) : 1;

    const allTemplates = getStorage<TemplatePlan[]>("msw_custom_templates", planTemplatesData as TemplatePlan[]);
    let trainerTemplates = allTemplates.filter(t => Number(t.trainerId) === Number(trainerId));
    
    if (trainerTemplates.length === 0 || trainerTemplates.every(t => t.id === 1)) {
      const index = (trainerId - 1) % allTemplates.length;
      trainerTemplates = [allTemplates[index] || allTemplates[0]];
    }

    return HttpResponse.json({
      data: { plans: trainerTemplates },
      pagination: { total: trainerTemplates.length, page: 1, limit: 10, totalPages: 1 }
    });
  }),

  // 2. Create Template
  http.post('/api/plans/templates', async ({ request }) => {
    const userId = getUserIdFromToken(request);
    const trainerId = userId ? Number(userId) : 1;

    const body = (await request.json()) as TemplateBody;
    const newPlanId = Date.now();
    
    const newPlan = {
      planId: newPlanId,
      id: newPlanId,
      name: body.name,
      description: body.description || "",
      status: "DRAFT",
      trainerId: trainerId,
      durationWeekTemplates: 4,
      isFav: false,
      weeks: []
    };

    const allTemplates = getStorage<TemplatePlan[]>("msw_custom_templates", planTemplatesData as TemplatePlan[]);
    setStorage("msw_custom_templates", [newPlan, ...allTemplates]);

    return HttpResponse.json({ data: newPlan }, { status: 200 });
  }),
  http.post('*/api/plans/templates', async ({ request }) => {
    const userId = getUserIdFromToken(request);
    const trainerId = userId ? Number(userId) : 1;

    const body = (await request.json()) as TemplateBody;
    const newPlanId = Date.now();
    
    const newPlan = {
      planId: newPlanId,
      id: newPlanId,
      name: body.name,
      description: body.description || "",
      status: "DRAFT",
      trainerId: trainerId,
      durationWeekTemplates: 4,
      isFav: false,
      weeks: []
    };

    const allTemplates = getStorage<TemplatePlan[]>("msw_custom_templates", planTemplatesData as TemplatePlan[]);
    setStorage("msw_custom_templates", [newPlan, ...allTemplates]);

    return HttpResponse.json({ data: newPlan }, { status: 200 });
  }),

  // 3. Update / Publish Template
  http.put('/api/plans/templates/:id', updateTemplateResolver),
  http.put('*/api/plans/templates/:id', updateTemplateResolver),

  // 4. Get Template Detail by ID (With robust multi-key storage & fallback week lookup)
  http.get('/api/plans/templates/:id', ({ params }) => {
    const { id } = params;
    const templateIdNum = Number(id);
    const allTemplates = getStorage<TemplatePlan[]>("msw_custom_templates", planTemplatesData as TemplatePlan[]);
    
    const found = allTemplates.find(t => t.id === templateIdNum || Number(t.planId) === templateIdNum) || {
      id: templateIdNum,
      planId: templateIdNum,
      name: `Custom Template #${templateIdNum}`,
      description: "Program workspace",
      status: "DRAFT",
      trainerId: 1,
      durationWeekTemplates: 4,
      isFav: false
    };
    
    const weeksStore = getStorage<Record<string, any[]>>("msw_template_weeks", {});
    let storedWeeks = 
      weeksStore[templateIdNum] || 
      weeksStore[String(templateIdNum)] || 
      weeksStore[found.id] || 
      [];

    if (storedWeeks.length === 0) {
      for (const key of Object.keys(weeksStore)) {
        const candidateWeeks = weeksStore[key];
        if (candidateWeeks.some((w: any) => Number(w.planTemplateId) === templateIdNum || Number(w.planTemplateId) === found.id)) {
          storedWeeks = candidateWeeks;
          break;
        }
      }
    }
    
    return HttpResponse.json({
      data: {
        ...found,
        weeks: storedWeeks
      }
    });
  }),
  http.get('*/api/plans/templates/:id', ({ params }) => {
    const { id } = params;
    const templateIdNum = Number(id);
    const allTemplates = getStorage<TemplatePlan[]>("msw_custom_templates", planTemplatesData as TemplatePlan[]);
    
    const found = allTemplates.find(t => t.id === templateIdNum || Number(t.planId) === templateIdNum) || {
      id: templateIdNum,
      planId: templateIdNum,
      name: `Custom Template #${templateIdNum}`,
      description: "Program workspace",
      status: "DRAFT",
      trainerId: 1,
      durationWeekTemplates: 4,
      isFav: false
    };
    
    const weeksStore = getStorage<Record<string, any[]>>("msw_template_weeks", {});
    let storedWeeks = 
      weeksStore[templateIdNum] || 
      weeksStore[String(templateIdNum)] || 
      weeksStore[found.id] || 
      [];

    if (storedWeeks.length === 0) {
      for (const key of Object.keys(weeksStore)) {
        const candidateWeeks = weeksStore[key];
        if (candidateWeeks.some((w: any) => Number(w.planTemplateId) === templateIdNum || Number(w.planTemplateId) === found.id)) {
          storedWeeks = candidateWeeks;
          break;
        }
      }
    }
    
    return HttpResponse.json({
      data: {
        ...found,
        weeks: storedWeeks
      }
    });
  }),

  // 5. Create Week Template (Saves under string and numeric key mappings)
  http.post('/api/plans/templates/weeks', async ({ request }) => {
    const body = (await request.json()) as WeekBody & { planTemplateId: number | string };
    const newWeekId = Date.now();
    const newWeek = { id: newWeekId, weekId: newWeekId, ...body, workouts: [] };

    const weeksStore = getStorage<Record<string, unknown[]>>("msw_template_weeks", {});
    const targetKey = String(body.planTemplateId);
    
    if (!weeksStore[targetKey]) {
      weeksStore[targetKey] = [];
    }
    weeksStore[targetKey].push(newWeek);
    setStorage("msw_template_weeks", weeksStore);

    return HttpResponse.json({ data: newWeek }, { status: 200 });
  }),
  http.post('*/api/plans/templates/weeks', async ({ request }) => {
    const body = (await request.json()) as WeekBody & { planTemplateId: number | string };
    const newWeekId = Date.now();
    const newWeek = { id: newWeekId, weekId: newWeekId, ...body, workouts: [] };

    const weeksStore = getStorage<Record<string, unknown[]>>("msw_template_weeks", {});
    const targetKey = String(body.planTemplateId);
    
    if (!weeksStore[targetKey]) {
      weeksStore[targetKey] = [];
    }
    weeksStore[targetKey].push(newWeek);
    setStorage("msw_template_weeks", weeksStore);

    return HttpResponse.json({ data: newWeek }, { status: 200 });
  }),

  // 6. Get Week Detail by ID
  http.get('/api/plans/templates/weeks/:weekId', ({ params }) => {
    const { weekId } = params;
    const weekIdNum = Number(weekId);
    const weeksStore = getStorage<Record<string, any[]>>("msw_template_weeks", {});
    
    let foundWeek = null;
    for (const planId of Object.keys(weeksStore)) {
      const weeks = weeksStore[planId];
      const match = weeks.find((w: any) => Number(w.id) === weekIdNum || Number(w.weekId) === weekIdNum);
      if (match) {
        foundWeek = match;
        break;
      }
    }

    if (!foundWeek) {
      foundWeek = {
        id: weekIdNum,
        weekId: weekIdNum,
        name: `Week #${weekIdNum}`,
        sequenceNumber: 1,
        durationMinutes: 60,
        workouts: []
      };
    }

    return HttpResponse.json({ data: foundWeek }, { status: 200 });
  }),
  http.get('*/api/plans/templates/weeks/:weekId', ({ params }) => {
    const { weekId } = params;
    const weekIdNum = Number(weekId);
    const weeksStore = getStorage<Record<string, any[]>>("msw_template_weeks", {});
    
    let foundWeek = null;
    for (const planId of Object.keys(weeksStore)) {
      const weeks = weeksStore[planId];
      const match = weeks.find((w: any) => Number(w.id) === weekIdNum || Number(w.weekId) === weekIdNum);
      if (match) {
        foundWeek = match;
        break;
      }
    }

    if (!foundWeek) {
      foundWeek = {
        id: weekIdNum,
        weekId: weekIdNum,
        name: `Week #${weekIdNum}`,
        sequenceNumber: 1,
        durationMinutes: 60,
        workouts: []
      };
    }

    return HttpResponse.json({ data: foundWeek }, { status: 200 });
  }),

  // 7. Assign Plan / Assignments Endpoint
  http.post('/api/plans/assignments', async () => {
    return HttpResponse.json({ data: { success: true } }, { status: 200 });
  }),
  http.post('*/api/plans/assignments', async () => {
    return HttpResponse.json({ data: { success: true } }, { status: 200 });
  }),
];