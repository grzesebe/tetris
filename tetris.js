window.onload = () => {
  div = document.createElement("div");
  can = document.createElement("canvas");
  can.width = "300";
  can.height = "600";
  document.getElementById("tetris-wrapper").appendChild(div);
  can.style.width = "300px";
  can.style.height = "600px";
  div.appendChild(can);
  boardCtx = can.getContext("2d");
  boardCtx.width = can.width;
  boardCtx.height = can.height;



  const initialSpeed = 3;
  var currentSpeed = 3;

  var falling = new figure(boardCtx);

  document.addEventListener('keydown', e => {
    if (e.code === "ArrowRight") {
      falling.moveSide(1);
    } else if (e.code === "ArrowLeft") {
      falling.moveSide(-1);
    } else if (e.code === "ArrowDown") {
      if (currentSpeed === initialSpeed) {
        currentSpeed *= 4;
        fall();
      }
    } else if (e.code === "ArrowUp") {
      falling.rotate();
    }
  });
  var slowdon = function(){
    currentSpeed = initialSpeed;
      fall();
  }
  document.addEventListener('keyup', e => {
    if (e.code === "ArrowDown" && currentSpeed != initialSpeed) {
      slowdon();
    }
  })
  window.addEventListener("blur", e =>{
    slowdon();
  });
  var fps = 20;
  var step;

  function fall() {
    if (step) clearTimeout(step);
    if (falling) {
      if (falling.moveDown()) {
      } else {
        falling = new figure(boardCtx);
      }
    }
    step = setTimeout(fall, 1000 / currentSpeed);
  }
  fall()

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
    this.fWidth = this.ctx.width / 10;
    this.fHeight = this.ctx.height / 20;
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
    for (let i = this.fieldArr.length-1; i > 0; i--) {
      if(this.fieldArr[i]){
        if(this.rowIsFull(i)){
          this.clearRow(i)
          this.drawAll();
        }else{
          this.fieldArr[i].forEach(e => {
            e.clear();
            e.calculate();
            e.draw();
          })
        }
      }
    }
  }
};





class figure {
  constructor(ctx) {
    let template = figureTemplates[Math.floor(Math.random()*(figureTemplates.length-1-0+1)+0)];
    this.fieldArr = [];
    this.color = template.color;
    this.figureWidth = template.figureWidth;
    this.ctx = ctx;
    template.fields.forEach((e, idx) => {
      this.fieldArr[idx] = new field(e.c + Math.floor((10-this.figureWidth)/2), e.r - this.figureWidth, this.ctx, this.color)
      this.fieldArr[idx].columnInFigure = e.c;
      this.fieldArr[idx].rowInFigure = e.r;
      this.fieldArr[idx].idx = idx;
    });
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
    } else {
      if(this.sendToStack() === "matched"){
        setTimeout(() => {
          fieldStack.drawAll();
          return false;
        }, 500);
      }else return false;
    }
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
    fieldStack.drawAll();
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
  drawAll = function () {
    this.fieldArr.forEach(e => {
      e.clear();
    });
    this.fieldArr.forEach(e => {
      e.draw();
    });
  }
}