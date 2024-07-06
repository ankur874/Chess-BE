import { BISHOP, BLACK, KING, KNIGHT, PAWN, QUEEN, ROOK, WHITE } from "../Constants";

export enum Files {
    h = 7,
    g = 6,
    f = 5,
    e = 4,
    d = 3,
    c = 2,
    b = 1,
    a = 0
}

export namespace Chess {

    export enum Peice {
        K = KING,
        Q = QUEEN,
        N = KNIGHT,
        R = ROOK,
        B = BISHOP,
        P = PAWN,
        NONE = "none",
    }

    export enum Color {
        W = WHITE,
        B = BLACK,
        NONE = "none",
    }

}


export interface PeiceDetails {
    color: Chess.Color,
    peice: Chess.Peice
}

export interface IndexPath {
    row: number;
    column: number;
}
