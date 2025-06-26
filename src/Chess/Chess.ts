import { MoveOutsideBoundsError, AttemptToCaptureSameColorError, PieceDoesNotExistError } from "./Errors";

export enum PlayMode{

    freePlay,
    randomEnemy
}

type Move = {
    startSquare : number,
    targetSquare : number
}

export class ChessBoard{ 

    squares : Array<number>  = new Array(64).fill(0);
    numSquaresToEdge : Array<any>  = []

    public turnNumber : number = 1;
    public colorToMove : number = Piece.White;

    public moves : Move[] = [];
    private friendlyColor = Piece.White;
    private opponentColor = Piece.Black;

    private startingPosition = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR"
    private directionOffsets = [-8, 8, -1, 1, -9, -7, 9, 7,]

    

    constructor(fen? : string){

        if(!fen){
            this.LoadFromFen(this.startingPosition);
        } else{
            this.LoadFromFen(fen);
        }
        this.PrecomputedMoveData();
        this.moves = this.GenerateMoves();
    }

    private AdvanceTurn(){
        this.turnNumber++;

        this.opponentColor = (this.turnNumber % 2 == 0)? Piece.White : Piece.Black;
        this.friendlyColor = (this.turnNumber % 2 == 0)? Piece.Black : Piece.White;
    }


    private LoadFromFen(str : string){

        let positionI = 0;

        for(let i = 0; i < str.length; i++){
            const char = str[i];

            //If the character is a number, advance that amount of spaces
            const num = parseInt(char);
            if(num){
                positionI += num;
                continue
            }
            switch (char) {
                case 'p':
                    this.squares[positionI] = Piece.Pawn | Piece.Black;
                    break;
            
                case 'b':
                    this.squares[positionI] = Piece.Bishop | Piece.Black;
                    break;
            
                case 'r':
                    this.squares[positionI] = Piece.Rook | Piece.Black;
                    break;
            
                case 'n':
                    this.squares[positionI] = Piece.Knight | Piece.Black;
                    break;
            
                case 'q':
                    this.squares[positionI] = Piece.Queen | Piece.Black;
                    break;
            
                case 'k':
                    this.squares[positionI] = Piece.King | Piece.Black;
                    break;
            
                case 'P':
                    this.squares[positionI] = Piece.Pawn | Piece.White;
                    break;
            
                case 'B':
                    this.squares[positionI] = Piece.Bishop | Piece.White;
                    break;
            
                case 'R':
                    this.squares[positionI] = Piece.Rook | Piece.White;
                    break;
            
                case 'N':
                    this.squares[positionI] = Piece.Knight | Piece.White;
                    break;
            
                case 'Q':
                    this.squares[positionI] = Piece.Queen | Piece.White;
                    break;
            
                case 'K':
                    this.squares[positionI] = Piece.King | Piece.White;
                    break;
                case '/':
                    continue
                    break;
                default:
                    break;
            }
            positionI++;

        }

    }

    private PrecomputedMoveData(){
        for (let rank = 0; rank < 8; rank++) {
            for (let file = 0; file < 8; file++) {
                
                const south = 7 - rank;
                const north = rank;
                const west = file;
                const east = 7 - file;

                const squareIndex = rank * 8 + file;

                this.numSquaresToEdge[squareIndex] = [
                    north,
                    south,
                    west,
                    east,
                    Math.min(north, west),
                    Math.min(north, east),
                    Math.min(south, west),
                    Math.min(south, east),
                ]

                
            } 
        }
        console.log(this.numSquaresToEdge)
    }


    public GenerateMoves(){

        let moves : Move[] = [];

        this.squares.forEach((piece, i)=>{
            if(Piece.IsColor(piece, this.colorToMove)){
                if(Piece.IsSlidingPiece(piece)){
                    moves.push(...this.GenerateSlidingMoves(i, piece))
                }
            }
        })
        return moves
    }

    private GenerateSlidingMoves(startSquare : number, piece : number){

        const moves : Move[] = [];

        const startDirIndex = Piece.IsPiece(piece, Piece.Bishop) ? 4 : 0;
        const endDirIndex = Piece.IsPiece(piece, Piece.Rook) ? 4 : 8;

        //Loop over each direction
        for (let dir = startDirIndex; dir < endDirIndex; dir++) {
            for (let n = 0; n < this.numSquaresToEdge[startSquare][dir]; n++) {
                

                const targetSquare = startSquare + this.directionOffsets[dir] * (n + 1);
                const pieceOnSquare = this.squares[targetSquare];
                if(startSquare === 61){
                    console.log({n, dir, targetSquare})
                
                }
                //Piece is blocked by friendly
                if(Piece.IsColor(pieceOnSquare, this.friendlyColor)){
                    continue;
                }

                moves.push({startSquare, targetSquare});

                if(Piece.IsColor(pieceOnSquare, this.opponentColor)){
                break;
                }
            }
            
        }
        return moves
    }

    private GenerateKnightMoves(startSquare : number){
        //how the heck
    }

}


export class Piece{
    static Pawn = 1;
    static Knight = 2;
    static Bishop = 3;
    static Rook = 4;
    static King = 5;
    static Queen = 5;

    static White = 8;
    static Black = 16

    static IsPiece(piece : number, comparison : number){
        const pieceMask = 0b00111;
        return (piece & pieceMask) == (comparison & pieceMask)
    }

    static IsColor(piece : number, color : number){
        const colorMask = 0b11000;
        return (piece & colorMask) == (color & colorMask)
    }
    

    static IsSlidingPiece(piece : number){
        if(
        Piece.IsPiece(piece, Piece.Bishop) ||
        Piece.IsPiece(piece, Piece.Rook) ||
        Piece.IsPiece(piece, Piece.Queen)){
            return true;
        } else{
            return false;
        }
    }

}