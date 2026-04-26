import projectModel from "../../model/project.model.js";

async function fetchController(req, res) {
  try {
    const { tenantId } = req.user;

    if (!tenantId) {
      return res.send({
        msg: "done",
      });
    }

    const projects = await projectModel
      .find({ tenantId: tenantId })
      .select("name _id");

    return res.status(200).send({
      statusCode: 200,
      message: "Projects fetched successfully",
      data: {
        projects: projects,
        count: projects.length,
      },
    });
  } catch (error) {
    req.log.error(error);
    return res.status(500).send({
      statusCode: 500,
      error: "Internal Server Error",
      message: "An unexpected error occurred while fetching projects.",
    });
  }
}

export default fetchController;
