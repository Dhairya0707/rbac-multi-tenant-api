import projectModel from "../../model/project.model.js";

async function createprojectController(req, res) {
  try {
    const { projectName } = req.body;
    const { tenantId } = req.user;

    if (!tenantId) {
      return res.status(401).send({
        statusCode: 401,
        error: "Unauthorized",
        message: "Tenant information missing from token.",
      });
    }
    const project = await projectModel.create({
      name: projectName,
      tenantId: tenantId,
    });

    return res.status(201).send({
      statusCode: 201,
      message: "Project created successfully",
      data: {
        // projectId: project._id,
        name: project.name,
        // tenantId: project.tenantId,
      },
    });
  } catch (error) {
    req.log.error(error);
    return res.status(500).send({
      statusCode: 500,
      error: "Internal Server Error",
      message: "An unexpected error occurred while creating the project.",
    });
  }
}

export default createprojectController;
