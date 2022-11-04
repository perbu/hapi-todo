import { MockRepo } from "../service/repomock";
import { TodoApi } from "../../src/api/api";
import { TodoService } from "../../src/service/service";
import * as Hapi from "@hapi/hapi";
import { TodoItem } from "../../src/model/model";
import exp = require("constants");

describe("TodoApi", () => {
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

// get the list of todo items, make sure it gets a 200 OK and return the list
async function getTodoList(server: Hapi.Server): Promise<TodoItem[]> {
  const res = await server.inject("/list");
  expect(res.statusCode).toBe(200);
  return JSON.parse(res.payload) as TodoItem[];
}

// createTodoItem is a function that creates a Todo Item on the server. It
// Looks at the response and makes sure it is what is expected.
async function createTodoItem(
  server: Hapi.Server,
  expectedId: number
): Promise<TodoItem> {
  // make the todo item:
  const todo: TodoItem = {
    // make the description with the expected id
    description: `todo ${expectedId}`,
    // make every even item done:
    done: expectedId % 2 === 0,
  };

  const res = await server.inject({
    method: "POST",
    url: "/create",
    payload: todo,
  }); // check the response
  expect(res.statusCode).toBe(200);
  // parse the response into a TodoItem object
  const todoObj = JSON.parse(res.payload) as TodoItem;
  expect(todoObj.description).toBe(todo.description);
  expect(todoObj.done).toBe(todo.done);
  expect(todoObj.id).toBe(expectedId);
  return todoObj;
}

// delete the todo item with the given id
// return the return code so we can check it.
async function deleteTodoItem(
  server: Hapi.Server,
  id: number
): Promise<number> {
  const res = await server.inject({
    method: "DELETE",
    url: `/delete/${id}`,
  });

  return res.statusCode;
}