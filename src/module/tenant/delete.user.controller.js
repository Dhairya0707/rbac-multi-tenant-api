import userModule from "../../model/user.model.js";

async function deleteuserCotnroller(req, res) {
  try {
    const { id } = req.params;
    const { userId, tenantId } = req.user;

    const user = await userModule.findOne({
      _id: id,
      tenantId: tenantId,
    });

    if (!user) {
      return res.status(404).send({
        statusCode: 404,
        error: "Not Found",
        message: "User not found or does not belong to your organization.",
      });
    }

    if (user._id.toString() === userId) {
      return res.status(400).send({
        statusCode: 400,
        error: "Bad Request",
        message:
          "Safety Block: You cannot delete your own account from the team management panel.",
      });
    }

    await user.deleteOne({
      _id: id,
    });

    return res.status(200).send({
      statusCode: 200,
      message: "User has been successfully removed from the organization.",
      data: {
        deletedUserId: id,
      },
    });
  } catch (error) {
    req.log.error(error);
    return res.status(500).send({
      statusCode: 500,
      error: "Internal Server Error",
      message: "An unexpected error occurred while deleting the user.",
    });
  }
}

export default deleteuserCotnroller;
