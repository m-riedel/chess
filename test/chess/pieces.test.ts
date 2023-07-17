import Piece, {Bishop, King, Knight, Pawn, PieceFactory, Queen, Rook} from "../../src/chess/pieces";
import {Rule} from "../../src/chess/rule";
import {PlayerColor} from "../../src/chess/commons";

export class TestPiece extends Piece{
    constructor(color : PlayerColor,  rules : Rule[]) {
        super(color, rules);
    }
    fen(): string {
        return "test";
    }
    printable(): string {
        return "test";
    }
}

describe('Rules of Pieces', () => {
    it('should have 4 Rules for Rook',  () => {
        const rook = new Rook(PlayerColor.WHITE);
        expect(rook.rules.length).toBe(4);
    });
    it('should have 12 Rules for King',  () => {
        const king = new King(PlayerColor.WHITE);
        expect(king.rules.length).toBe(12);
    });
    it('should have 8 Rules for Queen',  () => {
        const queen = new Queen(PlayerColor.WHITE);
        expect(queen.rules.length).toBe(8);
    });
    it('should have 4 Rules for Bishop',  () => {
        const bishop = new Bishop(PlayerColor.WHITE);
        expect(bishop.rules.length).toBe(4);
    });
    it('should have 8 Rules for Knight',  () => {
        const knight = new Knight(PlayerColor.WHITE);
        expect(knight.rules.length).toBe(8);
    });
    it('should have 8 Rules for Pawn',  () => {
        const pawn = new Pawn(PlayerColor.WHITE);
        expect(pawn.rules.length).toBe(8);
    });
});

describe('PieceFactory', () => {
    it('should return a White Pawn for "P"', () =>  {
        const res = PieceFactory.createPiece('P');
        expect(res).toBeInstanceOf(Pawn);
        expect(res.color).toBe(PlayerColor.WHITE);
    });
    it('should return a Black Pawn for "p"', () =>  {
        const res = PieceFactory.createPiece('p');
        expect(res).toBeInstanceOf(Pawn);
        expect(res.color).toBe(PlayerColor.BLACK);
    });
    it('should return a White Knight for "N"', () =>  {
        const res = PieceFactory.createPiece('N');
        expect(res).toBeInstanceOf(Knight);
        expect(res.color).toBe(PlayerColor.WHITE);
    });
    it('should return a Black Knight for "n"', () =>  {
        const res = PieceFactory.createPiece('n');
        expect(res).toBeInstanceOf(Knight);
        expect(res.color).toBe(PlayerColor.BLACK);
    });
    it('should return a White Bishop for "B"', () =>  {
        const res = PieceFactory.createPiece('B');
        expect(res).toBeInstanceOf(Bishop);
        expect(res.color).toBe(PlayerColor.WHITE);
    });
    it('should return a Black Bishop for "b"', () =>  {
        const res = PieceFactory.createPiece('b');
        expect(res).toBeInstanceOf(Bishop);
        expect(res.color).toBe(PlayerColor.BLACK);
    });
    it('should return a White Rook for "R"', () =>  {
        const res = PieceFactory.createPiece('R');
        expect(res).toBeInstanceOf(Rook);
        expect(res.color).toBe(PlayerColor.WHITE);
    });
    it('should return a Black Rook for "r"', () =>  {
        const res = PieceFactory.createPiece('r');
        expect(res).toBeInstanceOf(Rook);
        expect(res.color).toBe(PlayerColor.BLACK);
    });
    it('should return a White Queen for "Q"', () =>  {
        const res = PieceFactory.createPiece('Q');
        expect(res).toBeInstanceOf(Queen);
        expect(res.color).toBe(PlayerColor.WHITE);
    });
    it('should return a Black Queen for "q"', () =>  {
        const res = PieceFactory.createPiece('q');
        expect(res).toBeInstanceOf(Queen);
        expect(res.color).toBe(PlayerColor.BLACK);
    });
    it('should return a White King for "K"', () =>  {
        const res = PieceFactory.createPiece('K');
        expect(res).toBeInstanceOf(King);
        expect(res.color).toBe(PlayerColor.WHITE);
    });
    it('should return a Black King for "k"', () =>  {
        const res = PieceFactory.createPiece('k');
        expect(res).toBeInstanceOf(King);
        expect(res.color).toBe(PlayerColor.BLACK);
    });
    it('should throw an error for an invalid piece', () =>  {
        expect(() => PieceFactory.createPiece('x')).toThrowError();
    });
});