import { MoveOutsideBoundsError, AttemptToCaptureSameColorError, PieceDoesNotExistError } from "./Errors";
export enum PlayMode{
    
    freePlay,
    randomEnemy
}

type Move = {
    startSquare : number,
    targetSquare : number,
    flags? : number,
    capture? : number
}

export class ChessBoard{ 
    
    squares : Array<number>  = new Array(64).fill(0);
    numSquaresToEdge : Array<any>  = []
    
    public turnNumber : number = 1;
    public colorToMove : number = Piece.White;
    
    public moves : Move[] = [];
    private attackedSquares : number[] = []
    public lastTurnMoves : Move[] = [];
    private opponentColor = Piece.Black;
    
    private startingPosition = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR"
    private directionOffsets = [-8, 8, -1, 1, -9, -7, 7, 9]
    
    
    
    constructor(fen? : string){
        
        if(!fen){
            this.LoadFromFen(this.startingPosition);
        } else{
            this.LoadFromFen(fen);
        }
        this.numSquaresToEdge = BoardHelper.PrecomputedMoveData();
        this.moves = this.GenerateMoves();
    }
    
    private AdvanceTurn(){
        this.turnNumber++;
        
        this.colorToMove = (this.turnNumber % 2 == 0)? Piece.Black : Piece.White;
        this.opponentColor = (this.turnNumber % 2 == 0)? Piece.White : Piece.Black;
        
        this.lastTurnMoves = this.moves;
        this.moves = this.GenerateMoves()
    }
    public MakeMove(move : Move){
        this.MovePiece(move);
        this.AdvanceTurn();
    }
    public MovePiece(move : Move){
        const piece = this.squares[move.startSquare];
        this.squares[move.startSquare] = 0;
        this.squares[move.targetSquare] = piece;
    }
    UnmovePiece(move : Move){
        //Move the piece back
        const piece = this.squares[move.targetSquare];
        this.squares[move.targetSquare] = move.capture || 0;
        this.squares[move.startSquare] = piece;
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
    
    
    
    
    public GenerateMoves( opts = {shallow : false} ){
        
        let moves : Move[] = [];
        this.attackedSquares = BoardHelper.findAttackedSquares(this.squares, this.opponentColor)
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
                else if(Piece.IsPiece(piece, Piece.King)){
                    moves.push(...this.GenerateKingMoves(i))
                }
            }
        })
        return moves
    }
    public GenerateAttackData(boardState : number[]){
        let attackedSquares = [];
        let originalColorToMove = this.colorToMove
        let originalopponentColor = this.opponentColor
        let originalboardState = this.squares;
        this.squares = boardState
        
        this.colorToMove = originalopponentColor
        this.opponentColor = originalColorToMove
        
        attackedSquares = this.GenerateMoves({shallow : true})
        
    }
    
    private GenerateSlidingMoves(startSquare : number, piece : number){
        
        const moves : Move[] = [];
        
        const startDirIndex = Piece.IsPiece(piece, Piece.Bishop) ? 4 : 0;
        const endDirIndex = Piece.IsPiece(piece, Piece.Rook) ? 4 : 8;


        if(Piece.IsPiece(this.squares[startSquare], Piece.Queen) && Piece.IsColor(this.squares[startSquare], Piece.White)){
            console.log({ edge: this.numSquaresToEdge[startSquare],  offsets : this.directionOffsets});
        }
        //Loop over each direction
        for (let dir = startDirIndex; dir < endDirIndex; dir++) {
            for (let n = 0; n < this.numSquaresToEdge[startSquare][dir]; n++) {

                
                const targetSquare = startSquare + this.directionOffsets[dir] * (n + 1);
                const pieceOnSquare = this.squares[targetSquare];
                //Piece is blocked by friendly
                if(Piece.IsColor(pieceOnSquare, this.colorToMove)){
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
            if(Piece.IsColor(pieceOnSquare, this.colorToMove)){
                //If the target has a friendly piece on it, skip
                continue
            }
            
            moves.push({startSquare, targetSquare})
            
            
        }
        
        return moves
        
    }
    private GeneratePawnMoves(startSquare : number){
        let moves : Move[] = [];
        
        const pawnHasNotMoved = true;
        let forwardDirectionMulitplier = this.colorToMove == Piece.Black ? 1 : -1;
        const numSquaresToEdgeSouth = this.numSquaresToEdge[startSquare][0]
        const numSquaresToEdgeNorth = this.numSquaresToEdge[startSquare][1]
        const numSquaresToEdgeEast = this.numSquaresToEdge[startSquare][3]
        const numSquaresToEdgeWest = this.numSquaresToEdge[startSquare][2]
        
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
            let targetPiece = this.squares[targetSquare]
            if(Piece.IsColor(targetPiece, this.colorToMove)){
                //Skip if target is friendly
                continue;
            }
            console.log(this.attackedSquares)
            if(this.attackedSquares.some((square)=>{return targetSquare === square})){
                //if the square is attacked, don't add it
                continue
            }
            if(this.numSquaresToEdge[startSquare][dir] >= 0){
                //If the move is on the board, make it and check whether 
                moves.push({startSquare, targetSquare})
            }
        }
        return moves
    }
}
class BoardHelper{
    static directionOffsets = [-8, 8, -1, 1, -9, -7, 7, 9]
    
    static findAttackedSquares(boardState : number[], attackingColor : number){
        const numSquaresToEdge = BoardHelper.PrecomputedMoveData();
        
        let attackedSquares : number[] = [];
        
        boardState.forEach((piece, i)=>{
            if(Piece.IsColor(piece, attackingColor)){
                if(Piece.IsSlidingPiece(piece)){
                    attackedSquares.push(...GenerateSlidingMoves(i, piece))
                }
                else if(Piece.IsPiece(piece, Piece.Knight)){
                    attackedSquares.push(...GenerateKnightMoves(i))
                }
                else if(Piece.IsPiece(piece, Piece.Pawn)){
                    attackedSquares.push(...GeneratePawnMoves(i))
                }
                else if(Piece.IsPiece(piece, Piece.King)){
                    attackedSquares.push(...GenerateKingMoves(i))
                }
            }
        })
        
        
        
        function GenerateSlidingMoves(startSquare : number, piece : number){
            
            const squares : number[] = [];
            
            const startDirIndex = Piece.IsPiece(piece, Piece.Bishop) ? 4 : 0;
            const endDirIndex = Piece.IsPiece(piece, Piece.Rook) ? 4 : 8;
            
            //Loop over each direction
            for (let dir = startDirIndex; dir < endDirIndex; dir++) {
                for (let n = 0; n < numSquaresToEdge[startSquare][dir]; n++) {
                    
                    
                    const targetSquare = startSquare + BoardHelper.directionOffsets[dir] * (n + 1);
                    const pieceOnSquare = boardState[targetSquare];
                    
                    squares.push(targetSquare);
                    
                    if(pieceOnSquare){
                        break;
                    }
                }
                
            }
            return squares
        }
        
        function GenerateKnightMoves(startSquare : number){
            let squares : number[] = []
            //how the heck
            
            
            //Offsets arranged from west to east
            const offsets = [-10, 6, -17, 15, -15, 17, -6, 10 ]
            
            const distanceToWestEdge = numSquaresToEdge[startSquare][2]
            const distanceToEastEdge = numSquaresToEdge[startSquare][3]
            
            let startIndex = 0;
            let endIndex = 8;
            
            //Exclude offsets that would wrap around the board
            if(distanceToEastEdge <= 1){
                endIndex -=  4 - (distanceToEastEdge * 2)
            }
            
            if(distanceToWestEdge <= 1){
                startIndex += 4 - (distanceToWestEdge * 2)
            }
            //Change to for loop which cuts off the furthest left or right moves if the number of squares to the edge is too big
            for(let i = startIndex; i < endIndex; i++){
                const targetSquare = startSquare + offsets[i]
                
                if(targetSquare > 63 || targetSquare < 0){
                    //TODO: Also prevent wrapping
                    
                    //if the move is off the board, skip
                    continue
                }
                
                    squares.push(targetSquare);
            }
            
            return squares
            
        }
        function GeneratePawnMoves(startSquare : number){
            let squares : number[] = [];
            
            const pawnHasNotMoved = true;
            let forwardDirectionMulitplier = attackingColor == Piece.Black ? 1 : -1;
            const numSquaresToEdgeEast = numSquaresToEdge[startSquare][3]
            const numSquaresToEdgeWest = numSquaresToEdge[startSquare][2]
            
            const startIndex = pawnHasNotMoved? 0 : 1;
            
            let offsets = [8 * forwardDirectionMulitplier + 1, 8 * forwardDirectionMulitplier - 1]
            let numToEdge = [numSquaresToEdgeEast, numSquaresToEdgeWest]
            
            for(let i = startIndex; i < 2; i++){
                const targetSquare = startSquare + offsets[i];
                if(numToEdge[i] <= 0){
                    //If there are no squares, don't count it
                    continue
                }
                squares.push(targetSquare);

                
            }
            return squares;
            
        }
        function GenerateKingMoves(startSquare : number){
            
            let squares : number[] = [];
            
            for(let dir = 0; dir < 8; dir++){
                let targetSquare = startSquare + BoardHelper.directionOffsets[dir];
                if(numSquaresToEdge[startSquare][dir] >= 0){
                    //If the move is on the board, add it
                    squares.push(targetSquare);
                }
            }
            return squares;
        }

        return attackedSquares;
    }
    static PrecomputedMoveData(){
        let numSquaresToEdge = []
        for (let rank = 0; rank < 8; rank++) {
            for (let file = 0; file < 8; file++) {
                
                const south = 7 - rank;
                const north = rank;
                const west = file;
                const east = 7 - file;
                
                const squareIndex = rank * 8 + file;
                
                numSquaresToEdge[squareIndex] = [
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
        return numSquaresToEdge;
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