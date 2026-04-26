import permssionValidation from "../middleware/permission.middleware.js";
import roleModel from "../model/role.model.js";

async function rolesRoute(fastify, options) {
  fastify.get(
    "/",
    {
      onRequest: [fastify.authenticate, permssionValidation("role:view")],
    },

    async (req, res) => {
      try {
        const roles = await roleModel
          .find({
            tenantId: req.user.tenantId,
          })
          .select("name permissions");

        return res.status(200).send({
          statusCode: 200,
          message: "Roles fetched successfully",
          data: {
            roles: roles,
            count: roles.length,
          },
        });
      } catch (error) {
        req.log.error(error);
        return res.status(500).send({
          statusCode: 500,
          error: "Internal Server Error",
          message: "Failed to fetch roles for your organization.",
        });
      }
    },
  );
}

export default rolesRoute;
