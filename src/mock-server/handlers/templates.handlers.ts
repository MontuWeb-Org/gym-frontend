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
interface PlanAssignment {
id: number;
planTemplateId: number;
traineeId: number;
createdAt: string;
endedAt: string;
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
// Extract the authenticated trainer ID from the mock JWT.
//
// Auth handler creates tokens in this format:
// mock_jwt_{userId}_{timestamp}
//
// Example:
// mock_jwt_3_1789521480000
//
// Which becomes:
// ["mock", "jwt", "3", "1789521480000"]
function getTrainerIdFromRequest(request: Request): number | null {
const authHeader = request.headers.get("Authorization");
if (!authHeader || !authHeader.startsWith("Bearer ")) {
return null;
}
const token = authHeader.replace("Bearer ", "").trim();
const parts = token.split("_");
if (parts.length >= 4 && /^\d+$/.test(parts[2])) {
return Number(parts[2]);
}
return null;
}
// Shared update logic handler
const updateTemplateResolver = async ({ request, params }: any) => {
const { id } = params;
const templateIdNum = Number(id);
const trainerId = getTrainerIdFromRequest(request);
if (trainerId === null) {
return HttpResponse.json(
{ message: "Unauthorized access token" },
{ status: 401 }
);
}
const body = (await request.json().catch(() => ({}))) as Record<
string,
any
>;
const allTemplates = getStorage<TemplatePlan[]>(
"msw_custom_templates",
planTemplatesData as TemplatePlan[]
);
// Only allow the authenticated trainer to update their own template.
const index = allTemplates.findIndex(
(t) =>
(t.id === templateIdNum || Number(t.planId) === templateIdNum) &&
Number(t.trainerId) === trainerId
);
let updatedPlan: TemplatePlan;
if (index !== -1) {
updatedPlan = {
...allTemplates[index],
...body,
status: body.status || allTemplates[index].status || "ACTIVE",
trainerId: trainerId,
};
    allTemplates[index] = updatedPlan;
} else {
return HttpResponse.json(
{ message: "Template not found" },
{ status: 404 }
);
}
setStorage("msw_custom_templates", allTemplates);
return HttpResponse.json(
{ data: updatedPlan },
{ status: 200 }
);
};
// ============================================================
// Assignment handlers
// ============================================================
const createAssignmentResolver = async ({ request }: any) => {
const trainerId = getTrainerIdFromRequest(request);
if (trainerId === null) {
return HttpResponse.json(
{ message: "Unauthorized access token" },
{ status: 401 }
);
}
const body = (await request.json()) as Omit<
PlanAssignment,
"id"
>;
const allTemplates = getStorage<TemplatePlan[]>(
"msw_custom_templates",
planTemplatesData as TemplatePlan[]
);
// Make sure the template belongs to the logged-in trainer.
const template = allTemplates.find(
(t) =>
(Number(t.id) === Number(body.planTemplateId) ||
Number(t.planId) === Number(body.planTemplateId)) &&
Number(t.trainerId) === trainerId
);
if (!template) {
return HttpResponse.json(
{ message: "Template not found" },
{ status: 404 }
);
}
const assignments = getStorage<PlanAssignment[]>(
"msw_plan_assignments",
[]
);
const newAssignment: PlanAssignment = {
id: Date.now(),
planTemplateId: Number(body.planTemplateId),
traineeId: Number(body.traineeId),
createdAt: body.createdAt,
endedAt: body.endedAt,
};
assignments.push(newAssignment);
setStorage("msw_plan_assignments", assignments);
return HttpResponse.json(
{
data: newAssignment,
message: "Plan assigned successfully",
},
{ status: 200 }
);
};
const getAssignmentsResolver = async ({ request }: any) => {
const trainerId = getTrainerIdFromRequest(request);
if (trainerId === null) {
return HttpResponse.json(
{ message: "Unauthorized access token" },
{ status: 401 }
);
}
const assignments = getStorage<PlanAssignment[]>(
"msw_plan_assignments",
[]
);
const allTemplates = getStorage<TemplatePlan[]>(
"msw_custom_templates",
planTemplatesData as TemplatePlan[]
);
// Only return assignments belonging to templates
// owned by the currently logged-in trainer.
const trainerTemplateIds = new Set(
allTemplates
.filter((template) => Number(template.trainerId) === trainerId)
.flatMap((template) => [
Number(template.id),
Number(template.planId),
])
);
const trainerAssignments = assignments.filter((assignment) =>
trainerTemplateIds.has(Number(assignment.planTemplateId))
);
return HttpResponse.json({
data: trainerAssignments,
});
};
const updateAssignmentResolver = async ({
request,
params,
}: any) => {
const trainerId = getTrainerIdFromRequest(request);
if (trainerId === null) {
return HttpResponse.json(
{ message: "Unauthorized access token" },
{ status: 401 }
);
}
const assignmentId = Number(params.id);
const body = (await request.json().catch(() => ({}))) as Partial<
PlanAssignment
>;
const assignments = getStorage<PlanAssignment[]>(
"msw_plan_assignments",
[]
);
const allTemplates = getStorage<TemplatePlan[]>(
"msw_custom_templates",
planTemplatesData as TemplatePlan[]
);
const index = assignments.findIndex(
(assignment) => Number(assignment.id) === assignmentId
);
if (index === -1) {
return HttpResponse.json(
{ message: "Assignment not found" },
{ status: 404 }
);
}
const assignment = assignments[index];
// Make sure the assignment belongs to one of
// the logged-in trainer's templates.
const template = allTemplates.find(
(t) =>
(Number(t.id) === Number(assignment.planTemplateId) ||
Number(t.planId) === Number(assignment.planTemplateId)) &&
Number(t.trainerId) === trainerId
);
if (!template) {
return HttpResponse.json(
{ message: "Assignment not found" },
{ status: 404 }
);
}
const updatedAssignment: PlanAssignment = {
...assignment,
...body,
id: assignment.id,
planTemplateId: assignment.planTemplateId,
traineeId: assignment.traineeId,
};
assignments[index] = updatedAssignment;
setStorage("msw_plan_assignments", assignments);
return HttpResponse.json(
{
data: updatedAssignment,
message: "Assignment updated successfully",
},
{ status: 200 }
);
};
const deleteAssignmentResolver = async ({
request,
params,
}: any) => {
const trainerId = getTrainerIdFromRequest(request);
if (trainerId === null) {
return HttpResponse.json(
{ message: "Unauthorized access token" },
{ status: 401 }
);
}
const assignmentId = Number(params.id);
const assignments = getStorage<PlanAssignment[]>(
"msw_plan_assignments",
[]
);
const allTemplates = getStorage<TemplatePlan[]>(
"msw_custom_templates",
planTemplatesData as TemplatePlan[]
);
const assignment = assignments.find(
(item) => Number(item.id) === assignmentId
);
if (!assignment) {
return HttpResponse.json(
{ message: "Assignment not found" },
{ status: 404 }
);
}
const template = allTemplates.find(
(t) =>
(Number(t.id) === Number(assignment.planTemplateId) ||
Number(t.planId) === Number(assignment.planTemplateId)) &&
Number(t.trainerId) === trainerId
);
if (!template) {
return HttpResponse.json(
{ message: "Assignment not found" },
{ status: 404 }
);
}
const updatedAssignments = assignments.filter(
(item) => Number(item.id) !== assignmentId
);
setStorage("msw_plan_assignments", updatedAssignments);
return HttpResponse.json(
{
message: "Assignment removed successfully",
},
{ status: 200 }
);
};
export const templateHandlers = [
// ============================================================
// 1. List Templates
// ============================================================
http.get("*/api/plans/templates", ({ request }) => {
const trainerId = getTrainerIdFromRequest(request);
    if (trainerId === null) {
      return HttpResponse.json(
        { message: "Unauthorized access token" },
        { status: 401 }
      );
    }

    const allTemplates = getStorage<TemplatePlan[]>(
      "msw_custom_templates",
      planTemplatesData as TemplatePlan[]
    );

    // Only return templates created by the logged-in trainer.
    const trainerTemplates = allTemplates.filter(
      (t) => Number(t.trainerId) === trainerId
    );

    return HttpResponse.json({
      data: {
        plans: trainerTemplates,
      },
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
    if (trainerId === null) {
      return HttpResponse.json(
        { message: "Unauthorized access token" },
        { status: 401 }
      );
    }

    const allTemplates = getStorage<TemplatePlan[]>(
      "msw_custom_templates",
      planTemplatesData as TemplatePlan[]
    );

    // Only return templates created by the logged-in trainer.
    const trainerTemplates = allTemplates.filter(
      (t) => Number(t.trainerId) === trainerId
    );

    return HttpResponse.json({
      data: {
        plans: trainerTemplates,
      },
      pagination: {
        total: trainerTemplates.length,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
    });
}),
// ============================================================
// 2. Create Template
// ============================================================
http.post("/api/plans/templates", async ({ request }) => {
const trainerId = getTrainerIdFromRequest(request);
    if (trainerId === null) {
      return HttpResponse.json(
        { message: "Unauthorized access token" },
        { status: 401 }
      );
    }

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
    if (trainerId === null) {
      return HttpResponse.json(
        { message: "Unauthorized access token" },
        { status: 401 }
      );
    }

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
// ============================================================
// 3. Update / Publish Template
// ============================================================
http.put(
"/api/plans/templates/:id",
updateTemplateResolver
),
http.put(
"*/api/plans/templates/:id",
updateTemplateResolver
),
// ============================================================
// 4. Get Template Detail by ID
// ============================================================
http.get(
"/api/plans/templates/:id",
({ request, params }) => {
const trainerId = getTrainerIdFromRequest(request);
      if (trainerId === null) {
        return HttpResponse.json(
          { message: "Unauthorized access token" },
          { status: 401 }
        );
      }

      const { id } = params;
      const templateIdNum = Number(id);

      const allTemplates = getStorage<TemplatePlan[]>(
        "msw_custom_templates",
        planTemplatesData as TemplatePlan[]
      );

      // Find the template by ID AND make sure it belongs
      // to the currently authenticated trainer.
      const found = allTemplates.find(
        (t) =>
          (t.id === templateIdNum ||
            Number(t.planId) === templateIdNum) &&
          Number(t.trainerId) === trainerId
      );

      // Do not create or return a fake template here.
      // If it doesn't belong to this trainer, return 404.
      if (!found) {
        return HttpResponse.json(
          { message: "Template not found" },
          { status: 404 }
        );
      }

      const weeksStore = getStorage<Record<string, any[]>>(
        "msw_template_weeks",
        {}
      );

      let storedWeeks =
        weeksStore[String(templateIdNum)] ||
        weeksStore[String(found.id)] ||
        [];

      // Fallback search in case the week was stored under
      // a different key but has the correct planTemplateId.
      if (storedWeeks.length === 0) {
        for (const key of Object.keys(weeksStore)) {
          const candidateWeeks = weeksStore[key];

          if (
            candidateWeeks.some(
              (w: any) =>
                Number(w.planTemplateId) === templateIdNum ||
                Number(w.planTemplateId) === Number(found.id)
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
    }
),
http.get(
"*/api/plans/templates/:id",
({ request, params }) => {
const trainerId = getTrainerIdFromRequest(request);
      if (trainerId === null) {
        return HttpResponse.json(
          { message: "Unauthorized access token" },
          { status: 401 }
        );
      }

      const { id } = params;
      const templateIdNum = Number(id);

      const allTemplates = getStorage<TemplatePlan[]>(
        "msw_custom_templates",
        planTemplatesData as TemplatePlan[]
      );

      // Find the template by ID AND owner.
      const found = allTemplates.find(
        (t) =>
          (t.id === templateIdNum ||
            Number(t.planId) === templateIdNum) &&
          Number(t.trainerId) === trainerId
      );

      if (!found) {
        return HttpResponse.json(
          { message: "Template not found" },
          { status: 404 }
        );
      }

      const weeksStore = getStorage<Record<string, any[]>>(
        "msw_template_weeks",
        {}
      );

      let storedWeeks =
        weeksStore[String(templateIdNum)] ||
        weeksStore[String(found.id)] ||
        [];

      if (storedWeeks.length === 0) {
        for (const key of Object.keys(weeksStore)) {
          const candidateWeeks = weeksStore[key];

          if (
            candidateWeeks.some(
              (w: any) =>
                Number(w.planTemplateId) === templateIdNum ||
                Number(w.planTemplateId) === Number(found.id)
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
    }
),
// ============================================================
// 5. Create Week Template
// ============================================================
http.post(
"/api/plans/templates/weeks",
async ({ request }) => {
const body = (await request.json()) as WeekBody & {
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
const body = (await request.json()) as WeekBody & {
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
// ============================================================
// 6. Get Week Detail by ID
// ============================================================
http.get(
"/api/plans/templates/weeks/:weekId",
({ params }) => {
const { weekId } = params;
const weekIdNum = Number(weekId);
      const weeksStore = getStorage<
        Record<string, any[]>
      >("msw_template_weeks", {});

      let foundWeek = null;

      // Search all stored weeks for the requested week ID.
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

      // If no week exists, return a basic week object.
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

      const workoutsStore = getStorage<
        Record<string, any[]>
      >("msw_week_workouts", {});

      let storedWorkouts =
        workoutsStore[String(weekIdNum)] ||
        workoutsStore[weekIdNum] ||
        [];

      // If workouts weren't stored directly under the week ID,
      // search all workouts using weekTemplateId.
      if (storedWorkouts.length === 0) {
        const allWorkouts = Object.values(workoutsStore).flat();

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

      const workoutsStore = getStorage<
        Record<string, any[]>
      >("msw_week_workouts", {});

      let storedWorkouts =
        workoutsStore[String(weekIdNum)] ||
        workoutsStore[weekIdNum] ||
        [];

      if (storedWorkouts.length === 0) {
        const allWorkouts = Object.values(workoutsStore).flat();

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
// ============================================================
// 7. Assignments
// ============================================================
http.post(
"/api/plans/assignments",
createAssignmentResolver
),
http.post(
"*/api/plans/assignments",
createAssignmentResolver
),
http.get(
"/api/plans/assignments",
getAssignmentsResolver
),
http.get(
"*/api/plans/assignments",
getAssignmentsResolver
),
http.put(
"/api/plans/assignments/:id",
updateAssignmentResolver
),
http.put(
"*/api/plans/assignments/:id",
updateAssignmentResolver
),
http.delete(
"/api/plans/assignments/:id",
deleteAssignmentResolver
),
http.delete(
"*/api/plans/assignments/:id",
deleteAssignmentResolver
),
];