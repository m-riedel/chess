import Piece, {Bishop, King, Knight, Pawn, PieceFactory, Queen, Rook} from "./pieces";
import NotationParser from "./notation";
import MoveValidator from "./validatior";
import {SquareChangeInstruction} from "./rule";
import {Coordinates, ChessGameStatus, ChessMetaData, Fen, Printable, PlayerColor} from "./commons";


/**
 * The CreationOption enum is used to specify how the chess board should be created.
 * EMPTY: The board is created empty
 * DEFAULT: The board is created with the default chess starting position
 * FEN: The board is created from a FEN string
 */
enum CreationOption{
    EMPTY, DEFAULT, FEN
}

/**
 * The Square interface represents a square on the chess board. It contains a piece if there is one on the square.
 * Otherwise, it is undefined.
 */
interface Square{
    piece : Piece | undefined;
}


/**
 * The ChessBoard class represents the chess board. It is internally represented as a 2D array of Squares.
 */
class ChessBoard implements Printable, Fen{
    
    /**
     * Creates a Chessboard. The option parameter specifies how the board should be created. 
     * For all options see: {@link CreationOption}
     * @param option the option that specifies how the board should be created
     * @param fen the fen string to create the board from. Only used if option is FEN
     * @returns a new ChessBoard
     */
    static create(option : CreationOption = CreationOption.DEFAULT, fen : string | undefined = undefined) : ChessBoard{
        return new ChessBoard(option, fen);
    }

    /**
     * Creates an empty chess board
     * @param x the number of rows
     * @param y the number of columns
     */
    static createEmptySquareMatrix(x: number, y  :number) : Square[][]{
        return [...Array(x).keys()]
            .map(() => [...Array(y).keys()]
                .map(() => ({piece : undefined})));
    }

    private _metaData : ChessMetaData = {
        enPassantCoordinates : undefined,
        whiteKingSideCastle : true,
        whiteQueenSideCastle : true,
        blackKingSideCastle : true,
        blackQueenSideCastle : true,
        halfMoveClock : 0,
        fullMoveClock : 1,
        currentPlayer : PlayerColor.WHITE,
        status : ChessGameStatus.ONGOING
    };

    // The Chessboard is represented as a 2D array of Squares.
    // The conversion of algebraic notation to coordinates is visualized below:
    //     h   g   f   e   d   c   b   a
    // 1 |   |   |   |   |   |   |   |   |
    // 2 |   |   |   |   |   |   |   |   |
    // 3 |   |   |   |   |   |   |   |   |
    // 4 |   |   |   |   |   |   |   |   |
    // 5 |   |   |   |   |   |   |   |   |
    // 6 |   |   |   |   |   |   |   |   |
    // 7 |   |   |   |   |   |   |   |   |
    // 8 |   |   |   |   |   |   |   |   |
    //
    // This shows that white is on top in the array and black is on the bottom.
    private _board : Square[][] = [];
    private _fenHistory : string[] = [];

    constructor(option : CreationOption = CreationOption.DEFAULT, fen : string | undefined = undefined){
        this.initEmptyBoard();
        switch(option){
            case CreationOption.EMPTY:
                break;
            case CreationOption.DEFAULT:
                this.initDefaultBoard();
                break;
            case CreationOption.FEN:
                if(fen === undefined){
                    throw new Error("Fen is undefined");
                }
                this.initBoardFromFen(fen);
                break;
        }
        this._fenHistory.push(this.fen());
    }

    /**
     * Removes piece from the board at the specified coordinates
     * @param coordinates the coordinates of the piece to remove
     */
    public removePiece(coordinates : Coordinates) : void{
        this._board[coordinates.row][coordinates.col].piece = undefined;
    }

    /**
     * Moves a piece from the origin coordinates to the target coordinates
     * @param from the coordinates to move the piece from
     * @param to the coordinates to move the piece to
     */
    public movePiece(from : Coordinates, to : Coordinates) : void {
        this._board[to.row][to.col].piece = this._board[from.row][from.col].piece;
        this._board[from.row][from.col].piece = undefined;
    }

    /**
     * Gets the piece at the specified coordinates
     * @param coordinates the coordinates of the piece to get
     * @returns the piece at the specified coordinates or undefined if there is no piece at the coordinates
     */
    public getPiece(coordinates : Coordinates) : Piece | undefined {
        return this._board[coordinates.row][coordinates.col].piece;
    }

    /**
     * Gets the square at the specified coordinates
     * @param coordinates the coordinates of the square to get
     * @returns the square at the specified coordinates
     */
    public getSquare(coordinates : Coordinates) : Square {
        return this._board[coordinates.row][coordinates.col];
    }

    /**
     * Overrides the square at the specified coordinates with the specified piece
     * @param piece the piece to override the square with
     * @param location the coordinates of the square to override
     */
    public addPiece(piece : Piece, location : Coordinates) : void {
        this._board[location.row][location.col].piece = piece;
    }

    /**
     * Moves a piece from the origin coordinates to the target coordinates.
     * Throws an error if the move is invalid
     * @param origin the coordinates of the piece
     * @param target the coordinates to move the piece to
     */
    public move(origin : Coordinates, target : Coordinates) : void{
        if(this._metaData.status !== ChessGameStatus.ONGOING){
            throw new Error("Game is over");
        }
        if(!this.isCoordinateOnBoard(origin) || !this.isCoordinateOnBoard(target)){
            throw new Error("Coordinates are not on board");
        }
        const originSquare = this.getSquare(origin);
        if(originSquare.piece === undefined){
            throw new Error("No piece at origin");
        }
        if(originSquare.piece.color !== this._metaData.currentPlayer){
            throw new Error("Wrong player");
        }
        const targetSquare = this.getSquare(target);
        if(targetSquare.piece !== undefined && targetSquare.piece.color === this._metaData.currentPlayer){
            throw new Error("Cannot capture own piece");
        }
        const validity = MoveValidator.validateMove(this, origin, target);
        if(!validity.valid){
            throw new Error("Invalid move");
        }
        for(let i = 0; i < validity.instructions.length; i++){
            this.executeMoveInstruction(validity.instructions[i]);
        }

        if(this.isCheck()){
            this.loadFen(this._fenHistory[this._fenHistory.length - 1]);
            throw new Error("Cannot move into check");
        }
        if(validity.metaDataChange){
            this._metaData = validity.metaDataChange;
        }
        this._metaData.currentPlayer = this._metaData.currentPlayer === PlayerColor.WHITE ? PlayerColor.BLACK : PlayerColor.WHITE;
        if(this._metaData.currentPlayer === PlayerColor.WHITE){
            this._metaData.fullMoveClock += 1;
        }
        this.isGameOver();
        this._fenHistory.push(this.fen());
    }

    /**
     * Executes a move instruction
     * @param instruction the instruction to execute
     * @private
     */
    private executeMoveInstruction(instruction : SquareChangeInstruction){
        if(instruction.piece){
            this.addPiece(instruction.piece, instruction.coordinates);
        }else{
            this.removePiece(instruction.coordinates);
        }
    }

    /**
     * Checks if the provided coordinates are on the board
     * @param coordinates
     * @private
     */
    private isCoordinateOnBoard(coordinates : Coordinates) : boolean{
        return coordinates.row >= 0 && coordinates.row < 8 && coordinates.col >= 0 && coordinates.col < 8;
    }

    /**
     * Checks if the game position is over.
     * WARNING: This method overwrites the status of the game.
     * Therefore, it should only be called once per turn: after the move has been made.
     */
    public isGameOver() : boolean{
        if(this._metaData.status !== ChessGameStatus.ONGOING){
            return true;
        }
        //Check all Ending conditions
        if(this.hasNoLegalMoves(this._metaData.currentPlayer)){
            if(this.isCheck()){
                this._metaData.status = this._metaData.currentPlayer === PlayerColor.WHITE ? ChessGameStatus.BLACK_WON : ChessGameStatus.WHITE_WON;
            }else{
                this._metaData.status = ChessGameStatus.STALEMATE;
            }
            return true;
        }
        if(this.hasExceededFiftyMoveRule()){
            this._metaData.status = ChessGameStatus.FIFTY_MOVE_RULE;
            return true;
        }
        if(this.hasInsufficientMaterial()){
            this._metaData.status = ChessGameStatus.INSUFFICIENT_MATERIAL;
            return true;
        }
        if(this.hasThreefoldRepetition()){
            this._metaData.status = ChessGameStatus.THREEFOLD_REPETITION;
            return true;
        }
        return false;
    }

    /**
     * Calculates if the game position has occurred three times
     */
    public hasThreefoldRepetition() : boolean{
        let count = 0;
        for(let i = 0; i < this._fenHistory.length; i++){
            if(this._fenHistory[i].split(' ').slice(0, -2).join(' ') === this.fen().split(' ').slice(0, -2).join(' ') ){
                count++;
            }
        }
        return count >= 3;
    }

    /**
     * Calculates if the game position is a draw by insufficient material.
     * It expects that the game has 2 kings of opposite colors on the board.
     * @returns true if the game position is a draw by insufficient material, otherwise false
     */
    public hasInsufficientMaterial() : boolean{
        const piecesOnBoard = this.getAllPieces();
        if(piecesOnBoard.length === 2){
            return true;
        }
        if(piecesOnBoard.length === 3){
            return piecesOnBoard.some(e => e.piece instanceof Bishop || e.piece instanceof Knight);
        }
        const bishops = piecesOnBoard.filter(e => e.piece instanceof Bishop);
        const bishopsDraw = () : boolean => {
            return piecesOnBoard.length === 4
                && bishops.length === 2
                && bishops[0].piece.color !== bishops[1].piece.color
                && bishops[0].location.row % 2 === bishops[0].location.col % 2
                && bishops[1].location.row % 2 === bishops[1].location.col % 2;
        }
        return bishopsDraw();

    }

    /**
     * Gets all pieces on the board with their location
     * @returns all pieces on the board with their location
     */
    public getAllPieces() : { piece : Piece, location : Coordinates }[]{
        return this._board
            .flatMap((row, rowIndex) =>
                row.map((square, colIndex) => ({piece : square.piece, location : {row : rowIndex, col : colIndex}})))
            .filter(square => square.piece !== undefined) as { piece : Piece, location : Coordinates }[];
    }


    /**
     * Checks if the 50 move rule has been exceeded
     */
    public hasExceededFiftyMoveRule() : boolean{
        return this._metaData.halfMoveClock >= 50;
    }

    /**
     * Check if the specified player has legal moves
     * @param playerColor
     */
    public hasNoLegalMoves(playerColor : PlayerColor) : boolean{
        // Checks for if at least one has a legal move
        // Does so by checking if it can move to any square one the board
        const playerPieces  = this.getAllPieces()
            .filter(e => e.piece.color === playerColor);
        for(let i = 0; i < playerPieces.length; i++){
            for(let j = 0; j < 8; j++){
                for(let k = 0; k < 8; k++){
                    const prevTemp = this.fen();
                    if(playerPieces[i].location.row === j && playerPieces[i].location.col === k){
                        continue;
                    }
                    const validity = MoveValidator.validateMove(this, playerPieces[i].location, {row : j, col : k});
                    if(validity.valid){
                        //Execute the move and check if the king is in check
                        for(let i = 0; i < validity.instructions.length; i++){
                            this.executeMoveInstruction(validity.instructions[i]);
                        }
                        //Backtrack
                        if(!this.isCheck()){
                            this.loadFen(prevTemp);
                            return false;
                        }
                        this.loadFen(prevTemp);
                    }
                }
            }
        }
        return true;
    }

    /**
     * Checks if the current player is in check
     */
    public isCheck() : boolean{
        const kingCoordinates = this.findKingCoordinates(this._metaData.currentPlayer);
        return this.isSquareAttacked(kingCoordinates, this._metaData.currentPlayer === PlayerColor.WHITE ?
            PlayerColor.BLACK : PlayerColor.WHITE)
    }

    /**
     * Checks if the specified square is attacked by the specified player
     * @param coordinates coordinates of the square to check if it is attacked
     * @param playerColor color of the player to check if the square is attacked by
     */
    public isSquareAttacked(coordinates : Coordinates, playerColor : PlayerColor) : boolean{
        const enemyPieces = this.getAllPieces()
            .filter(e => e.piece.color === playerColor)
        for (let i = 0; i < enemyPieces.length; i++) {
            const validity = MoveValidator.validateMove(this, enemyPieces[i].location, coordinates);
            if(validity.valid){
                return true;
            }
        }
        return false;
    }

    /**
     * Finds the coordinates of the king of the specified player
     * @param playerColor the color of the player to find the king of
     */
    public findKingCoordinates(playerColor : PlayerColor) : Coordinates{
        for(let i = 0; i < 8; i++){
            for(let j = 0; j < 8; j++){
                const piece = this.getPiece({row : i, col : j});
                if(piece instanceof King && piece.color === playerColor){
                    return {row : i, col : j};
                }
            }
        }
        throw new Error("King not found");
    }


    /**
     * Loads the board from the specified fen
     * Overwrites the current board
     * @param fen the fen to load the board from
     */
    public loadFen(fen : string) : void {
        this._board = ChessBoard.createEmptySquareMatrix(8,8);
        this.initBoardFromFen(fen);
    }

    /**
     * Initializes the Default backrank for the specified player color and location.
     * @param playerColor the color of the player to initialize the backrank for
     * @param location the location of the backrank to initialize
     */
    private initBackrankSquare(playerColor : PlayerColor, location : Coordinates) {
        switch (location.col) {
            case 0:
            case 7:
                this.addPiece(new Rook(playerColor), location);
                break;
            case 1:
            case 6:
                this.addPiece(new Knight(playerColor), location);
                break;
            case 2:
            case 5:
                this.addPiece(new Bishop(playerColor), location);
                break;
            case 3:
                this.addPiece(new King(playerColor), location);
                break;
            case 4:
                this.addPiece(new Queen(playerColor), location);
                break;
        }
    }

    /**
     * Initializes the board to the default chess starting position
     */
    private initDefaultBoard() {
        for(let row = 0; row < 8; row++){
            for(let col = 0; col < 8; col++){
                const location = {row : row, col : col};
                switch (row) {
                    case 0:
                        this.initBackrankSquare(PlayerColor.WHITE, location);
                        break;
                    case 1:
                        this.addPiece(new Pawn(PlayerColor.WHITE), location);
                        break;
                    case 2:
                    case 3:
                    case 4:
                    case 5:
                        break;
                    case 6:
                        this.addPiece(new Pawn(PlayerColor.BLACK), location);
                        break;
                    case 7:
                        this.initBackrankSquare(PlayerColor.BLACK, location);
                        break;
                }
            }
        }
    }

    /**
     * Initializes the board from the specified fen
     * @param fen the fen to initialize the board from
     */
    private initBoardFromFen(fen : string) : void {
        const fenParts = fen.split(" ");
        //Init Metadata
        this._metaData = {
            enPassantCoordinates : fenParts[3] == '-' ? undefined : NotationParser.parseAlgebraicToCoordinates(fenParts[3]),
            whiteKingSideCastle : fenParts[2].includes("K"),
            whiteQueenSideCastle : fenParts[2].includes("Q"),
            blackKingSideCastle : fenParts[2].includes("k"),
            blackQueenSideCastle : fenParts[2].includes("q"),
            halfMoveClock : Number(fenParts[4]),
            fullMoveClock : Number(fenParts[5]),
            currentPlayer : fenParts[1] === 'w' ? PlayerColor.WHITE : PlayerColor.BLACK,
            status : ChessGameStatus.ONGOING
        }
        // Init Board
        let currentRow = 7;
        let currentCol = 7;
        for(let i = 0; i < fenParts[0].length; i++){
            switch (fenParts[0][i]) {
                case '/':
                    currentRow--;
                    currentCol = 7;
                    break;
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                case '7':
                case '8':
                    currentCol -= parseInt(fen[i]);
                    break;
                default:
                    const location = {row : currentRow, col : currentCol}
                    this.addPiece(PieceFactory.createPiece(fenParts[0][i]), location);
                    currentCol--;
            }
        }
    }

    /**
     * Initializes an empty board
     */
    private initEmptyBoard() {
        this._board = [];
        for(let row = 0; row < 8; row++){
            this._board.push([]);
            for(let col = 0; col < 8; col++){
                this._board[row].push({piece : undefined});
            }
        }
    }

    public fen() : string {
        let fen = "";
        let emptySquares = 0;
        for(let row = 7; row >= 0; row--){
            for(let col = 7; col >= 0; col--){
                let piece = this._board[row][col].piece;
                switch (piece){
                    case undefined:
                        emptySquares++;
                        break;
                    default:
                        if(emptySquares != 0){
                            fen += emptySquares;
                            emptySquares = 0;
                        }
                        fen += piece.fen();
                }
            }
            if(emptySquares != 0){
                fen += emptySquares;
            }
            if(row > 0){
                fen += "/";
            }
            emptySquares = 0;
        }
        fen += this._metaData.currentPlayer === PlayerColor.WHITE ? " w " : " b ";
        //Add Castling capabilities
        fen += this._metaData.whiteKingSideCastle ? "K" : "";
        fen += this._metaData.whiteQueenSideCastle ? "Q" : "";
        fen += this._metaData.blackKingSideCastle ? "k" : "";
        fen += this._metaData.blackQueenSideCastle ? "q" : "";
        if(!this._metaData.whiteKingSideCastle && !this._metaData.whiteQueenSideCastle
            && !this._metaData.blackKingSideCastle && !this._metaData.blackQueenSideCastle){
            fen += "-";
        }
        fen += this._metaData.enPassantCoordinates ? " " + NotationParser.parseCoordinatesToAlgebraic(this._metaData.enPassantCoordinates) : " -";
        //Add HalfClockTimer
        fen += ` ${this._metaData.halfMoveClock}`;
        //Add FullClock
        fen += ` ${this._metaData.fullMoveClock}`
        return fen;
    }

    /**
     * Gets the printable version of the board from the specified perspective (color)
     * @returns the printable version of the board from the specified perspective (color)
     */
    public printable() : string {
        const perspective = this._metaData.currentPlayer;
        const ranks = perspective === PlayerColor.WHITE ?  "     a    b    c    d    e    f    g    h\n" : "     h    g    f    e    d    c    b    a\n";
        const spacesBetween = "   ---------------------------------------\n";
        let board = "";
        board += ranks;
        board += spacesBetween
        if(!(perspective === PlayerColor.WHITE)){
            //Perspective is black
            //The current orientation of the board is from black's perspective so no problem.
            for(let row = 0; row < 8; row++){
                board += `${row+1} |`
                for(let col = 0; col < 8; col++){
                    const square =  this._board[row][col];
                    const pieceVal = square.piece != null ? square.piece.printable() : "  " ;
                    board += ` ${pieceVal} |`
                }
                board += ` ${row+1}\n`
                board += spacesBetween
            }
        }else{
            //Perspective is white, the board must be completely rotated to get the correct orientation.
            for(let row = 7; row >= 0; row--){
                board += `${row + 1} |`
                for(let col = 7; col >= 0; col--){
                    const square =  this._board[row][col];
                    const pieceVal = square.piece != null ? square.piece.printable() : "  " ;
                    board += ` ${pieceVal} |`
                }
                board += ` ${row + 1}\n`
                board += spacesBetween
            }
        }
        board += ranks
        return board;
    }

    public get board() : Square[][]{
        return this._board;
    }
    public get metaData() : ChessMetaData {
        return {...this._metaData};
    }
}

export default ChessBoard;
export { Square, CreationOption };
