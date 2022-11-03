import Hapi, { Request, ResponseToolkit } from "@hapi/hapi";

// addRoutes takes a server and adds routes to it
export const addRoutes = (server: Hapi.Server): void => {
  console.log("addRoutes");
  server.route({
    method: "GET",
    path: "/",
    handler: (request: Request, h: ResponseToolkit) => {
      console.log("GET /");
      return h.response("Hello World").code(200);
    },
  });
};
