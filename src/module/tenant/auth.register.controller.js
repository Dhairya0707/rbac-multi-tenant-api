import mongoose from "mongoose";
import userModule from "../../model/user.model.js";
import tenantModel from "../../model/tenant.model.js";
import roleModel from "../../model/role.model.js";
import bcrypt from "bcrypt";

async function tenantregisterController(req, res) {
  try {
    const { email, password, companyName } = req.body;
    const existinguser = await userModule.findOne({ email });

    if (existinguser) {
      return res.status(409).send({
        statusCode: 409,
        error: "Conflict",
        message: "User with this email already exist !",
      });
    }

    const tenant = await tenantModel.create({
      name: companyName,
    });

    const ownerRole = await roleModel.create({
      name: "OWNER",
      permissions: ["*"],
      tenantId: tenant._id,
    });

    const adminRole = await roleModel.create({
      name: "ADMIN",
      permissions: ["project:create", "project:view", "user:view", "role:view"],
      tenantId: tenant._id,
    });

    const memberRole = await roleModel.create({
      name: "MEMBER",
      permissions: ["project:view"],
      tenantId: tenant._id,
    });

    const hasedpass = await bcrypt.hash(password, 10);

    const user = await userModule.create({
      email: email,
      password: hasedpass,
      roleId: ownerRole._id,
      tenantId: tenant._id,
    });

    return res.status(201).send({
      statusCode: 201,
      message:
        "Registeration Completer created new tenant and user with Owner Role",
      data: {
        tenant: {
          tenantId: tenant._id,
          tenantName: tenant.name,
        },
        user: {
          userId: user._id,
          email: user.email,
          role: ownerRole.name,
        },
        availableRoles: [
          { id: ownerRole._id, name: ownerRole.name },
          { id: adminRole._id, name: adminRole.name },
          { id: memberRole._id, name: memberRole.name },
        ],
      },
    });
  } catch (error) {
    req.log.error(error); // Use Fastify's logger to see what happened!
    return res.status(500).send({
      statusCode: 500,
      error: "Internal Server Error",
      message: "An unexpected error occurred on our end.",
    });
  }
}

export default tenantregisterController;
