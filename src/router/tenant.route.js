import permssionValidation from "../middleware/permission.middleware.js";
import inviteController from "../module/tenant/member.invite.controller.js";
import viewmemberController from "../module/tenant/member.view.controller.js";

const inviteSchema = {
  body: {
    type: "object",
    required: ["email", "roleId"],
    properties: {
      email: { type: "string", format: "email" },
      roleId: { type: "string" },
    },
  },
};

async function tenantRoute(fastify, option) {
  fastify.post(
    "/member",
    {
      schema: inviteSchema,
      onRequest: [fastify.authenticate, permssionValidation("user:invite")],
    },
    inviteController,
  );

  fastify.get(
    "/member",
    {
      onRequest: [fastify.authenticate, permssionValidation("user:view")],
    },
    viewmemberController,
  );
}

export default tenantRoute;
