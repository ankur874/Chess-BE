import { Chess, Files, IndexPath, PeiceDetails } from "./ChessModel";

export class ChessManager {
    private board: Array<Array<string>>;

    constructor() {
        this.board = [[]];
        this.initilizeBoard();

    }

    /*-----------------private member function-----------------*/
    private initilizeBoard() {
        this.board = [['B$R', 'B$N', 'B$B', 'B$K', 'B$Q', 'B$B', 'B$N', 'B$R'], ['B$P', 'B$P', 'B$P', 'B$P', 'B$P', 'B$P', 'B$P', 'B$P'], ['', '', '', '', '', '', '', ''], ['', '', '', '', '', '', '', ''], ['', '', '', '', '', '', '', ''], ['', '', '', '', '', '', '', ''], ['W$P', 'W$P', 'W$P', 'W$P', 'W$P', 'W$P', 'W$P', 'W$P'], ['W$R', 'W$N', 'W$B', 'W$K', 'W$Q', 'W$B', 'W$N', 'W$R']];
    }

    private getIndexFromMove(move: string): IndexPath {
        //e5 -> [3][4]
        let indexPath: IndexPath = {
            row: 8 - Number(move[1]),
            column: Files[move[0] as keyof typeof Files]
        }
        return indexPath
    }

    private getPeiceDetailsFromMove(move: string): PeiceDetails {
        // e5 -> white , bishop
        const index: IndexPath = this.getIndexFromMove(move);
        const details = this.board[index.row][index.column].split('$')
        if (details.length == 1) {
            return {
                color: Chess.Color.NONE,
                peice: Chess.Peice.NONE
            }
        }
        const [color, peice] = details;
        let peiceDetails: PeiceDetails = {
            color: Chess.Color[color as keyof typeof Chess.Color],
            peice: Chess.Peice[peice as keyof typeof Chess.Peice]
        }
        return peiceDetails
    }

    private getPeiceCordinateFromIndex(indexPath: IndexPath) {
        //[5,1] -> b3

        const coordinate =
            String.fromCharCode("a".charCodeAt(0) + (indexPath.column ?? 0)) +
            (8 - (indexPath.row ?? 0));
        return coordinate;
    };


    private isOutOfBounds(rowIndex: number, colIndex: number) {
        return rowIndex < 0 || colIndex < 0 || rowIndex > 7 || colIndex > 7;
    }

    private validateMoveForPawn(move: string) {
        const [current, destination] = move.split('$');
        const { color: currColor, peice: currPeice } = this.getPeiceDetailsFromMove(current);
        const { color: destColor, peice: destPeice } = this.getPeiceDetailsFromMove(destination);
        const { row: currRow, column: currCol } = this.getIndexFromMove(current);
        const { row: destRow, column: destCol } = this.getIndexFromMove(destination);

        if (currPeice != Chess.Peice.P) return false;

        const isInDefaultState = currColor == Chess.Color.W ? currRow == 6 : currRow == 1;
        if (currColor == Chess.Color.W) {
            if (currRow - destRow > 2 || currRow - destRow < 0) return false;
            if (Math.abs(currCol - destCol) >= 2) return false;
            if (Math.abs(currCol - destCol) >= 1 && destPeice === Chess.Peice.NONE) return false;
            if (currRow - destRow > 1 && !isInDefaultState) return false;
            if (Math.abs(currCol - destCol) == 1 && currRow - destRow != 1) return false;
            if (Math.abs(currCol - destCol) == 0 && currRow - destRow == 1 && destPeice != Chess.Peice.NONE) return false;
            if (Math.abs(currCol - destCol) == 0 && currRow - destRow == 2 && destPeice != Chess.Peice.NONE && isInDefaultState) return false;

        } else {
            if (destRow - currRow > 2 || destRow - currRow < 0) return false;
            if (Math.abs(currCol - destCol) >= 2) return false;
            if (Math.abs(currCol - destCol) >= 1 && destPeice === Chess.Peice.NONE) return false;
            if (destRow - currRow > 1 && !isInDefaultState) return false;
            if (Math.abs(currCol - destCol) == 1 && destRow - currRow != 1) return false;
            if (Math.abs(currCol - destCol) == 0 && destRow - currRow == 1 && destPeice != Chess.Peice.NONE) return false;
            if (Math.abs(currCol - destCol) == 0 && destRow - currRow == 2 && destPeice != Chess.Peice.NONE && isInDefaultState) return false;
        }
        return true;
    }

    private validateMoveForRook(move: string) {
        const [current, destination] = move.split('$');
        const { color: currColor, peice: currPeice } = this.getPeiceDetailsFromMove(current);
        const { color: destColor, peice: destPeice } = this.getPeiceDetailsFromMove(destination);
        const { row: currRow, column: currCol } = this.getIndexFromMove(current);
        const { row: destRow, column: destCol } = this.getIndexFromMove(destination);

        if (currPeice != Chess.Peice.R) return false;

        if (currRow != destRow && currCol != destCol) return false;
        if (currColor === destColor) return false;

        for (let i = Math.min(currCol, destCol) + 1; i < Math.max(currCol, destCol); i++) {
            if (this.board[currRow][i] != "") return false;
        }
        for (let i = Math.min(currRow, destRow) + 1; i < Math.max(currRow, destRow); i++) {
            if (this.board[i][currCol] != "") return false;


        }
        return true
    }

    private validateMoveForBishop(move: string) {
        const [current, destination] = move.split('$');
        const { color: currColor, peice: currPeice } = this.getPeiceDetailsFromMove(current);
        const { color: destColor, peice: destPeice } = this.getPeiceDetailsFromMove(destination);
        const { row: currRow, column: currCol } = this.getIndexFromMove(current);
        const { row: destRow, column: destCol } = this.getIndexFromMove(destination);

        if (currPeice !== Chess.Peice.B) return false;

        let helperRow = currRow - 1, helperCol = currCol - 1;
        while (!this.isOutOfBounds(helperRow, helperCol)) {
            if (helperRow === destRow && helperCol === destCol) return true;
            if (this.board[helperRow][helperCol] != "") break;
            helperRow--;
            helperCol--;
        }
        helperRow = currRow - 1, helperCol = currCol + 1;
        while (!this.isOutOfBounds(helperRow, helperCol)) {
            if (helperRow === destRow && helperCol === destCol) return true;
            if (this.board[helperRow][helperCol] != "") break;
            helperRow--;
            helperCol++;
        }
        helperRow = currRow + 1, helperCol = currCol - 1;
        while (!this.isOutOfBounds(helperRow, helperCol)) {
            if (helperRow === destRow && helperCol === destCol) return true;
            if (this.board[helperRow][helperCol] != "") break;
            helperRow++;
            helperCol--;
        }
        helperRow = currRow + 1, helperCol = currCol + 1;
        while (!this.isOutOfBounds(helperRow, helperCol)) {
            if (helperRow === destRow && helperCol === destCol) return true;
            if (this.board[helperRow][helperCol] != "") break;
            helperRow++;
            helperCol++;
        }
        return false
    }

    private validateMoveForKnight(move: string) {
        const [current, destination] = move.split('$');
        const { color: currColor, peice: currPeice } = this.getPeiceDetailsFromMove(current);
        const { color: destColor, peice: destPeice } = this.getPeiceDetailsFromMove(destination);
        const { row: currRow, column: currCol } = this.getIndexFromMove(current);
        const { row: destRow, column: destCol } = this.getIndexFromMove(destination);

        if (currPeice !== Chess.Peice.N) return false;

        const movingSpaces = [[2, 1], [2, -1], [-2, 1], [-2, -1], [1, 2], [1, -2], [-1, 2], [-1, -2]];

        for (let i = 0; i < movingSpaces.length; i++) {
            if (!this.isOutOfBounds(movingSpaces[i][0] + currRow, movingSpaces[i][1] + currCol)) {
                if (destRow === movingSpaces[i][0] + currRow && destCol === movingSpaces[i][1] + currCol) return true;
            }
        }
        return false;
        /*
          [2,-2]
          [1,-1]
        */
    }

    private validateMoveForKing(move: string) {
        const [current, destination] = move.split('$');
        const { color: currColor, peice: currPeice } = this.getPeiceDetailsFromMove(current);
        const { color: destColor, peice: destPeice } = this.getPeiceDetailsFromMove(destination);
        const { row: currRow, column: currCol } = this.getIndexFromMove(current);
        const { row: destRow, column: destCol } = this.getIndexFromMove(destination);

        if (currPeice !== Chess.Peice.K) return false;

        const movingSpaces = [[0, -1], [-1, -1], [-1, 0], [-1, 1], [0, 1], [1, 1], [1, 0], [1, -1]];

        for (let i = 0; i < movingSpaces.length; i++) {
            if (!this.isOutOfBounds(movingSpaces[i][0] + currRow, movingSpaces[i][1] + currCol)) {
                if (destRow === movingSpaces[i][0] + currRow && destCol === movingSpaces[i][1] + currCol) return true;
            }
        }
        return false;

    }

    private validateMoveForQueen(move: string) {
        const [current, destination] = move.split('$');
        const { color: currColor, peice: currPeice } = this.getPeiceDetailsFromMove(current);
        const { color: destColor, peice: destPeice } = this.getPeiceDetailsFromMove(destination);
        const { row: currRow, column: currCol } = this.getIndexFromMove(current);
        const { row: destRow, column: destCol } = this.getIndexFromMove(destination);

        if (currPeice !== Chess.Peice.Q) return false;
        let helperRow = currRow - 1, helperCol = currCol - 1;
        while (!this.isOutOfBounds(helperRow, helperCol)) {
            if (helperRow === destRow && helperCol === destCol) return true;
            if (this.board[helperRow][helperCol] != "") break;
            helperRow--;
            helperCol--;
        }
        helperRow = currRow - 1, helperCol = currCol + 1;
        while (!this.isOutOfBounds(helperRow, helperCol)) {
            if (helperRow === destRow && helperCol === destCol) return true;
            if (this.board[helperRow][helperCol] != "") break;
            helperRow--;
            helperCol++;
        }
        helperRow = currRow + 1, helperCol = currCol - 1;
        while (!this.isOutOfBounds(helperRow, helperCol)) {
            if (helperRow === destRow && helperCol === destCol) return true;
            if (this.board[helperRow][helperCol] != "") break;
            helperRow++;
            helperCol--;
        }
        helperRow = currRow + 1, helperCol = currCol + 1;
        while (!this.isOutOfBounds(helperRow, helperCol)) {
            if (helperRow === destRow && helperCol === destCol) return true;
            if (this.board[helperRow][helperCol] != "") break;
            helperRow++;
            helperCol++;
        }

        helperRow = currRow - 1, helperCol = currCol;
        while (!this.isOutOfBounds(helperRow, helperCol)) {
            if (helperRow === destRow && helperCol === destCol) return true;
            if (this.board[helperRow][helperCol] != "") break;
            helperRow--;
        }
        helperRow = currRow, helperCol = currCol + 1;
        while (!this.isOutOfBounds(helperRow, helperCol)) {
            if (helperRow === destRow && helperCol === destCol) return true;
            if (this.board[helperRow][helperCol] != "") break;
            helperCol++;
        }
        helperRow = currRow + 1, helperCol = currCol;
        while (!this.isOutOfBounds(helperRow, helperCol)) {
            if (helperRow === destRow && helperCol === destCol) return true;
            if (this.board[helperRow][helperCol] != "") break;
            helperRow++;
        }
        helperRow = currRow, helperCol = currCol - 1;
        while (!this.isOutOfBounds(helperRow, helperCol)) {
            if (helperRow === destRow && helperCol === destCol) return true;
            if (this.board[helperRow][helperCol] != "") break;
            helperCol--;
        }
        return false;


    }

    private isMovedPeiceCorrect(peice: Chess.Peice, color: Chess.Color, isWhite: boolean,) {
        if (peice === Chess.Peice.NONE || (isWhite && color === Chess.Color.B) || (!isWhite && color === Chess.Color.W)) return false;
        return true
    }

    private validateMove(isWhite: boolean, move: string) {
        // move -> e4$e6
        const [current, destination] = move.split('$');
        const { color, peice } = this.getPeiceDetailsFromMove(current);

        if (!this.isMovedPeiceCorrect(peice, color, isWhite)) {
            return false
        }

        var isMoveValid = false
        switch (peice) {
            case Chess.Peice.P:
                isMoveValid = this.validateMoveForPawn(move);
                break;
            case Chess.Peice.R:
                isMoveValid = this.validateMoveForRook(move);
                break;
            case Chess.Peice.B:
                isMoveValid = this.validateMoveForBishop(move);
                break;
            case Chess.Peice.N:
                isMoveValid = this.validateMoveForKnight(move);
                break;
            case Chess.Peice.K:
                isMoveValid = this.validateMoveForKing(move);
                break;
            case Chess.Peice.Q:
                isMoveValid = this.validateMoveForQueen(move);
                break;

            default:
                isMoveValid = false;

        }

        //isMoveValid ? this.updateBoardOnValidation(move) : null
        return isMoveValid
    }

    private handleCheckedState(isWhite: boolean, move: string) {
        const [current, destination] = move.split('$');
        const { color, peice } = this.getPeiceDetailsFromMove(current);
        if (peice !== Chess.Peice.K) return false;

        if (this.validateMove(isWhite, move)) {
            this.updateBoardOnValidation(move)
            const isInCheckedStateAfterMove = this.isCheckedState(isWhite)
            if (isInCheckedStateAfterMove) {
                this.updateBoardOnValidation(`${destination}$${current}`);
                return false
            } else {
                return true
            }
        }
        return false;
    }

    private getKingIndex(king: string) {
        const index: IndexPath = { row: -1, column: -1 };
        for (let i = 0; i < this.board.length; i++) {
            for (let j = 0; j < this.board.length; j++) {
                if (this.board[i][j] === king) {
                    index.row = i;
                    index.column = j;
                    break;
                }
            }
        }

        return index

    }

    private isCheckedState(forWhite: boolean) {
        const king = forWhite ? "W$K" : "B$K";
        const index: IndexPath = this.getKingIndex(king)
        //opposition peices
        const pawn_opp = forWhite ? "B$P" : "W$P";
        const rook_opp = forWhite ? "B$R" : "W$R";
        const bishop_opp = forWhite ? "B$B" : "W$B";
        const knight_opp = forWhite ? "B$N" : "W$N";
        const queen_opp = forWhite ? "B$Q" : "W$Q";
        const king_opp = forWhite ? "B$K" : "W$K";

        let movingSpaces = [[-1, -1], [-1, 1], [1, 1], [1, -1]];

        for (let i = 0; i < movingSpaces.length; i++) {
            const newRow = movingSpaces[i][0] + index.row
            const newColumn = movingSpaces[i][1] + index.column
            if (!this.isOutOfBounds(newRow, newColumn)) {
                if (this.board[newRow][newColumn] === pawn_opp || this.board[newRow][newColumn] === king_opp) return true;
            }
        }

        movingSpaces = [[0, -1], [-1, 0], [0, 1], [1, 0]];

        for (let i = 0; i < movingSpaces.length; i++) {
            const newRow = movingSpaces[i][0] + index.row
            const newColumn = movingSpaces[i][1] + index.column
            if (!this.isOutOfBounds(newRow, newColumn)) {
                if (this.board[newRow][newColumn] === king_opp) return true;
            }
        }

        movingSpaces = [[2, 1], [2, -1], [-2, 1], [-2, -1], [1, 2], [1, -2], [-1, 2], [-1, -2]];

        for (let i = 0; i < movingSpaces.length; i++) {
            const newRow = movingSpaces[i][0] + index.row
            const newColumn = movingSpaces[i][1] + index.column
            if (!this.isOutOfBounds(newRow, newColumn)) {
                if (this.board[newRow][newColumn] === knight_opp) return true;
            }
        }

        ///////
        let leftRow = index.row, leftCol = index.column - 1
        let rightRow = index.row, rightCol = index.column + 1
        while (!this.isOutOfBounds(leftRow, leftCol) || !this.isOutOfBounds(rightRow, rightCol)) {
            if (!this.isOutOfBounds(leftRow, leftCol)) {
                if (this.board[leftRow][leftCol] === rook_opp || this.board[leftRow][leftCol] === queen_opp) return true
                if (this.board[leftRow][leftCol] != "") {
                    leftCol = -10;
                    leftRow = -10;
                }
                leftCol--;
            }
            if (!this.isOutOfBounds(rightRow, rightCol)) {
                if (this.board[rightRow][rightCol] === rook_opp || this.board[rightRow][rightCol] === queen_opp) return true
                if (this.board[rightRow][rightCol] != "") {
                    rightRow = -10;
                    rightCol = -10;
                }
                rightCol++;
            }
        }
        leftRow = index.row - 1, leftCol = index.column
        rightRow = index.row + 1, rightCol = index.column
        while (!this.isOutOfBounds(leftRow, leftCol) || !this.isOutOfBounds(rightRow, rightCol)) {
            if (!this.isOutOfBounds(leftRow, leftCol)) {
                if (this.board[leftRow][leftCol] === rook_opp || this.board[leftRow][leftCol] === queen_opp) return true
                if (this.board[leftRow][leftCol] != "") {
                    leftRow = -10;
                    leftCol = -10;
                }
                leftRow--;
            }
            if (!this.isOutOfBounds(rightRow, rightCol)) {
                if (this.board[rightRow][rightCol] === rook_opp || this.board[rightRow][rightCol] === queen_opp) return true
                if (this.board[rightRow][rightCol] != "") {
                    rightRow = -10;
                    rightCol = -10;
                }
                rightRow++;
            }
        }
        ///////
        leftRow = index.row - 1, leftCol = index.column - 1
        rightRow = index.row + 1, rightCol = index.column + 1
        while (!this.isOutOfBounds(leftRow, leftCol) || !this.isOutOfBounds(rightRow, rightCol)) {
            if (!this.isOutOfBounds(leftRow, leftCol)) {
                if (this.board[leftRow][leftCol] === bishop_opp || this.board[leftRow][leftCol] === queen_opp) return true
                if (this.board[leftRow][leftCol] != "") {
                    leftRow = -10;
                    leftCol = -10;
                }
                leftCol--;
                leftRow--;
            }
            if (!this.isOutOfBounds(rightRow, rightCol)) {
                if (this.board[rightRow][rightCol] === bishop_opp || this.board[rightRow][rightCol] === queen_opp) return true
                if (this.board[rightRow][rightCol] != "") {
                    rightRow = -10;
                    rightCol = -10;
                }
                rightCol++;
                rightRow++;
            }
        }
        leftRow = index.row - 1, leftCol = index.column + 1
        rightRow = index.row + 1, rightCol = index.column - 1
        while (!this.isOutOfBounds(leftRow, leftCol) || !this.isOutOfBounds(rightRow, rightCol)) {
            if (!this.isOutOfBounds(leftRow, leftCol)) {
                if (this.board[leftRow][leftCol] === bishop_opp || this.board[leftRow][leftCol] === queen_opp) return true
                if (this.board[leftRow][leftCol] != "") {
                    leftRow = -10;
                    leftCol = -10;
                }
                leftRow--;
                leftCol++;
            }
            if (!this.isOutOfBounds(rightRow, rightCol)) {
                if (this.board[rightRow][rightCol] === bishop_opp || this.board[rightRow][rightCol] === queen_opp) return true
                if (this.board[rightRow][rightCol] != "") {
                    rightRow = -10;
                    rightCol = -10;
                }
                rightRow++;
                rightCol--;
            }
        }

        return false;

    }

    move(isWhite: boolean, move: string) {
        const isInCheckedStateBeforeMove = this.isCheckedState(isWhite);
        if (isInCheckedStateBeforeMove) {
            return this.handleCheckedState(isWhite, move);
        }
        console.log("1st", isInCheckedStateBeforeMove, isWhite)
        if (this.validateMove(isWhite, move)) {
            console.log("validated")
            this.updateBoardOnValidation(move)
            console.log("updated")
            return true;
        }
        console.log("not validated");
        return false
    }

    updateBoardOnValidation(move: string) {
        // move -> e4$e6
        const [current, destination] = move.split('$');
        const { row: currRow, column: currCol } = this.getIndexFromMove(current);
        const { row: destRow, column: destCol } = this.getIndexFromMove(destination);

        if (this.board[destRow][destCol] != "") {
            console.log("point increased");
        }
        this.board[destRow][destCol] = this.board[currRow][currCol];
        this.board[currRow][currCol] = "";
    }

    isGameOver() {
        const gameOver = {
            forBlack: false,
            forWhite: false
        }

        const whiteIdx = this.getKingIndex("W$K");
        const blackIdx = this.getKingIndex("B$K");
        console.log("whiteIdx", whiteIdx, blackIdx);
        if (whiteIdx.row === -1 && whiteIdx.column === -1) gameOver.forWhite = true;
        if (blackIdx.row === -1 && blackIdx.column === -1) gameOver.forBlack = true;
        if (gameOver.forBlack || gameOver.forWhite) return gameOver

        const isWhiteChecked = this.isCheckedState(true);
        const isBlackChecked = this.isCheckedState(false);

        const movingSpaces = [[0, -1], [-1, -1], [-1, 0], [-1, 1], [0, 1], [1, 1], [1, 0], [1, -1]];
        let whiteFlag = true
        for (let i = 0; i < movingSpaces.length; i++) {
            const newRow = whiteIdx.row + movingSpaces[i][0];
            const newCol = whiteIdx.column + movingSpaces[i][1];

            if (!this.isOutOfBounds(newRow, newCol)) {
                const peice = this.board[newRow][newCol]
                if (this.board[newRow][newCol] != "" && this.board[newRow][newCol][0] == "W") continue
                this.board[newRow][newCol] = "W$K"
                this.board[whiteIdx.row][whiteIdx.column] = "";
                if (!this.isCheckedState(true)) {
                    whiteFlag = false
                }
                this.board[newRow][newCol] = peice
                this.board[whiteIdx.row][whiteIdx.column] = "W$K";
            }
        }
        let blackFlag = true;
        for (let i = 0; i < movingSpaces.length; i++) {
            const newRow = blackIdx.row + movingSpaces[i][0];
            const newCol = blackIdx.column + movingSpaces[i][1];

            if (!this.isOutOfBounds(newRow, newCol)) {
                const peice = this.board[newRow][newCol]
                if (this.board[newRow][newCol] != "" && this.board[newRow][newCol][0] == "B") continue
                this.board[newRow][newCol] = "B$K"
                this.board[blackIdx.row][blackIdx.column] = "";
                if (!this.isCheckedState(false)) {
                    blackFlag = false
                }
                this.board[newRow][newCol] = peice
                this.board[blackIdx.row][blackIdx.column] = "B$K";
            }
        }
        gameOver.forBlack = blackFlag;
        gameOver.forWhite = whiteFlag;
        if (!isWhiteChecked) gameOver.forWhite = false;
        if (!isBlackChecked) gameOver.forBlack = false;
        return gameOver
    }

    getBoard() {
        return [...this.board]
    }

}
