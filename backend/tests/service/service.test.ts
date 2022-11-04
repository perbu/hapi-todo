import { TodoService } from "../../src/service/service";
import { IRepo } from "../../src/repo/db";
import { MockRepo } from "./repomock";

const dbName = "tests.sqlite3";

describe("Service", () => {
  let repo: IRepo;

  beforeAll(async () => {
    repo = new MockRepo();
    await repo.init();
  });

  afterAll(async () => {
    await repo.deleteDb();
  });

  test("should create a new todo item", async () => {
    const service = new TodoService(repo);
    const todo = await service.createTodoItem({
      description: "This is a todo",
      done: false,
    });
    expect(todo.description).toBe("This is a todo");
    expect(todo.done).toBe(false);
    expect(todo.id).toBe(1);
    const todos = await service.getTodoItems();
    expect(todos.length).toBe(1);
    expect(todos[0].description).toBe(todo.description);
    expect(todos[0].done).toBe(todo.done);
    expect(todos[0].id).toBe(todo.id);
    // clear the database
    await repo.deleteAllTodoItems();
    // get the todos again
    const todos2 = await service.getTodoItems();
    expect(todos2.length).toBe(0);
  });
});
