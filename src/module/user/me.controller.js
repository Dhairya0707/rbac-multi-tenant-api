import userModule from "../../model/user.model.js";

async function meController(req, res) {
  try {
    const { userId } = req.user;

    const user = await userModule.findById(userId).populate({
      path: "roleId",
      select: "name permissions",
    });

    if (!user) {
      return res.status(404).send({
        statusCode: 404,
        error: "Not Found",
        message: "User profile not found. Your account may have been removed.",
      });
    }

    return res.status(200).send({
      statusCode: 200,
      message: "User profile fetched successfully",
      data: {
        userId: user._id,
        email: user.email,
        tenantId: user.tenantId,
        role: user.roleId?.name || "No Role",
        permissions: user.roleId?.permissions || [],
      },
    });
  } catch (error) {
    req.log.error(error);
    return res.status(500).send({
      statusCode: 500,
      error: "Internal Server Error",
      message: "An unexpected error occurred while fetching your profile.",
    });
  }
}
export default meController;
