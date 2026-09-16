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

// Bulletproof trainer ID extractor from query params, Authorization header, or localStorage session
function getTrainerIdFromRequest(request: Request): number {
  const url = new URL(request.url);

  // 1. Check explicit query params
  const queryTrainerId =
    url.searchParams.get("trainerId") || url.searchParams.get("userId");

  if (queryTrainerId && /^\d+$/.test(queryTrainerId)) {
    return Number(queryTrainerId);
  }

  // 2. Check Authorization header token
  const authHeader = request.headers.get("Authorization");

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.replace("Bearer ", "").trim();

    if (/^\d+$/.test(token)) return Number(token);

    const parts = token.split("_");

    for (const part of parts) {
      if (
        /^\d+$/.test(part) &&
        Number(part) > 0 &&
        Number(part) <= 5
      ) {
        return Number(part);
      }
    }
  }

  // 3. Scan browser localStorage for active user/trainer profiles
  if (typeof window !== "undefined") {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);

      if (
        key &&
        (key.toLowerCase().includes("user") ||
          key.toLowerCase().includes("auth") ||
          key.toLowerCase().includes("trainer") ||
          key.toLowerCase().includes("token"))
      ) {
        try {
          const val = localStorage.getItem(key);

          if (val) {
            if (/^\d+$/.test(val)) return Number(val);

            const parsed = JSON.parse(val);
            const id =
              parsed.id ||
              parsed.trainerId ||
              parsed.userId ||
              parsed.sub;

            if (id && !isNaN(Number(id))) {
              return Number(id);
            }
          }
        } catch {
          // Ignore parse errors
        }
      }
    }
  }

  return 1;
}

// Shared update logic handler with clean 'any' typing
const updateTemplateResolver = async ({ request, params }: any) => {
  const { id } = params;
  const templateIdNum = Number(id);

  const body = (await request.json().catch(() => ({}))) as Record<
    string,
    any
  >;

  const allTemplates = getStorage<TemplatePlan[]>(
    "msw_custom_templates",
    planTemplatesData as TemplatePlan[]
  );

  const index = allTemplates.findIndex(
    (t) =>
      t.id === templateIdNum ||
      Number(t.planId) === templateIdNum
  );

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

  return HttpResponse.json(
    { data: updatedPlan },
    { status: 200 }
  );
};

export const templateHandlers = [
  // 1. List Templates
  http.get("*/api/plans/templates", ({ request }) => {
    const trainerId = getTrainerIdFromRequest(request);

    const allTemplates = getStorage<TemplatePlan[]>(
      "msw_custom_templates",
      planTemplatesData as TemplatePlan[]
    );

    const trainerTemplates = allTemplates.filter(
      (t) => Number(t.trainerId) === Number(trainerId)
    );

    return HttpResponse.json({
      data: { plans: trainerTemplates },
      pagination: {
        total: trainerTemplates.length,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
    });
  }),

  http.get("/api/plans/templates", ({ request }) => {
    const trainerId = getTrainerIdFromRequest(request);

    const allTemplates = getStorage<TemplatePlan[]>(
      "msw_custom_templates",
      planTemplatesData as TemplatePlan[]
    );

    const trainerTemplates = allTemplates.filter(
      (t) => Number(t.trainerId) === Number(trainerId)
    );

    return HttpResponse.json({
      data: { plans: trainerTemplates },
      pagination: {
        total: trainerTemplates.length,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
    });
  }),

  // 2. Create Template
  http.post("/api/plans/templates", async ({ request }) => {
    const trainerId = getTrainerIdFromRequest(request);

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
      weeks: [],
    };

    const allTemplates = getStorage<TemplatePlan[]>(
      "msw_custom_templates",
      planTemplatesData as TemplatePlan[]
    );

    setStorage("msw_custom_templates", [
      newPlan,
      ...allTemplates,
    ]);

    return HttpResponse.json(
      { data: newPlan },
      { status: 200 }
    );
  }),

  http.post("*/api/plans/templates", async ({ request }) => {
    const trainerId = getTrainerIdFromRequest(request);

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
      weeks: [],
    };

    const allTemplates = getStorage<TemplatePlan[]>(
      "msw_custom_templates",
      planTemplatesData as TemplatePlan[]
    );

    setStorage("msw_custom_templates", [
      newPlan,
      ...allTemplates,
    ]);

    return HttpResponse.json(
      { data: newPlan },
      { status: 200 }
    );
  }),

  // 3. Update / Publish Template
  http.put(
    "/api/plans/templates/:id",
    updateTemplateResolver
  ),

  http.put(
    "*/api/plans/templates/:id",
    updateTemplateResolver
  ),

  // 4. Get Template Detail by ID
  http.get("/api/plans/templates/:id", ({ params }) => {
    const { id } = params;
    const templateIdNum = Number(id);

    const allTemplates = getStorage<TemplatePlan[]>(
      "msw_custom_templates",
      planTemplatesData as TemplatePlan[]
    );

    const found =
      allTemplates.find(
        (t) =>
          t.id === templateIdNum ||
          Number(t.planId) === templateIdNum
      ) || {
        id: templateIdNum,
        planId: templateIdNum,
        name: `Custom Template #${templateIdNum}`,
        description: "Program workspace",
        status: "DRAFT",
        trainerId: 1,
        durationWeekTemplates: 4,
        isFav: false,
      };

    const weeksStore = getStorage<
      Record<string, any[]>
    >("msw_template_weeks", {});

    let storedWeeks =
      weeksStore[templateIdNum] ||
      weeksStore[String(templateIdNum)] ||
      weeksStore[found.id] ||
      [];

    if (storedWeeks.length === 0) {
      for (const key of Object.keys(weeksStore)) {
        const candidateWeeks = weeksStore[key];

        if (
          candidateWeeks.some(
            (w: any) =>
              Number(w.planTemplateId) === templateIdNum ||
              Number(w.planTemplateId) === found.id
          )
        ) {
          storedWeeks = candidateWeeks;
          break;
        }
      }
    }

    return HttpResponse.json({
      data: {
        ...found,
        weeks: storedWeeks,
      },
    });
  }),

  http.get("*/api/plans/templates/:id", ({ params }) => {
    const { id } = params;
    const templateIdNum = Number(id);

    const allTemplates = getStorage<TemplatePlan[]>(
      "msw_custom_templates",
      planTemplatesData as TemplatePlan[]
    );

    const found =
      allTemplates.find(
        (t) =>
          t.id === templateIdNum ||
          Number(t.planId) === templateIdNum
      ) || {
        id: templateIdNum,
        planId: templateIdNum,
        name: `Custom Template #${templateIdNum}`,
        description: "Program workspace",
        status: "DRAFT",
        trainerId: 1,
        durationWeekTemplates: 4,
        isFav: false,
      };

    const weeksStore = getStorage<
      Record<string, any[]>
    >("msw_template_weeks", {});

    let storedWeeks =
      weeksStore[templateIdNum] ||
      weeksStore[String(templateIdNum)] ||
      weeksStore[found.id] ||
      [];

    if (storedWeeks.length === 0) {
      for (const key of Object.keys(weeksStore)) {
        const candidateWeeks = weeksStore[key];

        if (
          candidateWeeks.some(
            (w: any) =>
              Number(w.planTemplateId) === templateIdNum ||
              Number(w.planTemplateId) === found.id
          )
        ) {
          storedWeeks = candidateWeeks;
          break;
        }
      }
    }

    return HttpResponse.json({
      data: {
        ...found,
        weeks: storedWeeks,
      },
    });
  }),

  // 5. Create Week Template
  http.post(
    "/api/plans/templates/weeks",
    async ({ request }) => {
      const body =
        (await request.json()) as WeekBody & {
          planTemplateId: number | string;
        };

      const newWeekId = Date.now();

      const newWeek = {
        id: newWeekId,
        weekId: newWeekId,
        ...body,
        workouts: [],
      };

      const weeksStore = getStorage<
        Record<string, unknown[]>
      >("msw_template_weeks", {});

      const targetKey = String(body.planTemplateId);

      if (!weeksStore[targetKey]) {
        weeksStore[targetKey] = [];
      }

      weeksStore[targetKey].push(newWeek);

      setStorage("msw_template_weeks", weeksStore);

      return HttpResponse.json(
        { data: newWeek },
        { status: 200 }
      );
    }
  ),

  http.post(
    "*/api/plans/templates/weeks",
    async ({ request }) => {
      const body =
        (await request.json()) as WeekBody & {
          planTemplateId: number | string;
        };

      const newWeekId = Date.now();

      const newWeek = {
        id: newWeekId,
        weekId: newWeekId,
        ...body,
        workouts: [],
      };

      const weeksStore = getStorage<
        Record<string, unknown[]>
      >("msw_template_weeks", {});

      const targetKey = String(body.planTemplateId);

      if (!weeksStore[targetKey]) {
        weeksStore[targetKey] = [];
      }

      weeksStore[targetKey].push(newWeek);

      setStorage("msw_template_weeks", weeksStore);

      return HttpResponse.json(
        { data: newWeek },
        { status: 200 }
      );
    }
  ),

  // 6. Get Week Detail by ID
  http.get(
    "/api/plans/templates/weeks/:weekId",
    ({ params }) => {
      const { weekId } = params;
      const weekIdNum = Number(weekId);

      const weeksStore = getStorage<
        Record<string, any[]>
      >("msw_template_weeks", {});

      let foundWeek = null;

      // Find the week itself
      for (const planId of Object.keys(weeksStore)) {
        const weeks = weeksStore[planId];

        const match = weeks.find(
          (w: any) =>
            Number(w.id) === weekIdNum ||
            Number(w.weekId) === weekIdNum
        );

        if (match) {
          foundWeek = match;
          break;
        }
      }

      // Fallback if the week doesn't exist
      if (!foundWeek) {
        foundWeek = {
          id: weekIdNum,
          weekId: weekIdNum,
          name: `Week #${weekIdNum}`,
          sequenceNumber: 1,
          durationMinutes: 60,
          workouts: [],
        };
      }

      // ----------------------------------------------------------
      // Load workouts belonging to this week.
      //
      // Weeks are stored in:
      //   msw_template_weeks
      //
      // Workouts are stored separately in:
      //   msw_week_workouts
      //
      // Each workout has:
      //   weekTemplateId = weekId
      // ----------------------------------------------------------
      const workoutsStore = getStorage<
        Record<string, any[]>
      >("msw_week_workouts", {});

      let storedWorkouts =
        workoutsStore[String(weekIdNum)] ||
        workoutsStore[weekIdNum] ||
        [];

      // If the direct key lookup didn't find anything,
      // scan all workouts and match by weekTemplateId.
      if (storedWorkouts.length === 0) {
        const allWorkouts =
          Object.values(workoutsStore).flat();

        storedWorkouts = allWorkouts.filter(
          (workout: any) =>
            Number(workout.weekTemplateId) === weekIdNum
        );
      }

      return HttpResponse.json(
        {
          data: {
            ...foundWeek,
            workouts: storedWorkouts,
          },
        },
        { status: 200 }
      );
    }
  ),

  http.get(
    "*/api/plans/templates/weeks/:weekId",
    ({ params }) => {
      const { weekId } = params;
      const weekIdNum = Number(weekId);

      const weeksStore = getStorage<
        Record<string, any[]>
      >("msw_template_weeks", {});

      let foundWeek = null;

      // Find the week itself
      for (const planId of Object.keys(weeksStore)) {
        const weeks = weeksStore[planId];

        const match = weeks.find(
          (w: any) =>
            Number(w.id) === weekIdNum ||
            Number(w.weekId) === weekIdNum
        );

        if (match) {
          foundWeek = match;
          break;
        }
      }

      // Fallback if the week doesn't exist
      if (!foundWeek) {
        foundWeek = {
          id: weekIdNum,
          weekId: weekIdNum,
          name: `Week #${weekIdNum}`,
          sequenceNumber: 1,
          durationMinutes: 60,
          workouts: [],
        };
      }

      // ----------------------------------------------------------
      // Load workouts belonging to this week.
      // ----------------------------------------------------------
      const workoutsStore = getStorage<
        Record<string, any[]>
      >("msw_week_workouts", {});

      let storedWorkouts =
        workoutsStore[String(weekIdNum)] ||
        workoutsStore[weekIdNum] ||
        [];

      // Fallback: scan all stored workouts and match by weekTemplateId.
      if (storedWorkouts.length === 0) {
        const allWorkouts =
          Object.values(workoutsStore).flat();

        storedWorkouts = allWorkouts.filter(
          (workout: any) =>
            Number(workout.weekTemplateId) === weekIdNum
        );
      }

      return HttpResponse.json(
        {
          data: {
            ...foundWeek,
            workouts: storedWorkouts,
          },
        },
        { status: 200 }
      );
    }
  ),

  // 7. Assign Plan / Assignments Endpoint
  http.post(
    "/api/plans/assignments",
    async () => {
      return HttpResponse.json(
        { data: { success: true } },
        { status: 200 }
      );
    }
  ),

  http.post(
    "*/api/plans/assignments",
    async () => {
      return HttpResponse.json(
        { data: { success: true } },
        { status: 200 }
      );
    }
  ),
];