import { WebSocketServer } from "ws";
import { GameManager } from "./GameManager";



const wss = new WebSocketServer({ port: 8080 });

const gameManager = new GameManager();

console.log("-----------------project-----------------");
wss.on("connection", function connection(ws) {


  console.log("socket", "hello");
  gameManager.addUser(ws);
});
