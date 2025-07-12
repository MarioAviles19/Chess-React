import { MoveOutsideBoundsError, AttemptToCaptureSameColorError, PieceDoesNotExistError } from "./Errors";

export enum PlayMode{

    freePlay,
    randomEnemy
}

type Move = {
    startSquare : number,
    targetSquare : number,
    flags? : number
}

export class ChessBoard{ 

    squares : Array<number>  = new Array(64).fill(0);
    numSquaresToEdge : Array<any>  = []

    public turnNumber : number = 1;
    public colorToMove : number = Piece.White;

    public moves : Move[] = [];
    public lastTurnMoves : Move[] = [];
    private friendlyColor = Piece.White;
    private opponentColor = Piece.Black;

    private pawnsNotMoved : number[] = [];

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

        this.colorToMove = (this.turnNumber % 2 == 0)? Piece.Black : Piece.White;
        this.opponentColor = (this.turnNumber % 2 == 0)? Piece.White : Piece.Black;
        this.friendlyColor = (this.turnNumber % 2 == 0)? Piece.Black : Piece.White;

        this.lastTurnMoves = this.moves;
        this.moves = this.GenerateMoves()
        console.log(this.colorToMove == Piece.Black ? "Black" : "White")
    }
    public MovePiece(move : Move){
        const piece = this.squares[move.startSquare];
        this.squares[move.startSquare] = 0;
        this.squares[move.targetSquare] = piece;

        //Remove pawn from list of unmoved pawns
        const pawnIndex = this.pawnsNotMoved.findIndex((square)=>{return square == move.startSquare});
        if(pawnIndex > -1){
            this.pawnsNotMoved.splice(pawnIndex, 1);
        }
        this.AdvanceTurn();
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
                    this.pawnsNotMoved.push(positionI)
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
                    this.pawnsNotMoved.push(positionI)
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
                else if(Piece.IsPiece(piece, Piece.Knight)){
                    moves.push(...this.GenerateKnightMoves(i))
                }
                else if(Piece.IsPiece(piece, Piece.Pawn)){
                    moves.push(...this.GeneratePawnMoves(i))
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
                //Piece is blocked by friendly
                if(Piece.IsColor(pieceOnSquare, this.friendlyColor)){
                    break;
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
        let moves : Move[] = []
        //how the heck


        //Offsets arranged from west to east
        const offsets = [-10, 6, -17, 15, -15, 17, -6, 10 ]

        const distanceToWestEdge = this.numSquaresToEdge[startSquare][2]
        const distanceToEastEdge = this.numSquaresToEdge[startSquare][3]
    
        let startIndex = 0;
        let endIndex = 8;

        //Exclude offsets that would wrap around the board
        if(distanceToEastEdge <= 1){
            endIndex -=  4 - (distanceToEastEdge * 2)
        }

        if(distanceToWestEdge <= 1){
            startIndex += 4 - (distanceToWestEdge * 2)
        }
        console.log({startIndex, distanceToWestEdge, startSquare})
        //Change to for loop which cuts off the furthest left or right moves if the number of squares to the edge is too big
        for(let i = startIndex; i < endIndex; i++){
            const targetSquare = startSquare + offsets[i]
            const pieceOnSquare = this.squares[targetSquare]


        

            if(targetSquare > 63 || targetSquare < 0){
                //TODO: Also prevent wrapping

                //if the move is off the board, skip
                continue
            }
            if(Piece.IsColor(pieceOnSquare, this.friendlyColor)){
                //If the target has a friendly piece on it, skip
                continue
            }

            moves.push({startSquare, targetSquare})


        }

        return moves

    }
    private GeneratePawnMoves(startSquare : number){
        let moves : Move[] = [];

        const pawnHasNotMoved = this.pawnsNotMoved.some((val)=>{return val === startSquare})
        let forwardDirectionMulitplier = this.colorToMove == Piece.Black ? 1 : -1;
        const numSquaresToEdgeSouth = this.numSquaresToEdge[0]
        const numSquaresToEdgeNorth = this.numSquaresToEdge[1]
        const numSquaresToEdgeEast = this.numSquaresToEdge[3]
        const numSquaresToEdgeWest = this.numSquaresToEdge[2]

        const startIndex = pawnHasNotMoved? 0 : 1;
        
        let offsets = [16 * forwardDirectionMulitplier, 8 * forwardDirectionMulitplier, 8 * forwardDirectionMulitplier + 1, 8 * forwardDirectionMulitplier - 1]
        let numToEdge = [forwardDirectionMulitplier == 1 ? numSquaresToEdgeSouth : numSquaresToEdgeNorth, forwardDirectionMulitplier == 1 ? numSquaresToEdgeSouth : numSquaresToEdgeNorth, numSquaresToEdgeEast, numSquaresToEdgeWest]
        
        for(let i = startIndex; i < 4; i++){
            const targetSquare = startSquare + offsets[i];
            if(numToEdge[i] <= 0){
                //If there are no squares, don't count it
                continue
            }
            const targetPiece = this.squares[targetSquare];
            if(Piece.IsColor(targetPiece, this.colorToMove)){
                //If piece is friendly, skip over it
                continue
            }
            if(i > 1 && !Piece.IsColor(targetPiece, this.opponentColor)){
                //If there is no enemy piece on diagonal, skip
                continue
            }
            if(i < 2 && targetPiece){
                //If there is a piece in front of the pawn, don't add the move
                continue
            }
            moves.push({startSquare, targetSquare})
            
        }
        console.log({PawnMoves: moves})
        return moves;
        
    }
    private GenerateKingMoves(startSquare : number){

        let moves : Move[] = [];

        for(let dir = 0; dir < 8; dir++){
            let targetSquare = startSquare + this.directionOffsets[dir];

            if(Piece.IsColor(targetSquare, this.friendlyColor)){
                //Skip if target is friendly
                continue;
            }
            if(this.numSquaresToEdge[startSquare][dir] >= 0){
                //If the move is on the board, add it
                moves.push({startSquare, targetSquare})
            }
        }
    }

}


export class Piece{
    static Pawn = 1;
    static Knight = 2;
    static Bishop = 3;
    static Rook = 4;
    static King = 5;
    static Queen = 6;

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