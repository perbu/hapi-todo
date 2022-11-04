import sqlite3 from "sqlite3";
import { TodoItem } from "../model/model";
import * as fs from "fs";
import { ISqlite } from "sqlite";
import RunResult = ISqlite.RunResult;

export interface IRepo {
  getTodoItems(): Promise<TodoItem[]>;
  getTodoItem(id: number): Promise<TodoItem>;
  createTodoItem(todoItem: TodoItem): Promise<TodoItem>;
  updateTodoItem(todoItem: TodoItem): Promise<boolean>;
  deleteTodoItem(id: number): Promise<boolean>;
  deleteAllTodoItems(): Promise<void>;
  init(): Promise<void>;
  deleteDb(): Promise<void>;
}
const schemaSql = `
CREATE TABLE todos
(
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    description STRING NOT NULL,
    done        INTEGER NOT NULL
);
`;

export interface DbTodoItem {
  id?: number;
  description: string;
  done: number;
}

export class Repo implements IRepo {
  private db?: sqlite3.Database; // allow for lazy init
  private readonly path: string;
  private readonly mode: number;
  private readonly fresh: boolean;

  constructor(path: string, fresh = false) {
    this.path = path;
    this.fresh = fresh;
    if (fresh) {
      this.mode = sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE;
    } else {
      this.mode = sqlite3.OPEN_READWRITE;
    }
  }

  public async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.path, this.mode, async (err) => {
        if (err) {
          // create enriched Error:
          new Error(`Could not open database ${this.path}: ${err.message}`);
          reject(err);
        }
        if (this.fresh) {
          try {
            await this.dropSchema();
            await this.createSchema();
            resolve();
          } catch (err) {
            reject(err);
          }
        }
      });
    });
  }
  public async deleteDb(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db?.close((err) => {
        if (err) {
          reject(err);
        }
        // delete the actual file:
        fs.unlink(this.path, () => {
          resolve();
        });
      });
    });
  }
  // convert a DbTodoItem to a TodoItem
  private static _toTodoItem(dbTodoItem: DbTodoItem): TodoItem {
    return {
      id: dbTodoItem.id,
      description: dbTodoItem.description,
      done: dbTodoItem.done !== 0,
    };
  }
  private dropSchema(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db?.run("DROP TABLE IF EXISTS todos", (err) => {
        if (err) {
          reject(err);
        }
        resolve();
      });
    });
  }
  private createSchema(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db?.run(schemaSql, (err: Error) => {
        if (err) {
          reject(err);
        }
        resolve();
      });
    });
  }

  // Gets all todo items from the database and returns them as an array of TodoItem objects
  public async getTodoItems(): Promise<TodoItem[]> {
    return new Promise((resolve, reject) => {
      this.db?.all("SELECT * FROM todos", (err, rows: DbTodoItem[]) => {
        if (err) {
          reject(err);
        }
        // convert the rows to TodoItem objects and return them
        resolve(rows.map(Repo._toTodoItem));
      });
    });
  }
  // get a single todo-item from the database
  public async getTodoItem(id: number): Promise<TodoItem> {
    return new Promise((resolve, reject) => {
      this.db?.get(
        "SELECT * FROM todos WHERE id = ?",
        [id],
        (err, row: DbTodoItem) => {
          if (err) {
            reject(err);
          }
          resolve(Repo._toTodoItem(row));
        }
      );
    });
  }
  // insert a new todo-item into the database.
  // The database will assign an id to the new todo-item
  // and return the new todo-item with the id
  public async createTodoItem(todoItem: TodoItem): Promise<TodoItem> {
    return new Promise((resolve, reject) => {
      this.db?.run(
        "INSERT INTO todos (description, done) VALUES (?, ?)",
        [todoItem.description, todoItem.done],
        function (err) {
          if (err) {
            reject(err);
          }
          todoItem.id = this.lastID;
          resolve(todoItem);
        }
      );
    });
  }
  // update a todo-item in the database, either by changing the description or the done status
  public async updateTodoItem(todoItem: TodoItem): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.db?.run(
        "UPDATE todos SET description = ?, done = ? WHERE id = ?",
        [todoItem.description, todoItem.done, todoItem.id],
        (res: RunResult, err: Error) => {
          if (err) {
            reject(err);
          }
          if (res.changes === 0) {
            resolve(false);
          }
          resolve(true);
        }
      );
    });
  }

  public async deleteTodoItem(id: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.db?.run(
        "DELETE FROM todos WHERE id = ?",
        [id],
        (res: RunResult, err: Error) => {
          if (err) {
            reject(err);
          }
          // return true if a row was deleted, false otherwise
          resolve(res.changes === 1);
        }
      );
    });
  }
  public async deleteAllTodoItems(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db?.run("DELETE FROM todos", (err) => {
        if (err) {
          reject(err);
        }
        resolve();
      });
    });
  }
}
