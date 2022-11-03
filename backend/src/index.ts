import { addRoutes } from "./routes/routes";
import Hapi from "@hapi/hapi";

process.on("unhandledRejection", (err) => {
  console.error("unhandledRejection:" + err);
  process.exit(1);
});

process.on("beforeExit", (code) => {
  console.log("beforeExit:" + code);
});

async function enableLogging(server: Hapi.Server): Promise<void> {
  await server.register({
    plugin: require("hapi-pino"),
    options: {
      logEvents: ["response", "onPostStart"],
      logRequestComplete: true,
    },
  });
}

async function run() {
  const server = Hapi.server({
    port: process.env.PORT || 4000,
    host: "0.0.0.0",
    debug: { request: ["error"] },
  });

  console.log(`Server will run at: ${server.info.uri}`);
  addRoutes(server);
  await enableLogging(server);
  await server.start();
}

console.log("about to run");

run()
  .then(() => {
    console.log("done running");
  })
  .catch((err) => {
    console.error("run error");
    console.error(err);
    process.exit(1);
  });
