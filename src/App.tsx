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
function ResetBoard(props : {updateLitSquares : React.Dispatch<SetStateAction<Array<Vector2>>>, updateBoardState : React.Dispatch<SetStateAction<Array<Array<Piece | null>>>>, updateActivePiece : React.Dispatch<SetStateAction<Piece | null>>}){

  function HandleClick(){
    gameBoard.ResetBoard()
    props.updateLitSquares([]);
    props.updateBoardState(gameBoard.state);
    props.updateActivePiece(null);
  }

  return (
    <button onClick={HandleClick} className='resetButton'>Reset Board</button>
  )
}

function GameBoard(props : {boardState : (Piece | null)[][], litUpSquares : Vector2[], activePiece : Piece | null, updateLitSquares : React.Dispatch<SetStateAction<Array<Vector2>>>, updateBoardState : React.Dispatch<SetStateAction<Array<Array<Piece | null>>>>, updateActivePiece : React.Dispatch<SetStateAction<Piece | null>>}){



  const squares = gameBoard.state



  return (
    <>
      {props.boardState.map((val, x)=>{
        return (
          <div key={x} className="column">{
          val.map((piece, y)=>{
            //TODO: Clean this up
          return BoardSquare({x, y}, piece, props.litUpSquares, props.activePiece, props.updateLitSquares, props.updateBoardState, props.updateActivePiece)
        })}
        </div>
        )

      })}
    </>
  )

}

function App() {
  let [litUpSquares, updateLitSquares] = useState<Array<Vector2>>([]);
  let [activePiece, updateActivePiece] = useState<Piece | null>(null);
  let [boardState, updateBoardState] = useState(gameBoard.state);

  return (
    <div className="App">
      <div aria-hidden="true" className="background"></div>
              <h1>Chess!</h1>
      <div className="gameWrapper">
        <div className="game">
          <GameBoard
          litUpSquares={litUpSquares}
          updateLitSquares={updateLitSquares}
          activePiece={activePiece}
          updateActivePiece={updateActivePiece}
          boardState={boardState}
          updateBoardState={updateBoardState}
          />
          </div>
        <div className="topShadow"></div>
        <div className="bottomLightShadow"></div>
        <div className="bottomHeavyShadow"></div>
      </div>
        <ResetBoard updateActivePiece={updateActivePiece} updateBoardState={updateBoardState} updateLitSquares={updateLitSquares}/>
    </div>

  )
}

export default App
