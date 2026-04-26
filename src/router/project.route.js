import permssionValidation from "../middleware/permission.middleware.js";
import createprojectController from "../module/project/create.controller.js";
import deleteprojectController from "../module/project/delete.controller.js";
import fetchController from "../module/project/fetch.controller.js";

const projectcreateSchema = {
  body: {
    type: "object",
    required: ["projectName"],
    properties: {
      projectName: { type: "string", minLength: 3, maxLength: 50 },
    },
  },
};

const deleteprojectSchema = {
  params: {
    type: "object",
    required: ["id"],
    properties: {
      id: { type: "string" },
    },
  },
};

async function projectRoute(fastify, options) {
  fastify.post(
    "/",
    {
      schema: projectcreateSchema,
      onRequest: [fastify.authenticate, permssionValidation("project:create")],
    },
    createprojectController,
  );

  fastify.get(
    "/",
    {
      onRequest: [fastify.authenticate],
    },
    fetchController,
  );

  fastify.delete(
    "/:id",
    {
      schema: deleteprojectSchema,
      onRequest: [fastify.authenticate, permssionValidation("project:delete")],
    },
    deleteprojectController,
  );
}

export default projectRoute;
