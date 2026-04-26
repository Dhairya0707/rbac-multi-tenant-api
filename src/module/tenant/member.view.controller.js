import userModule from "../../model/user.model.js";
import roleModel from "../../model/role.model.js";

async function viewmemberContorller(req, res) {
  try {
    const { tenantId } = req.user;

    const members = await userModule
      .find({ tenantId: tenantId })
      .select("-password")
      .populate("roleId", "name permissions");

    //TODO : infutre add pagination and .count effcient method ?
    return res.status(200).send({
      statusCode: 200,
      message: "Organization members fetched successfully",
      data: {
        members: members,
        count: members.length,
      },
    });
  } catch (error) {
    req.log.error(error);
    return res.status(500).send({
      statusCode: 500,
      error: "Internal Server Error : " + error,
      message: "An unexpected error occurred while fetching members.",
    });
  }
}

export default viewmemberContorller;
