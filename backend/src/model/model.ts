export interface TodoItem {
  id?: number;
  description: string;
  done: boolean;
}

export interface NewTodoItem {
  description: string;
  done: boolean;
}
