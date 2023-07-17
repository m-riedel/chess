import ChessBoard from "./chessboard";
import {MoveValidity} from "./rule";

import {Coordinates} from "./commons";

/**
 * Validates a move on a chessboard.
 */
class MoveValidator {
    /**
     * Validates a move on a chessboard.
     * @param board the board to validate the move on
     * @param origin the origin of the move
     * @param target the target of the move
     * @returns a MoveValidity object containing information about the validity of the move.
     * On invalid moves, the instructions array will be empty as well as the metaDataChange object.
     * Otherwise, the instructions array will contain all instructions to execute the move and the metaDataChange object will contain
     */
    static validateMove(board : ChessBoard, origin : Coordinates, target : Coordinates): MoveValidity {
        const piece = board.getPiece(origin);
        if(!piece){
            throw new Error("No piece found at origin!");
        }
        if(origin.row === target.row && origin.col === target.col){
            throw new Error("Origin and target are the same!");
        }
        //Check every rule until one is valid
        const rules = piece.rules;
        for(let i = 0; i < rules.length; i++){
            const rule = rules[i];
            const validity = rule.apply(board, origin, target);
            if(validity.valid){
                return validity;
            }
        }
        return {valid : false, instructions : [], metaDataChange : undefined};
    }
}

export default MoveValidator;