import {Rule, RuleBuilder} from "./rule";
import ChessBoard from "./chessboard";
import {Coordinates, Fen, PlayerColor, Printable} from "./commons";

/**
 * A chess piece.
 * Contains information about its color and its rules.
 * Can also be used to create custom pieces for experiments or chess variations.
 */
abstract class Piece implements Printable, Fen{
    private readonly _color : PlayerColor;
    private readonly _rules : Rule[];

    protected constructor(color : PlayerColor, rules : Rule[]) {
        this._color = color;
        this._rules = rules;
    }

    public get color() : PlayerColor{
        return this._color;
    }

    public get rules(): Rule[]{
        return this._rules;
    };

    public abstract fen() : string;
    public abstract printable(): string;
}

/**
 * A Knight.
 */
class Knight extends Piece{
    constructor(color : PlayerColor) {
        const rules = [
            RuleBuilder.up(1).left(2).build(),
            RuleBuilder.up(1).right(2).build(),
            RuleBuilder.up(2).left(1).build(),
            RuleBuilder.up(2).right(1).build(),
            RuleBuilder.down(1).left(2).build(),
            RuleBuilder.down(1).right(2).build(),
            RuleBuilder.down(2).left(1).build(),
            RuleBuilder.down(2).right(1).build(),
        ];
        super(color, rules);
    }

    fen(): string {
        return this.color === PlayerColor.WHITE ? "N" : "n";
    }
    printable(): string {
        return this.color === PlayerColor.WHITE ? "WN" : "bn";
    }
}

/**
 * A Bishop.
 */
class Bishop extends Piece{
    constructor(color : PlayerColor) {
        const rules = [
            RuleBuilder.up().left().repeat().blockable().build(),
            RuleBuilder.up().right().repeat().blockable().build(),
            RuleBuilder.down().left().repeat().blockable().build(),
            RuleBuilder.down().right().repeat().blockable().build()
        ];
        super(color, rules);
    }
    fen() : string{
        return this.color === PlayerColor.WHITE ? "B" : "b";
    }
    printable(): string {
        return this.color === PlayerColor.WHITE ? "WB" : "bb";
    }
}

/**
 * A Rook.
 */
class Rook extends Piece{
    constructor(color : PlayerColor) {
        const rules = [
            RuleBuilder.up().repeat().blockable().build(),
            RuleBuilder.down().repeat().blockable().build(),
            RuleBuilder.left().repeat().blockable().build(),
            RuleBuilder.right().repeat().blockable().build(),
        ];
        super(color, rules);
    }
    fen() : string{
        return this.color === PlayerColor.WHITE ? "R" : "r";
    }
    printable(): string {
        return this.color === PlayerColor.WHITE ? "WR" : "br";
    }
}

/**
 * A Queen.
 */
class Queen extends Piece{
    constructor(color : PlayerColor) {
        const rules = [
            RuleBuilder.up().left().repeat().blockable().build(),
            RuleBuilder.up().right().repeat().blockable().build(),
            RuleBuilder.down().left().repeat().blockable().build(),
            RuleBuilder.down().right().repeat().blockable().build(),
            RuleBuilder.up().repeat().blockable().build(),
            RuleBuilder.down().repeat().blockable().build(),
            RuleBuilder.left().repeat().blockable().build(),
            RuleBuilder.right().repeat().blockable().build(),
        ];
        super(color, rules);
    }
    fen(): string {
        return this.color === PlayerColor.WHITE ? "Q" : "q";
    }
    printable(): string {
        return this.color === PlayerColor.WHITE ? "WQ" : "bq";
    }
}

/**
 * A Pawn.
 */
class Pawn extends Piece{
    constructor(color : PlayerColor) {
        const rules : Rule[] = [
            //White 1 Forward
            RuleBuilder.custom((board: ChessBoard, originCoordinates: Coordinates, targetCoordinates: Coordinates) => {
                //Check if origin is white
                const originSquare = board.getSquare(originCoordinates);
                if (!originSquare.piece || originSquare.piece.color !== PlayerColor.WHITE){
                    return {valid : false, instructions : [], metaDataChange : undefined};
                }
                const metaData = board.metaData;
                //Check if target is empty and 1 forward => valid
                if(targetCoordinates.row === originCoordinates.row + 1 && targetCoordinates.col === originCoordinates.col
                    && !board.getSquare(targetCoordinates).piece){
                    metaData.halfMoveClock = 0;
                    metaData.enPassantCoordinates = undefined;
                    return {
                        valid: true,
                        instructions: [
                            {
                                coordinates : targetCoordinates,
                                piece : targetCoordinates.row === 7 ? new Queen(originSquare.piece.color) : //When on opposite Backrank promote to Queen
                                    PieceFactory.createPiece(originSquare.piece.fen())
                            },
                            {
                                coordinates : originCoordinates,
                                piece : undefined
                            }
                        ],
                        metaDataChange: metaData
                    }
                }
                return {valid : false, instructions : [], metaDataChange : undefined};
            }),
            //White 2 Forward
            RuleBuilder.custom((board: ChessBoard, originCoordinates: Coordinates, targetCoordinates: Coordinates) => {
                //Check if origin is white
                const originSquare = board.getSquare(originCoordinates);
                if (!originSquare.piece || originSquare.piece.color !== PlayerColor.WHITE){
                    return {valid : false, instructions : [], metaDataChange : undefined};
                }
                const metaData = board.metaData;
                //Check if target is empty and the square in between, is 2 forward and is on the 2nd rank for white => valid
                if(originCoordinates.row === 1
                    && targetCoordinates.row === 3
                    && targetCoordinates.col === originCoordinates.col
                    && !board.getSquare({row : 2, col: originCoordinates.col}).piece
                    && !board.getSquare(targetCoordinates).piece){
                    metaData.halfMoveClock = 0;
                    metaData.enPassantCoordinates = {row : 2, col : originCoordinates.col};
                    return {
                        valid: true,
                        instructions: [
                            {
                                coordinates : targetCoordinates,
                                piece : PieceFactory.createPiece(originSquare.piece.fen()) //Cannot reach backrank
                            },
                            {
                                coordinates : originCoordinates,
                                piece : undefined
                            }
                        ],
                        metaDataChange: metaData
                    }
                }
                return {valid : false, instructions : [], metaDataChange : undefined} ;
            }),
            //White take
            RuleBuilder.custom((board: ChessBoard, originCoordinates: Coordinates, targetCoordinates: Coordinates) => {
                const originSquare = board.getSquare(originCoordinates);
                if (!originSquare.piece || originSquare.piece.color !== PlayerColor.WHITE){
                    return {valid : false, instructions : [], metaDataChange : undefined};
                }
                const metaData = board.metaData;
                if(targetCoordinates.row === originCoordinates.row + 1              //Check if target is 1 forward
                    && (targetCoordinates.col === originCoordinates.col + 1 ||      //Check if target is 1 left or 1 right
                        targetCoordinates.col === originCoordinates.col - 1)
                    && board.getSquare(targetCoordinates).piece                     //Check if target is occupied by an enemy
                    && board.getSquare(targetCoordinates).piece?.color === PlayerColor.BLACK){
                    metaData.halfMoveClock = 0;
                    metaData.enPassantCoordinates = undefined;
                    return {
                        valid: true,
                        instructions: [
                            {
                                coordinates : targetCoordinates,
                                piece : targetCoordinates.row === 7 ? new Queen(originSquare.piece.color) : //When on opposite Backrank promote to Queen
                                    PieceFactory.createPiece(originSquare.piece.fen())
                            },
                            {
                                coordinates : originCoordinates,
                                piece : undefined
                            }
                        ],
                        metaDataChange: metaData
                    }
                }
                return {valid : false, instructions : [], metaDataChange : undefined} ;
            }),
            //White EnPassant
            RuleBuilder.custom((board: ChessBoard, originCoordinates: Coordinates, targetCoordinates: Coordinates) => {
                const originSquare = board.getSquare(originCoordinates);
                if (!originSquare.piece || originSquare.piece.color !== PlayerColor.WHITE){
                    return {valid : false, instructions : [], metaDataChange : undefined};
                }
                const metaData = board.metaData;
                if(metaData.enPassantCoordinates
                    && targetCoordinates.row === originCoordinates.row + 1      //Check if target is 1 forward
                    && (targetCoordinates.col === originCoordinates.col + 1 ||  //Check if target is 1 left or 1 right
                        targetCoordinates.col === originCoordinates.col - 1)
                    && targetCoordinates.row === metaData.enPassantCoordinates.row  //Check if target is on the same as enPassantCoordinates
                    && targetCoordinates.col === metaData.enPassantCoordinates.col){
                    metaData.halfMoveClock = 0;
                    //Remove the pawn that is taken
                    const enPassantCoordinates = {
                        row: metaData.enPassantCoordinates.row - 1,
                        col: metaData.enPassantCoordinates.col
                    };
                    metaData.enPassantCoordinates = undefined;
                    return {
                        valid: true,
                        instructions: [
                            {
                                coordinates : targetCoordinates,
                                piece : PieceFactory.createPiece(originSquare.piece.fen())
                            },
                            {
                                coordinates : originCoordinates,
                                piece : undefined
                            },
                            {
                                coordinates: enPassantCoordinates,
                                piece: undefined
                            }
                        ],
                        metaDataChange: metaData
                    }
                }
                return {valid : false, instructions : [], metaDataChange : undefined} ;
            }),
            //Black 1 Forward
            RuleBuilder.custom((board: ChessBoard, originCoordinates: Coordinates, targetCoordinates: Coordinates) => {
                const originSquare = board.getSquare(originCoordinates);
                if (!originSquare.piece || originSquare.piece.color !== PlayerColor.BLACK){
                    return {valid : false, instructions : [], metaDataChange : undefined};
                }
                const metaData = board.metaData;
                if(targetCoordinates.row === originCoordinates.row - 1 && targetCoordinates.col === originCoordinates.col
                    && !board.getSquare(targetCoordinates).piece){
                    metaData.halfMoveClock = 0;
                    metaData.enPassantCoordinates = undefined;
                    return {
                        valid: true,
                        instructions: [
                            {
                                coordinates : targetCoordinates,
                                piece : targetCoordinates.row === 0 ? new Queen(originSquare.piece.color) : //When on opposite Backrank promote to Queen
                                    PieceFactory.createPiece(originSquare.piece.fen())
                            },
                            {
                                coordinates : originCoordinates,
                                piece : undefined
                            }],
                        metaDataChange: metaData
                    }
                }
                return {valid : false, instructions : [], metaDataChange : undefined} ;
            }),
            //Black 2 Forward
            RuleBuilder.custom((board: ChessBoard, originCoordinates: Coordinates, targetCoordinates: Coordinates) => {
                const originSquare = board.getSquare(originCoordinates);
                if (!originSquare.piece || originSquare.piece.color !== PlayerColor.BLACK){
                    return {valid : false, instructions : [], metaDataChange : undefined};
                }
                const metaData = board.metaData;
                if(originCoordinates.row === 6
                    && targetCoordinates.row === 4
                    && targetCoordinates.col === originCoordinates.col
                    && !board.getSquare({
                        row: 5,
                        col: originCoordinates.col
                    }).piece
                    && !board.getSquare(targetCoordinates).piece){
                    metaData.halfMoveClock = 0;
                    metaData.enPassantCoordinates = {row : 5, col : originCoordinates.col};
                    return {
                        valid: true,
                        instructions: [
                            {
                                coordinates : targetCoordinates,
                                piece : PieceFactory.createPiece(originSquare.piece.fen())
                            },
                            {
                                coordinates : originCoordinates,
                                piece : undefined
                            }],
                        metaDataChange: metaData
                    }
                }
                return {valid : false, instructions : [], metaDataChange : undefined};
            }),
            //Black take
            RuleBuilder.custom((board: ChessBoard, originCoordinates: Coordinates, targetCoordinates: Coordinates) => {
                const originSquare = board.getSquare(originCoordinates);
                if (!originSquare.piece || originSquare.piece.color !== PlayerColor.BLACK){
                    return {valid : false, instructions : [], metaDataChange : undefined};
                }
                const metaData = board.metaData;
                if(targetCoordinates.row === originCoordinates.row - 1
                    && (targetCoordinates.col === originCoordinates.col + 1 ||
                        targetCoordinates.col === originCoordinates.col - 1)
                    && board.getSquare(targetCoordinates).piece
                    && board.getSquare(targetCoordinates).piece?.color === PlayerColor.WHITE){
                    metaData.halfMoveClock = 0;
                    metaData.enPassantCoordinates = undefined;
                    return {
                        valid: true,
                        instructions: [
                            {
                                coordinates : targetCoordinates,
                                piece : targetCoordinates.row === 0 ? new Queen(originSquare.piece.color) : //When on opposite Backrank promote to Queen
                                    PieceFactory.createPiece(originSquare.piece.fen())
                            },
                            {
                                coordinates : originCoordinates,
                                piece : undefined
                            }],
                        metaDataChange: metaData
                    }
                }

                return {valid : false, instructions : [], metaDataChange : undefined};
            }),
            //Black EnPassant
            RuleBuilder.custom((board: ChessBoard, originCoordinates: Coordinates, targetCoordinates: Coordinates) => {
                const originSquare = board.getSquare(originCoordinates);
                if (!originSquare.piece || originSquare.piece.color !== PlayerColor.BLACK){
                    return {valid : false, instructions : [], metaDataChange : undefined};
                }
                const metaData = board.metaData;
                if(metaData.enPassantCoordinates &&
                    targetCoordinates.row === originCoordinates.row - 1
                    && (targetCoordinates.col === originCoordinates.col + 1 ||
                        targetCoordinates.col === originCoordinates.col - 1)
                    && targetCoordinates.row === metaData.enPassantCoordinates.row
                    && targetCoordinates.col === metaData.enPassantCoordinates.col){
                    metaData.halfMoveClock = 0;
                    const enPassantCoordinates = {
                        row: metaData.enPassantCoordinates.row + 1,
                        col: metaData.enPassantCoordinates.col
                    }
                    metaData.enPassantCoordinates = undefined;
                    return {
                        valid: true,
                        instructions: [
                            {
                                coordinates : targetCoordinates,
                                piece : PieceFactory.createPiece(originSquare.piece.fen())
                            },
                            {
                                coordinates : originCoordinates,
                                piece : undefined
                            },
                            {
                                coordinates: enPassantCoordinates,
                                piece: undefined
                            }
                        ],
                        metaDataChange: metaData
                    }
                }
                return {valid : false, instructions : [], metaDataChange : undefined} ;
            }),

        ];
        super(color, rules);
    }

    fen(): string {
        return this.color === PlayerColor.WHITE ? "P" : "p";
    }
    printable(): string {
        return this.color === PlayerColor.WHITE ? "WP" : "bp";
    }
}

/**
 * A King.
 */
class King extends Piece{
    constructor(color : PlayerColor) {
        const rules = [
            RuleBuilder.up().left().build(),
            RuleBuilder.up().right().build(),
            RuleBuilder.down().left().build(),
            RuleBuilder.down().right().build(),
            RuleBuilder.up().build(),
            RuleBuilder.down().build(),
            RuleBuilder.left().build(),
            RuleBuilder.right().build(),

            //White King-side castle
            RuleBuilder.custom((board: ChessBoard, originCoordinates: Coordinates, targetCoordinates: Coordinates) => {
                const originSquare = board.getSquare(originCoordinates);
                if (!originSquare.piece || originSquare.piece.color !== PlayerColor.WHITE){
                    return {valid : false, instructions : [], metaDataChange : undefined};
                }
                const metaData = board.metaData;
                if(metaData.whiteKingSideCastle
                    && originCoordinates.row === 0  //King is on the backrank
                    && targetCoordinates.row === 0
                    && targetCoordinates.col === 1  //King moves two squares to the right
                    && originCoordinates.col === 3  //King is on the e-file
                    && !board.getSquare({row : 0, col : 1}).piece  //No pieces blocking
                    && !board.getSquare({row : 0, col : 2}).piece
                    && !board.isSquareAttacked({row : 0, col : 3}, PlayerColor.BLACK) //No squares attacked so king does not get checked
                    && !board.isSquareAttacked({row : 0, col : 2}, PlayerColor.BLACK)){
                    metaData.halfMoveClock = 0;
                    metaData.enPassantCoordinates = undefined;
                    metaData.whiteKingSideCastle = false;
                    metaData.whiteQueenSideCastle = false;
                    return {
                        valid: true,
                        instructions: [
                            {
                                coordinates : targetCoordinates,
                                piece : PieceFactory.createPiece(originSquare.piece.fen())
                            },
                            {
                                coordinates : {row : 0, col : 2},
                                piece : new Rook(originSquare.piece.color)
                            },
                            {
                                coordinates : originCoordinates,
                                piece : undefined
                            },
                            {
                                coordinates : {row : 0, col : 0},
                                piece : undefined
                            }],
                        metaDataChange: metaData
                    }
                }
                return {valid : false, instructions : [], metaDataChange : undefined} ;
            }),
            //White Queen-side castle
            RuleBuilder.custom((board: ChessBoard, originCoordinates: Coordinates, targetCoordinates: Coordinates) => {
                const originSquare = board.getSquare(originCoordinates);
                if (!originSquare.piece || originSquare.piece.color !== PlayerColor.WHITE){
                    return {valid : false, instructions : [], metaDataChange : undefined};
                }
                const metaData = board.metaData;
                if(metaData.whiteQueenSideCastle
                    && originCoordinates.row === 0 //King is on the backrank
                    && targetCoordinates.row === 0
                    && targetCoordinates.col === 5 //King moves two squares to the left
                    && originCoordinates.col === 3
                    && !board.getSquare({row : 0, col : 6}).piece //No pieces blocking
                    && !board.getSquare({row : 0, col : 5}).piece
                    && !board.getSquare({row : 0, col : 4}).piece
                    && !board.isSquareAttacked({row : 0, col : 3}, PlayerColor.BLACK) //No squares attacked so king does not get checked
                    && !board.isSquareAttacked({row : 0, col : 4}, PlayerColor.BLACK)){
                    metaData.halfMoveClock = 0;
                    metaData.enPassantCoordinates = undefined;
                    metaData.whiteKingSideCastle = false;
                    metaData.whiteQueenSideCastle = false;
                    return {
                        valid: true,
                        instructions: [
                            {
                                coordinates : targetCoordinates,
                                piece : PieceFactory.createPiece(originSquare.piece.fen())
                            },
                            {
                                coordinates : {row : 0, col : 4},
                                piece : new Rook(originSquare.piece.color)
                            },
                            {
                                coordinates : originCoordinates,
                                piece : undefined
                            },
                            {
                                coordinates : {row : 0, col : 7},
                                piece : undefined
                            }],
                        metaDataChange: metaData
                    }
                }
                return {valid : false, instructions : [], metaDataChange : undefined} ;
            }),
            //Black King-side castle
            RuleBuilder.custom((board: ChessBoard, originCoordinates: Coordinates, targetCoordinates: Coordinates) => {
                const originSquare = board.getSquare(originCoordinates);
                if (!originSquare.piece || originSquare.piece.color !== PlayerColor.BLACK){
                    return {valid : false, instructions : [], metaDataChange : undefined};
                }
                const metaData = board.metaData;
                if(metaData.blackKingSideCastle
                    && originCoordinates.row === 7 //King is on the backrank
                    && targetCoordinates.row === 7
                    && targetCoordinates.col === 1 //King moves two squares to the right
                    && originCoordinates.col === 3
                    && !board.getSquare({row : 7, col : 1}).piece //No pieces blocking
                    && !board.getSquare({row : 7, col : 2}).piece
                    && !board.isSquareAttacked({row : 7, col : 3}, PlayerColor.WHITE) //No squares attacked so king does not get checked
                    && !board.isSquareAttacked({row : 7, col : 2}, PlayerColor.WHITE)){
                    metaData.halfMoveClock = 0;
                    metaData.enPassantCoordinates = undefined;
                    metaData.blackKingSideCastle = false;
                    metaData.blackQueenSideCastle = false;
                    return {
                        valid: true,
                        instructions: [
                            {
                                coordinates : targetCoordinates,
                                piece : PieceFactory.createPiece(originSquare.piece.fen())
                            },
                            {
                                coordinates : {row : 7, col : 2},
                                piece : new Rook(originSquare.piece.color)
                            },
                            {
                                coordinates : originCoordinates,
                                piece : undefined
                            },
                            {
                                coordinates : {row : 7, col : 0},
                                piece : undefined
                            }],
                        metaDataChange: metaData
                    }
                }


                return {valid : false, instructions : [], metaDataChange : undefined} ;
            }),
            //Black Queen-side castle
            RuleBuilder.custom((board: ChessBoard, originCoordinates: Coordinates, targetCoordinates: Coordinates) => {
                const originSquare = board.getSquare(originCoordinates);
                if (!originSquare.piece || originSquare.piece.color !== PlayerColor.BLACK){
                    return {valid : false, instructions : [], metaDataChange : undefined};
                }
                const metaData = board.metaData;
                if(metaData.blackQueenSideCastle
                    && originCoordinates.row === 7 //King is on the backrank
                    && targetCoordinates.row === 7
                    && targetCoordinates.col === 5 //King moves two squares to the left
                    && originCoordinates.col === 3
                    && !board.getSquare({row : 7, col : 6}).piece //No pieces blocking
                    && !board.getSquare({row : 7, col : 5}).piece
                    && !board.getSquare({row : 7, col : 4}).piece
                    && !board.isSquareAttacked({row : 7, col : 3}, PlayerColor.WHITE) //No squares attacked so king does not get checked
                    && !board.isSquareAttacked({row : 7, col : 4}, PlayerColor.WHITE)){
                    metaData.halfMoveClock = 0;
                    metaData.enPassantCoordinates = undefined;
                    metaData.blackKingSideCastle = false;
                    metaData.blackQueenSideCastle = false;
                    return {
                        valid: true,
                        instructions: [
                            {
                                coordinates : targetCoordinates,
                                piece : PieceFactory.createPiece(originSquare.piece.fen())
                            },
                            {
                                coordinates : {row : 7, col : 4},
                                piece : new Rook(originSquare.piece.color)
                            },
                            {
                                coordinates : originCoordinates,
                                piece : undefined
                            },
                            {
                                coordinates : {row : 7, col : 7},
                                piece : undefined
                            }],
                        metaDataChange: metaData
                    }
                }
                return {valid : false, instructions : [], metaDataChange : undefined} ;
            }),
        ];
        super(color, rules);
    }
    fen(): string {
        return this.color === PlayerColor.WHITE ? "K" : "k";
    }
    printable(): string {
        return this.color === PlayerColor.WHITE ? "WK" : "bk";
    }
}

/**
 * PieceFactory is a factory class for creating pieces, that exist in the game of chess by their
 * fen notation.
 */
class PieceFactory{

    /**
     * Creates a piece based on the shortFenNotation and location
     * @param shortFen the shortFenNotation of the piece
     * @returns the created piece
     */
    static createPiece(shortFen : string) : Piece{
        switch (shortFen) {
            case 'p':
                return new Pawn(PlayerColor.BLACK);
            case 'P':
                return new Pawn(PlayerColor.WHITE);
            case 'n':
                return new Knight(PlayerColor.BLACK);
            case 'N':
                return new Knight(PlayerColor.WHITE);
            case 'b':
                return new Bishop(PlayerColor.BLACK);
            case 'B':
                return new Bishop(PlayerColor.WHITE);
            case 'r':
                return new Rook(PlayerColor.BLACK);
            case 'R':
                return new Rook(PlayerColor.WHITE);
            case 'q':
                return new Queen(PlayerColor.BLACK);
            case 'Q':
                return new Queen(PlayerColor.WHITE);
            case 'k':
                return new King(PlayerColor.BLACK);
            case 'K':
                return new King(PlayerColor.WHITE);
            default:
                throw new Error("Invalid shortFenNotation");
        }
    }
}

export default Piece;
export {Pawn, Rook, Knight, Bishop, Queen, King, PieceFactory};