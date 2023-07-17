import ChessBoard, {CreationOption} from "./chessboard";
import NotationParser from "./notation";
import {ChessGameStatus, Fen, PlayerColor, Printable} from "./commons";

/**
 * ChessGame class. This class represents a chess game.
 * Manages the communication between with the chessboard.
 */
class ChessGame implements Fen, Printable {
    
    private _board : ChessBoard;

    constructor(){
        this._board = ChessBoard.create();
    }

    /**
     * Starts the game. If a fen is provided, the game is started from that position. 
     * Otherwise, the game is started from the starting position.
     * @param fen the fen to start the game from, is optional
     */
    public startGame(fen : string | undefined = undefined){
        if(fen){
            this._board = ChessBoard.create(CreationOption.FEN, fen);
        }else{
            this._board = ChessBoard.create();
        }
    }

    /**
     * Moves a piece from origin to target. The move is specified in algebraic notation.
     * @param origin
     * @param target
     */
    public move(origin : string, target : string){
        this._board.move(
            NotationParser.parseAlgebraicToCoordinates(origin),
            NotationParser.parseAlgebraicToCoordinates(target)
        );
    }

    /**
     * Returns a printable representation of the board for the console
     * @returns the printable representation of the board
     */
    public printable() : string{
        return this._board.printable();
    }
    public fen() : string{
        return this._board.fen();
    }

    public get metaData(){
        return this._board.metaData;
    }

    public get isFinished(){
        return this._board.metaData.status !== ChessGameStatus.ONGOING;
    }
    
    public get whiteToMove() {
        return this._board.metaData.currentPlayer === PlayerColor.WHITE;
    }

    public get status() {
        return this._board.metaData.status;
    }

}

export default ChessGame;