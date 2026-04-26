import roleModel from "../../model/role.model.js";
import userModule from "../../model/user.model.js";

async function changeroleController(req, res) {
  try {
    const targetUserId = req.params.id;
    const { roleId } = req.body;
    const { userId: currentUserId, tenantId } = req.user;

    const user = await userModule.findOne({
      _id: targetUserId,
      tenantId: tenantId,
    });

    if (!user) {
      return res.status(404).send({
        statusCode: 404,
        error: "Not Found",
        message: "User not found or does not belong to your organization.",
      });
    }

    if (user._id.toString() === currentUserId) {
      return res.status(400).send({
        statusCode: 400,
        error: "Bad Request",

        message: "You cannot change your own role",
      });
    }

    const role = await roleModel.findOne({
      _id: roleId,
      tenantId: tenantId,
    });

    if (!role) {
      return res.status(404).send({
        statusCode: 404,
        error: "Not Found",
        message: "The requested role does not exist for your organization.",
      });
    }

    user.roleId = roleId;
    await user.save();

    return res.status(200).send({
      statusCode: 200,
      message: `User role updated to ${role.name} successfully.`,
      data: {
        userId: user._id,
        newRole: role.name,
        newRoleId: role._id,
      },
    });
  } catch (error) {
    req.log.error(error);
    return res.status(500).send({
      statusCode: 500,
      error: "Internal Server Error :" + error,
      message: "An unexpected error occurred while updating the user role.",
    });
  }
}

export default changeroleController;
