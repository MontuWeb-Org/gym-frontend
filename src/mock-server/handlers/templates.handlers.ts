import {
  http,
  HttpResponse,
} from "msw";

import {
  deleteTemplateCascade,
  duplicateTemplateData,
  findTemplateForTrainer,
  getNextId,
  getTemplateWeeks,
  getTemplates,
  getTrainerTemplates,
  isTemplateAssigned,
  saveTemplates,
} from "../utils/templateHelpers";

import {
  TemplateBody,
  TemplatePlan,
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
      message: "Unauthorized access token",
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
/* GET TEMPLATES                                                              */
/* -------------------------------------------------------------------------- */

const getTemplatesResolver = ({
  request,
}: {
  request: Request;
}) => {
  const trainerId =
    getTrainerIdFromRequest(request);

  if (trainerId === null) {
    return unauthorizedResponse();
  }

  const templates =
    getTrainerTemplates(trainerId);

  return HttpResponse.json({
    data: {
      plans: templates,
    },
  });
};

/* -------------------------------------------------------------------------- */
/* CREATE TEMPLATE                                                            */
/* -------------------------------------------------------------------------- */

const createTemplateResolver = async ({
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
    (await request.json()) as Partial<TemplateBody>;

  if (
    typeof body.name !== "string" ||
    !body.name.trim()
  ) {
    return HttpResponse.json(
      {
        message:
          "Template name is required.",
      },
      {
        status: 400,
      }
    );
  }

  const templates =
    getTemplates();

  const newId =
    getNextId(templates);

  const newTemplate: TemplatePlan = {
    id: newId,
    planId: newId,
    name: body.name.trim(),
    description:
      typeof body.description ===
      "string"
        ? body.description.trim()
        : "",
    status: "DRAFT",
    trainerId,
    durationWeekTemplates: 4,
    isFav: false,
    weeks: [],
  };

  templates.push(newTemplate);

  saveTemplates(templates);

  return HttpResponse.json(
    {
      data: newTemplate,
      message:
        "Template created successfully.",
    },
    {
      status: 201,
    }
  );
};

/* -------------------------------------------------------------------------- */
/* GET TEMPLATE DETAIL                                                        */
/* -------------------------------------------------------------------------- */

const getTemplateDetailResolver = ({
  request,
  params,
}: {
  request: Request;
  params: {
    templateId?: string;
  };
}) => {
  const trainerId =
    getTrainerIdFromRequest(request);

  if (trainerId === null) {
    return unauthorizedResponse();
  }

  const templateId =
    Number(params.templateId);

  if (!Number.isFinite(templateId)) {
    return notFoundResponse(
      "Template not found."
    );
  }

  const template =
    findTemplateForTrainer(
      templateId,
      trainerId
    );

  if (!template) {
    return notFoundResponse(
      "Template not found."
    );
  }

  const weeks =
    getTemplateWeeks(template);

  return HttpResponse.json({
    data: {
      ...template,
      weeks,
    },
  });
};

/* -------------------------------------------------------------------------- */
/* UPDATE TEMPLATE                                                            */
/* -------------------------------------------------------------------------- */

const updateTemplateResolver = async ({
  request,
  params,
}: {
  request: Request;
  params: {
    templateId?: string;
  };
}) => {
  const trainerId =
    getTrainerIdFromRequest(request);

  if (trainerId === null) {
    return unauthorizedResponse();
  }

  const templateId =
    Number(params.templateId);

  if (!Number.isFinite(templateId)) {
    return notFoundResponse(
      "Template not found."
    );
  }

  const body =
    (await request.json()) as Partial<
      TemplateBody & {
        status: string;
      }
    >;

  const templates =
    getTemplates();

  const templateIndex =
    templates.findIndex(
      (template) =>
        Number(template.trainerId) ===
          trainerId &&
        (
          Number(template.id) ===
            templateId ||
          Number(template.planId) ===
            templateId
        )
    );

  if (templateIndex === -1) {
    return notFoundResponse(
      "Template not found."
    );
  }

  const currentTemplate =
    templates[templateIndex];

  const updatedTemplate: TemplatePlan =
    {
      ...currentTemplate,
      ...(typeof body.name === "string"
        ? {
            name: body.name,
          }
        : {}),
      ...(typeof body.description ===
      "string"
        ? {
            description:
              body.description,
          }
        : {}),
      ...(typeof body.status === "string"
        ? {
            status: body.status,
          }
        : {}),
    };

  templates[templateIndex] =
    updatedTemplate;

  saveTemplates(templates);

  return HttpResponse.json({
    data: updatedTemplate,
  });
};

/* -------------------------------------------------------------------------- */
/* DUPLICATE TEMPLATE                                                         */
/* -------------------------------------------------------------------------- */

const duplicateTemplateResolver = ({
  request,
  params,
}: {
  request: Request;
  params: {
    templateId?: string;
  };
}) => {
  const trainerId =
    getTrainerIdFromRequest(request);

  if (trainerId === null) {
    return unauthorizedResponse();
  }

  const templateId =
    Number(params.templateId);

  if (!Number.isFinite(templateId)) {
    return notFoundResponse(
      "Template not found."
    );
  }

  const originalTemplate =
    findTemplateForTrainer(
      templateId,
      trainerId
    );

  if (!originalTemplate) {
    return notFoundResponse(
      "Template not found."
    );
  }

  const templates =
    getTemplates();

  const newPlanId =
    getNextId(templates);

  const newTemplate =
    duplicateTemplateData(
      originalTemplate,
      newPlanId
    );

  templates.push(newTemplate);

  saveTemplates(templates);

  return HttpResponse.json(
    {
      data: {
        planId: newPlanId,
        id: newPlanId,
      },
      message:
        "Template duplicated successfully.",
    },
    {
      status: 201,
    }
  );
};

/* -------------------------------------------------------------------------- */
/* DELETE TEMPLATE                                                            */
/* -------------------------------------------------------------------------- */

const deleteTemplateResolver = ({
  request,
  params,
}: {
  request: Request;
  params: {
    templateId?: string;
  };
}) => {
  const trainerId =
    getTrainerIdFromRequest(request);

  if (trainerId === null) {
    return unauthorizedResponse();
  }

  const templateId =
    Number(params.templateId);

  if (!Number.isFinite(templateId)) {
    return notFoundResponse(
      "Template not found."
    );
  }

  const template =
    findTemplateForTrainer(
      templateId,
      trainerId
    );

  if (!template) {
    return notFoundResponse(
      "Template not found."
    );
  }

  if (
    isTemplateAssigned(template)
  ) {
    return HttpResponse.json(
      {
        code:
          "PLAN_TEMPLATE_ASSIGNED",
        message:
          "Plan template cannot be deleted because it is currently assigned to a trainee.",
        details: [],
      },
      {
        status: 409,
      }
    );
  }

  const templates =
    getTemplates();

  const updatedTemplates =
    templates.filter(
      (item) =>
        !(
          Number(item.trainerId) ===
            trainerId &&
          (
            Number(item.id) ===
              templateId ||
            Number(item.planId) ===
              templateId
          )
        )
    );

  saveTemplates(
    updatedTemplates
  );

  deleteTemplateCascade(
    template
  );

  return HttpResponse.json({
    message:
      "Template deleted successfully.",
  });
};

/* -------------------------------------------------------------------------- */
/* HANDLERS                                                                   */
/* -------------------------------------------------------------------------- */

export const templateHandlers = [
  http.get(
    "/api/plans/templates",
    getTemplatesResolver
  ),

  http.get(
    "*/api/plans/templates",
    getTemplatesResolver
  ),

  http.post(
    "/api/plans/templates",
    createTemplateResolver
  ),

  http.post(
    "*/api/plans/templates",
    createTemplateResolver
  ),

  http.get(
    "/api/plans/templates/:templateId",
    getTemplateDetailResolver
  ),

  http.get(
    "*/api/plans/templates/:templateId",
    getTemplateDetailResolver
  ),

  http.put(
    "/api/plans/templates/:templateId",
    updateTemplateResolver
  ),

  http.put(
    "*/api/plans/templates/:templateId",
    updateTemplateResolver
  ),

  http.post(
    "/api/plans/templates/:templateId/duplicate",
    duplicateTemplateResolver
  ),

  http.post(
    "*/api/plans/templates/:templateId/duplicate",
    duplicateTemplateResolver
  ),

  http.delete(
    "/api/plans/templates/:templateId",
    deleteTemplateResolver
  ),

  http.delete(
    "*/api/plans/templates/:templateId",
    deleteTemplateResolver
  ),
];