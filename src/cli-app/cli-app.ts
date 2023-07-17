import ChessGame from "../chess/chessgame";
import cliQuestion from "./cli-question";
import {ChessGameStatus} from "../chess/commons";

enum options{
    PLAYGAME, IMPORTGAME, VIEWCOMMANDS
}

export class CliApp{

    private _game : ChessGame;

    static commands : {key :string, description : string}[] = [
        {key : "/help", description : "Displays this help message"},
        {key : "/fen", description : "Prints the FEN string of the current position"},
        {key : "/metadata", description : "Prints the metadata of the current position"},
        {key : "/quit", description : "Quits the game"},
    ]


    constructor(){
        this._game = new ChessGame();
    }

    public async playGame(){
        this._game.startGame();
        await this.doGameLoop();
    }

    public async startGameFromFen(){
        const fen = await cliQuestion("Please enter the FEN string:\n");
        try{
            this._game.startGame(fen);
        }catch(err : any){
            console.log("Invalid FEN string, starting default game");
            this._game.startGame();
        }
        await this.doGameLoop();
    };

    private checkForCommand(input : string) : boolean{
        for (let i = 0; i < CliApp.commands.length; i++) {
            if (input === CliApp.commands[i].key) {
                switch (input) {
                    case "/help":
                        console.log("Available commands:");
                        CliApp.commands.forEach(command => {
                            console.log(`${command.key} - ${command.description}`);
                        });
                        break;
                    case "/fen":
                        console.log(this._game.fen());
                        break;
                    case "/metadata":
                        console.log(this._game.metaData);
                        break;
                    case "/quit":
                        process.exit(0);
                        break;
                }
                return true;
            }
        }
        return false;
    }

    private async doGameLoop(){
        while (!this._game.isFinished){
            let moveValid : boolean = true;
            let pieceToMoveOrigin = "", pieceToMoveTarget = "";
            console.log(this._game.printable())
            do {
                do{
                    pieceToMoveOrigin = await cliQuestion(`Player ${this._game.whiteToMove ? 'White' : 'Black'} please select the piece to move:\n`);
                }while(this.checkForCommand(pieceToMoveOrigin));
                do{
                    pieceToMoveTarget = await cliQuestion(`Please select the square to move to:\n`);
                }while (this.checkForCommand(pieceToMoveTarget));
                this.checkForCommand(pieceToMoveTarget)
                try{
                    this._game.move(pieceToMoveOrigin, pieceToMoveTarget);
                    moveValid = true;
                }catch(err : any){
                    moveValid = false;
                    console.log(this._game.printable());
                    console.log(err.message);
                }
            }while(!moveValid);
        }
        if(this._game.isFinished){
            console.log(this._game.printable());
            switch(this._game.status){
                case ChessGameStatus.BLACK_WON:
                    console.log("Black won!");
                    break;
                case ChessGameStatus.WHITE_WON:
                    console.log("White won!");
                    break;
                case ChessGameStatus.STALEMATE:
                    console.log("Draw: Stalemate!");
                    break;
                case ChessGameStatus.FIFTY_MOVE_RULE:
                    console.log("Draw: Fifty move rule!");
                    break;
                case ChessGameStatus.THREEFOLD_REPETITION:
                    console.log("Draw: Threefold repetition!");
                    break;
                case ChessGameStatus.INSUFFICIENT_MATERIAL:
                    console.log("Draw: Insufficient material!");
                    break;
            }
        }
    }

}

async function listOptions(){
    const app = new CliApp();
    let isQuit = false;
    while (!isQuit){
        const option =  Number(
            await cliQuestion("Please select an option:\n[0]: Play a game\n[1]: Import game from fen\n[2]: Ingame Commands\n[3]: Quit\n"));
        switch (option) {
            case options.PLAYGAME:
                await app.playGame();
                break;
            case options.IMPORTGAME:
                await app.startGameFromFen();
                break;
            case options.VIEWCOMMANDS:
                console.log("---\nAvailable commands:");
                CliApp.commands.forEach(command => {
                    console.log(`${command.key}: ${command.description}`);
                });
                console.log("---");
                break;
            default:
                isQuit = true;
                break;
        }
    }
    return;
}

listOptions().then(() => {
    console.log("Goodbye!");
    process.exit(0);
});