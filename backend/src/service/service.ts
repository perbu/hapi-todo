import { TodoItem } from "../model/model";
import { IRepo } from "../repo/db";

interface ITodoService {
  getTodoItems(): Promise<TodoItem[]>;
  getTodoItem(id: number): Promise<TodoItem>;
  updateTodoItem(todoItem: TodoItem): Promise<TodoItem>;
  createTodoItem(todoItem: TodoItem): Promise<TodoItem>;
  deleteTodoItem(id: number): Promise<void>;
}

export class TodoService implements ITodoService {
  repo: IRepo;
  constructor(repo: IRepo) {
    this.repo = repo;
  }

  createTodoItem(todoItem: TodoItem): Promise<TodoItem> {
    return this.repo.createTodoItem(todoItem);
  }

  deleteTodoItem(id: number): Promise<void> {
    return this.repo.deleteTodoItem(id);
  }

  getTodoItem(id: number): Promise<TodoItem> {
    return this.repo.getTodoItem(id);
  }

  getTodoItems(): Promise<TodoItem[]> {
    return this.repo.getTodoItems();
  }

  updateTodoItem(todoItem: TodoItem): Promise<TodoItem> {
    return this.repo.updateTodoItem(todoItem);
  }
}
