import { TodoItem } from "../model/model";
import { IRepo } from "../repo/db";

export interface ITodoService {
  getTodoItems(): Promise<TodoItem[]>;
  getTodoItem(id: number): Promise<TodoItem>;
  updateTodoItem(todoItem: TodoItem): Promise<boolean>;
  createTodoItem(todoItem: TodoItem): Promise<TodoItem>;
  deleteTodoItem(id: number): Promise<boolean>;
}

export class TodoService implements ITodoService {
  repo: IRepo;
  constructor(repo: IRepo) {
    this.repo = repo;
  }

  public createTodoItem(todoItem: TodoItem): Promise<TodoItem> {
    return this.repo.createTodoItem(todoItem);
  }

  public deleteTodoItem(id: number): Promise<boolean> {
    return this.repo.deleteTodoItem(id);
  }
  public deleteAllTodoItems(): Promise<void> {
    return this.repo.deleteAllTodoItems();
  }

  public getTodoItem(id: number): Promise<TodoItem> {
    return this.repo.getTodoItem(id);
  }

  public getTodoItems(): Promise<TodoItem[]> {
    return this.repo.getTodoItems();
  }

  public updateTodoItem(todoItem: TodoItem): Promise<boolean> {
    return this.repo.updateTodoItem(todoItem);
  }
}
