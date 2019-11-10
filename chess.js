
var target;
var originalColor;
var lastMove;
var toColor;
var fromColor;
var toSquare;
var fromSquare;
let lastMoveColor = "#9ff474";
let highlight = "#53f600";
let legalSquaresColor = "#f9eb9b";
var playersTurn = "white";
var legalMove = false;
let errorSound = document.getElementById("errorSound");
let moveSound = document.getElementById("moveSound");
let promotionSound = document.getElementById("promotionSound");
promotionSound.load();



//generates the board based on initial HTML settings. WILL NOT re-generate the board from scratch
let newBoard = function(){
  var div = document.getElementsByTagName("div");
  for (var i = 0; i < div.length; i++) {
    if((div[i].getAttribute("player") != "") && (div[i].getAttribute("piece")  != null)){
        var piece = div[i].getAttribute("piece");
        div[i].style.backgroundImage = "url(pieces/" + div[i].getAttribute("player") + "/" + piece + ".png)";
    }
  }
}

//calls the function that generates the board
newBoard();

//click functions
document.addEventListener("click", function(e){
  //First make nothing happen if the user clicks outside the board, and reset the target so the player can choose another piece
  if(e.target.getAttribute("class") == "area"){
    resetTarget();
    return;
  }
  //Highlight the selected piece, assign the square to target, and grab the background color so it can be unhighlighted later
  if (target === undefined && e.target.getAttribute("player") === playersTurn){
    selectPiece(e);
    //move
  } else if (target != undefined) {
    isLegalMove(target, e);
      if (legalMove){
        move(e);
      } else {
          errorSound.load()
          errorSound.play();
        }
    }
});

let resetTarget = function(){
  //only reset color if there is a target selected to avoid "Cannot set property of undefined" errors
  if(target){
    target.style.backgroundColor = originalColor;
  }
  target = undefined;
}

//grab the piece clicked on, grab the background color for later, and highlight the square
let selectPiece = function(e){
  target = e.target;
  originalColor = target.style.backgroundColor;
  target.style.backgroundColor = highlight;
}

let move = function(e){
  if(target === undefined){
    return;
  }
  //Move the piece to the new square, reset the color of the old square, and reset the variables
  //skips the coloring if it's the first move, essentially
  if(toSquare != undefined){
    //changes the 2 old squares back to their original color
    toSquare.style.backgroundColor = toColor;
    fromSquare.style.backgroundColor = fromColor;
  }
  //grabs the colors from the squares that have just been moved
  toSquare = e.target;
  toColor = e.target.style.backgroundColor;
  fromSquare = target;
  fromColor = originalColor;
  //adds the piece image to the new square, removes the old one, and resets the variables
  //Grab current piece image
  image = target.style.backgroundImage;
  //remove the piece image from the square you are moving from and reset board color
  target.style.backgroundImage = "";
  target.style.backgroundColor = lastMoveColor;
  //now add the piece to the square you are moving to and
  e.target.style.backgroundImage = image;
  e.target.style.backgroundColor = lastMoveColor;
  //change players turn and set new square to correnct piece
  e.target.setAttribute("player", playersTurn);
  e.target.setAttribute("piece", target.getAttribute("piece"));
  //handles pawn promotion
  if(target.getAttribute("piece") === "pawn" && target.getAttribute("player") === "white" && e.target.getAttribute('row') === "1"){
    e.target.setAttribute("piece", "queen");
    e.target.style.backgroundImage =  "url(pieces/white/queen.png)";
    promotionSound.play();
  }
  if(target.getAttribute("piece") === "pawn" && target.getAttribute("player") === "black" && e.target.getAttribute('row') === "8"){
    e.target.setAttribute("piece", "queen");
    e.target.style.backgroundImage =  "url(pieces/black/queen.png)";
    promotionSound.play();
  }
  //handles resetting en passant attributes
  if(playersTurn === "white"){
    var div = document.getElementsByTagName("div");
    for (var i = 0; i < div.length; i++) {
      if(div[i].getAttribute('row') === "3"){
        div[i].setAttribute('enPassant', "false");
      }
    }
  } else {
      var div = document.getElementsByTagName("div");
      for (var i = 0; i < div.length; i++) {
        if(div[i].getAttribute('row') === "6"){
          div[i].setAttribute('enPassant', "false");
        }
      }
    }
  //reset variables for next turn and make the appropriate sounds
  target.setAttribute("player", "");
  target.setAttribute("piece", "");
  target = undefined;
  originalColor = undefined;
  legalMove = false;
  captureEnPassant = false;
  moveSound.load();
  moveSound.play();
  if(playersTurn === "white"){
    playersTurn = "black";
  } else {
    playersTurn = "white";
    }
};

//Deletes the appropriate pawn during an en passant capture
let enPassantCapture = function(targetColumn, targetRow, playersTurn){
  var div = document.getElementsByTagName("div");
  if(playersTurn === "white"){
    for (var i = 0; i < div.length; i++) {
      if(div[i].getAttribute("column") === targetColumn.toString() && div[i].getAttribute("row") === (targetRow + 1).toString()){
        div[i].setAttribute("piece", "");
        div[i].setAttribute("player", "");
        div[i].style.backgroundImage = '';
      }
    }
  } else {
    for (var i = 0; i < div.length; i++) {
      if(div[i].getAttribute("column") === targetColumn.toString() && div[i].getAttribute("row") === (targetRow - 1).toString()){
        div[i].setAttribute("piece", "");
        div[i].setAttribute("player", "");
        div[i].style.backgroundImage = '';
      }
    }
  }
}

//Checks to make sure the attempted move is legal. This is the main function for all of the piece logic in the game
let isLegalMove = function(target, e){
  //check if the correct player is trying to move
  if(target.getAttribute("player") === playersTurn){
    //grab row and column information for both the piece trying to move, and the square moving to
    currentRow = parseInt(target.getAttribute("row"));
    targetRow = parseInt(e.target.getAttribute("row"));
    currentColumn = parseInt(target.getAttribute("column"));
    targetColumn = parseInt(e.target.getAttribute("column"));
    //handles all pawn moves
    if(target.getAttribute("piece") === "pawn"){
      //handles white's pawn move foward 1 or 2 squares
      if(playersTurn === "white"){
        if((targetRow === (currentRow - 1) || (target.getAttribute("row") === "7") && targetRow === (currentRow - 2)) && targetColumn === currentColumn && e.target.getAttribute("piece") === "") {
          //handles assigning "en passant" value when appropriate
          if(targetRow === (currentRow - 2)){
            var div = document.getElementsByTagName("div");
            for (var i = 0; i < div.length; i++) {
              if((div[i].getAttribute("row") === (currentRow - 1).toString()) && (div[i].getAttribute("column")  === (currentColumn).toString())){
                  div[i].setAttribute('enPassant', "true");
              }
            }
          }
          legalMove = true;
        //handles white's capture mechanincs
        } else if ((targetRow === (currentRow - 1) && targetColumn === (currentColumn + 1) && e.target.getAttribute("player") === 'black') || (targetRow    === (currentRow - 1) && targetColumn === (currentColumn - 1) && e.target.getAttribute("player") === 'black')){
          legalMove = true;
          //white's en passant
        } else if ((targetRow === (currentRow - 1) && targetColumn === (currentColumn + 1) && e.target.getAttribute('enPassant') === 'true' || (targetRow  === (currentRow - 1) && targetColumn === (currentColumn - 1) && e.target.getAttribute('enPassant') === 'true'))){
          legalMove = true;
          captureEnPassant = true;
          enPassantCapture(targetColumn, targetRow, playersTurn);
        }
        //handles black's move forward 1 or 2 squares
      } else {
          if((targetRow === (currentRow + 1) || (target.getAttribute("row") === "2") && targetRow === (currentRow + 2)) && targetColumn === currentColumn && e.target.getAttribute("piece") === "") {
            //handles assigning "en passant" value when appropriate
            if(targetRow === (currentRow + 2)){
              var div = document.getElementsByTagName("div");
              for (var i = 0; i < div.length; i++) {
                if((div[i].getAttribute("row") === (currentRow + 1).toString()) && (div[i].getAttribute("column")  === (currentColumn).toString())){
                    div[i].setAttribute('enPassant', "true");
                }
              }
            }
            legalMove = true;
            //handles black's capture mechanics
          } else if ((targetRow === (currentRow + 1) && targetColumn === (currentColumn + 1) && e.target.getAttribute("player") === 'white') || (targetRow === (currentRow + 1) && targetColumn === (currentColumn - 1) && e.target.getAttribute("player") === 'white')){
            legalMove = true;
            //black's en passant
          } else if ((targetRow === (currentRow + 1) && targetColumn === (currentColumn + 1) && e.target.getAttribute('enPassant') === 'true' || (targetRow  === (currentRow + 1) && targetColumn === (currentColumn + 1) && e.target.getAttribute('enPassant') === 'true'))) {
              legalMove = true;
              captureEnPassant = true;
              enPassantCapture(targetColumn, targetRow, playersTurn);
          }
        }
    }
    //handles all vertical and horizontal moves. Ultimately handles the bishop, rook, queen, and king
    if(target.getAttribute('piece') === "rook" || target.getAttribute('piece') === "bishop" || target.getAttribute('piece') === "queen" || target.getAttribute('piece') === "king"){
      console.log(target.getAttribute('piece'));
    }
    //handles knight moves CURRENTLY DOES NOTHING
    if(target.getAttribute('piece') === "knight"){
    }
    //Here is probably where I'll put functions for checking mate, check, and stalemate conditions
    //
  }
}
