import ChessBoard, {CreationOption} from "../../src/chess/chessboard";
import MoveValidator from "../../src/chess/validatior";
import {RuleBuilder} from "../../src/chess/rule";
import {TestPiece} from "./pieces.test";

import {PlayerColor} from "../../src/chess/commons";

describe('Validation', () => {
    let board = ChessBoard.create(CreationOption.EMPTY);
    beforeEach(() => {
        board = ChessBoard.create(CreationOption.EMPTY);
    });
    it('should throw error when no piece found at origin', () => {
        expect(() => MoveValidator.validateMove(board, {row: 0, col: 0}, {row: 1, col: 1})).toThrow();
    });
    it('should check all rules until one is valid', () => {
        const rules = [
            RuleBuilder.up(1).build(),
            RuleBuilder.down(1).build(),
        ];
        const piece = new TestPiece(PlayerColor.WHITE, rules);
        board.addPiece(piece, {row: 3, col: 3});
        const correctUp = MoveValidator.validateMove(board, {row: 3, col: 3}, {row: 4, col: 3});
        expect(correctUp.valid).toBe(true);
        const correctDown = MoveValidator.validateMove(board, {row: 3, col: 3}, {row: 2, col: 3});
        expect(correctDown.valid).toBe(true);
        const wrongLeft = MoveValidator.validateMove(board, {row: 3, col: 3}, {row: 3, col: 2});
        expect(wrongLeft.valid).toBe(false);
    });
    it('should throw error when origin and target are the same', () => {
        const rules = [
            RuleBuilder.up(1).build(),
            RuleBuilder.down(1).build(),
        ];
        const piece = new TestPiece(PlayerColor.WHITE, rules);
        board.addPiece(piece, {row: 3, col: 3});
        expect(() => MoveValidator.validateMove(board, {row: 3, col: 3}, {row: 3, col: 3})).toThrow();
    });
});