import * as Hapi from "@hapi/hapi";
import { TodoService } from "../../src/service/service";
import { MockRepo } from "../mocks/repomock";
import { TodoApi } from "../../src/api/api";

describe("TodoApi, broken repo tests", () => {
  let server: Hapi.Server; // we need the server to inject the request.
  let service: TodoService; // we need the service to reset the database.
  let repo: MockRepo;
  beforeAll(() => {
    repo = new MockRepo();
    service = new TodoService(repo);
    server = Hapi.server();
    const api = new TodoApi(server, service);
    api.addRoutes();
    repo.break();
  });
  afterAll(() => {
    repo.unbreak();
  });

  test("/list", async () => {
    repo.break();
    const res = await server.inject("/list");
    expect(res.statusCode).toBe(500);
  });
  test("/get", async () => {
    const res2 = await server.inject("/get/1");
    expect(res2.statusCode).toBe(500);
  });
  test("/delete", async () => {
    const res3 = await server.inject({
      method: "DELETE",
      url: `/delete/1`,
    });
    expect(res3.statusCode).toBe(500);
  });
  test("/create", async () => {
    const res4 = await server.inject({
      method: "POST",
      url: `/create`,
      payload: { description: "todo 1", done: false },
    });
    expect(res4.statusCode).toBe(500);
  });
});
