import { SetStateAction, useState } from 'react'
import { ChessBoard, Piece, PlayMode } from './Chess/Chess'
import { PieceToColorString, PieceToNameString } from './Chess/Util';
import './App.css'



const gameBoard = new ChessBoard();

function BoardSquare(index : number, piece: number, litUpSquares: Array<number>, activePiece: number, updateLitSquares: React.Dispatch<SetStateAction<Array<number>>>, updateBoardState: React.Dispatch<SetStateAction<Array<number>>>, updateActiveSquare: React.Dispatch<SetStateAction<number>>) {
  //Get if the square is even for appropriate coloring

  const isLight = ((((index % 8) + Math.floor(index / 8)) + 1) % 2) != 0;


  let shouldBeLit = gameBoard.moves.some((move)=>{return move.startSquare === activePiece && move.targetSquare === index})

  function HandleClick() {

    if (activePiece >= 0) {
      //If there is an active piece

     
      if (shouldBeLit) {
        gameBoard.MovePiece({startSquare : activePiece, targetSquare : index})
        updateBoardState(gameBoard.squares)
      }
    } 
      updateActiveSquare(index)


  }


  
   
      return (
        <div onClick={HandleClick} key={index} className={(isLight ? "evenSquare" : "oddSquare") + " boardSquare" + (piece > 0? " hasPiece" : "")} >
          {piece ? <span className={"fas fa-chess-" + PieceToNameString(piece) + " " + (PieceToColorString(piece))}></span> : ""}
          {shouldBeLit ? <div className={'litOverlay' + (piece? " hasPiece" : "")}><div className="moveIndicator"></div></div> : <></>}
        </div>
      )
    
    
  

}

function GameBoard(props: { boardState: (number)[], litUpSquares: number[], activePiece: number, updateLitSquares: React.Dispatch<SetStateAction<Array<number>>>, updateBoardState: React.Dispatch<SetStateAction<Array<number>>>, updateActivePiece: React.Dispatch<SetStateAction<number>> }) {



  return (
    <>
      {props.boardState.map((val, i) => {
        return (
              //TODO: Clean this up
              BoardSquare(i, val, props.litUpSquares, props.activePiece, props.updateLitSquares, props.updateBoardState, props.updateActivePiece)

        )

      })}
    </>
  )

}

function App() {
  let [litUpSquares, updateLitSquares] = useState<Array<number>>([]);
  let [activePiece, updateActivePiece] = useState<number>(-1);
  let [boardState, updateBoardState] = useState(gameBoard.squares);
  let [draggedPiece, updateDraggedPiece] = useState<Piece | null>(null);
  let [mousePos, updateMousePos] = useState<{x: number, y: number}>({x:0, y:0});

  let mouseX : number = 0;
  let mouseY : number = 0;


  const updateMousePosHandler : React.MouseEventHandler<HTMLDivElement> = (e)=>{

    updateMousePos({x: e.clientX, y: e.clientY});
  }

  return (
    <div className="App" onMouseMove={updateMousePosHandler}>
      <div aria-hidden="true" className="background"></div>
      <header>
        <a className="backButton" href="https://marioaviles.com"><i aria-hidden="true" className='fas fa-chevron-left'></i>Back To Website</a>
        <h1>Chess</h1>
        
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
          
          <p>Turn 0</p>
        </div>
        <div className="topShadow"></div>
        <div className="bottomShadow"></div>
        <div className="bottomHeavyShadow"></div>
      </div>
    
   
    </div>
    

  )
}

export default App
