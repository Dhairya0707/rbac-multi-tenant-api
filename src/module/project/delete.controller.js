import projectModel from "../../model/project.model.js";

async function deleteprojectController(req, res) {
  try {
    const { id } = req.params;
    const { tenantId } = req.user;

    const project = await projectModel.findOne({
      _id: id,
      tenantId: tenantId,
    });

    if (!project) {
      return res.status(404).send({
        statusCode: 404,
        error: "Not Found",
        message:
          "Project not found or you do not have permission to delete it.",
      });
    }

    await project.deleteOne();

    return res.status(200).send({
      statusCode: 200,
      message: "Project deleted successfully",
      data: {
        deletedId: id,
      },
    });
  } catch (error) {
    req.log.error(error);
    return res.status(500).send({
      statusCode: 500,
      error: "Internal Server Error",
      message: "An unexpected error occurred while deleting the project.",
    });
  }
}

export default deleteprojectController;
