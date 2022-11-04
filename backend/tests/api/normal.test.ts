import { MockRepo } from "../mocks/repomock";
import { TodoApi } from "../../src/api/api";
import { TodoService } from "../../src/service/service";
import * as Hapi from "@hapi/hapi";
import {
  getTodoList,
  createTodoItem,
  deleteTodoItem,
  updateTodoItem,
} from "./helpers";

describe("TodoApi, normal tests", () => {
  let server: Hapi.Server; // we need the server to inject the request.
  let service: TodoService; // we need the service to reset the database.

  beforeAll(() => {
    const repo = new MockRepo();
    service = new TodoService(repo);
    server = Hapi.server();
    const api = new TodoApi(server, service);
    api.addRoutes();
  });
  beforeEach(async () => {
    // make sure each test starts with an empty database
    await service.deleteAllTodoItems();
  });
  test("listTodoHandler with an empty list", async () => {
    const res = await server.inject("/list");
    expect(res.statusCode).toBe(200);
    // expect(res.source).toEqual([]);
  });
  test("Create two items and list them, make sure they are like they suppose to look", async () => {
    const todo1 = await createTodoItem(server, 1);
    const todo2 = await createTodoItem(server, 2);
    const list = await getTodoList(server);
    expect(list.length).toBe(2);
    expect(list[0]).toEqual(todo1);
    expect(list[1]).toEqual(todo2);
  });
  test("Create two items and delete the first one", async () => {
    const todo1 = await createTodoItem(server, 1);
    expect(todo1.id).toBe(1);
    const todo2 = await createTodoItem(server, 2);
    expect(todo2.id).toBe(2);
    const deleteRes = await deleteTodoItem(server, todo1.id);
    expect(deleteRes).toBe(200);
    const list = await getTodoList(server);
    expect(list.length).toBe(1);
    expect(list[0]).toEqual(todo2);
  });
  test("Create an item and update it, make sure it is updated", async () => {
    const todo = await createTodoItem(server, 1);
    expect(todo.id).toBe(1);
    expect(todo.description).toBe("todo 1");
    expect(todo.done).toBe(false);
    const updateRes = await updateTodoItem(server, {
      id: todo.id,
      description: "updated",
      done: true,
    });
    expect(updateRes).toBe(200);
    const list = await getTodoList(server);
    expect(list.length).toBe(1);
    expect(list[0].description).toBe("updated");
    expect(list[0].done).toBe(true);
  });
});

test("Basic test of the root handler", async () => {
  const repo = new MockRepo();
  const service = new TodoService(repo);
  const server = Hapi.server();
  const api = new TodoApi(server, service);
  api.addRoutes();
  const res = await server.inject("/");
  expect(res.statusCode).toBe(200);
  expect(res.result).toBe("Hello World");
});
