import userModule from "../../model/user.model.js";
import bcrypt from "bcrypt";
import generateToken from "../../utils/token.js";

async function userloginController(req, res) {
  try {
    const { email, password } = req.body;

    const user = await userModule.findOne({ email: email });

    if (!user) {
      return res.status(404).send({
        statusCode: 404,
        error: "Not Found",
        message: "User does not exist. Please check your email or sign up.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).send({
        statusCode: 401,
        error: "Unauthorized",
        message: "Incorrect password.",
      });
    }

    const token = generateToken(user);

    return res.status(200).send({
      statusCode: 200,
      message: "Login successful",
      data: {
        token: token,
      },
    });
  } catch (error) {
    req.log.error(error);
    return res.status(500).send({
      statusCode: 500,
      error: "Internal Server Error",
      message: "An unexpected error occurred on our end.",
    });
  }
}

export default userloginController;
