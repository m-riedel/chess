# chess-move-validator

## How to use on cli
### Install
Prerequisite for all following commands!
```shell
npm install
```
### Start
```shell
npm run cli
```

Upon start you have different options to choose from. Type:
- `0` - Start a new game from the default position
- `1` - Start a new game from a custom position with a correct FEN string
- `2` - View all available co

### Test
```shell
npm test
```
### Test Coverage
```shell
npm run test-coverage
```
To view the coverage report, open the file `coverage/lcov-report/index.html` in your browser.

## Features

- Local 1v1 chess game
- Move validation
- Checkmate detection
- Stalemate detection
- Insufficient material detection
- Threefold repetition detection
- Fifty move rule detection
- Castling
- En passant
- Pawn auto promotion to queen
- FEN import
- FEN export

## How to play a move

To play a move, u will need to first start the game with 0 or 1 (when importing from fen,
a chess Position notation).

The Pieces on the board are represented by 2 Letters:
- The first letter represents the color of the piece (w for white, b for black)
- The second letter represents the type of the piece (K for King, Q for Queen, R for Rook, B for Bishop, N for Knight, P for Pawn)

The color of a piece is also represented by the casing of the 2 letters:
- Uppercase for white
- Lowercase for black

Then u will be prompted to select a piece to move. U can do this by typing the position of the piece
e.g. `e4`. This can be read at the column and row descriptions of the board. After that u will be prompted
to select a destination for the piece. U can do this by typing the position of the destination e.g. `e5`.
If the move is valid, the move will be played and the board will be updated. Otherwise an error message will
be displayed and u will be prompted to select a piece again. (Note: if yyou selected a wrong piece, u need to
to type an invalid square or nothing so that the selection can be reset)


After that the board will be flipped so that your opponent can play.

This continues until the game is over. If the game is over, u will be prompted to start a new game or exit the
program.