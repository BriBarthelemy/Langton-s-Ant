/**
 * App : root of application
 * @returns {{start: start, stop: stop, setTiming: setTiming}}
 * @constructor
 */
var App = function (domCounterId) {
    var grid,
        ant,
        timing = 10,
        tileSize = 15,
        timeInterval = false,
        domCounter = document.getElementById(domCounterId) || false;

    function init() {
        // -- init configuration balance
        Configuration.getInstance().setIsMoving(false);
        Configuration.getInstance().setCanMove(true);
        Configuration.getInstance().setCountDomElement(domCounter);
        // -- instanciation element
        grid = new Grid(tileSize);
        grid.addSvgContainer();
        ant = new Ant(grid);
    }

    function start(){
        if(timeInterval === false)
            Configuration.getInstance().setIsMoving(true);
            timeInterval = setInterval(ant.moveToNext,timing);
    }
    function stop(){
        clearInterval(timeInterval);
        timeInterval = false;
        Configuration.getInstance().setIsMoving(false);
    }

    function setTiming(newTiming){
        timing = newTiming;
        stop();start();
    }

    function getNbrMove(){
        return ant.getMoveNbr();
    }

    function reset(){
        stop();
        grid.clear();
        ant.removeDom();

        ant = null;
        grid = null;

        init();

    }

    init();

    return {
        getNbrMove: getNbrMove,
        start: start,
        stop: stop,
        setTiming : setTiming,
        reset : reset
    }
};
/**
 * Tile Class
 * @param x
 * @param y
 * @param size
 * @returns {{getDomElement: getDomElement, getDirection: getDirection, toggleColor: toggleColor}}
 * @constructor
 */
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
        if (Configuration.getInstance().getIsMoving())
            return;

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
/**
 * Grid
 * @param tileSizeDef
 * @param containerDom optional : container for grid
 * @returns {{tileSize: (*|number), container: *, getTileWithPixel: getTileWithPixel, addSvgContainer: addSvgContainer, getCenteredTile: getCenteredTile}}
 * @constructor
 */
var Grid = function (tileSizeDef,containerDom) {
    var container = containerDom || document.getElementsByTagName("body")[0];
    var svgTag;
    var tileSize = tileSizeDef || 20;
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

    function clear(){
        svgTag.remove();
        arrayTile = [];
    }


    return {
        clear: clear,
        tileSize: tileSize,
        container: container,
        getTileWithPixel: getTileWithPixel,
        addSvgContainer: addSvgContainer,
        getCenteredTile: getCenteredTile
    }

};
/**
 * Ant
 * @param grid
 * @returns {{moveToNext: moveToNext, resetMoveNbr: resetMoveNbr, getMoveNbr: getMoveNbr}}
 * @constructor
 */
var Ant = function (grid) {
    var moveNbr = 0,
        antPicture,
        paddingImg = 0;
    rotation = -Math.PI * 0.5;


    function init() {
        resetMoveNbr();
        antPicture = document.createElement("img");
        antPicture.setAttribute("src", "img/square.gif");
        antPicture.setAttribute("width", grid.tileSize);
        antPicture.setAttribute("height", grid.tileSize);
        antPicture.setAttribute("style", "position:absolute;z-index:100;display:block;");

        antPicture.onload = function () {
            grid.container.appendChild(antPicture);
            paddingImg = (grid.tileSize - antPicture.clientWidth) / 2;
            var arrayPos = grid.getCenteredTile();
            setPos(arrayPos[1] * grid.tileSize, arrayPos[0] * grid.tileSize);
        }
    }

    function resetMoveNbr() {
        moveNbr = 0;
        updateCounter(moveNbr);
    }

    function getMoveNbr() {
        return moveNbr;
    }

    function removeDom(){
        antPicture.remove();

    }

    function updateCounter(nbr){
        Configuration.getInstance().getCountDomElement()!== false ? Configuration.getInstance().getCountDomElement().innerHTML = nbr :"";
    }


    function moveToNext() {
        if (!Configuration.getInstance().getCanMove())
            return;
        var currentTile = grid.getTileWithPixel(parseInt(antPicture.style.left), parseInt(antPicture.style.top));
        if (currentTile === false) {
            Configuration.getInstance().setCanMove(false);
            return;
        }
        rotation += currentTile.getDirection();

        var moveY = Math.sin(rotation);
        var moveX = Math.cos(rotation);
        moveBy(moveX, moveY);
        currentTile.toggleColor();
        moveNbr++;
        updateCounter(moveNbr);
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
        getMoveNbr: getMoveNbr,
        removeDom:removeDom
    }
};
/**
 * App Configuratoin with a Singleton pattern
 * @type {{getInstance}}
 */
var Configuration = (function () {
    var instance;

    var canMove = true;
    function setCanMove(bool){
        canMove = bool;
    }
    function getCanMove(){
        return canMove;
    }

    var isMoving = false;
    function setIsMoving(bool){
        isMoving = bool;
    }
    function getIsMoving(){
        return isMoving;
    }
    var countDomElement = false;
    function setCountDomElement(domElement){
        countDomElement = domElement;
    }
    function getCountDomElement(){
        return countDomElement;
    }



    function createInstance() {
        return {
            setCanMove : setCanMove,
            getCanMove : getCanMove,
            setIsMoving : setIsMoving,
            getIsMoving : getIsMoving,
            getCountDomElement : getCountDomElement,
            setCountDomElement : setCountDomElement
        };
    }



    return {
        getInstance: function () {
            if (!instance) {
                instance = createInstance();
            }
            return instance;
        }

    };
})();

