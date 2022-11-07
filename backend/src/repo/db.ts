import sqlite3 from "sqlite3";
import { TodoItem } from "../model/model";
import * as fs from "fs";
import { ISqlite } from "sqlite";
import RunResult = ISqlite.RunResult;

export interface IRepo {
  getTodoItems(): Promise<TodoItem[]>;
  getTodoItem(id: number): Promise<TodoItem | undefined>;
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
          console.error(err);
          new Error(`Could not open database ${this.path}: ${err.message}`);
          return reject(err);
        }
        if (this.fresh) {
          console.warn("initializing fresh database");
          try {
            await this.dropSchema();
            await this.createSchema();
            return resolve();
          } catch (err) {
            return reject(err);
          }
        }
        console.log("database initialized");
        return resolve();
      });
    });
  }
  public async deleteDb(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db?.close((err) => {
        if (err) {
          return reject(err);
        }
        // delete the actual file:
        fs.unlink(this.path, () => {
          return resolve();
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
          return reject(err);
        }
        return resolve();
      });
    });
  }
  private createSchema(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db?.run(schemaSql, (err: Error) => {
        if (err) {
          return reject(err);
        }
        return resolve();
      });
    });
  }

  // Gets all todo items from the database and returns them as an array of TodoItem objects
  public async getTodoItems(): Promise<TodoItem[]> {
    return new Promise((resolve, reject) => {
      this.db?.all("SELECT * FROM todos", (err, rows: DbTodoItem[]) => {
        if (err) {
          return reject(err);
        }
        // convert the rows to TodoItem objects and return them
        return resolve(rows.map(Repo._toTodoItem));
      });
    });
  }
  // get a single todo-item from the database
  public async getTodoItem(id: number): Promise<TodoItem | undefined> {
    return new Promise((resolve, reject) => {
      // check if id is a number
      if (isNaN(id)) {
        return reject(new Error("id must be a number"));
      }
      this.db?.get(
        "SELECT * FROM todos WHERE id = ?",
        [id],
        (err: Error, row: DbTodoItem) => {
          if (err) {
            return reject(err);
          }
          console.debug("row", row);
          // if row is undefined, the todo-item was not found. Resolve with undefined
          if (row === undefined) {
            console.log("todo-item not found:", id);
            return resolve(undefined);
          }
          return resolve(Repo._toTodoItem(row));
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
            return reject(err);
          }
          todoItem.id = this.lastID;
          return resolve(todoItem);
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
            return reject(err);
          }
          /*
          if (res.changes === 0) {
            resolve(false);
          }
           */
          return resolve(true);
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
            return reject(err);
          }
          // return true if a row was deleted, false otherwise
          return resolve(res.changes === 1);
        }
      );
    });
  }
  public async deleteAllTodoItems(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db?.run("DELETE FROM todos", (err) => {
        if (err) {
          return reject(err);
        }
        return resolve();
      });
    });
  }
}
