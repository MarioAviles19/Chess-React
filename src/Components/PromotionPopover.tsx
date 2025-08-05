import { Piece } from "../Chess/Chess";
import { PieceToColorString } from "../Chess/Util";

function PromotionPopover(props : { onSelectionCallback : (piece : number)=>void, isOpen : boolean, pieceColorString : string}){


    if(props.isOpen){
        return( 
        <>
        <div className="popover popover-promotion">
                <button onClick={()=>{props.onSelectionCallback(Piece.Queen); console.log(props)}} className={"boardSquare fullHeight button-promotion" + " " + props.pieceColorString}>
                    <div className="fas fa-chess-queen"></div>
                </button>
                <button onClick={()=>{props.onSelectionCallback(Piece.Knight)}} className={"boardSquare fullHeight button-promotion" + " " + props.pieceColorString}>
                    <div className="fas fa-chess-knight"></div>
                </button>
                <button onClick={()=>{props.onSelectionCallback(Piece.Bishop)}} className={"boardSquare fullHeight button-promotion" + " " + props.pieceColorString}>
                    <div className="fas fa-chess-bishop"></div>
                </button>
                <button onClick={()=>{props.onSelectionCallback(Piece.Rook)}} className={"boardSquare fullHeight button-promotion" + " " + props.pieceColorString}>
                    <div className="fas fa-chess-rook"></div>
                </button>
        </div>
        </>)
    }
    
}

export default PromotionPopover