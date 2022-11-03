import {IRepo} from "../../src/repo/db";
import {TodoItem} from "../../src/model/model";

export class MockRepo implements IRepo {
  todos: Map<number, TodoItem>
  broken: boolean = false;
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

  public async  deleteAllTodoItems(): Promise<void> {
    if (this.broken) {
      return Promise.reject(new Error("Repo is broken"));
    }
    this.todos.clear();
    return Promise.resolve(undefined);
  }

  public async deleteDb(): Promise<void> {
    await this.deleteAllTodoItems()
    return Promise.resolve(undefined);
  }

  public async deleteTodoItem(id: number): Promise<void> {
    if (this.broken) {
      return Promise.reject(new Error("Repo is broken"));
    }
    this.todos.delete(id);
    return Promise.resolve(undefined);
  }

  public async getTodoItem(id: number): Promise<TodoItem> {
    if (this.broken) {
      return Promise.reject(new Error("Repo is broken"));
    }
    const item = this.todos.get(id);
    return item ? Promise.resolve(item) : Promise.reject(new Error("Item not found"));
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

  updateTodoItem(todoItem: TodoItem): Promise<TodoItem> {
    if (this.broken) {
      return Promise.reject(new Error("Repo is broken"));
    }
    if (todoItem.id === undefined) {
      return Promise.reject(new Error("Item has no id"));
    }
    this.todos.set(todoItem.id, todoItem);
    return Promise.resolve(todoItem);
  }

}
