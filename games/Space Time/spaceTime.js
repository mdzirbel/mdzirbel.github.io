
class ai {
	constructor(pos, type, health, maxHealth, team) {
		this.pos = pos
		this.type = type
		this.health = health
		this.maxHealth = maxHealth
		this.team = team
	}
}
class player {
	constructor(pos, health) {
		this.pos = pos
		this.health = health
		this.maxHealth = 100
	}
}
class pressurePlate {
	constructor(xpos, ypos) {
		this.pos = [xpos,ypos]
		this.state = "off"
	}
}

c = document.getElementById("gameCanvas");
canvas = c.getContext("2d");

var keys = {37: 1, 38: 1, 39: 1, 40: 1};

var framerate = 60;

var xTiles = 30 // How many tiles you see in the x direction
var yTiles = 20 // How many tiles you see in the y direction

var walkingTiles = ["g"]

var maxTime = 200
var minTime = 0
var startTime = 0
var time = startTime

var map = [
["r","r","r","r","r","r","r","r","r","r","r","r","r","r","r","r","r","r","r","r","r","r","r","r","r","r","r","r","r","r"],
["r","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","r"],
["r","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","r"],
["r","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","r"],
["r","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","r"],
["r","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","r"],
["r","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","r"],
["r","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","r"],
["r","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","r"],
["r","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","r"],
["r","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","r"],
["r","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","r"],
["r","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","r"],
["r","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","r"],
["r","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","r"],
["r","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","r"],
["r","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","r"],
["r","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","r"],
["r","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","r"],
["r","r","r","r","r","r","r","r","r","r","r","r","r","r","r","r","r","r","r","r","r","r","r","r","r","r","r","r","r","r"],
]
var pressurePlates = [
new pressurePlate(1,1),
new pressurePlate(2,2),
]


var timePlayers = {"0":[]}

var cpus = [
new ai([5,5],"soldier",100,100,"blue")
]

var activePlayer = new player([1,1],100)

var canvasRoomX = $(window).width()*.93
var canvasRoomY = ($(window).height()-114)*.87
console.log("x:",canvasRoomX)
console.log("y:",canvasRoomY)

var tileSizeY = canvasRoomY / yTiles
var tileSizeX = canvasRoomX / xTiles

if (tileSizeY < tileSizeX) {
	tileWidth = tileSizeY
}
else {
	tileWidth = tileSizeX
}

c.width = tileWidth * xTiles
c.height = tileWidth * yTiles



function play() {
	cycles = 0
	$('.main').hide()
	$('.postGame').hide()
	$('canvas').show()
	window.scroll(0,100)
	for (var i=0;i<5;i++){
		drawEverything()
	}
}

function getMouseMove(evt) {
    var rect = c.getBoundingClientRect()
    mousePos = [evt.clientX - rect.left, evt.clientY - rect.top]
}

function drawEverything() {
	drawMap()
	drawPlates()
	drawPlayer()
	drawPreviousPlayers()
	drawInfo()

}
function drawMap() {
	for (var i=0; i<map.length; i++) {
		for (var j=0; j<map[i].length; j++) {
			if (map[i][j] == "g"){
				canvas.fillStyle = "green"
				canvas.beginPath()
				canvas.rect(tileWidth*j, tileWidth*i, tileWidth, tileWidth)
				canvas.closePath()
				canvas.fill()
			}
			else if (map[i][j] == "r"){
				canvas.fillStyle = "gray"
				canvas.beginPath()
				canvas.rect(tileWidth*j, tileWidth*i, tileWidth, tileWidth)
				canvas.closePath()
				canvas.fill()
			}
		}
	}
}
function drawPlayer() {
	canvas.fillStyle = "black"
	canvas.beginPath()
	canvas.rect(tileWidth*(activePlayer.pos[0]+.2), tileWidth*(activePlayer.pos[1]+.2), tileWidth*.6, tileWidth*.6)
	canvas.closePath()
	canvas.fill()
}
function drawPreviousPlayers() {
	console.log(timePlayers[time])
	if (timePlayers[time]){
		for (var i=0;i<timePlayers[time].length;i++){
			canvas.fillStyle = "gray"
			canvas.beginPath()
			canvas.rect(tileWidth*(timePlayers[time][i].pos[0]+.2), tileWidth*(timePlayers[time][i].pos[1]+.2), tileWidth*.6, tileWidth*.6)
			canvas.closePath()
			canvas.fill()
		}
	}
}
// function drawCPUs() {
// 	for () {
// 		canvas.fillStyle = cpu.team
// 		canvas.beginPath()
// 		canvas.rect(tileWidth*(cpu.pos[0]+.2), tileWidth*(cpu.pos[1]+.2), tileWidth*.6, tileWidth*.6)
// 		canvas.closePath()
// 		canvas.fill()
// 	}
// }
function drawPlates() {
	for (var i=0;i<pressurePlates.length;i++) {
		canvas.fillStyle = "blue"
		canvas.beginPath()
		canvas.moveTo(tileWidth*(pressurePlates[i].pos[0]), tileWidth*(pressurePlates[i].pos[1]+.5))
		canvas.lineTo(tileWidth*(pressurePlates[i].pos[0]+.5), tileWidth*(pressurePlates[i].pos[1]))
		canvas.lineTo(tileWidth*(pressurePlates[i].pos[0]+1), tileWidth*(pressurePlates[i].pos[1]+.5))
		canvas.lineTo(tileWidth*(pressurePlates[i].pos[0]+.5), tileWidth*(pressurePlates[i].pos[1]+1))
		canvas.lineTo(tileWidth*(pressurePlates[i].pos[0]), tileWidth*(pressurePlates[i].pos[1]+.5))
		canvas.closePath()
		canvas.fill()
	}
}
function drawInfo() {
	canvas.font = "15px Arial";
	canvas.fillText("Time: "+time,5,15);
	console.log("Time:",time)
}

function keyPress(e) {
    // console.log(e)
	if (e.key == "w") {
		activePlayer = move(activePlayer, 0, -1)
	}
	else if (e.key == "a") {
		activePlayer = move(activePlayer, -1, 0)
	}
	else if (e.key == "s") {
		activePlayer = move(activePlayer, 0, 1)
	}
	else if (e.key == "d") {
		activePlayer = move(activePlayer, 1, 0)
	}
	else if (e.key == " ") {
		time = moveTime(1)
	}
	else if (e.key == "Shift") {
		time = moveTime(-1)
	}
	else if (e.key == "t") {
		console.log(timePlayers)
	}
	checkPressurePlates()
	drawEverything()
}

function checkPressurePlates() {
	for (var i=0;i<pressurePlates.length;i++) {
		checkPlate(pressurePlates[i])
	}
}
function checkPlate(plate) {
	if (activePlayer.pos[0] == plate.pos[0] && activePlayer.pos[1] == plate.pos[1]) {
		plate.state = "on"
		return
	}
	for (var i=0;i<timePlayers[time].length;i++) {
		if (timePlayers[time][i].pos[0] == plate.pos[0] && timePlayers[time][i].pos[1] == plate.pos[1]) {
			plate.state = "on"
			return
		}
	}
	plate.state = "off"
}

function moveTime(amount) {
	timePlayers[time].push(new player([activePlayer.pos[0],activePlayer.pos[1]],activePlayer.health))
	time += amount
	if (!timePlayers[time]) {
		timePlayers[time] = []
	}
	return time
}

function move(thing,x,y) {
	var newPos = [thing.pos[0]+x, thing.pos[1]+y]
	if (map[newPos[1]][newPos[0]] == "g"){
		thing.pos = newPos
	}
	return thing
}