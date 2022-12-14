import { IRepo } from "../../src/repo/db";
import { TodoItem } from "../../src/model/model";

export class MockRepo implements IRepo {
  todos: Map<number, TodoItem>;
  broken = false;
  constructor() {
    this.todos = new Map<number, TodoItem>();
  }
  public async createTodoItem(todoItem: TodoItem): Promise<TodoItem> {
    // check if we're broken. If so, reject the promise
    if (this.broken) {
      return Promise.reject(new Error("Repo is broken"));
    }
    // check if the todoItem has an id
    if (todoItem.id === undefined) {
      // create a new id
      todoItem.id = this.todos.size + 1;
    }
    // add the todoItem to the map
    this.todos.set(todoItem.id, todoItem);
    return Promise.resolve(todoItem);
  }

  public async deleteAllTodoItems(): Promise<void> {
    if (this.broken) {
      return Promise.reject(new Error("Repo is broken"));
    }
    this.todos.clear();
    return Promise.resolve(undefined);
  }

  public async deleteDb(): Promise<void> {
    await this.deleteAllTodoItems();
    return Promise.resolve(undefined);
  }

  public async deleteTodoItem(id: number): Promise<boolean> {
    if (this.broken) {
      return Promise.reject(new Error("Repo is broken"));
    }
    const res = this.todos.delete(id);
    return Promise.resolve(res);
  }

  public async getTodoItem(id: number): Promise<TodoItem | undefined> {
    if (this.broken) {
      return Promise.reject(new Error("Repo is broken"));
    }
    return this.todos.get(id);
  }

  public async getTodoItems(): Promise<TodoItem[]> {
    if (this.broken) {
      return Promise.reject(new Error("Repo is broken"));
    }
    return Promise.resolve(Array.from(this.todos.values()));
  }

  public async init(): Promise<void> {
    if (this.broken) {
      return Promise.reject(new Error("Repo is broken"));
    }
    return Promise.resolve(undefined);
  }

  public async updateTodoItem(todoItem: TodoItem): Promise<boolean> {
    if (this.broken) {
      return Promise.reject(new Error("Repo is broken"));
    }
    if (todoItem.id === undefined) {
      return Promise.reject(new Error("Item has no id"));
    }
    // check if the todoItem exists
    const item = this.todos.get(todoItem.id);
    if (item === undefined) {
      return false;
    }
    this.todos.set(todoItem.id, todoItem);
    return true;
  }
  public break() {
    this.broken = true;
  }
  public unbreak() {
    this.broken = false;
  }
}
