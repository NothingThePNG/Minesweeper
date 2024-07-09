// geting game data
const size_x = sessionStorage.getItem("size_x");
const size_y = sessionStorage.getItem("size_y");
const mins = sessionStorage.getItem("mins");
let tot = sessionStorage.getItem("tot");
let vol = sessionStorage.getItem("vol") / 100;
let num_flags = mins;

// statas veriabels 
let woun = false;
let faild = false;
let first = true;

let held = false;

let intalvel;
let time = 0;

// loding adiuo 
const boom = new Audio("SFX/Boom.mp3");
const error = new Audio("SFX/error.mp3");
const victory = new Audio("SFX/victory.mp3");
let press_sound = new Audio("SFX/press.mp3");

// setting voluem 
boom.volume = vol;
error.volume = vol;
victory.volume = vol;
press_sound.volume = vol;

// to store the info of a cell
class Sqrer {
  constructor() {
    this.is_mine = false;
    this.reveald = false;
    this.mines_around = 0;
    this.flaged = false;
  }
  now_is_reveald() {
    this.reveald = true;
  }
  add_mines_around() {
    this.mines_around += 1;
  }
}

// making the 2D array to store the info of the cells
function initializeBoard() {
  let board = [];
  let free_borad = [];
  for (let i = 0; i < size_y; i++) {
    board[i] = [];
    for (let j = 0; j < size_x; j++) {
      board[i][j] = new Sqrer();
      free_borad.push([i, j]);
    }
  }
  return [board, free_borad];
}

// making the bord and a list of cells that mines can be 
// placed 
let [board, free_borad] = initializeBoard();

// updates the mins_around value
function uppdate_info(board) {
  // for each cell on the bord
  for (let y = 0; y < size_y; y++) {
    for (let x = 0; x < size_x; x++) {
      // if the cell is a mine, skip it as will not have a number any way
      if (board[y][x].is_mine) {
        board[y][x].mines_around = -1;
        continue;
      }
      // reseting mines_around
      board[y][x].mines_around = 0;

      // counting all agencent cells
      for (let i = -1; i < 2; i++) {
        for (let j = -1; j < 2; j++) {

          // if it is not out of bounds
          if (y + i >= 0 && y + i < size_y && x + j >= 0 && x + j < size_x) {
            // if it is a mine add one to the mines_around
            if (board[y + i][x + j].is_mine === true) {
              board[y][x].add_mines_around();
            }
          }
        }
      }
    }
  }
  // returning boord with updated info
  return board;
}

function make_mies() {
  let mines_placed = 0;

  // will place mines unil the requierd amount is placed
  while (mines_placed < mins) {
    if (free_borad.length <= 0) {
      break;
    }
    // geting a random cell and marking it as not free 
    let index = Math.floor(Math.random() * free_borad.length);
    let place = free_borad[index];
    free_borad.splice(index, 1);

    // geting random coudanets 
    let y = place[0];
    let x = place[1];

    // if it is achaly free
    if (!board[y][x].is_mine
      &&
      !board[y][x].reveald) {

      // geting the buttons
      let button = document.getElementById(`${y}_${x}`);

      // seting the cell as a mine
      button.classList.add("min");
      board[y][x].is_mine = true;
      mines_placed++;
    }
  }
  // will give each cell info on how many mines are around it
  return uppdate_info(board);
}

// reveling a 3 by 3 squre around the first cliked cell
function reveal_squer(y, x) {
  for (let i = -1; i < 2; i++) {
    for (let j = -1; j < 2; j++) {
      if (y + i >= 0
        &&
        y + i < size_y
        && x + j >= 0
        &&
        x + j < size_x) {
        board[y + i][x + j].now_is_reveald();
      }
    }
  }
}

// the timer for the game
function timer_func() {
  time += 1;

  // making the sconds
  let sec = `${time % 60}`;
  sec = sec.padStart(2, "0");

  // making the minites 
  let min = `${Math.floor(time / 60)}`;
  min = min.padStart(2, "0");

  // displying time
  timer_out.innerHTML = `${min}:${sec}`;
}

// making the rester and try new buttons
function make_reset_buttons() {
  // maing buttons
  reset_c = document.createElement("button");
  reset_all = document.createElement("button");

  // giving the text
  reset_c.innerHTML = "Reset";
  reset_all.innerHTML = "Try new";

  // ginving them funtionality 
  reset_c.onclick = function() {
    location.reload();
  }
  reset_all.onclick = function() {
    location.href = "index.html";
  }

  // giving them classes so they look nicer
  reset_c.classList.add("play");
  reset_all.classList.add("play");

  // adding them to the page
  document.body.appendChild(reset_c);
  document.body.appendChild(reset_all);
}

// when you win
function win() {
  woun = true;
  victory.play();

  // stoping the game
  make_reset_buttons();
  clearInterval(intalvel);

  // displying the win text
  main.innerHTML = "You win";
  the_cs.setAttribute('href', 'sucead.css');
}

function lose(button) {
  boom.play();
  faild = true; // stopint hte player from cliking any more cells

  make_reset_buttons(); // let the player try agen
  clearInterval(intalvel); // stoping the timer so the player can see their time

  // changin the color of the bord to show the player lost
  the_cs.setAttribute('href', 'faild.css');

  button.classList.add("pressed"); // so the plaer can see the mine that killed them
}

// when clik a button this will update the classes 
// origonly named this as it would remove input lissiners form the 
// button but I added midal clik so that would not work
function remove_button(y, x, button) {

  // diplaying the number of mines around the cell
  if (!board[y][x].mines_around == 0) {
    button.classList.add("pressed");

  } else {
    // giving the button a colour to show it's reveld but the text 
    // is invisabel
    button.classList.add("no_show");
  }

  button.innerHTML = board[y][x].mines_around; // diply number of surronding mines
}

// finning all agacent cells
function fill(y, x) {
  if (board[y][x].mines_around === 0) {

    // all agecent cells 
    for (let i = -1; i < 2; i++) {
      for (let j = -1; j < 2; j++) {
        // in bounds 
        if (y + i >= 0 && y + i < size_y && x + j >= 0 && x + j < size_x) {
          // not a mine just in cace the mines_around is wong
          if (!board[y + i][x + j].is_mine) {
            cell_cliked_smol(y + i, x + j);
          }
        }
      }
    }
  }
}

// for the firs clik only 
function first_clik(y, x) {
  // playing the press sound
  press_sound = new Audio("SFX/press.mp3");
  press_sound.volume = vol;
  press_sound.play();

  reveal_squer(y, x); // revinling a 9-by-9 squre arond where was cliked so no mines are put there

  board = make_mies(); // puting mines in random posisons 

  first = false; // updating the value so this will not run agen

  intalvel = setInterval(timer_func, 1000); // playing the timer

  //runing a cheaking algoroth on all of the cells ajacent to the first click 
  for (let i = -1; i < 2; i++) {
    for (let j = -1; j < 2; j++) {

      // making sure it is not out of bounds
      if (y + i >= 0
        &&
        y + i < size_y
        &&
        x + j >= 0
        &&
        x + j < size_x) {
        cell_cliked_smol_first(y + i, x + j); // the only time this fution is uesd
      }
    }
  }
}


// the funtion to check cells in the first clik modified to 
function cell_cliked_smol_first(y, x) {
  let button = document.getElementById(`${y}_${x}`);

  remove_button(y, x, button);

  if (!board[y][x].is_mine) {
    tot -= 1;

    // if all cell without mines are reveld 
    if (tot <= 0 && !woun) {
      win();
    } else {

      // cheking all other cells
      fill(y, x);
    }
  }
}

// cheeks the cell and soundig cels for mins but will not update the screan
function cell_cliked_smol(y, x) {
  let button = document.getElementById(`${y}_${x}`);

  remove_button(y, x, button);

  if (!board[y][x].is_mine
    &&
    !board[y][x].reveald) {
    board[y][x].now_is_reveald();
    tot--;

    if (tot <= 0 && !woun) {
      win();
    } else {

      fill(y, x);
    }
  }
}

// same as befor but will update the screan it mant to run only onece to not overlode sistem
function cell_cliked(y, x) {
  let button = document.getElementById(`${y}_${x}`);

  // handals the first click
  if (first) {
    first_clik(y, x, button);

  } else {
    // if the game is lost or woun and the player trys to clik a cell agne
    if (woun) {
      main.innerHTML = "You can't you woun";
    } else if (faild) {
      main.innerHTML = "You can't you lost";

      // playing a sound if the player cliked a flaged cell
    } else if (board[y][x].flaged) {
      error.play(); // playing a sound as they can't clik flaged cells

    } else if (board[y][x].is_mine) {
      lose(button); // the loses funtion 

    } else if (!board[y][x].reveald) {
      tot--; // there is now one less cell to revel

      board[y][x].now_is_reveald(); // so that ofther code can know the cell is reveled 

      remove_button(y, x, button); // stoping giving the button classes depending on what it is

      if (tot <= 0 && !woun) {
        win(); // the win funtion
      } else {

        // playin the press sound 
        press_sound = new Audio("SFX/press.mp3");
        press_sound.volume = vol; // seting the volume
        press_sound.play();

        fill(y, x); // cheecking all agecent cells
      }
    }
  }
}

// or placing and unplacing flags 
function flag(y, x) {
  // makeing sure the player can flag the cell
  if (!board[y][x].reveald
    &&
    !first
    &&
    !faild
    &&
    !woun) {

    // geting the button and updating flaged statas 
    let button = document.getElementById(`${y}_${x}`);

    // if it is allready flaged 
    if (button.classList.contains("flaged")) {
      button.classList.remove("flaged");
      button.innerHTML = "·";
      num_flags += 1
      board[y][x].flaged = false;

      // if it is not flaged and there are flags left to place
    } else if (num_flags > 0) {
      button.classList.add("flaged");
      button.innerHTML = "Flag";
      num_flags -= 1;
      board[y][x].flaged = true;

      // if the user is tring to flage a cell when all flags are used
    }

    flags_out.innerHTML = `Flags: ${num_flags}`; // showing how many fags are left 
  }
}

function flag_check(y, x) {
  let count = 0;
  for (let i = -1; i < 2; i++) {
    for (let j = -1; j < 2; j++) {

      // making sure it is not out of bounds
      if (y + i >= 0
        &&
        y + i < size_y
        &&
        x + j >= 0
        &&
        x + j < size_x) {
        if (board[y + i][x + j].flaged) {
          count++
        }
      }
    }
  }
  return count
}

function cell_cliked_for_mid(y, x) {
  let button = document.getElementById(`${y}_${x}`);

  if (!board[y][x].flaged) {
    if (board[y][x].is_mine) {
      lose(button);

    } else if (!board[y][x].reveald) {
      tot--;
      board[y][x].now_is_reveald();
      remove_button(y, x, button);

      if (tot <= 0 && !woun) {
        win();
      } else {
        fill(y, x);
      }
    }
  }
}

function make_shoround(y, x) {
  held = true;
  for (let i = -1; i < 2; i++) {
    for (let j = -1; j < 2; j++) {
      // making sure it is not out of bounds
      if (y + i >= 0
        &&
        y + i < size_y
        &&
        x + j >= 0
        &&
        x + j < size_x) {
        let button = document.getElementById(`${y + i}_${x + j}`);
        button.classList.add("higited");
      }
    }
  }
}

function midal_clik(y, x) {
  // if the game is lost or woun and the player trys to clik a cell agne
  if (woun) {
    main.innerHTML = "You can't you woun";
  } else if (faild) {
    main.innerHTML = "You can't you lost";

    // playing a sound if the player cliked a flaged cell
  } else {
    let button = document.getElementById(`${y}_${x}`);

    if (button.classList.contains("pressed")) {

      //geting the number of sorrounding flags 
      let flages = flag_check(y, x);

      // if the number of flages is the same as the number of mines around the cell
      if (flages === board[y][x].mines_around) {

        //running a modified cell_cliked to check soronding cells for mines
        for (let i = -1; i < 2; i++) {
          for (let j = -1; j < 2; j++) {

            // if the cell is on the bord
            if (y + i >= 0
              &&
              y + i < size_y
              &&
              x + j >= 0
              &&
              x + j < size_x) {
              cell_cliked_for_mid(y + i, x + j);
            }
          }
        }
        // if the number of flages is not the same as the number of mines around the cell it will higligt surronging cells
      } else {
        make_shoround(y, x);
      }
    }
  }
}

function mouse_down(e, y, x) {
  if (e.which === 1) {
    cell_cliked(y, x);
  } else if (e.which === 2) {
    midal_clik(y, x);
  } else if (e.which === 3) {
    flag(y, x);
  }
  e.preventDefault();
}

function mouse_up(e, y, x) {
  if (held) {
    held = false;
    for (let i = -1; i < 2; i++) {
      for (let j = -1; j < 2; j++) {
        // making sure it is not out of bounds
        if (y + i >= 0
          &&
          y + i < size_y
          &&
          x + j >= 0
          &&
          x + j < size_x) {
          let button = document.getElementById(`${y + i}_${x + j}`);
          button.classList.remove("higited");
        }
      }
    }
  }
}

function make_buttons() {
  // geting the oject that will store the buttons
  let container = document.getElementById("container");

  // resting contaner 
  container.innerHTML = ""

  // loging thoghe each elemnt in the array 
  for (let y = 0; y < size_y; y++) {

    for (let x = 0; x < size_x; x++) {

      // making a button
      let button = `<button
      id="${y}_${x}"
      onmousedown="mouse_down(event, ${y}, ${x})"
      onmouseup="mouse_up(event, ${y}, ${x})"
      >|</button>`;

      // adding the button to the container
      container.innerHTML += button;
    }
    container.innerHTML += "<br>";
  }
  flags_out.innerHTML = `Flags: ${num_flags}`;
}

make_buttons();