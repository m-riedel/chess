import NotationParser from "../../src/chess/notation";

describe('Parse to Coordinates', () => {
    it('should parse e4 to col 3, row 3', () => {
        const res = NotationParser.parseAlgebraicToCoordinates('e4')
        expect(res.col).toBe(3)
        expect(res.row).toBe(3)
    })
    it('should parse h1 to col 0, row 0', () => {
        const res = NotationParser.parseAlgebraicToCoordinates('h1')
        expect(res.col).toBe(0)
        expect(res.row).toBe(0)
    })
    it('should parse a1 to col 7, row 0', () => {
        const res = NotationParser.parseAlgebraicToCoordinates('a1')
        expect(res.col).toBe(7)
        expect(res.row).toBe(0)
    })
})

describe('Parse to Algebraic', () => {
    it('should parse col 3, row 3 to e4', () => {
        const res = NotationParser.parseCoordinatesToAlgebraic({col: 3, row: 3})
        expect(res).toEqual('e4')
    });
    it('should parse col 0, row 0 to h1', () => {
        const res = NotationParser.parseCoordinatesToAlgebraic({col: 0, row: 0})
        expect(res).toEqual('h1')
    });
    it('should parse col 7, row 0 to a1', () => {
        const res = NotationParser.parseCoordinatesToAlgebraic({col: 7, row: 0})
        expect(res).toEqual('a1')
    });
})