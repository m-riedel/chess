import {RuleBuilder} from "../../src/chess/rule";
import ChessBoard, {CreationOption} from "../../src/chess/chessboard";
import {TestPiece} from "./pieces.test";
import {PlayerColor} from "../../src/chess/commons";

describe('Repeted Rules', () => {
    let board = ChessBoard.create(CreationOption.EMPTY);
    beforeEach(() => {
        board = ChessBoard.create(CreationOption.EMPTY);
    });
    it('should throw when piece is not on board', () => {
        const rule = RuleBuilder.up().repeat().build();
        expect(() => rule.apply(board, {row: 0, col: 0}, {row: 1, col: 0})).toThrow();
    });
    it('should apply rule up', () => {
        const rule = RuleBuilder.up().repeat().build();
        const piece = new TestPiece(PlayerColor.WHITE, [rule]);
        const origin = {row: 3, col: 3};
        board.addPiece(piece, origin);
        for(let i = 4; i < 8; i++) {
            const correctRes = rule.apply(board, origin, {row : i, col : 3});
            expect(correctRes.valid).toBeTruthy();
            expect(correctRes.instructions.length).toBe(2);
            expect(correctRes.metaDataChange).toBeDefined();
        }

        const wrongRes = rule.apply(board, origin, {row : 2, col : 3});
        expect(wrongRes.valid).toBeFalsy();
        expect(wrongRes.instructions.length).toBe(0);
        expect(wrongRes.metaDataChange).toBeUndefined();
    });
    it('should apply rule down', () => {
        const rule = RuleBuilder.down().repeat().build();
        const piece = new TestPiece(PlayerColor.WHITE, [rule]);
        const origin = {row: 3, col: 3};
        board.addPiece(piece, origin);
        for(let i = 2; i >= 0; i--) {
            const correctRes = rule.apply(board, origin, {row : i, col : 3});
            expect(correctRes.valid).toBeTruthy();
            expect(correctRes.instructions.length).toBe(2);
            expect(correctRes.metaDataChange).toBeDefined();
        }
        const wrongRes = rule.apply(board, origin, {row : 4, col : 3});
        expect(wrongRes.valid).toBeFalsy();
        expect(wrongRes.instructions.length).toBe(0);
        expect(wrongRes.metaDataChange).toBeUndefined();
    });
    it('should apply rule left', () => {
        const rule = RuleBuilder.left().repeat().build();
        const piece = new TestPiece(PlayerColor.WHITE, [rule]);
        const origin = {row: 3, col: 3};
        board.addPiece(piece, origin);
        for(let i = 2; i >= 0; i--) {
            const correctRes = rule.apply(board, origin, {row : 3, col : i});
            expect(correctRes.valid).toBeTruthy();
            expect(correctRes.instructions.length).toBe(2);
            expect(correctRes.metaDataChange).toBeDefined();
        }
        const wrongRes = rule.apply(board, origin, {row : 3, col : 4});
        expect(wrongRes.valid).toBeFalsy();
        expect(wrongRes.instructions.length).toBe(0);
        expect(wrongRes.metaDataChange).toBeUndefined();
    });
    it('should apply rule right', () => {
        const rule = RuleBuilder.right().repeat().build();
        const piece = new TestPiece(PlayerColor.WHITE, [rule]);
        const origin = {row: 3, col: 3};
        board.addPiece(piece, origin);
        for(let i = 4; i < 8; i++) {
            const correctRes = rule.apply(board, origin, {row : 3, col : i});
            expect(correctRes.valid).toBeTruthy();
            expect(correctRes.instructions.length).toBe(2);
            expect(correctRes.metaDataChange).toBeDefined();
        }
        const wrongRes = rule.apply(board, origin, {row : 3, col : 2});
        expect(wrongRes.valid).toBeFalsy();
        expect(wrongRes.instructions.length).toBe(0);
        expect(wrongRes.metaDataChange).toBeUndefined();
    });
    it('should apply rule diagonally', () => {
        const rule = RuleBuilder.up().right().repeat().build();
        const piece = new TestPiece(PlayerColor.WHITE, [rule]);
        const origin = {row: 3, col: 3};
        board.addPiece(piece, origin);
        for(let i = 4; i < 4; i++) {
            console.log({row : origin.row + i, col : origin.col + i})
            const correctRes = rule.apply(board, origin,
                {row : origin.row + i, col : origin.col + i});
            expect(correctRes.valid).toBeTruthy();
            expect(correctRes.instructions.length).toBe(2);
            expect(correctRes.metaDataChange).toBeDefined();
        }
        const wrongRes = rule.apply(board, origin, {row : 2, col : 4});
        expect(wrongRes.valid).toBeFalsy();
        expect(wrongRes.instructions.length).toBe(0);
        expect(wrongRes.metaDataChange).toBeUndefined();
    });
});

describe('Non Repeted Rules', () => {
    let board = ChessBoard.create(CreationOption.EMPTY);
    beforeEach(() => {
        board = ChessBoard.create(CreationOption.EMPTY);
    });
    it('should throw when piece is not on board', () => {
        const rule = RuleBuilder.up().build();
        expect(() => rule.apply(board, {row: 0, col: 0}, {row: 1, col: 0})).toThrow();
    });
    it('should apply rule up', () => {
        const rule = RuleBuilder.up().build();
        const piece = new TestPiece(PlayerColor.WHITE, [rule]);
        const origin = {row: 3, col: 3};
        board.addPiece(piece, origin);
        const correctRes = rule.apply(board, origin, {row : 4, col : 3});
        expect(correctRes.valid).toBeTruthy();
        expect(correctRes.instructions.length).toBe(2);
        expect(correctRes.metaDataChange).toBeDefined();
        const wrongRes = rule.apply(board, origin, {row : 2, col : 3});
        expect(wrongRes.valid).toBeFalsy();
        expect(wrongRes.instructions.length).toBe(0);
        expect(wrongRes.metaDataChange).toBeUndefined();
    });
    it('should apply rule down', () => {
        const rule = RuleBuilder.down().build();
        const piece = new TestPiece(PlayerColor.WHITE, [rule]);
        const origin = {row: 3, col: 3};
        board.addPiece(piece, origin);
        const correctRes = rule.apply(board, origin, {row : 2, col : 3});
        expect(correctRes.valid).toBeTruthy();
        expect(correctRes.instructions.length).toBe(2);
        expect(correctRes.metaDataChange).toBeDefined();
        const wrongRes = rule.apply(board, origin, {row : 4, col : 3});
        expect(wrongRes.valid).toBeFalsy();
        expect(wrongRes.instructions.length).toBe(0);
        expect(wrongRes.metaDataChange).toBeUndefined();
    });
    it('should apply rule left', () => {
        const rule = RuleBuilder.left().build();
        const piece = new TestPiece(PlayerColor.WHITE, [rule]);
        const origin = {row: 3, col: 3};
        board.addPiece(piece, origin);
        const correctRes = rule.apply(board, origin, {row : 3, col : 2});
        expect(correctRes.valid).toBeTruthy();
        expect(correctRes.instructions.length).toBe(2);
        expect(correctRes.metaDataChange).toBeDefined();
        const wrongRes = rule.apply(board, origin, {row : 3, col : 4});
        expect(wrongRes.valid).toBeFalsy();
        expect(wrongRes.instructions.length).toBe(0);
        expect(wrongRes.metaDataChange).toBeUndefined();
    });
    it('should apply rule right', () => {
        const rule = RuleBuilder.right().build();
        const piece = new TestPiece(PlayerColor.WHITE, [rule]);
        const origin = {row: 3, col: 3};
        board.addPiece(piece, origin);
        const correctRes = rule.apply(board, origin, {row : 3, col : 4});
        expect(correctRes.valid).toBeTruthy();
        expect(correctRes.instructions.length).toBe(2);
        expect(correctRes.metaDataChange).toBeDefined();
        const wrongRes = rule.apply(board, origin, {row : 3, col : 2});
        expect(wrongRes.valid).toBeFalsy();
        expect(wrongRes.instructions.length).toBe(0);
        expect(wrongRes.metaDataChange).toBeUndefined();
    });
    it('should apply rule up left', () => {
        const rule = RuleBuilder.up().left().build();
        const piece = new TestPiece(PlayerColor.WHITE, [rule]);
        const origin = {row: 3, col: 3};
        board.addPiece(piece, origin);
        const correctRes = rule.apply(board, origin, {row : 4, col : 2});
        expect(correctRes.valid).toBeTruthy();
        expect(correctRes.instructions.length).toBe(2);
        expect(correctRes.metaDataChange).toBeDefined();
        const wrongRes = rule.apply(board, origin, {row : 2, col : 4});
        expect(wrongRes.valid).toBeFalsy();
        expect(wrongRes.instructions.length).toBe(0);
        expect(wrongRes.metaDataChange).toBeUndefined();
    });

});


describe('Rule Builder', () => {
    it ('should return correct rule for up', () => {
        const ruleUpOne = RuleBuilder.up().build();
        expect(ruleUpOne.squaresUp).toBe(1);
        expect(ruleUpOne.squaresDown).toBe(0);
        expect(ruleUpOne.squaresLeft).toBe(0);
        expect(ruleUpOne.squaresRight).toBe(0);
        expect(ruleUpOne.isRepetitive).toBeFalsy();
        const ruleUpTwo = RuleBuilder.down().up(2).build();
        expect(ruleUpTwo.squaresUp).toBe(2);
        expect(ruleUpTwo.squaresDown).toBe(0);
        expect(ruleUpTwo.squaresLeft).toBe(0);
        expect(ruleUpTwo.squaresRight).toBe(0);
        expect(ruleUpTwo.isRepetitive).toBeFalsy();
    });
    it ('should return correct rule for down', () => {
        const ruleDownOne = RuleBuilder.down().build();
        expect(ruleDownOne.squaresUp).toBe(0);
        expect(ruleDownOne.squaresDown).toBe(1);
        expect(ruleDownOne.squaresLeft).toBe(0);
        expect(ruleDownOne.squaresRight).toBe(0);
        expect(ruleDownOne.isRepetitive).toBeFalsy();
        const ruleDownTwo = RuleBuilder.up().down(2).build();
        expect(ruleDownTwo.squaresUp).toBe(0);
        expect(ruleDownTwo.squaresDown).toBe(2);
        expect(ruleDownTwo.squaresLeft).toBe(0);
        expect(ruleDownTwo.squaresRight).toBe(0);
        expect(ruleDownTwo.isRepetitive).toBeFalsy();
    });
    it ('should return correct rule for left', () => {
        const ruleLeftOne = RuleBuilder.left().build();
        expect(ruleLeftOne.squaresUp).toBe(0);
        expect(ruleLeftOne.squaresDown).toBe(0);
        expect(ruleLeftOne.squaresLeft).toBe(1);
        expect(ruleLeftOne.squaresRight).toBe(0);
        expect(ruleLeftOne.isRepetitive).toBeFalsy();
        const ruleLeftTwo = RuleBuilder.right().left(2).build();
        expect(ruleLeftTwo.squaresUp).toBe(0);
        expect(ruleLeftTwo.squaresDown).toBe(0);
        expect(ruleLeftTwo.squaresLeft).toBe(2);
        expect(ruleLeftTwo.squaresRight).toBe(0);
        expect(ruleLeftTwo.isRepetitive).toBeFalsy();
    });
    it ('should return correct rule for right', () => {
        const ruleRightOne = RuleBuilder.right().build();
        expect(ruleRightOne.squaresUp).toBe(0);
        expect(ruleRightOne.squaresDown).toBe(0);
        expect(ruleRightOne.squaresLeft).toBe(0);
        expect(ruleRightOne.squaresRight).toBe(1);
        expect(ruleRightOne.isRepetitive).toBeFalsy();
        const ruleRightTwo = RuleBuilder.left().right(2).build();
        expect(ruleRightTwo.squaresUp).toBe(0);
        expect(ruleRightTwo.squaresDown).toBe(0);
        expect(ruleRightTwo.squaresLeft).toBe(0);
        expect(ruleRightTwo.squaresRight).toBe(2);
        expect(ruleRightTwo.isRepetitive).toBeFalsy();
    });

    it ('should return correct rule for repetitive', () => {
        const ruleRepetitive = RuleBuilder.up().repeat().build();
        expect(ruleRepetitive.squaresUp).toBe(1);
        expect(ruleRepetitive.squaresDown).toBe(0);
        expect(ruleRepetitive.squaresLeft).toBe(0);
        expect(ruleRepetitive.squaresRight).toBe(0);
        expect(ruleRepetitive.isRepetitive).toBeTruthy();
    })
    it('should return correct rule for bloackable', () => {
        const ruleBlockable = RuleBuilder.up().blockable().build();
        expect(ruleBlockable.squaresUp).toBe(1);
        expect(ruleBlockable.squaresDown).toBe(0);
        expect(ruleBlockable.squaresLeft).toBe(0);
        expect(ruleBlockable.squaresRight).toBe(0);
        expect(ruleBlockable.isRepetitive).toBeFalsy();
        expect(ruleBlockable.canBeBlocked).toBeTruthy();
    });
})

describe('Half Move Clock', () => {
    let board = ChessBoard.create(CreationOption.EMPTY);
    beforeEach(() => {
        board = ChessBoard.create(CreationOption.EMPTY);
    });
    it('should be incremented when a piece is moved', () => {
        const rule = RuleBuilder.up().build();
        const piece = new TestPiece(PlayerColor.WHITE, [rule]);
        const origin = {row: 3, col: 3};
        const destination = {row: 4, col: 3};
        board.addPiece(piece, origin);
        const res =  rule.apply(board, origin, destination);
        expect(res.valid).toBeTruthy();
        expect(res.metaDataChange).toBeDefined();
        expect(res.metaDataChange?.halfMoveClock).toBe(board.metaData.halfMoveClock + 1);
    });
    it('should be reset when a capture is made', () => {
        const rule = RuleBuilder.up().build();
        const piece = new TestPiece(PlayerColor.WHITE, [rule]);
        const origin = {row: 3, col: 3};
        const destination = {row: 4, col: 3};
        board.addPiece(piece, origin);
        board.addPiece(new TestPiece(PlayerColor.BLACK, []), destination);
        const res =  rule.apply(board, origin, destination);
        expect(res.valid).toBeTruthy();
        expect(res.metaDataChange).toBeDefined();
        expect(res.metaDataChange?.halfMoveClock).toBe(0);
    });
});