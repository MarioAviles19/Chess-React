import { Piece } from "./Chess";
export function PieceToNameString(piece : number){
    
    if(Piece.IsPiece(piece, Piece.Pawn)){
        return "pawn"
    } else if(Piece.IsPiece(piece, Piece.Bishop)){
        return "bishop"
    } else if(Piece.IsPiece(piece, Piece.Knight)){
        return "knight"
    } else if(Piece.IsPiece(piece, Piece.Rook)){
        return "rook"
    } else if(Piece.IsPiece(piece, Piece.King)){
        return "king"
    } else if(Piece.IsPiece(piece, Piece.Queen)){
        return "queen"
    }
}

export function PieceToColorString(piece : number){
    
    if(Piece.IsColor(piece, Piece.White)){
        return "white";
    } else{
        return "black"
    }
}