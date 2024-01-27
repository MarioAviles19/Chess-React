import { Piece } from "./Chess";
//Error for when a piece is trying to move outside the bounds of the board
export class MoveOutsideBoundsError extends Error{
    message = "Unable to make move because the position does not exist";
    piece : Piece | undefined;
    posToMove = {x: Number.NEGATIVE_INFINITY, y : Number.NEGATIVE_INFINITY}
    constructor(piece : Piece, posToMove : Vector2){
        super();
        this.piece = piece;
        this.posToMove = posToMove
    }
}

export class AttemptToCaptureSameColorError extends Error{
    message = "Unable to make move because the position does not exist";
    piece : Piece | undefined;
    posToMove = {x: Number.NEGATIVE_INFINITY, y : Number.NEGATIVE_INFINITY}
    constructor(piece : Piece, posToMove : Vector2){
        super();
        this.piece = piece;
        this.posToMove = posToMove
    }
}