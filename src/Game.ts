import WebSocket from "ws";
import { ChessManager } from "./ChessManager/ChessManager";
import { GAME_OVER, INIT_GAME, MOVE, REVERT_MOVE } from "./Constants";
import { Chess } from "./ChessManager/ChessModel";

export class Game {
  //---------------private--------------------
  private moves: string[];
  private chessManager: ChessManager;
  private startTime: Date;

  //---------------public--------------------
  public player1: WebSocket;
  public player2: WebSocket;
  public activePlayer: WebSocket;
  public player1Name?: string;
  public player2Name?: string;

  constructor(
    player1: WebSocket,
    player2: WebSocket,
    player1Name: string,
    player2Name: string
  ) {
    this.player1 = player1;
    this.player2 = player2;
    this.player1Name = player1Name;
    this.player2Name = player2Name;
    this.moves = [];
    this.startTime = new Date();
    this.chessManager = new ChessManager();
    this.activePlayer = player1;
    this.initilizeGameForBothPlayers();
  }

  private initilizeGameForBothPlayers() {
    this.player1.send(
      JSON.stringify({
        type: INIT_GAME,
        payload: {
          color: "white",
          opponentName: this.player2Name,
        },
      })
    );
    this.player2.send(
      JSON.stringify({
        type: INIT_GAME,
        payload: {
          color: "black",
          opponentName: this.player1Name,
        },
      })
    );
  }

  makeMove(socket: WebSocket, move: string) {
    //move e4$e5

    if (socket !== this.activePlayer) {
      return;
    }

    const res = this.chessManager.move(socket === this.player1, move) ?? false;
    if (res) {
      this.moves.push(move);
      this.activePlayer =
        this.activePlayer === this.player1 ? this.player2 : this.player1;
      //check for game over and send event to both players
      const gameOver = this.chessManager.isGameOver();
      if (gameOver.forBlack === true || gameOver.forWhite === true) {
        this.player1.send(
          JSON.stringify({
            type: GAME_OVER,
            payload: {
              winner: gameOver.forBlack ? Chess.Color.W : Chess.Color.B,
              move: this.activePlayer === this.player1 ? move : undefined,
              color: Chess.Color.W,
            },
          })
        );
        this.player2.send(
          JSON.stringify({
            type: GAME_OVER,
            payload: {
              winner: gameOver.forBlack ? Chess.Color.W : Chess.Color.B,
              move: this.activePlayer === this.player2 ? move : undefined,
              color: Chess.Color.B,
            },
          })
        );
        return;
      }
      this.activePlayer.send(
        JSON.stringify({
          type: MOVE,
          payload: move,
        })
      );
    } else {
      this.activePlayer.send(
        JSON.stringify({
          type: REVERT_MOVE,
          payload: move,
        })
      );
    }
  }

  makeGameOverBy(socket: WebSocket) {
    const winner: WebSocket =
      socket == this.player1 ? this.player2 : this.player1;
    winner.send(
      JSON.stringify({
        type: GAME_OVER,
        payload: {
          message: "Opponent left, you win!😄",
          winner: winner == this.player1 ? Chess.Color.W : Chess.Color.B,
          move: undefined,
          color: winner == this.player1 ? Chess.Color.W : Chess.Color.B,
        },
      })
    );
  }
}
