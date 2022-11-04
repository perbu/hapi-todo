import Hapi, { Request, ResponseToolkit } from "@hapi/hapi";
import { ITodoService } from "../service/service";
import { TodoItem } from "../model/model";

export class TodoApi {
  service: ITodoService;
  server: Hapi.Server;
  name = "TodoApi";

  constructor(server: Hapi.Server, service: ITodoService) {
    this.server = server;
    this.service = service;
  }
  // list all todos
  public async listTodoHandler(request: Request, h: ResponseToolkit) {
    const todos = await this.service.getTodoItems();
    return h.response(todos).code(200);
  }
  // get a specific todo item
  public async getTodoHandler(request: Request, h: ResponseToolkit) {
    // get the id from the request parameters and make it a number
    const id = parseInt(request.params.id, 10);
    const todo = await this.service.getTodoItem(id);
    return h.response(todo).code(200);
  }
  // create a new todo item
  public async createTodoHandler(request: Request, h: ResponseToolkit) {
    // parse the request payload into an object
    const todo = request.payload as TodoItem;
    const result = await this.service.createTodoItem(todo);
    return h.response(result).code(200);
  }
  // delete a todo item by id
  public async deleteTodoHandler(request: Request, h: ResponseToolkit) {
    const id = parseInt(request.params.id, 10);
    const result = await this.service.deleteTodoItem(id);
    // if result is true, return a 200, otherwise return a 404
    return h.response({}).code(result ? 200 : 404);
  }
  // update a todo item
  public async updateTodoHandler(request: Request, h: ResponseToolkit) {
    // parse the request payload into an object
    const todo = request.payload as TodoItem;
    // check that there is an ID in the payload
    if (todo.id === undefined) {
      return h.response({}).code(400);
    }
    const result = await this.service.updateTodoItem(todo);
    return h.response(result).code(200);
  }
  // the handler for the root path. Just returns "Hello World"
  async rootHandler(request: Request, h: ResponseToolkit) {
    return h.response("Hello World").code(200);
    // this.server.log("info", "rootHandler");
  }

  public addRoutes() {
    this.server.route([
      {
        // root handler
        method: "GET",
        path: "/",
        handler: this.rootHandler.bind(this),
      },
      {
        // list the todo items
        method: "GET",
        path: "/list",
        handler: this.listTodoHandler.bind(this),
      },
      {
        // get a specific todo item
        method: "GET",
        path: "/get/{id}",
        handler: this.getTodoHandler.bind(this),
      },
      {
        // create a new todo item
        method: "POST",
        path: "/create",
        handler: this.createTodoHandler.bind(this),
      },
      {
        // delete a todo item
        method: "DELETE",
        path: "/delete/{id}",
        handler: this.deleteTodoHandler.bind(this),
      },
      {
        // update a todo item
        method: "PUT",
        path: "/update",
        handler: this.updateTodoHandler.bind(this),
      },
    ]);
  }
}
