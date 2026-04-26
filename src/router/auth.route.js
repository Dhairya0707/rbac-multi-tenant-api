import userloginController from "../module/user/auth.login.controller.js";
import tenantregisterController from "../module/tenant/auth.register.controller.js";

const registerSchema = {
  body: {
    type: "object",
    required: ["companyName", "email", "password"],
    properties: {
      companyName: { type: "string" },
      email: { type: "string", format: "email" },
      password: { type: "string", minLength: 6 },
    },
  },
};

const loginSchema = {
  body: {
    type: "object",
    required: ["email", "password"],
    properties: {
      email: { type: "string", format: "email" },
      password: { type: "string", minLength: 6, maxLength: 72 },
    },
  },
};

async function authRoutes(fastify, options) {
  fastify.post(
    "/register",
    { schema: registerSchema },
    tenantregisterController,
  );
  fastify.post("/login", { schema: loginSchema }, userloginController);
}

export default authRoutes;
