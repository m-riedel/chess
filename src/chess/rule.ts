import ChessBoard from "./chessboard";
import Piece, {King, Rook} from "./pieces";
import {ChessMetaData, Coordinates, PlayerColor} from "./commons";

/**
 * Contains information about the validity of a move.
 * The instructions array contains all instructions needed to execute the move on the board.
 * The metaDataChange object contains information about the change of the metadata of the board.
 * E.g. if a pawn is moved two squares, the en passant square is set.
 */
interface MoveValidity{
    valid : boolean;
    instructions : SquareChangeInstruction[];
    metaDataChange : ChessMetaData | undefined;
}

/**
 * Describes an Instruction to change a square on the board.
 * Used in the MoveValidity object.
 */
interface SquareChangeInstruction {
    coordinates : Coordinates;
    piece : Piece | undefined;
}

/**
 * Describes a rule for a piece.
 */
abstract class Rule {
    /**
     * Validates if the basic move rule is correct. If so it gives Instructions on how to execute the move.
     * @param board the board
     * @param originCoordinates the coordinates of the origin square
     * @param targetCoordinates the coordinates of the target square
     * @returns a move validity object
     */
    public abstract apply(board : ChessBoard, originCoordinates: Coordinates, targetCoordinates: Coordinates) : MoveValidity;
}

/**
 * Describes all rules that can be described by the parameters of the rule.
 * Special Rules such as En Passant or Castling are not described by this rule.
 */
class ParameterRule extends Rule{
    private readonly _isRepetitive : boolean;
    private readonly _canBeBlocked : boolean;
    private readonly _squaresUp : number;
    private readonly _squaresDown : number;
    private readonly _squaresRight : number;
    private readonly _squaresLeft : number;

    constructor(isRepetitive : boolean, canBeBlocked : boolean, squaresUp :
            number, squaresDown : number, squaresRight : 
            number, squaresLeft : number){
        super();
        this._isRepetitive = isRepetitive;
        this._canBeBlocked = canBeBlocked;
        this._squaresUp = squaresUp;
        this._squaresDown = squaresDown;
        this._squaresRight = squaresRight;
        this._squaresLeft = squaresLeft;
    }

    /**
     * Checks if the rule can be applied to the described move based on the set parameters. <br>
     * WARNING: This method sets enpassentCoordinates to undefined.
     * @param board the board
     * @param originCoordinates the coordinates of the origin square
     * @param targetCoordinates the coordinates of the target square
     */
    public apply(board: ChessBoard, originCoordinates: Coordinates, targetCoordinates: Coordinates): MoveValidity {
        // Validate, that there is a piece on the origin square
        const originSquare = board.getSquare(originCoordinates);
        if(!originSquare.piece){
            throw Error('The Origin does not contain a piece.')
        }
        const targetSquare = board.getSquare(targetCoordinates);
        const isSameColorAsOrigin = (coordinatesToCheck : Coordinates) => {
            return originSquare.piece?.color === board.getPiece(coordinatesToCheck)?.color;
        }
        const isCapture = () => {
            return targetSquare.piece && targetSquare.piece.color !== originSquare.piece?.color
        }
        const steps = this.getSteps();
        const metaData = board.metaData;
        if (this._isRepetitive){
            for(let i = 1; i < 8; i++){
                //Calculate the current coordinates based on the steps
                const currentCoordinates : Coordinates = {
                    row: originCoordinates.row + (steps[0] * i),
                    col: originCoordinates.col + (steps[1] * i)
                }
                //Check if still inbounds
                if(currentCoordinates.row < 0 || currentCoordinates.row > 7 ||
                    currentCoordinates.col < 0 || currentCoordinates.col > 7){
                    return {valid : false, instructions : [], metaDataChange : undefined};
                }
                //Square plus the steps is its target square. So the move would be correct
                if(currentCoordinates.row === targetCoordinates.row &&
                    currentCoordinates.col === targetCoordinates.col &&
                    !isSameColorAsOrigin(currentCoordinates)){
                    // If the move is a capture, reset the half move clock
                    if(isCapture()){
                        metaData.halfMoveClock = 0;
                    }else{
                        metaData.halfMoveClock++;
                    }
                    // Disable castling if rook moves
                    if(originSquare.piece instanceof Rook){
                        if(originSquare.piece.color === PlayerColor.WHITE){
                            if(originCoordinates.row === 0 && originCoordinates.col === 0){
                                metaData.whiteKingSideCastle = false;
                            }else if(originCoordinates.row === 0 && originCoordinates.col === 7){
                                metaData.whiteQueenSideCastle = false;
                            }
                        }else if(originSquare.piece.color === PlayerColor.BLACK){
                            if(originCoordinates.row === 7 && originCoordinates.col === 0){
                                metaData.blackKingSideCastle = false;
                            }else if(originCoordinates.row === 7 && originCoordinates.col === 7){
                                metaData.blackQueenSideCastle = false;
                            }
                        }
                    }
                    metaData.enPassantCoordinates = undefined;
                    return {
                        valid : true,
                        instructions : [
                            {
                                coordinates : targetCoordinates,
                                piece : originSquare.piece
                            },
                            {
                                coordinates : originCoordinates,
                                piece : undefined
                            }
                        ],
                        metaDataChange : metaData};
                }

                const square = board.getSquare(currentCoordinates);
                // Since we know that this is not the target square and if there is a piece that may block us we can return false.
                if(this._canBeBlocked && square.piece){
                    return {valid : false, instructions : [], metaDataChange : undefined};
                }
            }
        }else{
            //Check if the target is the same as the origin plus the steps if so the move is valid (Also check if the
            // target is not the same color as the origin)
            if(originCoordinates.row + steps[0] === targetCoordinates.row
                && originCoordinates.col + steps[1] === targetCoordinates.col
                && !isSameColorAsOrigin(targetCoordinates)){
                // Disable castling if king moves
                if(originSquare.piece instanceof King){
                    if(originSquare.piece.color === PlayerColor.WHITE){
                        metaData.whiteKingSideCastle = false;
                        metaData.whiteQueenSideCastle = false;
                    }else if(originSquare.piece.color === PlayerColor.BLACK){
                        metaData.blackKingSideCastle = false;
                        metaData.blackQueenSideCastle = false;
                    }
                }
                // If the move is a capture, reset the half move clock
                if(isCapture()){
                    metaData.halfMoveClock = 0;
                }else{
                    metaData.halfMoveClock++;
                }
                metaData.enPassantCoordinates = undefined;
                return{
                    valid : true,
                    instructions : [
                        {
                            coordinates : targetCoordinates,
                            piece : originSquare.piece
                        },
                        {
                            coordinates : originCoordinates,
                            piece : undefined
                        }
                    ],
                    metaDataChange : metaData
                }
            }

        }
        return {valid : false, instructions : [], metaDataChange : undefined};
    }

    /**
     * Returns the steps that the rule allows.
     */
    private getSteps() : number[]{
        return [
            this._squaresUp > 0 ? this._squaresUp : -1 * this._squaresDown, 
            this.squaresRight > 0 ? this._squaresRight : -1 * this._squaresLeft
        ]
    }

    public get isRepetitive() : boolean{
        return this._isRepetitive;
    }

    public get squaresUp() : number{
        return this._squaresUp;
    }

    public get squaresDown() : number{
        return this._squaresDown;
    }

    public get squaresRight() : number{
        return this._squaresRight;
    }

    public get squaresLeft() : number{
        return this._squaresLeft;
    }

    public get canBeBlocked() : boolean{
        return this._canBeBlocked;
    }
}

/**
 * A custom rule that can be applied to a chess board.
 */
class CustomRule extends Rule{
    public constructor(apply : (board : ChessBoard, originCoordinates: Coordinates, targetCoordinates: Coordinates) => MoveValidity){
        super();
        this.apply = apply;
    }

    /**
     * Applies the rule to the board and returns the result. Does so by calling the given function of the constructor.
     *
     * @param board the board to apply the rule to
     * @param originCoordinates the coordinates of the piece that is moved
     * @param targetCoordinates the coordinates of the target square
     */
    public apply(board: ChessBoard, originCoordinates: Coordinates, targetCoordinates: Coordinates): MoveValidity {
        throw new Error("Method not implemented.");
    }
}

/**
 * A builder for rules.
 */
class RuleBuilder {
    private _isRepetitive : boolean = false;
    private _canBeBlocked : boolean = true;
    private _squaresUp : number = 0;
    private _squaresDown : number = 0;
    private _squaresRight : number = 0;
    private _squaresLeft : number = 0;

    constructor(){}

    /**
     * Builds a custom rule with the given function.
     * @param apply the function that describes the rule
     * @returns a {@link CustomRule} with the given function
     */
    static custom(apply : (board : ChessBoard, originCoordinates: Coordinates, targetCoordinates: Coordinates) => MoveValidity){
        return new CustomRule(apply);
    }

    /**
     * Sets the number of squares that the rule allows to move up.
     * @param squares the number of squares, defaults to 1
     */
    static up(squares : number = 1){
        const builder = new RuleBuilder();
        return builder.up(squares);
    }
    /**
     * Sets the number of squares that the rule allows to move down.
     * @param squares the number of squares, defaults to 1
     */
    static down(squares : number = 1){
        const builder = new RuleBuilder();
        return builder.down(squares);
    }
    /**
     * Sets the number of squares that the rule allows to move left.
     * @param squares the number of squares, defaults to 1
     */
    static left(squares : number = 1){
        const builder = new RuleBuilder();
        return builder.left(squares);
    }

    /**
     * Sets the number of squares that the rule allows to move right.
     * @param squares the number of squares, defaults to 1
     */
    static right(squares : number = 1){
        const builder = new RuleBuilder();
        return builder.right(squares);
    }

    /**
     * Sets the number of squares that the rule allows to move up.
     * Resets the number of squares that the rule allows to move down to 0.
     * @param squares the number of squares, defaults to 1
     */
    up(squares : number = 1){
        this._squaresUp = squares;
        this._squaresDown = 0;
        return this;
    }

    /**
     * Sets the number of squares that the rule allows to move down.
     * Resets the number of squares that the rule allows to move up to 0.
     * @param squares the number of squares, defaults to 1
     */
    down(squares : number = 1){
        this._squaresDown = squares;
        this._squaresUp = 0;
        return this;
    }

    /**
     * Sets the number of squares that the rule allows to move left.
     * Resets the number of squares that the rule allows to move right to 0.
     * @param squares the number of squares, defaults to 1
     */
    left(squares : number = 1){
        this._squaresLeft = squares;
        this._squaresRight = 0;
        return this;
    }

    /**
     * Sets the number of squares that the rule allows to move right.
     * Resets the number of squares that the rule allows to move left to 0.
     * @param squares the number of squares, defaults to 1
     */
    right(squares : number = 1){
        this._squaresRight = squares;
        this._squaresLeft = 0;
        return this;
    }

    /**
     * Sets weather the rule can be applied multiple times in a row.
     * @param isRepetitive weather the rule can be applied multiple times in a row, defaults to true when called
     */
    repeat(isRepetitive : boolean = true){
        this._isRepetitive = isRepetitive;
        return this;
    }

    /**
     * Sets weather the rule can be blocked by other pieces.
     * @param canBeBlocked weather the rule can be blocked by other pieces, defaults to true when called
     */
    blockable(canBeBlocked : boolean = true){
        this._canBeBlocked = canBeBlocked;
        return this;
    }
    /**
     * Builds the rule.
     * @returns a {@link ParameterRule} with the given parameters
     */
    public build() : ParameterRule{
        return new ParameterRule(
            this._isRepetitive,
            this._canBeBlocked,
            this._squaresUp, 
            this._squaresDown, 
            this._squaresRight,
            this._squaresLeft
            );
    }
}

export {Rule, RuleBuilder, MoveValidity, SquareChangeInstruction};