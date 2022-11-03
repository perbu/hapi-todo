import Hapi, { Request, ResponseToolkit } from "@hapi/hapi";

// addRoutes takes a server and adds routes to it
export function addRoutes(server: Hapi.Server): void {
  console.log("init", "adding routes");
  server.route({
    method: "GET",
    path: "/",
    handler: (request: Request, h: ResponseToolkit) => {
      console.log("GET /");
      return h.response("Hello World").code(200);
    },
  });
}
