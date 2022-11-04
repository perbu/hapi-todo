import { Repo } from "../../src/repo/db";

const dbName = "tests.sqlite3";

describe("Repo", () => {
  let repo: Repo;
  beforeAll(async () => {
    repo = new Repo(dbName, true);
    await repo.init();
  });
  beforeEach(async () => {
    await repo.deleteAllTodoItems();
  });
  afterAll(async () => {
    await repo.deleteAllTodoItems();
    await repo.deleteDb();
  });
  it("should be able to create a todo", async () => {
    const todo = await repo.createTodoItem({
      description: "This is a todo",
      done: false,
    });
    const todos = await repo.getTodoItems();
    expect(todos.length).toBe(1);
    expect(todos[0].description).toBe(todo.description);
    expect(todos[0].done).toBe(todo.done);
    // clear the database
  });
  it("should be able to update a todo", async () => {
    const todo = await repo.createTodoItem({
      description: "This is a todo",
      done: false,
    });
    todo.done = true;
    todo.description = "new description";
    await repo.updateTodoItem(todo);
    const todos = await repo.getTodoItems();
    expect(todos.length).toBe(1);
    expect(todos[0].description).toBe(todo.description);
    expect(todos[0].done).toBe(todo.done);
  });
});
