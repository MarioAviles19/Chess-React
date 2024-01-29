import { SetStateAction, useState } from 'react'
import { ChessBoard, Piece, PlayMode } from './Chess/Chess'
import './App.css'



const gameBoard = new ChessBoard();
gameBoard.ResetBoard()

function BoardSquare(pos: Vector2, piece: Piece | null, litUpSquares: Array<Vector2>, activePiece: Piece | null, updateLitSquares: React.Dispatch<SetStateAction<Array<Vector2>>>, updateBoardState: React.Dispatch<SetStateAction<Array<Array<Piece | null>>>>, updateActivePiece: React.Dispatch<SetStateAction<Piece | null>>) {
  //Get if the square is even for appropriate coloring
  const isEven = ((pos.x + pos.y) % 2 == 0)

  let shouldBeLit = litUpSquares.some((val) => { return (val.x === pos.x && val.y === pos.y) });


  function HandleClick() {
    //If there is no active piece

    if (activePiece) {
      //If this is lit try to move the piece
      if (shouldBeLit) {

        gameBoard.MovePiece(activePiece, pos)
        updateBoardState(gameBoard.state);

        updateLitSquares([]);
        updateActivePiece(null);
        return;
      }
    }

    //If it is this piece's turn to move
    if((piece?.isWhite && gameBoard.turnNumber % 2 === 0) || (!piece?.isWhite && gameBoard.turnNumber % 2 === 1)){
      //Set the lit squares
      updateLitSquares(piece?.GetLegalMoves(gameBoard) || []);
      //Set the active piece
      updateActivePiece(piece)
    }


  }

  return (
    <div onClick={HandleClick} key={pos.x + ":" + pos.y} className={(isEven ? "evenSquare" : "oddSquare") + " boardSquare"}>
      {piece ? <span className={"fas fa-chess-" + piece.name + (piece.isWhite ? "" : " black")}></span> : ""}
      {shouldBeLit ? <div className={'litOverlay' + (piece? " hasPiece" : "")}><div className="moveIndicator"></div></div> : <></>}
    </div>
  )
}
function ResetBoard(props: { updateLitSquares: React.Dispatch<SetStateAction<Array<Vector2>>>, updateBoardState: React.Dispatch<SetStateAction<Array<Array<Piece | null>>>>, updateActivePiece: React.Dispatch<SetStateAction<Piece | null>> }) {

  function HandleClick() {
    gameBoard.ResetBoard()
    props.updateLitSquares([]);
    props.updateBoardState(gameBoard.state);
    props.updateActivePiece(null);
  }

  return (
    <button onClick={HandleClick} className='resetButton'>Reset Board</button>
  )
}

function GameBoard(props: { boardState: (Piece | null)[][], litUpSquares: Vector2[], activePiece: Piece | null, updateLitSquares: React.Dispatch<SetStateAction<Array<Vector2>>>, updateBoardState: React.Dispatch<SetStateAction<Array<Array<Piece | null>>>>, updateActivePiece: React.Dispatch<SetStateAction<Piece | null>> }) {



  const squares = gameBoard.state



  return (
    <>
      {props.boardState.map((val, x) => {
        return (
          <div key={x} className="column">{
            val.map((piece, y) => {
              //TODO: Clean this up
              return BoardSquare({ x, y }, piece, props.litUpSquares, props.activePiece, props.updateLitSquares, props.updateBoardState, props.updateActivePiece)
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

  const selectMode: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
    if (e.target.value) {
      if (e.target.value === "free") {
        gameBoard.mode = PlayMode.freePlay
      } else if (e.target.value === "random") {
        gameBoard.mode = PlayMode.randomEnemy;
      }
    }
  }

  return (
    <div className="App">
      <div aria-hidden="true" className="background"></div>
      <header>
        <a className="backButton" href="https://marioaviles.com"><i aria-hidden="true" className='fas fa-chevron-left'></i>Back To Website</a>
        <h1>Chess!</h1>
      </header>

      <div className="gameWrapper">
        <div className="panel">
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
        </div>
        <div className="topShadow"></div>
        <div className="bottomShadow"></div>
        <div className="bottomHeavyShadow"></div>
      </div>
      <div className="controlPanel wrapper">

        <div className="panel">
          <h2>Game Info</h2>
          
          <p>Turn {gameBoard.turnNumber}</p>
          <p>{gameBoard.turnNumber % 2 === 0? "White to move": "Black to move"}</p>
          <select onChange={selectMode}>
            <option value="free">Free Play</option>
            <option value="random">Random</option>
          </select>
        </div>
        <div className="topShadow"></div>
        <div className="bottomShadow"></div>
        <div className="bottomHeavyShadow"></div>
      </div>
      <ResetBoard updateActivePiece={updateActivePiece} updateBoardState={updateBoardState} updateLitSquares={updateLitSquares} />
    </div>

  )
}

export default App
