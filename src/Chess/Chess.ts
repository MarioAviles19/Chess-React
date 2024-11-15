import { MoveOutsideBoundsError, AttemptToCaptureSameColorError, PieceDoesNotExistError } from "./Errors";

export let Pieces = {

    b_pawn   : 0b00000001,
    b_knight : 0b00000010,
    b_bishop : 0b00000100,
    b_rook   : 0b00001000,
    b_queen  : 0b00010000,
    b_king   : 0b00100000,

    w_pawn   : 0b10000001,
    w_knight : 0b10000010,
    w_bishop : 0b10000100,
    w_rook   : 0b10001000,
    w_queen  : 0b10010000,
    w_king   : 0b10100000,
}

export enum PlayMode{

    freePlay,
    randomEnemy
}

function Create2DArray<T>(xLen : number, yLen : number){

    let payload : Array<Array<T>> = new Array(xLen);

    for (let i = 0; i < xLen; i++) {
        payload[i] = new Array(yLen);
        
    }
    return payload;
}


export class ChessBoard{ 

    public isVirtual = false;
    //The state of the board 
    public state = Create2DArray<Piece| null>(8, 8);
    //An array representing the captured pieces. Not divided into white or black because the pieces themselves
    //have that information
    public captures : Array<Piece> = [];

    public check : null | "white" | "black"  = null;

    public turnNumber = 0;
    public mode = PlayMode.freePlay;
    pieces : Piece[] = [];

    private wKing : King = new King(true, {x: 4, y: 7});
    private bKing : King = new King(true, {x: 4, y: 0});;

    constructor(board? : ChessBoard){
        if(board){
            this.turnNumber = board.turnNumber;
            this.mode = board.mode;
            this.pieces = [...board.pieces];
            

        }
    }
    public ToFenString(){
        let str = "";
        //Loop over each 

        for (let i = 0; i < this.state.length; i++){
            let emptyCount = 0;
            //Add forward slash to beginning of each row, except the last
            if(i > 0){
                str += "/"
            }
            for (let j = 0; j < this.state[i].length; j++){
                let square = this.state[i][j];
                //If there is no square, increment the empty count
                if(!square){
                    emptyCount++;
                } else{
                    //if there is a square, first add the emptyCount to the string if above zero
                    if(emptyCount > 0){
                        str += emptyCount;
                        emptyCount = 0;
                    }
                    //Then add the piece, capitalizing if white
                    str += square.isWhite? square.fen.toUpperCase() : square.fen;
                }
            }
            if(emptyCount > 0){
                str += emptyCount;
                emptyCount = 0;
            }
        }
        return str
    }
    
    public ResetBoard(){

        this.state = Create2DArray<Piece | null>(8,8);

        for (let i = 0; i < this.state.length; i++) {
            this.state[i] = this.state[i].fill(null)
            
        } 
        //Manually map the starting positions

        //Black's back row

        //The king is special;

        this.bKing = new King  (false, {x: 4, y: 0});

        this.state[0][0] = new Rook  (false, {x: 0, y: 0});
        this.state[0][1] = new Knight(false, {x: 1, y: 0});
        this.state[0][2] = new Bishop(false, {x: 2, y: 0});
        this.state[0][3] = new Queen (false, {x: 3, y: 0});
        this.state[0][4] = this.bKing
        this.state[0][5] = new Bishop(false, {x: 5, y: 0});
        this.state[0][6] = new Knight(false, {x: 6, y: 0});
        this.state[0][7] = new Rook  (false, {x: 7, y: 0});

        //Black's Front row
        this.state[1][0] = new Pawn(false, {x: 0, y: 1});
        this.state[1][1] = new Pawn(false, {x: 1, y: 1});
        this.state[1][2] = new Pawn(false, {x: 2, y: 1});
        this.state[1][3] = new Pawn(false, {x: 3, y: 1});
        this.state[1][4] = new Pawn(false, {x: 4, y: 1});
        this.state[1][5] = new Pawn(false, {x: 5, y: 1});
        this.state[1][6] = new Pawn(false, {x: 6, y: 1});
        this.state[1][7] = new Pawn(false, {x: 7, y: 1});

        //White's back row
        
        //The king is special;

        this.wKing = new King  (true, {x: 4, y: 7});

        this.state[7][0] = new Rook  (true, {x: 0, y: 7});
        this.state[7][1] = new Knight(true, {x: 1, y: 7});
        this.state[7][2] = new Bishop(true, {x: 2, y: 7});
        this.state[7][3] = new Queen (true, {x: 3, y: 7});
        this.state[7][4] = this.wKing
        this.state[7][5] = new Bishop(true, {x: 5, y: 7});
        this.state[7][6] = new Knight(true, {x: 6, y: 7});
        this.state[7][7] = new Rook  (true, {x: 7, y: 7});

        //White's Front row
        this.state[6][0] = new Pawn(true, {x: 0, y: 6});
        this.state[6][1] = new Pawn(true, {x: 1, y: 6});
        this.state[6][2] = new Pawn(true, {x: 2, y: 6});
        this.state[6][3] = new Pawn(true, {x: 3, y: 6});
        this.state[6][4] = new Pawn(true, {x: 4, y: 6});
        this.state[6][5] = new Pawn(true, {x: 5, y: 6});
        this.state[6][6] = new Pawn(true, {x: 6, y: 6});
        this.state[6][7] = new Pawn(true, {x: 7, y: 6});

        //Load all pieces into piece array;
        this.state.forEach(val=>{
            val.forEach(piece=>{
                if(piece instanceof Piece){
                    this.pieces.push(piece);
                }else{
                }
            })
        })
        //Set the kings to check for checks later
        

    }
    private getRandomValueFromArray<T>(arr : T[]) {
        const randomIndex = Math.floor(Math.random() * arr.length);
        return arr[randomIndex];
      }

    private GetRandomMove( piecesLeftToCheck : Piece[]) : {piece: Piece, move : Vector2} | null{

            if(piecesLeftToCheck.length <= 0){
                return null;
            }
            const piece = this.getRandomValueFromArray<Piece>(piecesLeftToCheck);

            //if piece is black
            if(!piece.isWhite){
                //If piece has moves
                const moves = piece.GetLegalMoves(this);

                if(moves.length > 0){
                    //If there is a move, get a random one
                    const move = this.getRandomValueFromArray<Vector2>(moves);
                    return {piece, move}
                }
            } 
            //Remove the piece from the pieces to check
            const indexOfPiece = piecesLeftToCheck.indexOf(piece);
            if(indexOfPiece !== -1){
                piecesLeftToCheck.splice(indexOfPiece, 1)
            }

            return this.GetRandomMove(piecesLeftToCheck);


    }

    private CheckForChecks(){


        let inCheck = null;
        this.pieces.forEach(piece=>{
            
            const moves = piece.GetLegalMoves(this);

            if(moves.some(move=>{
                console.log((move.x === this.bKing.position.x && move.y === this.bKing.position.y) || (move.x === this.wKing.position.x && move.y === this.wKing.position.y))
                return (move.x === this.bKing.position.x && move.y === this.bKing.position.y) || (move.x === this.wKing.position.x && move.y === this.wKing.position.y);


            })){
               inCheck = piece.isWhite? "black" : "white";
            }
        })
        return inCheck;
    }
    /**
     * @description This function makes a move, 
     * gathers some information, and then rolls back the move
     * 
     * @param piece The piece to move
     * @param posToMove The position to move to
     * @returns {check: null | "white" | "black"}
     */
    public InCheckAfterMove(piece : Piece, posToMove : Vector2){
        let myKing = piece.isWhite? this.wKing : this.bKing;
        let legal = true;
        for (let i = 0; i < this.pieces.length; i++){
            if(this.pieces[i].isWhite != piece.isWhite){
                let moves = this.pieces[i].GetLegalMoves(this);
                if(moves.some(val=>{val.x === myKing.position.x && val.y === myKing.position.y})){
                    legal = false;
                    break;
                }
            }
        }
        return legal;
    }

    /**
     * @description This function ensures that
     * the move attempting to be made is allowed
     * 
     * @param piece The piece to move
     * @param posToMove The position to move to
     */
    public MovePiece(piece : Piece, posToMove : Vector2){

        
        
        
        if((piece.isWhite && this.turnNumber % 2 !== 0) || (!piece.isWhite && this.turnNumber % 2 === 0)){
            //Make sure that pieces can only move on their turn
            return;
        }




        //Make sure the position to move is on the board, throw error if not
        if(posToMove.x < 0 || posToMove.y < 0 || posToMove.x > 7 || posToMove.y > 7){
            console.log(posToMove);
            throw new MoveOutsideBoundsError(piece, posToMove);
        }
        const squareToMoveTo = this.state[posToMove.y][posToMove.x];

        if(squareToMoveTo){
            if(squareToMoveTo.isWhite === piece.isWhite){
                //If the pieces are the same color, throw error
                throw new AttemptToCaptureSameColorError(piece, posToMove);
            }
            else{
                //Capture the piece
                this.CapturePiece(squareToMoveTo)


                //Move piece

                //If the move is a pawn and it moved to the back row, promote to queen
                if(piece instanceof Pawn && (posToMove.y === 7 || posToMove.y === 0)){
                    piece = new Queen(piece.isWhite, piece.position);
                }
                

                //Remove the piece from the current location
                this.state[piece.position.y][piece.position.x] = null;
                //Set the piece's position to the indicated
                piece.position = posToMove;
                this.state[posToMove.y][posToMove.x] = piece;
                //set the piece's Has moved variable to true
                piece.hasMoved = true;
                this.turnNumber ++;
            }
        }
        //TODO: This can probably be reduced
        if(!this.state[posToMove.y][posToMove.x]){
            //If there is no piece already at the position to move, go ahead and move it
            
            //If the move is a pawn and it moved to the back row, promote to queen
            if(piece instanceof Pawn && (posToMove.y === 7 || posToMove.y === 0)){
                piece = new Queen(piece.isWhite, piece.position);
            }
            //Remove the piece from the current location
            this.state[piece.position.y][piece.position.x] = null;
            //Set the piece's position to the indicated
            piece.position = posToMove;
            this.state[posToMove.y][posToMove.x] = piece;
            //set the piece's Has moved variable to true
            piece.hasMoved = true;
            this.turnNumber ++;

        }

        //If the game is in randomEnemy mode and it's black's turn, make a random move

        if(this.mode == PlayMode.randomEnemy && this.turnNumber % 2 !== 0){


            const move = this.GetRandomMove([...this.pieces]);
            //If there is no move, there must be no more black pieces
            if(!move){
                //END GAME
                return;
            }
            this.MovePiece(move.piece, move.move);
        }

        this.check = this.CheckForChecks();
        
    

    }

    private CapturePiece(pieceBeingCaptured : Piece){

        this.captures.push(pieceBeingCaptured);
        //Remove piece from list of pieces
        const indexOfPieceToCapture = this.pieces.indexOf(pieceBeingCaptured);
        this.pieces.splice(indexOfPieceToCapture, 1);
        console.log(pieceBeingCaptured)
        console.log(indexOfPieceToCapture);
    }




    

}

function CheckIfMoveIsOnBoard(move : Vector2){
    if(move.x < 0 || move.y < 0 || move.x > 7 || move.y > 7){
        return false;
    }
    return true;
}


export abstract class Piece{

    //moveOffsets : Array<Vector2> = [];
    isWhite = false;
    hasMoved = false;
    name = "";
    fen = "";
    position : Vector2 = {x: 0, y:0}

    constructor(isWhite : boolean, initialPosition : Vector2){
        this.isWhite = isWhite
        this.position = initialPosition;
    }
    public GetLegalMoves(board : ChessBoard, opts? : {shallow? : boolean}) : Array<Vector2> {
        return [];
    }
    abstract CreateNewInstance<T>() : T;
    public Copy<T>(){
        return this.CreateNewInstance<T>()
    }

}

export abstract class ShortDistanceMover extends Piece{

    moveOffsets : Vector2[] = []

    public GetLegalMoves(board : ChessBoard, opts? : {shallow? : boolean}) : Array<Vector2>{
        //Get the specific positions that a knight can get
        let legalPositions = this.moveOffsets.map(offset=>{
            const result = {x: this.position.x + offset.x, y: this.position.y + offset.y};

            if(!CheckIfMoveIsOnBoard(result)){
                return undefined;
            }
            if(board.state[result.y][result.x] && board.state[result.y][result.x]?.isWhite === this.isWhite){
                return undefined
            }
            return result
        })
        const trimmedLegalPositions  = legalPositions.filter((val): val is Vector2=>{return val !== undefined})

        return trimmedLegalPositions;
    }


}

export class Knight extends Piece{
    //Name for easy use in class names
    name = "knight"
    fen = "n"
    moveOffsets = [
        {x: -2, y: 1}, 
        {x: -2, y: -1}, 
        {x: 2, y: 1},   
        {x:2 , y:-1}, 
        {x:-1, y: 2}, 
        {x: 1, y: 2},
        {x:-1, y: -2}, 
        {x: 1, y: -2},
    ]

    public GetLegalMoves(board : ChessBoard, opts? : {shallow? : boolean}) : Array<Vector2>{
        //Get the specific positions that a knight can get
        let legalPositions = this.moveOffsets.map(offset=>{
            const result = {x: this.position.x + offset.x, y: this.position.y + offset.y};

            if(!CheckIfMoveIsOnBoard(result)){
                return undefined;
            }
            if(board.state[result.y][result.x] && board.state[result.y][result.x]?.isWhite === this.isWhite){
                return undefined
            }


            return result
        })
        const trimmedLegalPositions  = legalPositions.filter((val): val is Vector2=>{return val !== undefined})

        return trimmedLegalPositions;
    }
    CreateNewInstance<T>(): T {
        let newPiece = new Knight(this.isWhite, this.position)
        newPiece.hasMoved = this.hasMoved;
        return newPiece as T;
    }

}

export class Pawn extends Piece{

    name = "pawn";
    fen = "p";

    public GetLegalMoves(board : ChessBoard, opts? : {shallow? : boolean}) : Array<Vector2> {

        //Get the theoretical next position
        const upPos = {x: this.position.x, y: this.position.y + (1 * (this.isWhite? -1 : 1))}
        const upLeftSquare = board?.state[upPos.y]?.[upPos.x - 1];
        const upRightSquare = board?.state[upPos.y]?.[upPos.x + 1];

        let legalMoveList : Array<Vector2> = [];
        //Make sure the move is on the board
        if(!CheckIfMoveIsOnBoard(upPos)){
            return [];
        }
        //If there isn't a piece in front of the pawn, add it to the list
        if(!board.state[upPos.y][upPos.x]){
            legalMoveList.push({x: upPos.x, y: upPos.y})

            //Handle being able to move two spaces if this piece haven't moved yet
            if(!this.hasMoved && !board.state[upPos.y + (1 * (this.isWhite? -1 : 1))][upPos.x]){
                legalMoveList.push({x: upPos.x, y: upPos.y + (1 * (this.isWhite? -1 : 1))});
            }
        }
        //If there is an enemy piece up and on either side of the pawn, add those to the list
        if(upLeftSquare){
            if(upLeftSquare.isWhite !== this.isWhite){
                legalMoveList.push(upLeftSquare.position);
            }

        }
        if(upRightSquare){
            if(upRightSquare.isWhite !== this.isWhite){
                legalMoveList.push(upRightSquare.position);
            }

        }
        //TODO: deal with enpassant 


        return legalMoveList
        
    }
    CreateNewInstance<T>(): T {
        let newPiece = new Pawn(this.isWhite, this.position)
        newPiece.hasMoved = this.hasMoved;
        return newPiece as T;
    }

}

abstract class LongDistanceMover extends Piece{

    name = ""
    offsets : Vector2[] = []

    public GetLegalMoves(board: ChessBoard, opts? : {shallow? : boolean}): Vector2[] {
        
        let moves : Vector2[] = [];
        this.offsets.forEach((offset)=>{
            let currentPos = {x: this.position.x + offset.x, y: this.position.y + offset.y};
            let index = 0;
            while(CheckIfMoveIsOnBoard(currentPos) || index > 16){

                const square = board.state[currentPos.y][currentPos.x]

                if(square){
                    if(square.isWhite !== this.isWhite){
                        moves.push(currentPos);
                        break
                    }
                    else if(square !== this){
                        break;

                    }
                }
                    moves.push(currentPos)
                
                
                index++
                
                currentPos = {x: this.position.x + (offset.x * index), y: this.position.y + (offset.y * index)}

                
            }

        })
        return moves;
    }

}

class Bishop extends LongDistanceMover{
    name = "bishop"
    fen = "b"
    offsets = [
        {x: 1, y: 1},
        {x: -1, y:1},
        {x: 1, y:-1},
        {x:-1, y:-1}
    ]

    CreateNewInstance<T>(): T {
        let newPiece = new Bishop(this.isWhite, this.position)
        newPiece.hasMoved = this.hasMoved;
        return newPiece as T;
    }

}

class Rook extends LongDistanceMover{

    name = "rook"
    fen = "r";
    offsets: Vector2[] = [
        {x:0, y:1},
        {x:0, y:-1},
        {x:1, y:0},
        {x:-1, y:0}
    ]

    CreateNewInstance<Rook>(): Rook {
        let newPiece = new Rook(this.isWhite, this.position)
        newPiece.hasMoved = this.hasMoved;
        return newPiece as Rook;
    }

}

class Queen extends LongDistanceMover{

    name = "queen"
    fen = "q"
    offsets: Vector2[] = [
        {x:0, y:1},
        {x:0, y:-1},
        {x:1, y:0},
        {x:-1, y:0},
        {x: 1, y: 1},
        {x: -1, y:1},
        {x: 1, y:-1},
        {x:-1, y:-1}
    ]
    CreateNewInstance<Queen>(): Queen {
        let newPiece = new Queen(this.isWhite, this.position)
        newPiece.hasMoved = this.hasMoved;
        return newPiece as Queen;
    }
}
class King extends ShortDistanceMover{
    name = "king"
    fen = "k"
    moveOffsets: Vector2[] = [
        {x:0, y:1},
        {x:0, y:-1},
        {x:1, y:0},
        {x:-1, y:0},
        {x: 1, y: 1},
        {x: -1, y:1},
        {x: 1, y:-1},
        {x:-1, y:-1}
    ]
    CreateNewInstance<King>(): King {
        let newPiece = new King(this.isWhite, this.position)
        newPiece.hasMoved = this.hasMoved;
        return newPiece as King;
    }
}