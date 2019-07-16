window.onload = () => {
  div = document.createElement("div");
  can = document.createElement("canvas");
  can.width = "300";
  can.height = "600";
  document.getElementById("tetris-wrapper").appendChild(div);
  can.style.width = "300px";
  can.style.height = "600px";
  div.appendChild(can);
  ctx = can.getContext("2d");
  ctx.width = can.width;
  ctx.height = can.height;

  var falling = new figure(ctx);

  const fps = 3;
  setInterval(() => {
    if (falling) {
      if (falling.moveDown()) {
        falling.drawAll();
      } else {
        falling = new figure(ctx);
      }
    }

    console.log("refreshed");
  }, 1000 / fps);
}


var bottomLines = {
  fieldArr: [],
  addField: function (field) {
    if (!this.fieldArr[field.row]) {
      this.fieldArr[field.row] = new Array(5);
    }
    this.fieldArr[field.row][field.column] = field;
  },
  isAvaliable: function(field) {
    if(this.fieldArr[field.row+1] && this.fieldArr[field.row+1][field.column+1]){
      return false;
    }else{
      return true;
    }
  }
};

var figureTemplates = [
  {name: "stick",color: "yellow", fields: [{x: 0, y: 2}, {x: 1, y: 2}, {x: 2, y: 2}, {x: 3, y: 2}, {x: 4, y: 2}]}
]



class field {
  constructor(column, row, ctx, color) {
    this.column = column;
    this.row = row;
    this.color = color;
    this.ctx = ctx;
  }
  calculate() {
    this.fWidth = this.ctx.width / 10;
    this.fHeight = this.ctx.height / 20;
    this.startX = this.column * this.fWidth;
    this.startY = this.row * this.fHeight;
  }
  clear() {
    ctx.clearRect(this.startX, this.startY - 1, this.fWidth + 1, this.fHeight);
  }
  draw() {
    this.clear();
    this.calculate();
    ctx.fillStyle = this.color;
    ctx.fillRect(this.startX, this.startY, this.fWidth, this.fHeight);
    ctx.fillStyle = "black";
    ctx.strokeRect(this.startX, this.startY, this.fWidth, this.fHeight);
  }
}


class figure {
  constructor(ctx) {
    this.template = figureTemplates[0];
    this.fieldArr = [];
    this.color = this.template.color
    this.ctx = ctx;
    this.template.fields.forEach((e, idx) => {
      this.fieldArr[idx] = new field(e.x, e.y, this.ctx, this.color)
    });
    console.log(this);
  }
  canMove() {
    let can = true;
    this.fieldArr.forEach(e => {
      if (e.row + 1 >= 20 || !bottomLines.isAvaliable(e)) {
        console.log("can't move")
        can = false;
      }
    });
    return can;
  }
  moveDown() {
    if (this.canMove() === true) {
      this.fieldArr.forEach(e => {
        e.row++;
        console.log(e.row)
      });
      return true;
    } else {
      this.moveToLine();
      return false;
    }
  }
  moveToLine() {
    this.fieldArr.forEach(e => {
      bottomLines.addField(e)
    });
    console.log(bottomLines);
  }
  drawAll = function () {
    this.fieldArr.forEach(e => {
      e.draw();
    });
  }
}

class line {
  constructor(field) {
    this.fieldArr = new Array(5)
    console.log(this)
  }
}