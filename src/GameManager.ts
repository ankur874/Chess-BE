
import WebSocket from "ws";
import { INIT_GAME, MOVE } from "./Constants";
import { Game } from "./Game";


export class GameManager {
    private games: Game[];
    private pendingUser: WebSocket | null;
    private allUsers: WebSocket[];

    constructor(){
        this.games = [];
        this.pendingUser = null;
        this.allUsers = [];
    }

    addUser(socket: WebSocket){
      this.allUsers.push(socket);
      this.handleMatching(socket);
    }

    removeUser(toBeRemovedSocket: WebSocket){
      this.allUsers =  this.allUsers.filter((socket: WebSocket)=>{
        return socket!==toBeRemovedSocket
       });
    }

    private handleMatching(socket: WebSocket){
      socket.on('message',(data)=>{
         const message = JSON.parse(data.toString());

         if(message.type === INIT_GAME){
            if(this.pendingUser){
              const game = new Game(this.pendingUser , socket);
              this.games.push(game);
              this.pendingUser = null;
            }else{
                this.pendingUser = socket
            }
         }

         if(message.type === MOVE){
           const game = this.games.find((game)=>{
            return game.player1 === socket || game.player2 === socket;
           }) 

           game?.makeMove(socket , message.move);


         }
      })
    }

}