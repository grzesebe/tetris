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
    }else if (e.code === "ArrowDown") {
      if (currentSpeed === initialSpeed){
        currentSpeed *= 4;
        fall();
      }
    }
  });
  document.addEventListener('keyup', e => {
    if (e.code === "ArrowDown" && currentSpeed != initialSpeed) {
      currentSpeed = initialSpeed;
      fall();
    }
  })
  var fps = 20;
  var step;
  function fall() {
    if(step) clearTimeout(step);
    if (falling) {
      if (falling.moveDown()) {
        // falling.drawAll();
      } else {
        falling = new figure(boardCtx);
      }
    }
    step = setTimeout(fall, 1000 / currentSpeed);
  }
  fall()

  setInterval(() => {
    if (falling) falling.drawAll();
    console.log(fieldStack)
  }, 1000 / fps);
}


var fieldStack = {
  fieldArr: [],
  addField: function (field) {
    if (!this.fieldArr[field.row]) {
      this.fieldArr[field.row] = new Array(4);
    }
    this.fieldArr[field.row][field.column] = field;
  },
  isAvaliable: function (c,r) {
    if (this.fieldArr[r] && this.fieldArr[r][c]) {
      return false;
    } else {
      return true;
    }
  }
};

var figureTemplates = [{
  name: "stick",
  color: "yellow",
  fields: [{
    x: 0,
    y: 2
  }, {
    x: 1,
    y: 2
  }, {
    x: 2,
    y: 2
  }, {
    x: 3,
    y: 2
  }]
}]



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
    this.clear();
    this.calculate();
    this.ctx.fillStyle = this.color;
    this.ctx.fillRect(this.startX, this.startY, this.fWidth, this.fHeight);
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(this.startX + 1, this.startY + 1, this.fWidth - 2, this.fHeight - 2);
  }
  move(c, r) {
    this.column += c;
    this.row += r;
  }
}


class figure {
  constructor(ctx) {
    this.template = figureTemplates[0];
    this.fieldArr = [];
    this.color = this.template.color
    this.ctx = ctx;
    this.template.fields.forEach((e, idx) => {
      this.fieldArr[idx] = new field(e.x, e.y - 4, this.ctx, this.color)
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
  moveDown() {
    if (this.canMoveDown() === true) {
      this.fieldArr.forEach(e => {
        e.move(0, 1);
      });
      return true;
    } else {
      this.sendToStack();
      return false;
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
  }
  drawAll = function () {
    this.fieldArr.forEach(e => {
      e.draw();
    });
  }
}
