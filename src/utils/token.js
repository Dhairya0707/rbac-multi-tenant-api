import app from "../app.js";

function generateToken(user) {
  return app.jwt.sign(
    {
      userId: user._id,
      tenantId: user.tenantId,
      roleId: user.roleId,
    },
    {
      expiresIn: "1d",
    },
  );
}

export default generateToken;
