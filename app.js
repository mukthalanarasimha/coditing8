const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const app = express();
app.use(express.json());

const dataPath = path.join(__dirname, "todoApplication.db");
let dataBase = null;
const initializeAndDbServer = async () => {
  try {
    dataBase = await open({
      filename: dataPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log.log("Server Running at https://localhost:3000/");
    });
  } catch (error) {
    console.log(`DB ERROR ${error.message}`);
  }
};
initializeAndDbServer();

const hasPriorityAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};
const hasPriorityProperty = (requestQuery) => {
  return requestQuery.priority !== undefined;
};
const hasStatusProperty = (requestQuery) => {
  return requestQuery.status !== undefined;
};
//API 1//

app.get("/todos/", async (request, response) => {
  let getTodoQuery = "";
  let data = null;
  const { search_q = "", priority, status } = request.query;

  switch (true) {
    case hasPriorityAndStatusProperties(request.query):
      getTodoQuery = `
            SELECT 
            * FROM todo 
            WHERE 
            todo LIKE ${search_q},
            priority = ${priority},
            status = ${status}`;
      break;
    case hasPriorityProperty(request.query):
      getTodoQuery = `
            SELECT 
            * FROM todo
             WHERE todo 
             LIKE ${search_q},
             priority = ${priority}`;
      break;
    case hasStatusProperty(request.query):
      getTodoQuery = `
            SELECT * FROM todo WHERE todo LIKE ${search_q},
            status = ${status}`;
      break;
    default:
      getTodoQuery = `
            SELECT 
            * FROM todo 
            WHERE todo ${search_q}`;
  }
  data = await dataBase.all(getTodoQuery);
  response.send(data);
});

// API 2 //
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoId = `
    SELECT 
    * FROM todo WHERE todo_id = ${todoId}`;
  getIdTodoAp = await dataBase.run(getTodoId);
  response.send(getTodoId);
});

// API 3 //
app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  const createTodoAp = `
    INSERT INTO todo (id,todo,priority,status)
    VALUES (${id},${todo},${priority},${status});`;
  const createId = await dataBase.run(createTodoAp);
  response.send("Todo Successfully Added");
});

// API 4 //
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  let updateColumn = "";
  switch (true) {
    case request.status !== undefined:
      updateColumn = "Status";
      break;
    case request.priority !== undefined:
      updateColumn = "Priority";
      break;
    case request.todo !== undefined:
      updateColumn = "Todo";
      break;
  }
  const previousTodo = `
    SELECT 
    * FROM todo WHERE todo_id = ${todoId}`;
  const previousTodoApp = await dataBase.run(previousTodo);

  const {
    todo = previousTodoApp.todo,
    priority = previousTodoApp.priority,
    status = previousTodoApp.status,
  } = request.body;

  const UpadateTodQuery = `
    UPDATE todo 
    SET 
    todo = ${todo},
    priority = ${priority},
    status = ${status}
    WHERE 
    todo_id = ${todoId}`;
  await dataBase.run(UpadateTodQuery);
  response.send("Todo Updated");
});

//API 5 //
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.body;

  const deleteId = `
    DELETE 
    * FROM todo WHERE todo_id = ${todoId}`;
  await dataBase.run(deleteId);
  respond.send("Todo Deleted");
});
module.exports = app;
