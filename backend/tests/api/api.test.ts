import { MockRepo } from "../mocks/repomock";
import { TodoApi } from "../../src/api/api";
import { TodoService } from "../../src/service/service";
import * as Hapi from "@hapi/hapi";
import { TodoItem } from "../../src/model/model";

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

describe("TodoApi, abnormal tests", () => {
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
  test("Break the underlying repo and make sure the api returns 500", async () => {
    repo.break();
    const res = await server.inject("/list");
    expect(res.statusCode).toBe(500);
    const res2 = await server.inject("/get/1");
    expect(res2.statusCode).toBe(500);
    const res3 = await server.inject({
      method: "DELETE",
      url: `/delete/1`,
    });
    expect(res3.statusCode).toBe(500);
    const res4 = await server.inject({
      method: "POST",
      url: `/create`,
      payload: { description: "todo 1", done: false },
    });
    expect(res4.statusCode).toBe(500);
    repo.unbreak();
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
  id?: number
): Promise<number> {
  // check that id is defined
  expect(id).toBeDefined();
  const res = await server.inject({
    method: "DELETE",
    url: `/delete/${id}`,
  });

  return res.statusCode;
}

// update the given todo item:
// return the updated todo item
async function updateTodoItem(
  server: Hapi.Server,
  update: TodoItem
): Promise<number> {
  expect(update.id).toBeDefined();
  const res = await server.inject({
    method: "PUT",
    url: `/update`,
    payload: update,
  });
  return res.statusCode;
}
