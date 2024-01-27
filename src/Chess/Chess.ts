import { MoveOutsideBoundsError, AttemptToCaptureSameColorError } from "./Errors";

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

function Create2DArray<T>(xLen : number, yLen : number){

    let payload : Array<Array<T>> = new Array(xLen);

    for (let i = 0; i < xLen; i++) {
        payload[i] = new Array(yLen);
        
    }
    return payload;
}


export class ChessBoard{

    //The state of the board 
    public state = Create2DArray<Piece| null>(8, 8);
    //An array representing the captured pieces. Not divided into white or black because the pieces themselves
    //have that information
    public captures : Array<Piece> = [];

    
    public ResetBoard(){

        this.state = Create2DArray<Piece | null>(8,8);

        for (let i = 0; i < this.state.length; i++) {
            this.state[i] = this.state[i].fill(null)
            
        } 
        this.state[3][4] = new Knight(true, {x: 3, y : 4})
        this.state[2][2] = new Pawn(true, {x:2,y:2});
        this.state[3][5] = new Bishop(true, {x: 3, y: 5});
        this.state[4][2] = new Rook(true, {x: 4, y: 2});
    }

    /**
     * @description This function ensures that
     * the move attempting to be made is allowed
     * 
     * @param piece The piece to move
     * @param posToMove The position to move to
     */
    public MovePiece(piece : Piece, posToMove : Vector2){

        const squareToMoveTo = this.state[posToMove.x][posToMove.y];

        //Make sure the position to move is on the board, throw error if not
        if(posToMove.x < 0 || posToMove.y < 0 || posToMove.x > 8 || posToMove.y > 8){
            throw new MoveOutsideBoundsError(piece, posToMove);
        }
        if(squareToMoveTo){
            if(squareToMoveTo.isWhite === piece.isWhite){
                //If the pieces are the same color, throw error
                throw new AttemptToCaptureSameColorError(piece, posToMove);
            }
            else{
                //Capture the piece
                this.CapturePiece(squareToMoveTo)

                //Move piece

                //Remove the piece from the current location
                this.state[piece.position.x][piece.position.y] = null;
                //Set the piece's position to the indicated
                piece.position = posToMove;
                this.state[posToMove.x][posToMove.y] = piece;
            }
        }

        if(!this.state[posToMove.x][posToMove.y]){
            //If there is no piece already at the position to move, go ahead and move it
            
            //Remove the piece from the current location
            this.state[piece.position.x][piece.position.y] = null;
            //Set the piece's position to the indicated
            piece.position = posToMove;
            this.state[posToMove.x][posToMove.y] = piece;

        }



    }

    private CapturePiece(pieceBeingCaptured : Piece){

        this.captures.push(pieceBeingCaptured);
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
    name    = "";
    position : Vector2 = {x: 0, y:0}

    constructor(isWhite : boolean, initialPosition : Vector2){
        this.isWhite = isWhite
        this.position = initialPosition;
    }
    public GetLegalMoves(board : ChessBoard) : Array<Vector2> {
        return [];
    }


}

export class Knight extends Piece{
    //Name for easy use in class names
    name = "knight"
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

    public GetLegalMoves(board : ChessBoard) : Array<Vector2>{
        //Get the specific positions that a knight can get

        let legalPositions = this.moveOffsets.map(offset=>{
            const result = {x: this.position.x + offset.x, y: this.position.y + offset.y};

            if(!CheckIfMoveIsOnBoard(result)){
                return undefined;
            }
            if(board.state[result.x][result.y] && board.state[result.x][result.y]?.isWhite === this.isWhite){
                return undefined
            }

            return result
        })
        const trimmedLegalPositions  = legalPositions.filter((val): val is Vector2=>{return val !== undefined})

        return trimmedLegalPositions;
    }


}

export class Pawn extends Piece{

    name = "pawn";


    public GetLegalMoves(board : ChessBoard) : Array<Vector2> {

        //Get the theoretically next position
        const upPos = {x: this.position.x, y: this.position.y + (1 * (this.isWhite? -1 : 1))}
        const upLeftSquare = board.state[upPos.x - 1][upPos.y];
        const upRightSquare = board.state[upPos.x +1][upPos.y];

        let legalMoveList : Array<Vector2> = [];
        //Make sure the move is on the board
        if(!CheckIfMoveIsOnBoard(upPos)){
            return [];
        }
        //If there isn't a piece in front of the pawn, add it to the list
        if(!board.state[upPos.x][upPos.y]){
            legalMoveList.push({x: upPos.x, y: upPos.y})

            //Handle being able to move two spaces if this piece haven't moved yet
            if(!this.hasMoved && !board.state[upPos.x][upPos.y + (1 * (this.isWhite? -1 : 1))]){
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

}

abstract class LongDistanceMover extends Piece{

    name = ""
    offsets : Vector2[] = []

    public GetLegalMoves(board: ChessBoard): Vector2[] {
        
        let moves : Vector2[] = [];
        this.offsets.forEach((offset)=>{
            let currentPos = this.position;
            let index = 0;
            while(CheckIfMoveIsOnBoard(currentPos) || index > 16){

                const square = board.state[currentPos.x][currentPos.y]

                if(square){
                    if(square.isWhite !== this.isWhite){
                        moves.push(currentPos);
                    }
                    else if(square !== this){
                        break;

                    }
                }
                
                index++
                moves.push(currentPos)
                
                currentPos = {x: this.position.x + (offset.x * index), y: this.position.y + (offset.y * index)}

                
            }

        })
        return moves;
    }

}

class Bishop extends LongDistanceMover{
    name = "bishop"
    offsets = [
        {x: 1, y: 1},
        {x: -1, y:1},
        {x: 1, y:-1},
        {x:-1, y:-1}
    ]

    public  GetLegalMoves(board: ChessBoard): Vector2[] {
        return super.GetLegalMoves(board);
    }
}

class Rook extends LongDistanceMover{

    name = "rook"
    offsets: Vector2[] = [
        {x:0, y:1},
        {x:0, y:-1},
        {x:1, y:0},
        {x:-1, y:0}
    ]

    public GetLegalMoves(board: ChessBoard): Vector2[] {
        return super.GetLegalMoves(board);
    }
}