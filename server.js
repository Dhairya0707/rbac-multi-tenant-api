import fastify from "fastify";
import app from "./src/app.js";
import connectDB from "./src/config/db.js";
import authRoutes from "./src/router/auth.route.js";
import userRoute from "./src/router/user.route.js";
import projectRoute from "./src/router/project.route.js";
import tenantRoute from "./src/router/tenant.route.js";
import rolesRoute from "./src/router/role.route.js";

await connectDB();

app.get("/api/health", async (req, res) => {
  return res.status(200).send({
    statusCode: 200,
    message: "Server is healthy and running",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.register(authRoutes, { prefix: "/api/auth" });

app.register(userRoute, { prefix: "/api/users" });
app.register(projectRoute, { prefix: "/api/projects" });
app.register(tenantRoute, { prefix: "/api/tenants" });
app.register(rolesRoute, { prefix: "/api/roles" });

const PORT = process.env.PORT || 3000;

app.listen({ port: PORT, host: "0.0.0.0" }, (err, add) => {
  if (err) {
    console.error("Server failed to start:", err.message);
    process.exit(1);
  }
  console.log("server is running on : ", add);
});
