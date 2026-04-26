import roleModel from "../../model/role.model.js";
import userModule from "../../model/user.model.js";
import bcrypt from "bcrypt";

async function inviteController(req, res) {
  try {
    const { email, roleId } = req.body;
    const { tenantId } = req.user;

    const exitingsuer = await userModule.findOne({ email: email });

    if (exitingsuer) {
      return res.status(409).send({
        statusCode: 409,
        error: "Conflict",
        message: "User with this email is already registered in the system.",
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
        message: "The assigned role was not found for your organization.",
      });
    }
    const defaultPassword =
      process.env.DEFAULT_INVITE_PASSWORD || "Welcome@123";
    const hasedpassword = await bcrypt.hash(defaultPassword, 10);

    const newUser = await userModule.create({
      email: email,
      tenantId: tenantId,
      roleId: role._id,
      password: hasedpassword,
    });

    return res.status(201).send({
      statusCode: 201,
      message: "User invited and created successfully.",
      data: {
        user: {
          email: newUser.email,
          userId: newUser._id,
          role: role.name,
          temporaryPassword: defaultPassword, // Send this so the admin can give it to the user
        },
        tenantId: tenantId,
      },
    });
  } catch (error) {
    req.log.error(error);
    return res.status(500).send({
      statusCode: 500,
      error: "Internal Server Error :" + error,
      message: "An unexpected error occurred while inviting the user.",
    });
  }
}

export default inviteController;
