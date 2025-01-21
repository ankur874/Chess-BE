import WebSocket from "ws";
import { INIT_GAME, LEAVE_GAME, MOVE } from "./Constants";
import { Game } from "./Game";

export class GameManager {
  private games: Game[];
  private pendingUser: WebSocket | null;
  private allUsers: WebSocket[];
  private player1Name?: string;

  constructor() {
    this.games = [];
    this.pendingUser = null;
    this.allUsers = [];
  }

  addUser(socket: WebSocket) {
    this.allUsers.push(socket);
    this.handleMatching(socket);
  }

  removeUser(toBeRemovedSocket: WebSocket) {
    this.allUsers = this.allUsers.filter((socket: WebSocket) => {
      return socket !== toBeRemovedSocket;
    });
  }

  removeGame(gameToBeRemoved: Game) {
    this.games = this.games.filter((game: Game) => {
      return game != gameToBeRemoved;
    });
  }

  findGameForUser(user: WebSocket): Game | undefined {
    const game = this.games.find((game) => {
      return game.player1 === user || game.player2 === user;
    });
    return game;
  }

  private handleMatching(socket: WebSocket) {
    socket.on("message", (data) => {
      const message = JSON.parse(data.toString());
      if (message.type === INIT_GAME) {
        if (this.pendingUser) {
          const game = new Game(
            this.pendingUser,
            socket,
            this.player1Name ?? "",
            message.name
          );
          this.games.push(game);
          this.pendingUser = null;
          this.player1Name = "";
        } else {
          this.pendingUser = socket;
          this.player1Name = message.name;
        }
      }

      if (message.type === LEAVE_GAME) {
        this.removeUser(socket);
        const game = this.findGameForUser(socket);
        if (game) {
          game?.makeGameOverBy(socket);
          this.removeGame(game);
        } else {
          if (socket != this.pendingUser) {
            return;
          }
          this.player1Name = "";
          this.pendingUser = null;
        }
      }

      if (message.type === MOVE) {
        const game = this.games.find((game) => {
          return game.player1 === socket || game.player2 === socket;
        });
        game?.makeMove(socket, message.move);
      }
    });
  }
}
