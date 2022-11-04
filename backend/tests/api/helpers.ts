// get the list of todo items, make sure it gets a 200 OK and return the list
import * as Hapi from "@hapi/hapi";
import { TodoItem } from "../../src/model/model";

export async function getTodoList(server: Hapi.Server): Promise<TodoItem[]> {
  const res = await server.inject("/list");
  expect(res.statusCode).toBe(200);
  return JSON.parse(res.payload) as TodoItem[];
}

// createTodoItem is a function that creates a Todo Item on the server. It
// Looks at the response and makes sure it is what is expected.
export async function createTodoItem(
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
export async function deleteTodoItem(
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
export async function updateTodoItem(
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
