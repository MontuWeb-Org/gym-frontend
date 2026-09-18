import {
  http,
  HttpResponse,
} from "msw";

import {
  findTemplateForTrainer,
  getAssignments,
  getNextId,
  getTemplates,
  saveAssignments,
} from "../utils/templateHelpers";

import {
  PlanAssignment,
} from "../types/program.types";

import {
  getTrainerIdFromRequest,
} from "../utils/mockAuth";

/* -------------------------------------------------------------------------- */
/* RESPONSE HELPERS                                                           */
/* -------------------------------------------------------------------------- */

function unauthorizedResponse() {
  return HttpResponse.json(
    {
      message:
        "Unauthorized access token",
    },
    {
      status: 401,
    }
  );
}

function notFoundResponse(
  message: string
) {
  return HttpResponse.json(
    {
      message,
    },
    {
      status: 404,
    }
  );
}

/* -------------------------------------------------------------------------- */
/* CREATE ASSIGNMENT                                                          */
/* -------------------------------------------------------------------------- */

const createAssignmentResolver = async ({
  request,
}: {
  request: Request;
}) => {
  const trainerId =
    getTrainerIdFromRequest(request);

  if (trainerId === null) {
    return unauthorizedResponse();
  }

  const body =
    (await request.json()) as Partial<
      PlanAssignment
    >;

  const planTemplateId =
    Number(body.planTemplateId);

  const traineeId =
    Number(body.traineeId);

  if (
    !Number.isFinite(
      planTemplateId
    ) ||
    !Number.isFinite(
      traineeId
    )
  ) {
    return HttpResponse.json(
      {
        message:
          "planTemplateId and traineeId are required.",
      },
      {
        status: 400,
      }
    );
  }

  const template =
    findTemplateForTrainer(
      planTemplateId,
      trainerId
    );

  if (!template) {
    return notFoundResponse(
      "Template not found."
    );
  }

  const assignments =
    getAssignments();

  const newAssignment: PlanAssignment =
    {
      id: getNextId(
        assignments
      ),
      planTemplateId,
      traineeId,
      createdAt:
        typeof body.createdAt ===
        "string"
          ? body.createdAt
          : new Date().toISOString(),
      endedAt:
        typeof body.endedAt ===
        "string"
          ? body.endedAt
          : "",
    };

  assignments.push(
    newAssignment
  );

  saveAssignments(
    assignments
  );

  return HttpResponse.json(
    {
      data: newAssignment,
      message:
        "Plan assigned successfully.",
    },
    {
      status: 201,
    }
  );
};

/* -------------------------------------------------------------------------- */
/* GET ASSIGNMENTS                                                            */
/* -------------------------------------------------------------------------- */

const getAssignmentsResolver = ({
  request,
}: {
  request: Request;
}) => {
  const trainerId =
    getTrainerIdFromRequest(request);

  if (trainerId === null) {
    return unauthorizedResponse();
  }

  const assignments =
    getAssignments();

  const templates =
    getTemplates();

  const trainerTemplateIds =
    new Set<number>();

  templates
    .filter(
      (template) =>
        Number(template.trainerId) ===
        trainerId
    )
    .forEach((template) => {
      trainerTemplateIds.add(
        Number(template.id)
      );

      if (
        template.planId !==
        undefined
      ) {
        trainerTemplateIds.add(
          Number(template.planId)
        );
      }
    });

  const trainerAssignments =
    assignments.filter(
      (assignment) =>
        trainerTemplateIds.has(
          Number(
            assignment.planTemplateId
          )
        )
    );

  return HttpResponse.json({
    data: trainerAssignments,
  });
};

/* -------------------------------------------------------------------------- */
/* UPDATE ASSIGNMENT                                                          */
/* -------------------------------------------------------------------------- */

const updateAssignmentResolver =
  async ({
    request,
    params,
  }: {
    request: Request;
    params: {
      assignmentId?: string;
    };
  }) => {
    const trainerId =
      getTrainerIdFromRequest(
        request
      );

    if (trainerId === null) {
      return unauthorizedResponse();
    }

    const assignmentId =
      Number(params.assignmentId);

    if (
      !Number.isFinite(
        assignmentId
      )
    ) {
      return notFoundResponse(
        "Assignment not found."
      );
    }

    const assignments =
      getAssignments();

    const assignmentIndex =
      assignments.findIndex(
        (assignment) =>
          Number(assignment.id) ===
          assignmentId
      );

    if (
      assignmentIndex === -1
    ) {
      return notFoundResponse(
        "Assignment not found."
      );
    }

    const currentAssignment =
      assignments[
        assignmentIndex
      ];

    const template =
      findTemplateForTrainer(
        Number(
          currentAssignment.planTemplateId
        ),
        trainerId
      );

    if (!template) {
      return notFoundResponse(
        "Assignment not found."
      );
    }

    const body =
      (await request.json()) as Partial<
        Pick<
          PlanAssignment,
          "createdAt" | "endedAt"
        >
      >;

    const updatedAssignment:
      PlanAssignment = {
      ...currentAssignment,
      ...(typeof body.createdAt ===
      "string"
        ? {
            createdAt:
              body.createdAt,
          }
        : {}),
      ...(typeof body.endedAt ===
      "string"
        ? {
            endedAt:
              body.endedAt,
          }
        : {}),
    };

    assignments[
      assignmentIndex
    ] = updatedAssignment;

    saveAssignments(
      assignments
    );

    return HttpResponse.json({
      data: updatedAssignment,
      message:
        "Assignment updated successfully.",
    });
  };

/* -------------------------------------------------------------------------- */
/* DELETE ASSIGNMENT                                                          */
/* -------------------------------------------------------------------------- */

const deleteAssignmentResolver = ({
  request,
  params,
}: {
  request: Request;
  params: {
    assignmentId?: string;
  };
}) => {
  const trainerId =
    getTrainerIdFromRequest(request);

  if (trainerId === null) {
    return unauthorizedResponse();
  }

  const assignmentId =
    Number(params.assignmentId);

  if (
    !Number.isFinite(
      assignmentId
    )
  ) {
    return notFoundResponse(
      "Assignment not found."
    );
  }

  const assignments =
    getAssignments();

  const assignment =
    assignments.find(
      (item) =>
        Number(item.id) ===
        assignmentId
    );

  if (!assignment) {
    return notFoundResponse(
      "Assignment not found."
    );
  }

  const template =
    findTemplateForTrainer(
      Number(
        assignment.planTemplateId
      ),
      trainerId
    );

  if (!template) {
    return notFoundResponse(
      "Assignment not found."
    );
  }

  const updatedAssignments =
    assignments.filter(
      (item) =>
        Number(item.id) !==
        assignmentId
    );

  saveAssignments(
    updatedAssignments
  );

  return HttpResponse.json({
    message:
      "Assignment deleted successfully.",
  });
};

/* -------------------------------------------------------------------------- */
/* HANDLERS                                                                   */
/* -------------------------------------------------------------------------- */

export const assignmentHandlers = [
  /* Create assignment */
  http.post(
    "/api/plans/assignments",
    createAssignmentResolver
  ),

  http.post(
    "*/api/plans/assignments",
    createAssignmentResolver
  ),

  /* Get assignments */
  http.get(
    "/api/plans/assignments",
    getAssignmentsResolver
  ),

  http.get(
    "*/api/plans/assignments",
    getAssignmentsResolver
  ),

  /* Update assignment */
  http.put(
    "/api/plans/assignments/:assignmentId",
    updateAssignmentResolver
  ),

  http.put(
    "*/api/plans/assignments/:assignmentId",
    updateAssignmentResolver
  ),

  /* Delete assignment */
  http.delete(
    "/api/plans/assignments/:assignmentId",
    deleteAssignmentResolver
  ),

  http.delete(
    "*/api/plans/assignments/:assignmentId",
    deleteAssignmentResolver
  ),
];