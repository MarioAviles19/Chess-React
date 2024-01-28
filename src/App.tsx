import { SetStateAction, useState } from 'react'
import { ChessBoard, Piece} from './Chess/Chess'
import './App.css'



const gameBoard = new ChessBoard();
gameBoard.ResetBoard()

function BoardSquare(pos: Vector2, piece : Piece | null, litUpSquares : Array<Vector2>, activePiece : Piece | null,  updateLitSquares : React.Dispatch<SetStateAction<Array<Vector2>>>, updateBoardState : React.Dispatch<SetStateAction<Array<Array<Piece | null>>>>, updateActivePiece : React.Dispatch<SetStateAction<Piece | null>>){
  //Get if the square is even for appropriate coloring
  const isEven = ((pos.x + pos.y) % 2 == 0) 

  let shouldBeLit = litUpSquares.some((val)=>{return (val.x === pos.x && val.y === pos.y)});



  let style = {
    backgroundColor : shouldBeLit? "red" : ""
  }
  function HandleClick(){
    //If there is no active piece

    if(activePiece){
      //If this is lit try to move the piece
      if(shouldBeLit){
        
        gameBoard.MovePiece(activePiece, pos)
        updateBoardState(gameBoard.state);

        updateLitSquares([]);
        updateActivePiece(null);
        return;
      }
    }
      //Set the lit squares
      updateLitSquares(piece?.GetLegalMoves(gameBoard) || []);
      //Set the active piece
      updateActivePiece(piece)
    

  }

  return (
    <div onClick={HandleClick} key={pos.x + ":" + pos.y}  className={(isEven? "evenSquare" : "oddSquare") + " boardSquare"}>
      {piece? <span className={"fas fa-chess-" + piece.name + (piece.isWhite? "": " black")}></span> : ""}
      {shouldBeLit? <div className='litOverlay'><div className="moveIndicator"></div></div>: <></>}
    </div>
  )
}

function GameBoard(){



  const squares = gameBoard.state

  let [litUpSquares, updateLitSquares] = useState<Array<Vector2>>([]);
  let [activePiece, updateActivePiece] = useState<Piece | null>(null);
  let [boardState, updateBoardState] = useState(squares);

  return (
    <>
      {boardState.map((val, x)=>{
        return (
          <div key={x} className="column">{
          val.map((piece, y)=>{
            //TODO: Clean this up
          return BoardSquare({x, y}, piece, litUpSquares, activePiece, updateLitSquares, updateBoardState, updateActivePiece)
        })}
        </div>
        )

      })}
    </>
  )

}

function App() {
  

  return (
    <div className="App">
      <div className="game">
        <GameBoard/>
        </div>
    </div>
  )
}

export default App
