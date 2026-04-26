import roleModel from "../model/role.model.js";

const permssionValidation = (reqpremission) => {
  return async (req, res) => {
    try {
      const { roleId } = req.user;

      if (!roleId) {
        return res.status(403).send({
          statusCode: 403,
          error: "Forbidden",
          message: "No role assigned to this user.",
        });
      }

      const role = await roleModel.findById(roleId);

      if (!role) {
        return res.status(404).send({
          statusCode: 404,
          error: "Not Found",
          message: "Role not found in the system.",
        });
      }

      const hasPermission =
        role.permissions.includes("*") ||
        role.permissions.includes(reqpremission);

      if (!hasPermission) {
        return res.status(403).send({
          statusCode: 403,
          error: "Forbidden",
          message: `You do not have permission to: ${reqpremission}`,
        });
      }
    } catch (error) {
      req.log.error(error);
      return res.status(500).send({
        statusCode: 500,
        error: "Internal Server Error : " + error,
        message: "Error validating user permissions.",
      });
    }
  };
};

export default permssionValidation;
