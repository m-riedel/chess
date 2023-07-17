import {Coordinates} from "./commons";

/**
 * Parses algebraic notation to coordinates and vice versa.
 */
class NotationParser{
    private static keys = [...Array(8).keys()]

    /**
     * Parses algebraic notation to coordinates.
     * @param location the location in algebraic notation
     */
    static parseAlgebraicToCoordinates(location : string) : Coordinates{
        return {
            row : Number(location[1]) - 1,
            col : NotationParser.keys[7 - Number(location.charCodeAt(0) - 97)]
        }
    }

    /**
     * Parses coordinates to algebraic notation.
     * @param coordinates the coordinates to parse
     */
    static parseCoordinatesToAlgebraic(coordinates : Coordinates) : string{
        return `${String.fromCharCode(NotationParser.keys[7 - coordinates.col] + 97)}${coordinates.row + 1}`
    }
}

export default NotationParser;