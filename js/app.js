var App = function () {
    var grid,
        ant,
        timing = 10,
        tileSize = 20,
        timeInterval = false;

    function init() {
        grid = new Grid(tileSize);
        grid.addSvgContainer();
        ant = new Ant(grid);
    }

    function start(){
        if(timeInterval === false)
            timeInterval = setInterval(ant.moveToNext,timing);
    }
    function stop(){
        clearInterval(timeInterval);
        timeInterval = false;
    }

    function setTiming(newTiming){
        timing = newTiming;
        stop();start();
    }

    init();
    return {
        start: start,
        stop: stop,
        setTiming : setTiming
    }
};

var Tile = function (x, y, size) {

    var domElement;

    function init() {
        domElement = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        domElement.setAttribute("x", x * size);
        domElement.setAttribute("y", y * size);
        domElement.setAttribute("stroke", "#555");
        domElement.setAttribute("width", size);
        domElement.setAttribute("height", size);
        domElement.setAttribute("class", 'tile white');
        domElement.setAttribute("id", x + '-' + y);
        domElement.addEventListener("click", clickOnTile);
    }

    function getDomElement() {
        return domElement;
    }

    function clickOnTile(event) {
        toggleColor();
    }


    function toggleColor() {
        domElement.classList.toggle("white");
        domElement.classList.toggle("black");
    }

    function getDirection() {
        if (domElement.classList.contains('white')) {
            // right
            return Math.PI / 2;
        } else if (domElement.classList.contains('black')) {
            // left
            return -Math.PI / 2;
        }
    }


    init();
    return {
        getDomElement: getDomElement,
        getDirection: getDirection,
        toggleColor: toggleColor
    }
};

var Grid = function (tileSize,container) {
    var container = container || document.getElementsByTagName("body")[0];
    var svgTag;
    var tileSize = tileSize || 20;
    var arrayTile = [];
    var tilesHeight = Math.ceil(document.documentElement.clientHeight / tileSize);
    var tilesWidth = Math.ceil(document.documentElement.clientWidth / tileSize);
    /*
     Create sgv container
     */
    function addSvgContainer() {
        svgTag = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svgTag.setAttribute("width", document.documentElement.clientWidth);
        svgTag.setAttribute("height", document.documentElement.clientHeight);

        for (var i = 0; i < tilesHeight; i++) {
            arrayTile[i] = [];
            for (var j = 0; j < tilesWidth; j++) {
                arrayTile[i][j] = new Tile(j, i, tileSize);

                svgTag.appendChild(arrayTile[i][j].getDomElement());
            }
        }
        container.appendChild(svgTag);
    }

    function getCenteredTile() {
        return [
            Math.round(tilesHeight / 2),
            Math.round(tilesWidth / 2)

        ]
    }

    function getTileWithPixel(x, y) {
        var i = Math.floor(y / tileSize);
        var j = Math.floor(x / tileSize);
        if (arrayTile[i] == undefined || arrayTile[i][j] == undefined) {

            return false;
        }
        return arrayTile[i][j];
    }


    return {
        tileSize: tileSize,
        container: container,
        getTileWithPixel: getTileWithPixel,
        addSvgContainer: addSvgContainer,
        getCenteredTile: getCenteredTile
    }

};

var Ant = function (grid) {
    var canMove = true,
        moveNbr = 0,
        antPicture,
        paddingImg = 0;
    rotation = -Math.PI * 0.5;


    function init() {
        antPicture = document.createElement("img");
        antPicture.setAttribute("src", "img/square.gif");
        antPicture.setAttribute("width", grid.tileSize);
        antPicture.setAttribute("height", grid.tileSize);
        antPicture.setAttribute("style", "position:absolute;z-index:100;display:block;");

        antPicture.onload = function () {
            grid.container.appendChild(antPicture);

            paddingImg = (grid.tileSize - antPicture.clientWidth) / 2
            var arrayPos = grid.getCenteredTile();

            setPos(arrayPos[1] * grid.tileSize, arrayPos[0] * grid.tileSize);
        }
    }

    function resetMoveNbr() {
        moveNbr = 0;
    }

    function getMoveNbr() {
        return moveNbr;
    }


    function moveToNext() {
        if (!canMove)
            return;
        var currentTile = grid.getTileWithPixel(parseInt(antPicture.style.left), parseInt(antPicture.style.top));
        if (currentTile === false) {
            canMove = false;
            return;
        }
        rotation += currentTile.getDirection();

        var moveY = Math.sin(rotation);
        var moveX = Math.cos(rotation);
        moveBy(moveX, moveY);
        currentTile.toggleColor();
        moveNbr++;
    }

    function moveBy(x, y) {
        setPos((parseInt(antPicture.style.left) + (x * grid.tileSize)), (parseInt(antPicture.style.top) + (y * grid.tileSize)));
    }


    function setPos(x, y) {
        antPicture.style.top = (y + paddingImg) + "px";
        antPicture.style.left = (x + paddingImg) + "px";
    }

    init();

    return {
        moveToNext: moveToNext,
        resetMoveNbr: resetMoveNbr,
        getMoveNbr: getMoveNbr
    }
};

var app = new App();
app.start();
