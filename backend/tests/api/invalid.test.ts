import * as Hapi from "@hapi/hapi";
import { TodoService } from "../../src/service/service";
import { MockRepo } from "../mocks/repomock";
import { TodoApi } from "../../src/api/api";
import { createTodoItem, deleteTodoItem, updateTodoItem } from "./helpers";

describe("TodoApi, invalid input", () => {
  let server: Hapi.Server; // we need the server to inject the request.
  let service: TodoService; // we need the service to reset the database.
  let repo: MockRepo;
  beforeAll(() => {
    repo = new MockRepo();
    service = new TodoService(repo);
    server = Hapi.server();
    const api = new TodoApi(server, service);
    api.addRoutes();
  });
  beforeEach(async () => {
    // make sure each test starts with an empty database
    await service.deleteAllTodoItems();
  });
  test("Create an item and try to delete it with a wrong id", async () => {
    const todo = await createTodoItem(server, 1);
    expect(todo.id).toBe(1);
    const deleteRes = await deleteTodoItem(server, 2);
    expect(deleteRes).toBe(404);
  });
  test("Create an item and try to update it with a wrong id", async () => {
    const todo = await createTodoItem(server, 1);
    expect(todo.id).toBe(1);
    const updateRes = await updateTodoItem(server, {
      id: 2,
      description: "updated",
      done: true,
    });
    expect(updateRes).toBe(404);
  });

  test("Query the API with an invalid ID", async () => {
    const res = await server.inject("/get/foo");
    expect(res.statusCode).toBe(400);
  });

  test("Delete a todo item with non-numeric id", async () => {
    const res = await server.inject({
      method: "DELETE",
      url: "/delete/foo",
    });
    expect(res.statusCode).toBe(400);
  });

  test("Create an item with incomplete data", async () => {
    const res = await server.inject({
      method: "POST",
      url: `/create`,
      payload: { description: "todo 1" },
    });
    expect(res.statusCode).toBe(400);
  });

  test("Update an item with incomplete data", async () => {
    const payload = {
      description: "incomplete",
    };
    const res = await server.inject({
      method: "PUT",
      url: `/update`,
      payload: payload,
    });
    expect(res.statusCode).toBe(400);
  });
});
