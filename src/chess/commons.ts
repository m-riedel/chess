/**
 * Coordinates interface for chessboard
 */
export interface Coordinates {
    row: number;
    col: number;
}

/**
 * PlayerColor enum. All possible player colors are stored here.
 */
export enum PlayerColor {
    WHITE, BLACK
}

/**
 * ChessMetaData interface. All necessary information about the game is stored here such as if an en passant move is possible, if castling is possible, etc.
 */
export interface ChessMetaData {
    enPassantCoordinates: Coordinates | undefined;
    whiteKingSideCastle: boolean;
    whiteQueenSideCastle: boolean;
    blackKingSideCastle: boolean;
    blackQueenSideCastle: boolean;
    halfMoveClock: number;
    fullMoveClock: number;
    currentPlayer: PlayerColor;
    status: ChessGameStatus;
}

/**
 * ChessGameStatus enum. All possible game statuses are stored here.
 */
export enum ChessGameStatus {
    ONGOING, WHITE_WON, BLACK_WON, STALEMATE, INSUFFICIENT_MATERIAL, FIFTY_MOVE_RULE, THREEFOLD_REPETITION
}

/**
 * Printable signifies that an object can be printed to the console using the printable() method.
 */
export interface Printable {
    printable(): string;
}

/**
 * Fen signifies that an object can be converted to a FEN string using the fen() method.
 */
export interface Fen {
    fen(): string;
}