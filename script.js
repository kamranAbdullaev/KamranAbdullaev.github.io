const startBtn = document.querySelector('#start'),
  screens = document.querySelectorAll('.screen');

let huPlayer = "X";
let aiPlayer = "O";
let cell = document.querySelectorAll('.cell');
let aiCo = "red";
let huCo = "blue";

$('.players2').click(function () {
  screens[0].classList.add('up');
  screens[1].classList.add('up');
  twoPlayers();
});

function statBtn() {
  startBtn.addEventListener('click', (event) => {
    $('.start').css({
      'font-size': '0px',
      'transition': '1.7s'
    });
    $('.gameName').css({
      'font-size': '0px',
      'transition': '1.7s'
    });
    //  $('.mortalLough').html('<audio class="musicAudio"src="https://zvukipro.com/uploads/files/2018-12/1545842847_mji3nde5ntg0mji3nde0_c_2b1cpabqhho.mp3" autoplay></audio>');
    event.preventDefault();
    setTimeout(() => {
      screens[0].classList.add('up');
      buttonSelectionShow();
      buttonSelection();
    }, 2200);
  });
}
statBtn();

function buttonSelectionShow() {
  $(".guys, p").css("display", "block");
  $(".dots").css("display", "flex");
  $(".dots2").css("display", "flex");
  $("td").css("display", "show");
  $('.start').css({
    'font-size': '40px',
  });
  $('.gameName').css({
    'font-size': '90px'
  });
  $(".dots").css({
    'opacity': '1',
    'height': '100px',
    'width': '100px',
    'transition': '0.5s',
    'font-size': '70px'
  });
  $(".dots2").css({
    'opacity': '1',
    'height': '100px',
    'width': '100px',
    'transition': '0.5s',
    'font-size': '70px'
  });
}

/* function MortalComabatFightAudio() {
  $("td").html('<div><audio class="musicAudio"src="https://zvukipro.com/uploads/files/2018-12/1545842748_nta3mde5ntg0nta3mtew_n4ltgrxccn4.mp3" autoplay></audio></div>');
} */

function buttonSelection() {
  $(".dots").click(function () {
    $(".dots").css({
      'opacity': '0.3',
      'height': '70px',
      'width': '70px',
      'transition': '0.5s',
      'font-size': '40px'
    });
    // MortalComabatFightAudio();
    setTimeout(() => {
      $(".guys, p").css("display", "none");
      $("td").css("display", "show");
      $("table").css("display", "block");
      aiCo = "blue";
      huCo = "red";
      console.log("Red");
      huPlayer = "X";
      aiPlayer = "O";
      oneClick();
    }, 1000);
  });

  $(".dots2").click(function () {
    $(".dots2").css({
      'opacity': '0.3',
      'height': '70px',
      'width': '70px',
      'transition': '0.5s',
      'font-size': '40px'
    });
    //  MortalComabatFightAudio();
    setTimeout(() => {
      $(".guys, p").css("display", "none");
      $("td").css("display", "show");
      $("table").css("display", "block");
      console.log("blue");
      huPlayer = "O";
      aiPlayer = "X";
      aiCo = "red";
      huCo = "blue";
      oneClick();
    }, 1500);

  });

}

function oneClick() {
  $("td").click(addFunc);
}

function addFunc() {
  move(this, huPlayer, huCo);
  let ai = "ai",
    human = "human";
  this.setAttribute('human', "human");
  if (this.hasAttribute(ai)) { } else if (this.hasAttribute(human)) {
    this.innerHTML = `${huPlayer}`;
    this.style.textShadow = "0 0 13px #fff";
  }

}

function offClick() {
  $("td").off('click');
}

let board = [0, 1, 2, 3, 4, 5, 6, 7, 8];
let iter = 0;
let round = 0;
let = textAboutGame = document.querySelector('.modal__title');

function move(element, player, color) {
  if (board[element.id] != "X" && board[element.id] != "O") {
    round++;
    $(element).css("background-color", color);
    board[element.id] = player;

    if (winning(board, player)) {
      setTimeout(function () {
        textAboutGame.innerHTML = `<h1>YOU WIN</h1>`;
        openModal();
      }, 500);
      return;
    } else if (round > 8) {
      setTimeout(function () {
        textAboutGame.innerHTML = `<h1>drawn game</h1>`;
        openModal();
      }, 500);
      return;
    } else {
      round++;
      let index = minimax(board, aiPlayer).index;
      let selector = "#" + index;
      let selectorAi = $(selector);
      selectorAi.css("background-color", aiCo);
      selectorAi.css("text-shadow", "0 0 13px #fff");
      selectorAi.html(aiPlayer);
      selectorAi.attr('ai', 'ai');
      board[index] = aiPlayer;
      offClick();

      if (winning(board, aiPlayer)) {
        setTimeout(function () {
          textAboutGame.innerHTML = `<h1>YOU LOSE</h1>`;
          openModal();
        }, 500);
        return;
      } else if (round === 0) {
        setTimeout(function () {
          textAboutGame.innerHTML = `<h1>drawn game</h1>`;
          openModal();
        }, 500);
        return;
      }
      oneClick();
    }
  }
}

function reset() {
  round = 0;
  board = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  $("td").css("background-color", "transparent");
  $("td").html("");
  $(".guys, p").css("display", "show");
  $("td").css("display", "show");
  $("table").css("display", "none");
  $("td").removeAttr("ai");
  $("td").removeAttr("human");
  statBtn();
}

function minimax(reboard, player) {
  iter++;
  let array = avail(reboard);
  if (winning(reboard, huPlayer)) {
    return {
      score: -10
    };
  } else if (winning(reboard, aiPlayer)) {
    return {
      score: 10
    };
  } else if (array.length === 0) {
    return {
      score: 0
    };
  }

  var moves = [];
  for (var i = 0; i < array.length; i++) {
    var move = {};
    move.index = reboard[array[i]];
    reboard[array[i]] = player;

    if (player == aiPlayer) {
      var g = minimax(reboard, huPlayer);
      move.score = g.score;
    } else {
      var g = minimax(reboard, aiPlayer);
      move.score = g.score;
    }
    reboard[array[i]] = move.index;
    moves.push(move);
  }

  var bestMove;
  if (player === aiPlayer) {
    var bestScore = -10000;
    for (var i = 0; i < moves.length; i++) {
      if (moves[i].score > bestScore) {
        bestScore = moves[i].score;
        bestMove = i;
      }
    }
  } else {
    var bestScore = 10000;
    for (var i = 0; i < moves.length; i++) {
      if (moves[i].score < bestScore) {
        bestScore = moves[i].score;
        bestMove = i;
      }
    }
  }
  return moves[bestMove];
}

function avail(reboard) {
  return reboard.filter(s => s != "X" && s != "O");
}

function winning(board, player) {
  if (
    (board[0] == player && board[1] == player && board[2] == player) ||
    (board[3] == player && board[4] == player && board[5] == player) ||
    (board[6] == player && board[7] == player && board[8] == player) ||
    (board[0] == player && board[3] == player && board[6] == player) ||
    (board[1] == player && board[4] == player && board[7] == player) ||
    (board[2] == player && board[5] == player && board[8] == player) ||
    (board[0] == player && board[4] == player && board[8] == player) ||
    (board[2] == player && board[4] == player && board[6] == player)
  ) {
    return true;
  } else {
    return false;
  }
}

//**** MODAL */
let modal = document.querySelector('.modal'),
  restartBtn = document.querySelector('.btnRestart');

function openModal() {
  modal.classList.add('show');
  modal.classList.remove('hide');
  document.body.style.overflow = 'hidden';
}

modal.addEventListener('click', (e) => { // Прики клике на заднюю подложку модальное окно закрывается!
  if (e.target === modal || e.target.getAttribute('data-close') == '') {
    CloseModal();
  }
});

document.addEventListener('keydown', (e) => { // keydown- указывает при нажатий на клавищу 
  if (e.code === 'Escape' && modal.classList.contains('show')) { // code отслеживает нашу клавищу!
    CloseModal();
  }
});
restartBtn.addEventListener('click', (e) => {
  e.preventDefault();
  CloseModal();
});

function CloseModal() {
  modal.classList.add('hide');
  modal.classList.remove('show');
  document.body.style.overflow = '';
  screens[0].classList.remove('up');
  reset();
}
// ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


/* 


$('.player1').click(function () {
  $('.choosePlayer').css('display', 'none');
  $('.chooseYouPlayer').css('display', 'none');
  $('.tableForTwoPlayer').css('display', 'grid');
  oneClickTwoPlayers();
});

$('.player2').click(function () {
  $('.choosePlayer').css('display', 'none');
  $('.chooseYouPlayer').css('display', 'none');
  $('.tableForTwoPlayer').css('display', 'grid');
  oneClickTwoPlayers();
});



function oneClickTwoPlayers() {
  $("td").click(addFuncTwoPlayers);
}

let Player1 = "X";
let Player2 = "O";
let p1Color = "red";
let p2Color = "blue";

function addFuncTwoPlayers() {
  move2(this, Player1, p1Color);
  let human2 = "human2",
    human1 = "human1";
  this.setAttribute('human1', "human1");
  if (this.hasAttribute(human2)) { } else if (this.hasAttribute(human1)) {
    this.innerHTML = `${Player1}`;
    this.style.textShadow = "0 0 13px #fff";
  }

}
let board2 = [0, 1, 2, 3, 4, 5, 6, 7, 8];
let iter2 = 0;
let round2 = 0;

function move2(element, Player1, color) {
  if (board2[element.id] != "X" && board2[element.id] != "O") {
    round2++;
    $(element).css("background-color", color);
    board2[element.id] = player;

    if (winning2(board2, player)) {
      setTimeout(function () {
        // textAboutGame.innerHTML = `<h1>YOU WIN</h1>`;
        // openModal();
        alert('Win');
      }, 500);
      return;
    } else if (round2 > 8) {
      setTimeout(function () {
        // textAboutGame.innerHTML = `<h1>drawn game</h1>`;
        // openModal();
        alert('Draw');
      }, 500);
      return;
    } else {
      round2++;
      function move3(element2, Player2, p2Color) {
        if (board2[element2.id] != "X" && board2[element.id] != "O") {
          round2++;
          $(element).css("background-color", color);
          board2[element2.id] = Player2;

          if (winning2(board2, Player2)) {
            setTimeout(function () {
              // textAboutGame.innerHTML = `<h1>YOU WIN</h1>`;
              // openModal();
              alert('Win');
            }, 500);
            return;
          } else if (round2 > 8) {
            setTimeout(function () {
              // textAboutGame.innerHTML = `<h1>drawn game</h1>`;
              // openModal();
              alert('Draw');
            }, 500);
            return;
          }
        }
      }
    }
  }
} */
twoPlayers();
function twoPlayers() {

  let buttonStart = document.querySelector(".button-start");
  let ticTacToe = document.querySelector(".tic-tac-toe");
  let blockPlayer = document.querySelector(".block-player");
  let blockNowPlayer = document.querySelector(".block-player div");
  let gameBlock = document.querySelectorAll(".block");
  let mass = ["X", "0"];
  let blockWinner = document.querySelector(".winner");

  buttonStart.onclick = playGame;

  $('.home').click(function (){
    screens[0].classList.remove('up');
    screens[1].classList.remove('up');
  });

  function transformGame() {
    buttonStart.classList.toggle("hidden-button");
    ticTacToe.classList.toggle("open-game");
    blockPlayer.classList.toggle("close-block-player");
  }

  function endGame() {
    buttonStart.classList.remove("hidden-button");
    ticTacToe.classList.remove("open-game");
    blockPlayer.classList.add("close-block-player");
    buttonStart.innerHTML = "Играть снова";
    blockWinner.classList.remove("hidden-winner");
    setTimeout(function () {
      for (i = 0; i < gameBlock.length; i++) {
        gameBlock[i].innerHTML = "";
      }
    }, 1000);
  }

  function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function randomInner() {
    blockNowPlayer.innerHTML = mass[rand(0, mass.length - 1)];
  }

  function nextPlayer() {
    if (blockNowPlayer.innerHTML === mass[0]) {
      blockNowPlayer.innerHTML = mass[1];
    }
    else if (blockNowPlayer.innerHTML === mass[1]) {
      blockNowPlayer.innerHTML = mass[0];
    }
  }

  function indexOfMass(a, m) {
    let result;
    for (i = 0; i < m.length; i++) {
      if (a.indexOf(m[i]) === -1) result = -1;
    }
    if (result !== -1) return true;
    else if (result === -1) return false;
  }

  function checkWin() {
    let massWin = [[0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]];
    let x = [];
    let y = [];
    for (i = 0; i < gameBlock.length; i++) {
      if (gameBlock[i].innerHTML === `<span class="player1">X</span>`) x.push(i);
      else if (gameBlock[i].innerHTML === `<span class="player2">O</span>`) y.push(i);
    }
    for (z = 0; z < massWin.length; z++) {
      if (indexOfMass(x, massWin[z])) {
        endGame();
        return ("Победил крестик");
      }

      if (indexOfMass(y, massWin[z])) {
        endGame();
        return ("Победил нолик");
      }
    }
  }

  function stopPlay() {
    ticTacToe.onclick = function () {
      return false;
    };
  }

  function playGame() {
    transformGame();
    blockWinner.classList.add("hidden-winner");
    randomInner();
    var count = 0;
    ticTacToe.onclick = function (event) {
      if (event.target.className === "block" &&
        event.target.innerHTML === "") {
        event.target.innerHTML = blockNowPlayer.innerHTML;
        nextPlayer();
        count++;
        if (checkWin()) {
          blockWinner.innerHTML = "Игра закончена <br/>" + checkWin();
        }
        if (count === 9) {
          if (!checkWin()) {
            endGame();
            blockWinner.innerHTML = "Игра закончилась ничьей";
          }
        }
      }
    };
  }
}
