import fastify from "fastify";
import cors from "@fastify/cors";
import fastifyJwt from "@fastify/jwt";
import path from "path";
import { fileURLToPath } from "url";
import fastifyStatic from "@fastify/static";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = fastify({
  logger: false,
});

await app.register(cors, {
  origin: "*",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
});

app.register(fastifyStatic, {
  root: path.join(__dirname, "../public"),
  prefix: "/", // optional
});

app.register(fastifyJwt, {
  secret: process.env.JWT_SECRET,
  sign: {
    expiresIn: "1d",
  },
});

app.decorate("authenticate", async function (request, reply) {
  try {
    const decoded = await request.jwtVerify();
    const { userId, tenantId, roleId } = decoded;

    if (!userId || !tenantId || !roleId) {
      return reply.status(401).send({
        statusCode: 401,
        error: "Unauthorized",
        message: "Session payload is corrupted or invalid. Please login again.",
      });
    }
  } catch (error) {
    return reply.status(401).send({
      statusCode: 401,
      error: "Unauthorized",
      message: "Your session has expired or is invalid. Please login again.",
    });
  }
});

export default app;
