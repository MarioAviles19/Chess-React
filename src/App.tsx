import { SetStateAction, useState } from 'react'
import { ChessBoard, Piece} from './Chess/Chess'
import './App.css'



const gameBoard = new ChessBoard();

function BoardSquare(pos: Vector2, piece : Piece | null, litUpSquares : Array<Vector2>, updateLitSquares : React.Dispatch<SetStateAction<Array<Vector2>>>){
  //Get if the square is even for appropriate coloring
  const isEven = ((pos.x + pos.y) % 2 == 0) 

  let shouldBeLit = litUpSquares.some((val)=>{return (val.x === pos.x && val.y === pos.y)});



  let style = {
    backgroundColor : shouldBeLit? "red" : ""
  }

  return (
    <div onClick={()=>{updateLitSquares(piece?.GetLegalMoves(gameBoard) || []); console.log(pos)}} key={pos.x + ":" + pos.y} style={style} className={(isEven? "evenSquare" : "oddSquare") + " boardSquare"}>
      {piece? <span className={"fas fa-chess-" + piece.name + (piece.isWhite? "": " black")}></span> : ""}
    </div>
  )
}

function GameBoard(){


  gameBoard.ResetBoard()
  const squares = gameBoard.state

  let [litUpSquares, updateLitSquares] = useState<Array<Vector2>>([]);

  return (
    <>
      {squares.map((val, x)=>{
        return (
          <div key={x} className="column">{
          val.map((piece, y)=>{
          return BoardSquare({x, y}, piece, litUpSquares, updateLitSquares)
        })}
        </div>
        )

      })}
    </>
  )

}

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="App">
      <div className="game">
        <GameBoard/>
        </div>
    </div>
  )
}

export default App
