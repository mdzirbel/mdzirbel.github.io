

c = document.getElementById("gameCanvas");
canvas = c.getContext("2d");

var keys = {37: 1, 38: 1, 39: 1, 40: 1};

var carColor = "gray";
var playerColor = "orange";

var framerate = 60;
var time = 60;
var lastLoop = new Date

var size = [c.width, c.height]

var numLanes = 9
var laneSize = Math.floor(size[0]/numLanes)

player = Math.floor((numLanes-1)/2)
var playerHeight = [size[1] - laneSize * 1.25]

var cars = []

var initCarVelocity = 10/6 // Starting velocity
carVelocity = initCarVelocity // Current velocity

var carAccel = .015/6 // Increase in Velocity per frame

var carFrequencyAdjust = 20 // The current car frequency is multiplied by velocity. This is the constant used to keep that in check
var laneFrequencyAdjust = 50 // Car frequency is multiplied by (numLanes/laneFrequencyAdjust).

var forgiveness = .3 // The amount it allows you to overlap with cars, .75 would make there be no crashes

var carFrequency = .1

var carSize = [laneSize, laneSize]
var playerSize = [laneSize/2, laneSize/2]

var carLaneBorder = (laneSize - carSize[0]) / 2 // Don't change this. It is the distance between the lane edge and the car. It will change if I change carSize
var playerLaneBorder = (laneSize - playerSize[0]) / 2 // Don't change this, to change it change playerSize

var powerBarHeight = 15

var statusReport = [10, size[1] - 30]
var statusTextHeight = 13

invulnerable = false
invincibility = {
	"time" : 1000, // This can start as whatever; currently a big number so the recharge bar won't be displayed instantly
	"maxCharges" : 1,
	"charges" : 1,
	"length" : 1 * time, // Time (frames, but those are factored in through the time variable) 
	"rechargeTime" : 6 * time
}
stopTimeKey = false
stoppingTime = false
stopTime = {
	"time" : 0,
	"maxCharge" : 250,
	"charge" : 250,
	"rechargeRate" : 15 / time
}

function menuMain(from) {
	$('.main').show();
	$('.main').removeClass("menuLeft");
	if(from){
		$('.'+from).hide();
	}
}
function howToPlay() {
	$('.main').hide();
	$('.howToPlay').show();
}
function credits() {
	$('.main').hide();
	$('.credits').show();
}
function play() {
	cycles = 0
	$('.main').hide();
	$('.postGame').hide();
	$('canvas').show();
	// $('.display').show();
	window.scroll(0,100)
	runGame = setInterval(function(){ game(); }, 1000/framerate);
}
function menuHighscores() {
	highscoreText();
	$('canvas').hide();
	$('.postGame').show();
}

function highscoreText() {
	$('.yourScore').html("Your final velocity was " + oldCarVelocity + " pixels/frame")
	$('.highscores').html("Highscores<br>1: "+highscores[0]+"<br>2: "+highscores[1]+"<br>3: "+highscores[2]+"<br>4: "+highscores[3]+"<br>5: "+highscores[4])
}

function sortNumber(a,b) {
	return b-a;
}
function drawLine(start, end, width, color) { // Draws lines
	color = color || "gray";
	canvas.beginPath();
	canvas.lineWidth = width;
	canvas.strokeStyle = color;
	canvas.moveTo(start[0],start[1]);
	canvas.lineTo(end[0],end[1]);
	canvas.stroke();
}

function moveCars() { // Moves the cars down the screen
	if (!stoppingTime){
		for (var i=0; i<cars.length; i++){
			cars[i][1] += carVelocity*(framerate/fps)

		}
	}
}
function addCar() { // Adds cars randomly, in random lanes
	if ((Math.random() <= carFrequency*(carVelocity/carFrequencyAdjust)*((numLanes**2)/laneFrequencyAdjust)*3) && !stoppingTime) {
		cars.push([Math.floor(Math.random()*numLanes),-carSize[1]])
	}
}
function carEndpoint() { // Checks for and deletes cars which go too far
	for (var i=0; i<cars.length; i++){
		if (cars[i][1] > (size[1] + carSize[1])*2){
			cars.splice(i,1)
		}
	}
}
function carStartPoint() { // Finds and deletes cars above the top of the screen
	for (var i=0; i<cars.length; i++) {
		if (cars[i][1] < -carSize[1]){
			cars.splice(i,1)
		}
	}
}

function checkCollision(){
	if (unsafe(player)){
		return true
	}
	return false
}

function drawEverything() {
	canvas.fillStyle="black";
	canvas.fillRect(0,0,c.width,c.height);
	drawCars();
	drawPlayer();
	drawPowerBars()
}

function drawCars() {
	canvas.fillStyle = carColor;
	for (var i=0; i<cars.length; i++){
		canvas.fillRect(cars[i][0]*laneSize + carLaneBorder, cars[i][1]-carSize[1]*.5, carSize[0], carSize[1])
		// canvas.fill()
		// pygame.draw.rect(screen, gray, (0, car[1], 699, 3)) // Prints a horizontal line where the car center is
	}
}
function drawPlayer() {
	canvas.fillStyle = playerColor
	canvas.rect(player*laneSize + playerLaneBorder, playerHeight - playerSize[1]/2, playerSize[0], playerSize[1])
	canvas.fill()
	drawLine([0,playerHeight], [size[0],playerHeight], 3, playerColor) // Puts a horizontal line where the player center is
}


function unsafe(playerx, checkAhead){ // playerx to differentiate between the local variable, so this can be used to check hypotheticals. checkAhead is to check at a different y
	playerx = playerx || player;
	checkAhead = checkAhead || 0;
	for (var i=0; i<cars.length; i++){
		if (cars[i][0] == playerx){
			if (Math.abs(cars[i][1] - playerHeight)-checkAhead < laneSize * (.75 - forgiveness)){
				return true
			}
		}
	}
	return false
}

function getMouseClick(evt) {
    var rect = c.getBoundingClientRect();
    clickPos = [evt.clientX - rect.left, evt.clientY - rect.top];
    unhandledClick = true;
}
function getMouseMove(evt) {
    var rect = c.getBoundingClientRect();
    mousePos = [evt.clientX - rect.left, evt.clientY - rect.top];
}

function accelerate() {
	carVelocity += carAccel
}

function movePlayer(direction) {
	if (direction == "right" && !(player == numLanes-1)) {
		player ++
	}
	if (direction == "left"  && !(player == 0)) {
		player --
	}
}

function stopTimeHandler() {
	if (stopTimeKey && stopTime["charge"] > 0) {
		stoppingTime = true
		stopTime["charge"] --
	}
	else if (!stopTimeKey || stopTime["charge"] <= 0) {
		stoppingTime = false
	}
	if (!stoppingTime && !stopTimeKey && stopTime["charge"] < stopTime["maxCharge"]) {
		stopTime["charge"] += stopTime["rechargeRate"]
	}
}

function invincibilityOn() {
	if (invincibility["charges"] >= 1) {
		invincibility["charges"] --;
		invincibility["time"] = 0;
		invulnerable = true
	}
}
function invincibilityHandler() { // Takes care of pretty much all the invincibility stuff
	if (invincibility["time"] > invincibility["length"]){
		invulnerable = false
	}
	if (invincibility["time"] >= invincibility["rechargeTime"] && invincibility["charges"] < invincibility["maxCharges"]) {
		invincibility["charges"] ++;
		invincibility["time"] = 0;
	}
	invincibility["time"] ++
}

function drawPowerBars() {
	if (invulnerable == true) {
		drawPowerBar("gold", 1, invincibility["time"]/invincibility["length"])
	}
	else if (invincibility["charges"] >= 1) {
		drawPowerBar("red", 1, invincibility["charges"]/invincibility["maxCharges"])
	}
	if (invincibility["time"] < invincibility["rechargeTime"] && invincibility["charges"]<invincibility["maxCharges"]) {
		drawPowerBar("gold", 1, invincibility["time"]/invincibility["rechargeTime"], 5)
	}
	drawPowerBar("green", 0, stopTime["charge"]/stopTime["maxCharge"])
}
function drawPowerBar(color, height, distance, tallness, backwards){
	tallness = tallness || powerBarHeight;
	backwards = backwards || false;
	canvas.fillStyle = color
	canvas.beginPath()
	if (!backwards){
		canvas.rect(0, height*powerBarHeight, distance*size[0], tallness)
	}
	else {
		canvas.rect(distance, size[0]-(distance*size[0]), distance*size[0], tallness)
	}
	canvas.closePath()
	canvas.fill()
}

function preventDefault(e) {
	e = e || window.event;
	if (e.preventDefault)
		e.preventDefault();
	e.returnValue = false;  
}
function keyPress(e) {
    // console.log(e)
	if (e.key == "ArrowRight") {
		movePlayer("right")
	}
	if (e.key == "ArrowLeft") {
		movePlayer("left")
	}
	if (e.key == "ArrowUp") {
    	invincibilityOn()
    }
    if (e.key == "ArrowDown") {
    	stopTimeKey = true
    }
    if (e.key == "Enter") {
    	highscores = reset()
    	clearInterval(runGame)
    	play()
    }


	if (keys[e.keyCode]) { // Keeps the keys from doing ususal stuff, like the up arrow scrolling up
        preventDefault(e);
        return false;
    } // No more key stuff beyond this point
}
function keyUp(e) {
	if (e.key == "ArrowDown") {
		stopTimeKey = false
	}
}

function checkForCrash() {
	// debugPrint(invulnerable)
	if (unsafe() && !invulnerable){
		oldCarVelocity = Math.round(carVelocity*100)/100
		highscores = reset()
		menuHighscores()
		clearInterval(runGame);
	}
}

function wait(ms){
	var start = new Date().getTime();
	var end = start;
	while(end < start + ms) {
		end = new Date().getTime();
	}
}

function getFPS() {
	var thisLoop = new Date;
    fps = 1000 / (thisLoop - lastLoop);
    lastLoop = thisLoop;
}

function debugPrint(toPrint, interval) {
	interval = interval || 15;
	if (cycles % interval == 0){
		console.log(toPrint)
	}
}

function game() { // This is the main game code, it will be called repeatedly to run the game
	getFPS()
	addCar()
	carStartPoint()
	carEndpoint()
	moveCars()
	accelerate()
	drawEverything();
	checkForCrash();
	invincibilityHandler()
	stopTimeHandler()
	
	// debugPrint(carVelocity)
	// debugPrint(getFPS())
	cycles ++
}

function reset() {
	carVelocity = Math.round(carVelocity*100)/100
	var highscores = getHighscores()
	addHighscore(carVelocity, highscores)
	setHighscores(highscores)
	cars = [];
	carVelocity = initCarVelocity
	cycles = 0
	return highscores
}

function getHighscores() {
	if (localStorage["highscores"]) {
		var highscores = localStorage["highscores"].split(","); // Gets highscores from cookies and turns it into a list
	}
	else {
		return [];
	}
	// console.log(typeof highscores)
	// console.log(highscores);
	highscores.sort(sortNumber);
	// console.log(highscores);
	return highscores;
}
function addHighscore(newHighscore, highscores) {
	highscores.push(newHighscore)
	// console.log(highscores);
	highscores.sort(sortNumber);
	// console.log(highscores);
	highscores.splice(5,1)
	return highscores
}
function setHighscores(highscores) {
	localStorage.setItem("highscores",highscores)
}
