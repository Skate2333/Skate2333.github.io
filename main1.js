  var name = prompt("what's your name?");
  alert("Hello," + name + ",welcome to this game!");
function Mine(tr, td, mineNum) {
    this.tr = tr;
    this.td = td;
    this.mineNum = mineNum;
    this.squares = [];
    this.tds = [];
    this.surplusMine = mineNum;
    this.mainBox = document.querySelector('.gameBox');
}
Mine.prototype.randomNum = function () {
    var positionArray = new Array(this.tr * this.td);
    for (var i = 0; i < positionArray.length; i++) {
        positionArray[i] = i
    }
    positionArray.sort(function () {
        return 0.5 - Math.random()
    });
    return positionArray.splice(0, this.mineNum);
}
Mine.prototype.init = function () {
    var positionMine = this.randomNum();
    var n = 0;
    for (var i = 0; i < this.tr; i++) {
        this.squares[i] = [];
        for (var j = 0; j < this.td; j++) {
            if (positionMine.indexOf(n++) != -1) {
                this.squares[i][j] = { type: 'mine', x: j, y: i };
            } else {
                this.squares[i][j] = { type: 'number', x: j, y: i, value: 0 };
            }
        }
    }

    this.mainBox.oncontextmenu = function () {
        return false;
    }

    this.updateNum();
    this.createDom();
    this.mineNumDom = document.querySelector('.mineNum');
    this.surplusMine = this.mineNum;
    this.mineNumDom.innerHTML = this.surplusMine;

};

Mine.prototype.createDom = function () {
    var This = this;
    var table = document.createElement('table');
    for (var i = 0; i < this.tr; i++) {
        var domTr = document.createElement('tr');
        this.tds[i] = [];
        for (var j = 0; j < this.td; j++) {
            var domTd = document.createElement('td');
            domTd.pos = [i, j];
            domTd.onmousedown = function () {
                This.play(event, this);
            };
            this.tds[i][j] = domTd;
            domTr.appendChild(domTd);
        }
        table.appendChild(domTr)
    }

    this.mainBox.innerHTML = '';
    this.mainBox.appendChild(table);
}
Mine.prototype.getAround = function (positionArray) {
    var x = positionArray.x;
    var y = positionArray.y;
    var result = [];
    for (var i = x - 1; i <= x + 1; i++) {
        for (var j = y - 1; j <= y + 1; j++) {
            if (
                i < 0 ||
                j < 0 ||
                i > this.td - 1 ||
                j > this.tr - 1 ||
                (i == x && j == y ||
                    this.squares[j][i].type == 'mine')
            ) {
                continue;
            }
            result.push([j, i]);
        }
    }

    return result;
}


Mine.prototype.updateNum = function () {
    for (var i = 0; i < this.tr; i++) {
        for (var j = 0; j < this.td; j++) {
            if (this.squares[i][j].type == 'number') {
                continue;
            }
            var num = this.getAround(this.squares[i][j]);
            for (var k = 0; k < num.length; k++) {
                this.squares[num[k][0]][num[k][1]].value += 1;
            }
        }
    }
}


Mine.prototype.play = function (ev, obj) {
    var This = this;
    if (ev.which == 1 && obj.className != 'flag') {

        var curSquare = this.squares[obj.pos[0]][obj.pos[1]];

        var cl = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight'];

        if (curSquare.type == 'number') {
            obj.innerHTML = curSquare.value;
            obj.className = cl[curSquare.value];

            if (curSquare.value == 0) {
                obj.innerHTML = '';

                function getAllZero(positionArray) {
                    var around = This.getAround(positionArray);

                    for (var i = 0; i < around.length; i++) {
                        var x = around[i][0];
                        var y = around[i][1];

                        This.tds[x][y].className = cl[This.squares[x][y].value];
                        if (This.squares[x][y].value == 0) {
                            if (!This.tds[x][y].check) {
                                This.tds[x][y].check = true;

                                getAllZero(This.squares[x][y]);
                            }
                        } else {
                            This.tds[x][y].innerHTML = This.squares[x][y].value;
                        }
                    }
                }

                getAllZero(curSquare);

            }
        } else {
            this.gameOver(obj);
        }
    }
    if (ev.which == 3) {
        if (obj.className && obj.className != 'flag') {
            return;
        }
        obj.className = obj.className == 'flag' ? '' : 'flag';

        if (obj.className == 'flag') {
            this.mineNumDom.innerHTML = --this.surplusMine;
        } else {
            this.mineNumDom.innerHTML = ++this.surplusMine;
        }

        if (this.surplusMine == 0) {
            for (var i = 0; i < this.tr; i++) {
                for (var j = 0; j < this.td; j++) {
                    if (this.tds[i][j].className == 'flag') {
                        if (this.squares[i][j].type != 'mine') {
                            this.gameOver();
                            return;
                        }
                    }
                }
            }
            alert(name + "，恭喜你成功扫雷！");
            this.init();
        }
    }

};

Mine.prototype.gameOver = function (clickTd) {

    for (var i = 0; i < this.tr; i++) {
        for (var j = 0; j < this.td; j++) {
            if (this.squares[i][j].type == 'mine') {
                this.tds[i][j].className = 'mine';
            }
            this.tds[i][j].onmousedown = null;
        }
    }

    if (clickTd) {
        clickTd.className = 'redMine';
    }
};

var btns = document.querySelectorAll('.header button');
var mine = null;

var btnKey = 0;
var headerArr = [
    [9, 9, 10], [16, 16, 40], [28, 28, 99]
];

for (let i = 0; i < btns.length - 1; i++) {
    btns[i].onclick = function () {

        btns[btnKey].className = '';
        this.className = 'active';

        mine = new Mine(...headerArr[i]);
        mine.init();

        btnKey = i;
    }
}

btns[0].onclick();
btns[3].onclick = function () {
    mine.init();
}
