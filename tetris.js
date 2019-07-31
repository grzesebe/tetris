window.onload = () => {
  div = document.createElement("div");
  div.classList.add("tetris")
  document.getElementById("tetris-wrapper").appendChild(div);
  
  can = document.createElement("canvas");
  can.width = "300";
  can.height = "600";
  div.appendChild(can);
  can.style.width = "300px";
  can.style.height = "600px";
  can.id = "mainGame";
  boardCtx = can.getContext("2d");
  boardCtx.width = can.width;
  boardCtx.height = can.height;
  boardCtx.columns = 10;
  boardCtx.rows = 20;
  boardCtx.startRow = -5;
  
  stats = document.createElement("div");
  stats.id = "stats";
  div.appendChild(stats);

  can2 = document.createElement("canvas");
  can2.width = "200";
  can2.height = "200";
  stats.appendChild(can2);
  can2.style.width = "200px";
  can2.style.height = "200px";
  waitCtx = can2.getContext("2d");
  waitCtx.width = can2.width;
  waitCtx.height = can2.height;
  waitCtx.columns = 4;
  waitCtx.rows = 4;
  waitCtx.startRow = 0;
  

  points = document.createElement("span");
  points.id = "points";
  stats.appendChild(points);
  points.innerHTML = "score: 0"
  

  
  game.new();

  



  document.addEventListener('keydown', e => {
    if (e.code === "ArrowRight") {
      game.falling.moveSide(1);
    } else if (e.code === "ArrowLeft") {
      game.falling.moveSide(-1);
    } else if (e.code === "ArrowDown") {
      game.speedUp();
    } else if (e.code === "ArrowUp") {
      game.falling.rotate();
    }
  });
  document.addEventListener('keyup', e => {
    if (e.code === "ArrowDown" && game.currentSpeed != game.initialSpeed) {
      game.slowdown();
    }
  })


  window.addEventListener("blur", e =>{
    game.slowdown();
  });
  

  

}


var figureTemplates = [
  {
    name: "stick",
    color: "#FE453C",
    figureWidth: 4,
    fields: [{c: 3, r: 2},{c: 2, r: 2}, {c: 1, r: 2}, {c: 0, r: 2}]
  },
  {
    name: "T",
    color: "#999999",
    figureWidth: 3,
    fields: [{c: 2, r: 2}, {c: 1, r: 1},{c: 1, r: 2}, {c: 0, r: 2}]
  },
  {
    name: "square",
    color: "#7BFFFF",
    figureWidth: 2,
    fields: [{c: 1, r: 1}, {c: 0, r: 1}, {c: 1, r: 0}, {c: 0, r: 0}]
  },
  {
    name: "L",
    color: "#FFFF56",
    figureWidth: 3,
    fields: [{c: 0, r: 0}, {c: 0, r: 1}, {c: 0, r: 2}, {c: 1, r: 2}]
  },
  {
    name: "reverse L",
    color: "#FD61FF",
    figureWidth: 3,
    fields: [{c: 0, r: 2}, {c: 1, r: 2}, {c: 1, r: 1}, {c: 1, r: 0}]
  },
  {
    name: "reverse Z",
    color: "#1F47FF",
    figureWidth: 3,
    fields: [{c: 0, r: 2}, {c: 1, r: 2}, {c: 1, r: 1}, {c: 2, r: 1}]
  },
  {
    name: "Z",
    color: "#81FF45",
    figureWidth: 3,
    fields: [{c: 0, r: 0}, {c: 1, r: 0}, {c: 1, r: 1}, {c: 2, r: 1}]
  }
]

class field {
  constructor(column, row, ctx, color) {
    this.column = column;
    this.row = row;
    this.color = color;
    this.ctx = ctx;
  }
  clear() {
    this.ctx.clearRect(this.startX, this.startY, this.fWidth, this.fHeight);
  }
  calculate() {
    this.fWidth = this.ctx.width / this.ctx.columns;
    this.fHeight = this.ctx.height / this.ctx.rows;
    this.startX = this.column * this.fWidth;
    this.startY = this.row * this.fHeight;
  }
  draw() {
    this.calculate();
    this.ctx.fillStyle = this.color;
    this.ctx.fillRect(this.startX, this.startY, this.fWidth, this.fHeight);
    this.ctx.lineWidth = 2;
    for(var i=0; i < 8; i++){
      this.ctx.fillStyle = "rgba(255,255,255,0.2)";
      this.ctx.fillRect(this.startX + i, this.startY + i, this.fWidth - 2*i, this.fHeight - 2*i);
    }
  }
  move(c, r) {
    this.column += c;
    this.row += r;
  }
}

var fieldStack = {
  fieldArr: new Array(20),
  addField: function (field) {
    if (!this.fieldArr[field.row]) {
      this.fieldArr[field.row] = new Array();
    }
    this.fieldArr[field.row][field.column] = field;
  },
  clearRow: function(row){
    this.fieldArr[row].forEach(e => {
      e.calculate();
      e.clear();
    });
    if(this.fieldArr[row-1] != null){
      for (let i = row; i >= 0; i--) {
        if(this.fieldArr[i]){
          this.fieldArr[i] = (i === 0 || !this.fieldArr[i-1]) ? [] : this.fieldArr[i-1];
          this.fieldArr[i].forEach(e => {
            e.clear();
            e.move(0, 1);
            e.draw();
          });
        }
      }
    }
  },
  rowIsFull: function(row) {
    let countFields = 0;
    for(var i = 0; i < 10; i++){
      if(this.fieldArr[row] && this.fieldArr[row][i]){
        countFields++;
      }
    }
    return countFields >= 10;
  },
  isAvaliable: function (c, r) {
    return (this.fieldArr[r] && this.fieldArr[r][c]) ? false : true;
  },
  drawAll: function () {
    let cleared = 0;
    for (let i = this.fieldArr.length-1; i > 0; i--) {
      if(this.fieldArr[i]){
        if(this.rowIsFull(i)){
          this.clearRow(i)
          cleared++;
          i = this.fieldArr.length-1;
        }else{
          this.fieldArr[i].forEach(e => {
            e.clear();
            e.calculate();
            e.draw();
          })
        }
      }
    }
    return cleared;
  }
};

class figure {
  constructor(ctx, template = null) {
    this.template = template? template : figureTemplates[Math.floor(Math.random()*(figureTemplates.length-1-0+1)+0)];
    this.fieldArr = [];
    this.color = this.template.color;
    this.figureWidth = this.template.figureWidth;
    this.ctx = ctx;
    this.template.fields.forEach((e, idx) => {
      this.fieldArr[idx] = new field(e.c + Math.floor((this.ctx.columns-this.figureWidth)/2), e.r + this.ctx.startRow, this.ctx, this.color)
      this.fieldArr[idx].columnInFigure = e.c;
      this.fieldArr[idx].rowInFigure = e.r;
      this.fieldArr[idx].idx = idx;
    });
    this.drawAll();
  }
  canMoveDown() {
    return this.fieldArr.every(e => {
      return (fieldStack.isAvaliable(e.column, e.row + 1) && e.row + 1 < 20);
    });
  }
  canMoveSide(c) {
    return this.fieldArr.every((e) => {
      let finalPosition = e.column + c;
      return (fieldStack.isAvaliable(e.column + c, e.row) && 0 <= finalPosition && finalPosition < 10);
    });
  }
  canRotate() {
    return this.fieldArr.every(e => {
      let newRow = e.columnInFigure;
      let newColumn = this.figureWidth - 1 - e.rowInFigure;
      let row = e.row - e.rowInFigure + newRow;
      let column = e.column - e.columnInFigure + newColumn;
      return (fieldStack.isAvaliable(column, row) && row < 20 && 0 <= column && column < 10);
    });
  }
  moveDown() {
    if (this.canMoveDown()) {
      this.fieldArr.forEach(e => {
        e.move(0, 1);
      });
      this.drawAll();
      return true;
    } else if(this.sendToStack() === "matched"){
      setTimeout(() => {
        return false;
      }, 500);
    }else return false;
  }

  moveSide(c) {
    if (this.canMoveSide(c)) {
      this.fieldArr.forEach(e => {
        e.move(c, 0)
      });
      this.drawAll();
    }
  }
  sendToStack() {
    this.fieldArr.forEach(e => {
      fieldStack.addField(e)
    });
    game.clearedLines += fieldStack.drawAll()
    points.innerHTML = "score: " + game.clearedLines;
  }
  rotate() {
    if (this.canRotate()) {
      this.fieldArr.forEach(e => {
        let newRow = e.columnInFigure;
        let newColumn = this.figureWidth - 1 - e.rowInFigure;
        e.row = e.row - e.rowInFigure + newRow;
        e.column = e.column - e.columnInFigure + newColumn;
        e.rowInFigure = newRow;
        e.columnInFigure = newColumn;
      });
      this.drawAll();
    }
  }
  clearAll(){
    this.fieldArr.forEach(e => {
      e.clear();
    });
  }
  drawAll() {
    this.clearAll();
    this.fieldArr.forEach(e => {
      e.draw();
    });
  }
}

game = {
  step: null,
  clearedLines: 0,
  level: 0,
  started: false,
  new: function(){
    this.clearAll();
    this.falling = new figure(boardCtx);
    this.next = new figure(waitCtx);
    this.currentSpeed = 3;
    this.initialSpeed = 3;
    this.level = 1;
    this.started = true;
    this.fall();
  },
  end: function() {
    this.started = false;
    clearInterval(this.step);
    this.step = null;
    alert("end of game");
  },
  clearAll: function(){
    boardCtx.clearRect(0, 0, boardCtx.width, boardCtx.height);
    waitCtx.clearRect(0, 0, waitCtx.width, waitCtx.height);
  },
  fall: function() {
    if(this.started){
      if (this.step) clearTimeout(this.step);
      if (this.falling) {
        if (this.falling.moveDown()) {
        } else {
          this.next.clearAll();
          this.falling = new figure(boardCtx, this.next.template);
          this.next = new figure(waitCtx);
        }
      }
      this.step = setTimeout(() => {this.fall()}, 1000 / this.currentSpeed + this.level);
    }
  },
  speedUp: function(){
    if (this.currentSpeed === this.initialSpeed) {
      this.currentSpeed *= 4;
      this.fall();
    }
  },
  slowdown: function(){
    this.currentSpeed = this.initialSpeed;
      this.fall();
  }
}