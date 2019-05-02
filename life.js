function toCoordinates(board, x, y) {
  //turn x y coordinates into index for an array
  return y * board.size["x"] + x;
}

function wait(seconds) {
  //only use for local terminal-- not for web use
  seconds *= 1000;
  let start = new Date().getTime();
  let end = start;
  while (end < start + seconds) {
    end = new Date().getTime();
  }
}

function getToken() {
  //return a random member of the tokens list to represent a living cell
  //let tokens = ["@", "#", "$", "%", "&", "*", "?", "~"];
  let tokens = ["0", "o", "O", "¤", "°", "Ɵ", "ʘ"];
  return tokens[Math.floor(tokens.length * Math.random())];
}

class GameBoard {
  constructor(xSize, ySize, lifeRatio = 5) {
    //create the board, set initial value to zero
    this.size = { "x": parseInt(xSize), "y": parseInt(ySize) };
    this.cells = [];
    this.ratio = lifeRatio;
    //list of cell values, where i is (y * (board width) + x)
    //0 means dead, 1 means alive
    for (let y = 0; y < this.size["y"]; y++) {
      for (let x = 0; x < this.size["x"]; x++) {
        this.cells[toCoordinates(this, x, y)] = "0";
      }
    }
  }

  get(x, y) {
    // ensure border cells work
    let xSize = this.size["x"];
    let ySize = this.size["y"];

    if (x < 0) {
      return this.get(xSize, y);
    } else if (x >= xSize) {
      return this.get(0, y);
    } else if (y < 0) {
      return this.get(x, ySize);
    } else if (y >= this.size["y"]) {
      return this.get(x, 0);
    } else {
      return this.cells[toCoordinates(this, x, y)];
    }
  }

  set(x, y, value) {
    //set the value of a given cell
    this.cells[toCoordinates(this, x, y)] = value;
  }

  printHelper() {
    //returns list of lists of current values (inner lists are rows)
    let toPrint = [];
    for (let y = 0; y < this.size["y"]; y++) {
      let row = [];
      for (let x = 0; x < this.size["x"]; x++) {
        if (this.cells[toCoordinates(this, x, y)] == 1) {
          row.push(getToken());
        } else {
          row.push(" ");
        }
      }
      toPrint.push(row);
    }
    return toPrint;
  }

  consolePrint() {
    //print the current game state to the console
    let toPrint = this.printHelper();
    let rows = toPrint.map(r => r.join(" "));
    console.log(rows.join("\n"));
    console.log("\n");
  }

  htmlPrint() {
    //change the values of <td> elements to be their new value (living or dead)
    let toPrint = this.printHelper();
    //console.log(toPrint[0]);
    let cells = document.body.getElementsByTagName("td");
    for (let i = 0; i < toPrint.length; i++) {
      for (let j = 0; j < toPrint[i].length; j++) {
        try{
          cells[toCoordinates(this, j, i)].textContent = toPrint[i][j];
        } catch (error) {
          console.log(`${j}, ${i}`);
        }
      }
    }
  }

  randomize() {
    //fill in this.cells with random values
    for (let y = 0; y < this.size["y"]; y++) {
      for (let x = 0; x < this.size["x"]; x++) {
        if (Math.random() < 1.0 / this.ratio) {
          this.cells[toCoordinates(this, x, y)] = 1;
        }
      }
    }
  }

  getNeighbors(x, y) {
    //return an array of all neighbors' coordinates 
    let neighbors = [
      [x - 1, y - 1],
      [x - 1, y],
      [x - 1, y + 1],
      [x, y + 1],
      [x, y - 1],
      [x + 1, y],
      [x + 1, y - 1],
      [x + 1, y + 1]
    ];
    return neighbors.map(
      n => {
      if (n[0] < 0) {
        return [this.size["x"] - 1, n[1]];
      } else if (n[0] >= this.size["x"]) {
        return [0, n[1]];
      } else if (n[1] < 0) {
        return [n[0], this.size["y"] - 1];
      } else if (n[1] >= this.size["y"]) {
        return [n[0], 0];
      } else {
        return [n[0], n[1]];
      }
      });
  }


  neighborCount(x, y) {
    //return the count of living neighbors
    return this.getNeighbors(x, y)
      .map(arr => this.get(arr[0], arr[1]))
      .filter(cell => cell == 1).length;
  }

  update() {
    //replace this.cells with an updated array for the next generation
    let alive = 0;
    let newBoard = [];
    for (let y = 0; y < this.size["y"]; y++) {
      for (let x = 0; x < this.size["x"]; x++) {
        let val = this.get(x, y);
        let neighbors = this.neighborCount(x, y);
        let coord = toCoordinates(this, x, y);
        if (val == 1) {
          alive += 1;
          if (neighbors == 2 || neighbors == 3) {
            newBoard[coord] = 1;
          } else {
            newBoard[coord] = 0;
          }
        } else {
          if (neighbors == 3) {
            newBoard[coord] = 1;
          } else {
            newBoard[coord] = 0;
          }
        }
      }
    }
    this.cells = newBoard;
    return alive;
  }
}

/*function consoleRun() {
  //runs the Game of Life in the console
  let board = new GameBoard(46, 30);
  board.randomize();
  console.log("\n");
  board.consolePrint();
  let alive = 1;
  let turn = 0;
  while (alive > 0) {
    turn += 1;
    alive = board.update();
    console.log(`\nTurn ${turn} Cells Alive: ${alive}\n`);
    board.consolePrint();
    wait(0.15);
  }
}*/


function run() {
  let board = null;
  let process = undefined;
  let defaultBoard = [60, 25];
  let turn = 0;
  let alive = 0;
  let running = 0; 
  let tableElement = document.getElementById("board");
  let label = document.getElementById("label");
  let startButton = document.getElementById("start");
  let createButton = document.getElementById("create");
  let randomizeButton = document.getElementById("randomize");
  let xSizeBox = document.getElementById("xAxis");
  let ySizeBox = document.getElementById("yAxis");
  let pauseButton = document.getElementById("pause");
  let instruction = document.getElementById("instruction");
  
   
  startButton.addEventListener("click", start);
  randomizeButton.addEventListener("click", random);
  createButton.addEventListener("click", createBoard);
  pauseButton.addEventListener("click", pause);
  tableElement.addEventListener("click", function(event) {
    clickCell(event.target.id);
  })
  
  window.addEventListener("keydown", function(event) {
    if (event.key == 'r') {
      randomCell(1);
    }});
  
  window.addEventListener("keydown", function(event) {
    if (event.key == 'R') {
      randomCell(5);
    }});

  
  function pause() {
    // pause the simulation
    reset();
    tick();
  }
   
  function start() {
    // start the simulation
    reset();
    if (board == null) {
      random();
    }
    process = setInterval(tick, 400);
    running = 1;
    pauseButton.value = "Pause";
    console.log(running);
  }
  
  function random() {
    //randomize the board
    reset();
    if (board == null) {
      createBoard(60, 25);
    }
    board.randomize();
    board.htmlPrint();
  }
   
  function reset() {
    running = 0;
    pauseButton.value = "One Step";
    if (process != undefined) {
      clearInterval(process);
    }
    alive = 0;
    turn = 0;
  }
   
  function tick() {
    // advance the simulation one generation
    turn++;
    alive = board.update();
    board.htmlPrint();
    label.textContent = `Turn number: ${turn}, Cells currently alive: ${alive}`;
  }
  
  function randomCell(n) {
    for (let i = 0; i < n; i++) {
      let randX = Math.floor(Math.random() * board.size["x"]);
      let randY = Math.floor(Math.random() * board.size["y"]);
      if (board.get(randX, randY) == 1) {
        randomCell(1);
      } else {
        board.set(randX, randY, 1);
      }
    }  
    board.htmlPrint();
  }
   
  function clickCell(id) {
    console.log(`Clicked ${id}`);
    let cell = document.getElementById(id);
    cell.innerText = getToken();
    let x = parseInt(id.split(",")[0]);
    let y = parseInt(id.split(",")[1]);
    board.set(x, y, 1);
    console.log(board.cells);
    console.log(board.printHelper());
    console.log(board.getNeighbors(x,y));
  }
   
  function createBoard() {
    reset();
    let xSize = 58;
    let ySize = 25;
    startButton.value = "Start this board";
    createButton.value = "Create new board";
    randomizeButton.value = "Randomize current board";
    instruction.textContent = "Click inside the board, press the 'randomize' button, or type r's to create cells! 'r' creates 1 and 'R' creates 5.";
    reset();
    if (ySizeBox.value.length != 0) {
      ySize = parseInt(ySizeBox.value);
      console.log(ySize);
    }
    if (xSizeBox.value.length != 0) {
      xSize = parseInt(xSizeBox.value);
      console.log(xSize);
    }
    while (tableElement.firstChild) {
      tableElement.removeChild(tableElement.firstChild);
    }
    board = new GameBoard(xSize, ySize);
    
    for (let y = 0; y < ySize; y++) {
      let row = document.createElement("tr");
      for (let x = 0; x < xSize; x++) {
        let cell = document.createElement("td");
        let id = `${x},${y}`;
        cell.setAttribute("id", id);
        cell.innerText = " ";
        row.appendChild(cell);
        
      }
      tableElement.appendChild(row);
    }
   }
  }


run();
//consoleRun();
