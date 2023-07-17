import ChessBoard from "../../src/chess/chessboard";
import Chessboard, {CreationOption} from "../../src/chess/chessboard";
import {Bishop, King, Knight, Pawn, Queen, Rook} from "../../src/chess/pieces";

import {ChessGameStatus, PlayerColor} from "../../src/chess/commons";


const colors = [PlayerColor.WHITE, PlayerColor.BLACK]

function getOppositeColor(color : PlayerColor) : PlayerColor {
    return color === PlayerColor.WHITE ? PlayerColor.BLACK : PlayerColor.WHITE;
}

describe('Chessboard Castling', () =>{
    const fen = 'r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1';
    const originWhiteKing = {row: 0, col: 3};
    const targetWhiteKingSide = {row: 0, col: 1};
    const targetWhiteQueenSide = {row: 0, col: 5};
    const originBlackKing = {row: 7, col: 3};
    const targetBlackKingSide = {row: 7, col: 1};
    const targetBlackQueenSide = {row: 7, col: 5};
    let board : ChessBoard = ChessBoard.create(CreationOption.FEN, fen);
    beforeEach(() => {
        board = ChessBoard.create(CreationOption.FEN, fen);
    });
    it('should be possible to castle white kingside and black queenside', () => {
        board.move(originWhiteKing, targetWhiteKingSide);
        expect(board.getPiece({row: 0, col: 2})).toBeInstanceOf(Rook);
        expect(board.getPiece(targetWhiteKingSide)).toBeInstanceOf(King);
        expect(board.getPiece(originWhiteKing)).toBeUndefined();
        expect(board.getPiece({row: 0, col: 0})).toBeUndefined();

        //BLack kingside not possible due to check
        expect(() => board.move(originBlackKing, targetBlackKingSide)).toThrow();
        //Black queenside possible
        board.move(originBlackKing, targetBlackQueenSide);
        expect(board.getPiece({row: 7, col: 4})).toBeInstanceOf(Rook);
        expect(board.getPiece(targetBlackQueenSide)).toBeInstanceOf(King);
        expect(board.getPiece(originBlackKing)).toBeUndefined();
        expect(board.getPiece({row: 7, col: 6})).toBeUndefined();
        expect(board.getPiece({row: 7, col: 7})).toBeUndefined();
    });

    it('should be possible to castle white queenside and black kingside', () => {
        board.move(originWhiteKing, targetWhiteQueenSide);
        expect(board.getPiece({row: 0, col: 4})).toBeInstanceOf(Rook);
        expect(board.getPiece(targetWhiteQueenSide)).toBeInstanceOf(King);
        expect(board.getPiece(originWhiteKing)).toBeUndefined();
        expect(board.getPiece({row: 0, col: 7})).toBeUndefined();
        expect(board.getPiece({row: 0, col: 6})).toBeUndefined();
        //BLack queenside not possible due to check
        expect(() => board.move(originBlackKing, targetBlackQueenSide)).toThrow();
        //Black kingside possible
        board.move(originBlackKing, targetBlackKingSide);
        expect(board.getPiece({row: 7, col: 2})).toBeInstanceOf(Rook);
        expect(board.getPiece(targetBlackKingSide)).toBeInstanceOf(King);
        expect(board.getPiece(originBlackKing)).toBeUndefined();
        expect(board.getPiece({row: 7, col: 0})).toBeUndefined();
    });
    it('should not be possible to castle when king has moved', () => {
        board.move(originWhiteKing, {row: 1, col: 3});
        expect(board.metaData.whiteKingSideCastle).toBeFalsy();
        expect(board.metaData.whiteQueenSideCastle).toBeFalsy();
        board.move(originBlackKing, {row: 6, col: 3});
        expect(board.metaData.blackKingSideCastle).toBeFalsy();
        expect(board.metaData.blackQueenSideCastle).toBeFalsy();
        //Move king back
        board.move({row: 1, col: 3}, originWhiteKing);
        board.move({row: 6, col: 3}, originBlackKing);
        expect(board.metaData.whiteKingSideCastle).toBeFalsy();
        expect(board.metaData.whiteQueenSideCastle).toBeFalsy();
        expect(board.metaData.blackKingSideCastle).toBeFalsy();
        expect(board.metaData.blackQueenSideCastle).toBeFalsy();
        // Cannot castle after king has moved
        expect(() => board.move(originWhiteKing, targetWhiteKingSide)).toThrow();
        expect(() => board.move(originWhiteKing, targetWhiteQueenSide)).toThrow();
        //Intermediary move so that it is blacks turn
        board.move(originWhiteKing, {row: 1, col: 3});
        expect(() => board.move(originBlackKing, targetBlackKingSide)).toThrow();
        expect(() => board.move(originBlackKing, targetBlackQueenSide)).toThrow();
    });
    it('should not be possible to castle when in check for white', () => {
        const blackQueen = new Queen(PlayerColor.BLACK);
        board.addPiece(blackQueen, {row:  3, col : 3})
        expect(board.isCheck()).toBeTruthy();
        expect(() => board.move(originWhiteKing, targetWhiteKingSide)).toThrow();
        expect(() => board.move(originWhiteKing, targetWhiteQueenSide)).toThrow();
    });
    it('should not be possible to castle when in check for black', () => {
        const blackQueen = new Queen(PlayerColor.WHITE);
        board.addPiece(blackQueen, {row:  3, col : 3})
        //Intermediate white move so that its black turn
        board.move(originWhiteKing, {row: 1, col: 3});
        // Black should not be able to castle since its in check
        expect(board.isCheck()).toBeTruthy();
        expect(() => board.move(originBlackKing, targetBlackKingSide)).toThrow();
        expect(() => board.move(originBlackKing, targetBlackQueenSide)).toThrow();
    });
});

describe('Chesboard Pawn', () =>{
    let board : ChessBoard = ChessBoard.create(CreationOption.EMPTY);
    beforeEach(() => {
        board = ChessBoard.create(CreationOption.EMPTY);
        const whiteKing = new King(PlayerColor.WHITE);
        const blackKing = new King(PlayerColor.BLACK);
        board.addPiece(whiteKing, {row: 0, col: 4});
        board.addPiece(blackKing, {row: 7, col: 4});
    });
    it('should be possible to move pawn two steps forward on first move', () => {
        const origin = {row: 1, col: 0};
        const target = {row: 3, col: 0};
        board.addPiece(new Pawn(PlayerColor.WHITE), origin);
        board.move(origin, target);
        expect(board.getPiece(target)).toBeInstanceOf(Pawn);
        expect(board.getPiece(origin)).toBeUndefined();
        expect(board.metaData.enPassantCoordinates).toBeDefined();
        expect(board.metaData.enPassantCoordinates).toEqual({row: 2, col: 0});
    });
    it('should be possible to move pawn one step forward', () => {
        const origin = {row: 1, col: 0};
        const target = {row: 2, col: 0};
        board.addPiece(new Pawn(PlayerColor.WHITE), origin);
        board.move(origin, target);
        expect(board.getPiece(target)).toBeInstanceOf(Pawn);
        expect(board.getPiece(origin)).toBeUndefined();
        expect(board.metaData.enPassantCoordinates).toBeUndefined();
    });
    it('should not be possible to move pawn two steps forward on second move', () => {
        const origin = {row: 2, col: 0};
        const target = {row: 4, col: 0};
        board.addPiece(new Pawn(PlayerColor.WHITE), origin);
        expect(() => board.move(origin, target)).toThrow();
        expect(board.getPiece(target)).toBeUndefined();
        expect(board.getPiece(origin)).toBeInstanceOf(Pawn);
        expect(board.metaData.enPassantCoordinates).toBeUndefined();
    });
    it('should not be possible to move pawn two steps forward when blocked', () => {
        const origin = {row: 1, col: 0};
        const target = {row: 3, col: 0};
        board.addPiece(new Pawn(PlayerColor.WHITE), origin);
        board.addPiece(new Pawn(PlayerColor.BLACK), {row: 2, col: 0});
        expect(() => board.move(origin, target)).toThrow();
        expect(board.getPiece(target)).toBeUndefined();
        expect(board.getPiece(origin)).toBeInstanceOf(Pawn);
        expect(board.metaData.enPassantCoordinates).toBeUndefined();
    });
    it('should not be possible to move pawn one step forward when blocked', () => {
        const origin = {row: 1, col: 0};
        const target = {row: 2, col: 0};
        board.addPiece(new Pawn(PlayerColor.WHITE), origin);
        board.addPiece(new Pawn(PlayerColor.BLACK), target);
        expect(() => board.move(origin, target)).toThrow();
        expect(board.getPiece(target)).toBeInstanceOf(Pawn);
        expect(board.getPiece(origin)).toBeInstanceOf(Pawn);
        expect(board.metaData.enPassantCoordinates).toBeUndefined();
    });
    it('should be possible to move enpassent as white', () => {
        const fen = 'rnbqkbnr/ppp1pppp/8/3pP3/8/8/PPPP1PPP/RNBQKBNR w KQkq d6 0 2';
        board = ChessBoard.create(CreationOption.FEN, fen);
        const origin = {row: 4, col: 3};
        const target = {row: 5, col: 4};
        expect(board.getPiece(origin)).toBeInstanceOf(Pawn);
        expect(board.getPiece(target)).toBeUndefined();
        expect(board.metaData.enPassantCoordinates).toEqual(target);
        board.move(origin, target);
        expect(board.getPiece(target)).toBeInstanceOf(Pawn);
        expect(board.getPiece(origin)).toBeUndefined();
        expect(board.getPiece({row: 4, col: 4})).toBeUndefined();
        expect(board.metaData.enPassantCoordinates).toBeUndefined();
    });
    it('should be possible to move enpassent as black', () => {
        const fen = 'rnbqkbnr/pppp1ppp/8/8/3Pp3/8/PPP1PPPP/RNBQKBNR b KQkq d3 0 1';
        board = ChessBoard.create(CreationOption.FEN, fen);
        const origin = {row: 3, col: 3};
        const target = {row: 2, col: 4};
        expect(board.getPiece(origin)).toBeInstanceOf(Pawn);
        expect(board.getPiece(target)).toBeUndefined();
        expect(board.metaData.enPassantCoordinates).toEqual(target);
        board.move(origin, target);
        expect(board.getPiece(target)).toBeInstanceOf(Pawn);
        expect(board.getPiece(origin)).toBeUndefined();
        expect(board.getPiece({row: 3, col: 4})).toBeUndefined();
        expect(board.metaData.enPassantCoordinates).toBeUndefined();
    });
    it('should not be possible to move enpassent when not set as white', () => {
        const fen = 'rnbqkbnr/ppp1pppp/8/3pP3/8/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2';
        board = ChessBoard.create(CreationOption.FEN, fen);
        const origin = {row: 4, col: 3};
        const target = {row: 5, col: 4};
        expect(board.getPiece(origin)).toBeInstanceOf(Pawn);
        expect(board.getPiece(target)).toBeUndefined();
        expect(board.metaData.enPassantCoordinates).toBeUndefined();
        expect(() => board.move(origin, target)).toThrow();
    });
    it('should not be possible to move enpassent when not set as black', () => {
        const fen = 'rnbqkbnr/pppp1ppp/8/8/3Pp3/8/PPP1PPPP/RNBQKBNR b KQkq - 0 1';
        board = ChessBoard.create(CreationOption.FEN, fen);
        const origin = {row: 3, col: 3};
        const target = {row: 2, col: 4};
        expect(board.getPiece(origin)).toBeInstanceOf(Pawn);
        expect(board.getPiece(target)).toBeUndefined();
        expect(board.metaData.enPassantCoordinates).toBeUndefined();
        expect(() => board.move(origin, target)).toThrow();
    });
});

describe('Chessboard Move', () => {
    let board : ChessBoard = ChessBoard.create(CreationOption.EMPTY);
    beforeEach(() => {
        board = ChessBoard.create(CreationOption.EMPTY);
        const whiteKing = new King(PlayerColor.WHITE);
        const blackKing = new King(PlayerColor.BLACK);
        board.addPiece(whiteKing, {row: 0, col: 4});
        board.addPiece(blackKing, {row: 7, col: 4});
    });
    it('should throw when origin is out of bounds', () => {
        const originRowOutOfBounds = {row: -1, col: 0};
        const originColOutOfBounds = {row: 0, col: -1};
        const target = {row: 0, col: 0};
        expect(() => board.move(originRowOutOfBounds, target)).toThrow();
        expect(() => board.move(originColOutOfBounds, target)).toThrow();
    });
    it('should throw when target is out of bounds', () => {
        const origin = {row: 0, col: 0};
        const targetRowOutOfBounds = {row: -1, col: 0};
        const targetColOutOfBounds = {row: 0, col: -1};
        expect(() => board.move(origin, targetRowOutOfBounds)).toThrow();
        expect(() => board.move(origin, targetColOutOfBounds)).toThrow();
    });
    it('should throw when origin is empty', () => {
        const origin = {row: 0, col: 0};
        const target = {row: 1, col: 1};
        expect(() => board.move(origin, target)).toThrow();
    });
    it('should throw when the wrong player plays', () => {
        const origin = {row: 0, col: 0};
        const target = {row: 1, col: 1};
        const piece = new Pawn(PlayerColor.BLACK);
        board.addPiece(piece, origin);
        expect(() => board.move(origin, target)).toThrow();
    });
    it('should throw when the target is occupied by a piece of the same color', () => {
        const origin = {row: 0, col: 0};
        const target = {row: 1, col: 1};
        const piece = new Pawn(PlayerColor.WHITE);
        board.addPiece(piece, origin);
        const piece2 = new Pawn(PlayerColor.WHITE);
        board.addPiece(piece2, target);
        expect(() => board.move(origin, target)).toThrow();
    });
    it('should throw when the move is not valid', () => {
        const origin = {row: 0, col: 0};
        const target = {row: 1, col: 1};
        const piece = new Pawn(PlayerColor.WHITE);
        board.addPiece(piece, origin);
        expect(() => board.move(origin, target)).toThrow();
    });
    it('should move the piece when the move is valid', () => {
        const origin = {row: 1, col: 0};
        const piece = new Pawn(PlayerColor.WHITE);
        board.addPiece(piece, origin);
        const validTarget = {row: 2, col: 0};
        board.move(origin, validTarget);
        expect(board.getPiece(origin)).toBeUndefined();
        expect(board.getPiece(validTarget)).toBeInstanceOf(Pawn);
    });
    it('should throw when the move is valid but the king is in check', () => {
        const blackQueenPosition = {row: 0, col: 0};
        const blackQueen = new Queen(PlayerColor.BLACK);
        board.addPiece(blackQueen, blackQueenPosition);

        const whitePawnPosition = {row: 1, col: 0};
        const whitePawn = new Pawn(PlayerColor.WHITE);
        board.addPiece(whitePawn, whitePawnPosition);
        expect(() => board.move(whitePawnPosition, {row: 2, col: 0})).toThrow();
    });
})

describe('Chessboard End Conditions', () => {
    it('should return false when the game is not over', () => {
        const board = ChessBoard.create(CreationOption.DEFAULT);
        expect(board.isGameOver()).toBeFalsy();
    });
    it('should return true when insufficient Material is on the board', () => {
        const oneKnightFen = '2k5/8/8/8/8/8/5N2/1K6 w - - 0 1';
        const board = ChessBoard.create(CreationOption.FEN, oneKnightFen);
        expect(board.isGameOver()).toBeTruthy();
        expect(() => board.move({row: 6, col: 5}, {row: 7, col: 7})).toThrow("Game is over");
        const twoSameBishopsFen = '2k1b3/8/8/8/8/8/8/1K3B2 w - - 0 1';
        const board2 = ChessBoard.create(CreationOption.FEN, twoSameBishopsFen);
        expect(board2.isGameOver()).toBeTruthy();
        expect(() => board.move({row: 6, col: 5}, {row: 7, col: 7})).toThrow("Game is over");
        const twoKingFen = '2k5/8/8/8/8/8/8/1K6 w - - 0 1';
        const board3 = ChessBoard.create(CreationOption.FEN, twoKingFen);
        expect(board3.isGameOver()).toBeTruthy();
        expect(() => board.move({row: 6, col: 5}, {row: 7, col: 7})).toThrow("Game is over");
        const twoDifferentBishopFen = '2kb4/8/8/8/8/8/8/1K3B2 w - - 0 1';
        const board4 = ChessBoard.create(CreationOption.FEN, twoDifferentBishopFen);
        expect(board4.isGameOver()).toBeFalsy();
    });
    it('should return true when the king is in checkmate', () => {
        const checkmateFen = 'r1b1qb1r/2B1p1pp/p1p2p1n/k4P2/2B1P3/1PP5/P5PP/2K4R b - - 1 21';
        const board = ChessBoard.create(CreationOption.FEN, checkmateFen);
        expect(board.hasNoLegalMoves(PlayerColor.BLACK)).toBeTruthy();
        expect(board.isGameOver()).toBeTruthy();
        expect(() => board.move({row: 6, col: 5}, {row: 7, col: 7})).toThrow("Game is over");
        expect(board.metaData.status).toBe(ChessGameStatus.WHITE_WON);
    });
    it('should return true when the king is in stalemate', () => {
        const stalemateFen = '2b1k3/p1pp4/5n2/7n/1r6/4K3/q7/1q3r2 w - - 4 47';
        const board = ChessBoard.create(CreationOption.FEN, stalemateFen);
        expect(board.hasNoLegalMoves(PlayerColor.WHITE)).toBeTruthy();
        expect(board.isGameOver()).toBeTruthy();
        expect(() => board.move({row: 6, col: 5}, {row: 7, col: 7})).toThrow("Game is over");
        expect(board.metaData.status).toBe(ChessGameStatus.STALEMATE);
    });
});

describe('Chessboard Creation', () => {
    it('should create empty board for empty creation option', () => {
        const board = ChessBoard.create(CreationOption.EMPTY);
        expect(board).toBeDefined();
        expect(board.board.length).toBe(8);
        expect(board.board[0].length).toBe(8);
        for(let row = 0; row < 8; row++) {
            for(let col = 0; col < 8; col++) {
                expect(board.board[row][col].piece).toBeUndefined();
            }
        }
        expect(board.fen()).toContain('8/8/8/8/8/8/8/8');
    });
    it('should return default starting board for default creation option', () => {
        const board = ChessBoard.create(CreationOption.DEFAULT);
        expect(board).toBeDefined();
        expect(board.board.length).toBe(8);
        expect(board.board[0].length).toBe(8);
        expect(board.fen()).toContain('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR');
    });
    it('should return correct board for creation option start from fen', () => {
        const fen = 'r1bqkb1r/pppppp1p/2n2np1/8/2P1P3/7P/PP1P1PP1/RNBQKBNR w KQkq - 0 4';
        const board = ChessBoard.create(CreationOption.FEN, fen);
        expect(board).toBeDefined();
        expect(board.board.length).toBe(8);
        expect(board.board[0].length).toBe(8);
        expect(board.fen()).toEqual(fen);
    });
    it('should throw error on missing fen for creation option fen', () => {
        expect(() => ChessBoard.create(CreationOption.FEN)).toThrow();
    });
    it('should throw error on invalid fen for creation option fen', () => {
        expect(() => ChessBoard.create(CreationOption.FEN, 'invalid fen')).toThrow();
    });
    it('should be overridden for load from fen', () => {
        const board = ChessBoard.create(CreationOption.DEFAULT);
        const fen = 'rnbqkbnr/pp1ppp1p/2p3p1/8/1P2PP2/8/P1PP2PP/RNBQKBNR b KQkq - 0 3';
        board.loadFen(fen);
        expect(board).toBeDefined();
        expect(board.board.length).toBe(8);
        expect(board.board[0].length).toBe(8);
        expect(board.fen()).toEqual(fen);
    })
});
describe('Chessboard board operations', () => {
    it('should remove piece', () => {
        const board = ChessBoard.create(CreationOption.DEFAULT);
        board.removePiece({row: 0, col: 0});
        expect(board.board[0][0].piece).toBeUndefined();
        expect(board.fen()).toContain('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBN1');
    });
    it('should add piece', () => {
        const board = ChessBoard.create(CreationOption.DEFAULT);
        board.addPiece(new Rook(PlayerColor.WHITE,), {row: 3, col: 3});
        expect(board.board[3][3].piece).toBeDefined();
        expect(board.fen()).toContain('rnbqkbnr/pppppppp/8/8/4R3/8/PPPPPPPP/RNBQKBNR');
    });
    it('should move piece', () => {
        const board = ChessBoard.create(CreationOption.DEFAULT);
        board.movePiece({row: 1, col: 3}, {row: 3, col: 3});
        expect(board.board[1][3].piece).toBeUndefined();
        expect(board.board[3][3].piece).toBeDefined();
        expect(board.fen()).toContain('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR');
    });
    it('should return correct piece', () => {
        const board = ChessBoard.create(CreationOption.DEFAULT);
        const pieceDef = board.getPiece({row: 0, col: 0});
        expect(pieceDef).toBeDefined();
        expect(pieceDef).toBeInstanceOf(Rook);
        const pieceUndef = board.getPiece({row: 3, col: 3});
        expect(pieceUndef).toBeUndefined();
    });
    it('should return correct square', () => {
        const board = ChessBoard.create(CreationOption.DEFAULT);
        const square = board.getSquare({row: 0, col: 0});
        expect(square).toBeDefined();
        expect(square.piece).toBeDefined();
        expect(square.piece).toBeInstanceOf(Rook);
    });
});

describe('Chessboard is square attacked', () => {
    let board = ChessBoard.create(CreationOption.EMPTY);
    beforeEach(() => {
        board = Chessboard.create(CreationOption.EMPTY);
    })
    it('should return correct answers for square attacked by queen', () => {
        for (let color of colors) {
            board.addPiece(new Queen(color), {row: 3, col: 3});
            expect(board.isSquareAttacked({row: 0, col: 3}, color)).toBeTruthy();
            expect(board.isSquareAttacked({row: 3, col: 0}, color)).toBeTruthy();
            expect(board.isSquareAttacked({row: 3, col: 7}, color)).toBeTruthy();
            expect(board.isSquareAttacked({row: 7, col: 3}, color)).toBeTruthy();
            expect(board.isSquareAttacked({row: 0, col: 0}, color)).toBeTruthy();
            expect(board.isSquareAttacked({row: 5, col: 5}, color)).toBeTruthy();
            expect(board.isSquareAttacked({row: 5, col: 4}, color)).toBeFalsy();
            board.addPiece(new Queen(getOppositeColor(color)), {row: 2, col: 2});
            expect(board.isSquareAttacked({row: 2, col: 2}, color)).toBeTruthy();
            expect(board.isSquareAttacked({row: 0, col: 0}, color)).toBeFalsy();
        }

    });
    it('should return correct answers for square attacked by rook', () => {
        for (let color of colors){
            board.addPiece(new Rook(color), {row: 3, col: 3});
            expect(board.isSquareAttacked({row: 0, col: 3}, color)).toBeTruthy();
            expect(board.isSquareAttacked({row: 3, col: 0}, color)).toBeTruthy();
            expect(board.isSquareAttacked({row: 3, col: 7}, color)).toBeTruthy();
            expect(board.isSquareAttacked({row: 7, col: 3}, color)).toBeTruthy();
            expect(board.isSquareAttacked({row: 0, col: 0}, color)).toBeFalsy();
            expect(board.isSquareAttacked({row: 5, col: 5}, color)).toBeFalsy();
            expect(board.isSquareAttacked({row: 5, col: 4}, color)).toBeFalsy();
            board.addPiece(new Rook(getOppositeColor(color)), {row: 3, col: 2});
            expect(board.isSquareAttacked({row: 3, col: 2}, color)).toBeTruthy();
            expect(board.isSquareAttacked({row: 0, col: 0}, color)).toBeFalsy();
        }

    });
    it('should return correct answers for square attacked by bishop', () => {
        for (let color of colors){
            board.addPiece(new Bishop(color), {row: 3, col: 3});
            expect(board.isSquareAttacked({row: 0, col: 3}, color)).toBeFalsy();
            expect(board.isSquareAttacked({row: 0, col: 0}, color)).toBeTruthy();
            board.addPiece(new Bishop(getOppositeColor(color)), {row: 2, col: 2});
            expect(board.isSquareAttacked({row: 2, col: 2}, color)).toBeTruthy();
            expect(board.isSquareAttacked({row: 0, col: 0}, color)).toBeFalsy();
        }
    });
    it('should return correct answers for square attacked by knight', () => {
        for (let color of colors){
            board.addPiece(new Knight(color), {row: 3, col: 3});
            expect(board.isSquareAttacked({row: 4, col: 5}, color)).toBeTruthy();
            expect(board.isSquareAttacked({row: 5, col: 4}, color)).toBeTruthy();
            expect(board.isSquareAttacked({row: 2, col: 2}, color)).toBeFalsy();
            expect(board.isSquareAttacked({row: 0, col: 0}, color)).toBeFalsy();
        }
    });
    it('should return correct answers for square attacked by king', () => {
        board.addPiece(new King(PlayerColor.WHITE), {row: 3, col: 3});
        expect(board.isSquareAttacked({row: 4, col: 2}, PlayerColor.WHITE)).toBeTruthy();
        expect(board.isSquareAttacked({row: 4, col: 3}, PlayerColor.WHITE)).toBeTruthy();
        expect(board.isSquareAttacked({row: 4, col: 4}, PlayerColor.WHITE)).toBeTruthy();
        expect(board.isSquareAttacked({row: 3, col: 2}, PlayerColor.WHITE)).toBeTruthy();
        expect(board.isSquareAttacked({row: 3, col: 4}, PlayerColor.WHITE)).toBeTruthy();
        expect(board.isSquareAttacked({row: 2, col: 2}, PlayerColor.WHITE)).toBeTruthy();
        expect(board.isSquareAttacked({row: 2, col: 3}, PlayerColor.WHITE)).toBeTruthy();
        expect(board.isSquareAttacked({row: 2, col: 4}, PlayerColor.WHITE)).toBeTruthy();
    });
})