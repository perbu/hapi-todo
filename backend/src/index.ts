import Hapi from "@hapi/hapi";
import { TodoService } from "./service/service";
import { Repo } from "./repo/db";
import { TodoApi } from "./api/api";

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
  const repo = new Repo("prod.sqlite3", false);
  try {
    await repo.init();
  } catch (err) {
    console.error("Error creating database: " + err);
    process.exit(1);
  }
  console.log("Database initialized");
  const service = new TodoService(repo);
  const api = new TodoApi(server, service);
  api.addRoutes();
  await enableLogging(server);
  server
    .start()
    .then(() => {
      console.log("Server running at:", server.info.uri);
    })
    .catch((err) => {
      console.error("Error starting server: " + err);
      process.exit(1);
    });
}

console.log("about to run");

run()
  .then(() => {
    console.log("running");
  })
  .catch((err) => {
    console.error("run error");
    console.error(err);
    process.exit(1);
  });
