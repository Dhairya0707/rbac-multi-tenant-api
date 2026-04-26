import permssionValidation from "../middleware/permission.middleware.js";
import changeroleController from "../module/tenant/change.role.controller.js";
import deleteuserCotnroller from "../module/tenant/delete.user.controller.js";
import meController from "../module/user/me.controller.js";

const updateroleSchema = {
  body: {
    type: "object",
    required: ["roleId"],
    properties: {
      roleId: { type: "string", minLength: 1 },
    },
  },
  params: {
    type: "object",
    required: ["id"],
    properties: {
      id: { type: "string", minLength: 1 },
    },
  },
};

const deleteuserSchema = {
  params: {
    type: "object",
    required: ["id"],
    properties: {
      id: { type: "string" },
    },
  },
};

//TODO : need to change and update more data soon
async function userRoute(fastify, options) {
  fastify.get(
    "/me",
    {
      onRequest: [fastify.authenticate],
    },
    meController,
  );

  fastify.patch(
    "/:id/role",
    {
      schema: updateroleSchema,
      onRequest: [fastify.authenticate, permssionValidation("user:update")],
    },
    changeroleController,
  );

  fastify.delete(
    "/:id",
    {
      // schema: deleteuserSchema,
      onRequest: [fastify.authenticate, permssionValidation("user:delete")],
    },
    deleteuserCotnroller,
  );
}

export default userRoute;
