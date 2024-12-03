class ball {
	constructor(pos, vel, radius, team, mass, collided){
		this.pos = pos;
		this.vel = vel;
		this.radius = radius;
		this.team = team;
		this.mass = mass;
		this.collided = false; // Used to not have friction when it hits a wall. This ensures that it doesn't move up to the wall, jump into it, get reflected, have friction
		                       // applied, and then still be in the wall the next move because it is going slightly slower.
	}
}
class wall {
	constructor(start, end, width, bounciness) {
		this.start = start;
		this.end = end;
		this.width = width;
		this.bounciness = bounciness;
	}
}
class field {
	constructor(corners) {
		this.corners = corners;
	}
}
class circleWall {
	constructor(pos, radius, bounciness) {
		this.pos = pos;
		this.radius = radius;
		this.bounciness = bounciness;
	}
}
class converterCircle {
	constructor(pos, team, radius, bounciness) {
		this.pos = pos;
		this.team = team;
		this.radius = radius;
		this.bounciness = bounciness;
	}
}

mapSelected = "map3";
playerNum = 2; // playerNumbers index from 1, it's kind of wierd that way.
players = [];

function initialize() { // all variables which get changed and need to be reset at the beginning of each game
	turn = 1; // Number of the player whose turn it is
	stage = "wait for stop";

	angle = "initial";
	magnitude = "initialer";
	unhandledClick = false;
	shouldDrawTracer = false;
	clicks = 0;
}
initialize();

pauseBetweenFrames = 17;

poolGreen = "rgb(39, 119, 20)";

teamColors = ["purple","lightgreen","blue","red","yellow","silver"];
readableTeamColors = ["Purple","Light Green","Blue","Red","Yellow","Silver"];
fieldColor = poolGreen;
wallColor = "gray";

balls = [];
walls = [];
fields = [];

frictionConstant = .0044;
airResistanceConstant = .9975

launchingConstant = .01;

c = document.getElementById("gameCanvas");
canvas = c.getContext("2d");

maps = {
	"map1" : {
		"walls": [
		new wall([0,0],[0,500],10,1),
		// new wall([0,1],[200,1],10,1),
		new wall([500,0],[700,0],10,1),
		new wall([700,0],[700,500],10,1),
		// new wall([200,0],[200,300],10,1),
		],
		"balls": [
		new ball([130,150],[0,0],15,1,10),
		new ball([130,250],[0,0],15,1,10),
		new ball([130,350],[0,0],15,1,10),
		new ball([520,150],[0,0],15,2,10),
		new ball([520,250],[0,0],15,2,10),
		new ball([520,350],[0,0],15,2,10),
		],
		"fields": [
		new field([[0,0],[200,0],[200,300],[500,300],[500,0],[700,0],[700,400],[0,400]]),
		],
		"circleWalls": [
		],
		"converterCircles": [
		]
	},
	"map2" : {
		"walls": [
		new wall([0,0],[700,0],10,1),
		new wall([700,0],[700,500],10,1),
		new wall([0,0],[0,500],10,1),
		new wall([0,500],[700,500],10,1),
		],
		"balls": [
		new ball([130,150],[0,0],15,1,10),
		new ball([130,250],[0,0],15,1,10),
		new ball([130,350],[0,0],15,1,10),
		new ball([520,150],[0,0],15,2,10),
		new ball([520,250],[0,0],15,2,10),
		new ball([520,350],[0,0],15,2,10),
		],
		"fields": [
		new field([[0,0],[300,0],[300,500],[0,500]]),
		new field([[300,0],[700,0],[700,500],[300,500],[300,300],[400,300],[400,200],[300,200]]),
		],
		"circleWalls": [
		new circleWall([300,200],25,1),
		new circleWall([300,300],25,1),
		new circleWall([400,200],25,1),
		new circleWall([400,300],25,1),
		],
		"converterCircles": [
		]
	},
	"map3" : {
		"walls": [
		new wall([0,0],[700,0],10,1),
		new wall([700,0],[700,500],10,1),
		new wall([0,0],[0,500],10,1),
		new wall([0,500],[700,500],10,1),
		],
		"balls": [
		new ball([130,150],[0,0],15,1,10),
		new ball([130,250],[0,0],15,1,10),
		new ball([130,350],[0,0],15,1,10),
		new ball([520,150],[0,0],15,2,10),
		new ball([520,250],[0,0],15,2,10),
		new ball([520,350],[0,0],15,2,10),
		],
		"fields": [
		new field([[0,0],[300,0],[300,500],[0,500]]),
		new field([[300,0],[700,0],[700,500],[300,500],[300,300],[400,300],[400,200],[300,200]]),
		],
		"circleWalls": [
		new circleWall([0,0],25,1),
		new circleWall([700,0],25,1),
		new circleWall([700,500],25,1),
		new circleWall([0,500],25,1),
		new circleWall([350,0],25,1),
		new circleWall([700,250],25,1),
		new circleWall([350,500],25,1),
		new circleWall([0,250],25,1),
		],
		"converterCircles": [
		]
	},
	"map4" : {
		"walls": [
		new wall([0,0],[700,0],10,1),
		new wall([700,0],[700,500],10,1),
		new wall([0,0],[0,500],10,1),
		new wall([0,500],[700,500],10,1),
		],
		"balls": [
		new ball([130,150],[0,0],15,1,10),
		new ball([130,250],[0,0],15,1,10),
		new ball([130,350],[0,0],15,1,10),
		new ball([520,150],[0,0],15,2,10),
		new ball([520,250],[0,0],15,2,10),
		new ball([520,350],[0,0],15,2,10),
		],
		"fields": [
		new field([[0,0],[700,0],[700,500],[0,500]]),
		],
		"circleWalls": [
		],
		"converterCircles": [
		new converterCircle([0,250],1,25,1),
		new converterCircle([700,250],2,25,1),
		]
	},
};

function menuMain(from) {
	$('.main').show();
	$('.main').removeClass("menuLeft");
	if(from){
		$('.'+from).hide();
	}
}
function menuNewGame(from) {
	$('.main').addClass("menuLeft");
	$('.newGame').show();
	if(from){
		$('.newGame').removeClass("menuLeft");
		$('.'+from).hide();
		$('.main').show();
	}
}
function menuMaps() {
	$('.main').hide();
	$('.newGame').addClass("menuLeft");
	$('.maps').show();
}
function menuPlayerNum() {
	$('.main').hide();
	$('.newGame').addClass("menuLeft");
	$('.playerNum').show();
}
function setPlayerNum(buttonNum) {
	playerNum = buttonNum;
	menuNewGame('playerNum');
}
function setMap(mapClicked) {
	mapSelected = mapClicked;
	menuNewGame('maps');
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
	if(mapSelected && playerNum){
		clicks = 0
		$('.main').hide();
		$('.newGame').hide();
		$('canvas').show();
		$(".display").show();
		menuMain("newGame");
		makeMap(mapSelected);
		runGame = setInterval(function(){ game(); }, pauseBetweenFrames);
	}
}

function drawEverything(){ // Manages and calls the other draw functions
	canvas.fillStyle="white";
	canvas.fillRect(0,0,c.width,c.height);
	drawFields();
	drawWalls();
	drawCircleWalls();
	drawConverterCircles();
	drawBalls();
	drawTracer();
}
function drawWalls(){ // Draws all the walls, uses drawLine to do so
	for (var i = 0; i < walls.length; i++){
		drawLine(walls[i].start, walls[i].end, walls[i].width);
	}
}
function drawCircleWalls() {
	for (var i=0; i<circleWalls.length; i++){
		canvas.beginPath();
		canvas.fillStyle = wallColor;
		canvas.arc(circleWalls[i].pos[0],circleWalls[i].pos[1],circleWalls[i].radius,0,2*Math.PI);
		canvas.fill();
	}
}
function drawConverterCircles() {
	for (var i=0; i<converterCircles.length; i++){
		canvas.beginPath();
		canvas.fillStyle = teamColors[converterCircles[i].team];
		canvas.arc(converterCircles[i].pos[0],converterCircles[i].pos[1],converterCircles[i].radius,0,2*Math.PI);
		canvas.fill();
	}
}
function drawBalls(){ // Draws all the balls
	for (var i=0; i < balls.length; i++){
		canvas.beginPath();
		canvas.fillStyle = teamColors[balls[i].team];
		canvas.arc(balls[i].pos[0],balls[i].pos[1],balls[i].radius,0,2*Math.PI);
		canvas.fill();
	}
}
function drawFields(){ // Draws all the fields
	for (var i=0; i < fields.length; i++){
		canvas.beginPath();
		canvas.fillStyle = fieldColor;
		canvas.moveTo(fields[i].corners[0][0],fields[i].corners[0][1]);
		for (var j=1; j < fields[i].corners.length; j++){
			canvas.lineTo(fields[i].corners[j][0],fields[i].corners[j][1]);
		}
		canvas.closePath();
		canvas.fill();
	}
}
function drawLine(start, end, width, color) { // Draws lines
	color = color || wallColor;
	canvas.beginPath();
	canvas.lineWidth = width;
	canvas.strokeStyle = color;
	canvas.moveTo(start[0],start[1]);
	canvas.lineTo(end[0],end[1]);
	canvas.stroke();
}
function drawTracer() {
	if (shouldDrawTracer){
		drawLine(balls[nearestBallIndex].pos,mousePos,3,"gray")
	}
}

function allStopped() {
	for (var i=0; i < balls.length; i++){
		if (balls[i].vel[0] != 0 || balls[i].vel[1] != 0){
			return false;
		}
	}
	return true;
}
function moveBalls(){ // Moves balls according to their velocity
	for (var i=0; i < balls.length; i++){
		balls[i].pos[0] += balls[i].vel[0];
		balls[i].pos[1] += balls[i].vel[1];
	}
}
function friction(){ // Decreases the magnitude of the ball's velocity by the friction constant
	for (var i=0; i < balls.length; i++){
		if ((balls[i].vel[0] != 0 || balls[i].vel[1] != 0) && balls[i].mass != 0){
			if (balls[i].collided == false) {
				[angle, magnitude] = cartesianToPolar(balls[i].vel);
				if (magnitude > frictionConstant){
					magnitude -= frictionConstant;
					magnitude *= airResistanceConstant;
				}
				else{
					magnitude = 0;
				}
				balls[i].vel = polarToCartesian(angle, magnitude);
			}
			balls[i].collided = false;
		}
	}
}

function checkField() { // Deals with balls which are not on the field
	for (var i=0; i < balls.length; i++){ // I should eventually just check balls whenever I move them
		ballOnField = false;
		for (var j=0; j < fields.length; j++){
			if (!ballOnField && ballInField(balls[i],fields[j])){
				ballOnField = true;
			}
		}
		if (!ballOnField || balls[i].mass == 0){
			ballOffField(i);
		}
	}
}
function ballOffField(i) { // Manages balls which fall off the field
	if (balls[i].radius > 0) {
		balls[i].radius -= .2+.1*Math.sqrt(balls[i].vel[0]**2+balls[i].vel[1]**2);
		balls[i].mass = 0;

	}
	if (balls[i].radius <= 2) {
		balls.splice(i,1);
	}
}
function ballInField(ball, field) { // Given a ball and a field, checks if the ball is in the field
	crossings = 0;
	for (var c=0; c<field.corners.length-1; c++){ // Checks all the corners but the first and last and sees if the imaginary line to the right goes through them
		if (checkCrossings(field.corners[c][0],field.corners[c][1],field.corners[c+1][0],field.corners[c+1][1],ball.pos[0],ball.pos[1])){
			crossings++;
		}
	}
	if (checkCrossings(field.corners[0][0],field.corners[0][1],field.corners[field.corners.length-1][0],field.corners[field.corners.length-1][1],ball.pos[0],ball.pos[1])){
		crossings++;
	}
	if (crossings % 2 == 1){
		return true;
	}
	else{
		return false;
	}
}
function checkCrossings(a,b,c,d,e,f) { // [a,b] and [c,d] are the start and end of the line, [e,f] is the ball
	if ((f >= d && f <= b) || (f <= d && f >= b)){
		if (b-d == 0){ // Makes sure to take care of the case where the line is horizontal so we don't devide by 0
			return false;
		}
		x = ((f-b)*(a-c))/(b-d)+a; // End result of solving for the crossing of two lines
		if (x >= e && ((x >= a && x <= c) || (x <= a && x >= c))){
			return true;
		}
	}
	return false;
}

function wallCollision() { // Checks for and handles all ball to wall collisions
	for (var i=0; i<walls.length; i++){
		var wall = walls[i];
		for (var j=0; j<balls.length; j++){
			var ball = balls[j];
			if(ball) {
				v = wall.start[1]-wall.end[1];
				u = wall.start[0]-wall.end[0];
				r = ((ball.pos[0]-wall.start[0])*(-v) + (ball.pos[1]-wall.start[1])*(u))/Math.sqrt(u**2 + v**2);

				if (Math.abs(r) < 5+balls[j].radius){
					u = wall.start[0]-wall.end[0];
					v = wall.start[1]-wall.end[1];
					ball.vel = [wall.bounciness*(ball.vel[0]+(2*(-v*ball.vel[0]+u*ball.vel[1])/(u**2+v**2)*v)),
					wall.bounciness*(ball.vel[1]-2*(-v*ball.vel[0]+u*ball.vel[1])/(u**2+v**2)*u)]; // If you need to understand this you're doomed
					ball.collided = true;
				}
			}
			else{
				console.log("i:",i,"balls[i]",balls[i],"balls length",balls.length)
			}
		}
	}
}

function ballToCircleWallCollision() {
	for (var i=0; i<circleWalls.length; i++){
		var wall = circleWalls[i];
		for (var j=0; j<balls.length; j++){
			var ball = balls[j];
			if (Math.sqrt((ball.pos[0]-wall.pos[0])**2+(ball.pos[1]-wall.pos[1])**2) <= ball.radius + wall.radius){
				var angleBetween = Math.atan2((ball.pos[1]-wall.pos[1]),(ball.pos[0]-wall.pos[0]));
				diff = Math.PI - angleBetween;
				[a, m] = cartesianToPolar(ball.vel);
				a += diff;
				ball.vel = polarToCartesian(a,m);
				ball.vel[0] *= -1;
				[a, m] = cartesianToPolar(ball.vel);
				a -= diff;
				ball.vel = polarToCartesian(a,m);
				ball.collided = true;
			}
		}
	}
}

function ballToConverterCircleCollision() { // Most of this is copy pasted from ballToCircleWallCollision, it's very close to the same thing
	for (var i=0; i<converterCircles.length; i++){
		var wall = converterCircles[i];
		for (var j=0; j<balls.length; j++){
			var ball = balls[j];
			if (Math.sqrt((ball.pos[0]-wall.pos[0])**2+(ball.pos[1]-wall.pos[1])**2) <= ball.radius + wall.radius){
				ball.team = wall.team;
				var angleBetween = Math.atan2((ball.pos[1]-wall.pos[1]),(ball.pos[0]-wall.pos[0]));
				diff = Math.PI - angleBetween;
				[a, m] = cartesianToPolar(ball.vel);
				a += diff;
				ball.vel = polarToCartesian(a,m);
				ball.vel[0] *= -1;
				[a, m] = cartesianToPolar(ball.vel);
				a -= diff;
				ball.vel = polarToCartesian(a,m);
				ball.collided = true;
			}
		}
	}
}

function ballCollision() { // Checks for and manages ball to ball collisions
	for (var i=0; i<balls.length; i++){
		var ball1 = balls[i];
		for (var j=0; j<balls.length; j++){
			var ball2 = balls[j];
			if (j<i){ // I haven't thought enough about this. Is it doing what I want? I don't want to compare two balls twice, that's the point of it
				if (Math.sqrt((ball1.pos[0]-ball2.pos[0])**2+(ball1.pos[1]-ball2.pos[1])**2) <= ball1.radius + ball2.radius){
					var angleBetween = Math.atan2((ball2.pos[1]-ball1.pos[1]),(ball2.pos[0]-ball1.pos[0]));
					// console.log("angleBetween:",angleBetween/Math.PI);
					while (angleBetween < 0){
						angleBetween += Math.PI;
					}
					[a1, v1] = cartesianToPolar(ball1.vel);
					[a2, v2] = cartesianToPolar(ball2.vel);

					// console.log(teamColors[ball1.team], a1/Math.PI, v1);
					// console.log(teamColors[ball2.team], a2/Math.PI, v2);
					// console.log(teamColors[ball2.team],"Angle =",a2f/Math.PI);

					var m1 = ball1.mass;
					var m2 = ball2.mass;

					// These equations are on the wikipedia for elastic collisions. If you need to understand them, just give up.
					ball1.vel = [((v1*Math.cos(a1-angleBetween)*(m1-m2)+2*m2*v2*Math.cos(a2-angleBetween))/(m1+m2))*Math.cos(angleBetween)+v1*Math.sin(a1-angleBetween)*Math.cos(angleBetween+Math.PI/2),
					((v1*Math.cos(a1-angleBetween)*(m1-m2)+2*m2*v2*Math.cos(a2-angleBetween))/(m1+m2))*Math.sin(angleBetween)+v1*Math.sin(a1-angleBetween)*Math.sin(angleBetween+Math.PI/2)];
					ball2.vel = [((v2*Math.cos(a2-angleBetween)*(m2-m1)+2*m1*v1*Math.cos(a1-angleBetween))/(m2+m1))*Math.cos(angleBetween)+v2*Math.sin(a2-angleBetween)*Math.cos(angleBetween+Math.PI/2),
					((v2*Math.cos(a2-angleBetween)*(m2-m1)+2*m1*v1*Math.cos(a1-angleBetween))/(m2+m1))*Math.sin(angleBetween)+v2*Math.sin(a2-angleBetween)*Math.sin(angleBetween+Math.PI/2)];
					ball1.collided = true;
					ball2.collided = true;
					// console.log(teamColors[ball1.team], ball1.vel);
					// console.log(teamColors[ball2.team], ball2.vel);
				}
			}
		}
	}
}

function cartesianToPolar(vel) { // Takes a velocity vector (list) and returns an angle and a magnitude as a list
	angle = Math.atan2(vel[1],vel[0]);
	magnitude = Math.sqrt(vel[0]**2 + vel[1]**2);
	return [angle, magnitude];
}
function polarToCartesian(angle, magnitude) { //  Takes an angle and magnitude and returns a velocity vector as a list
	return [magnitude * Math.cos(angle), magnitude * Math.sin(angle)];
}

function removeNonPlayerBalls() { // Removes all balls which there aren't players for, based on playerNum
	for (var i=0; i < balls.length; i++) {
		if (balls[i].team > playerNum) {
			balls.splice(i,1);
		}
	}
}
function playerHasBalls(player) {
	for (var i=0; i < balls.length; i++){
		if (balls[i].team == player) {
			return true;
		}
	}
	return false;
}
function playerNumBalls(player) {
	var numBalls = 0;
	for (var i=0; i < balls.length; i++){
		if (balls[i].team == player) {
			numBalls++;
		}
	}
	return numBalls;
}

function selectNearestBall(team) {
	var minDistanceAway = 100000
	for (var i=0; i < balls.length; i++){
		if (balls[i].team == team) {
			var distanceAway = Math.sqrt((balls[i].pos[0]-clickPos[0])**2+(balls[i].pos[1]-clickPos[1])**2)
			if (distanceAway < minDistanceAway){
				minDistanceAway = distanceAway
				var nearestBallIndex = i
			}
		}
	}
	return nearestBallIndex;
}

function getMouseClick(evt) {
	if (clicks > 0){
	    var rect = c.getBoundingClientRect();
	    clickPos = [evt.clientX - rect.left, evt.clientY - rect.top];
	    unhandledClick = true;
	}
	clicks ++;
}
function getMouseMove(evt) {
    var rect = c.getBoundingClientRect();
    mousePos = [evt.clientX - rect.left, evt.clientY - rect.top];
}

function displayGameData() {
	$(".team").html(readableTeamColors[turn] + "'s turn");
	$(".map").html("map: " + mapSelected);
	toDisplay = "";
	for (var i=1; i < playerNum+1; i++) {
		numBalls = playerNumBalls(i);
		if (numBalls > 0 && i != turn){
			toDisplay = toDisplay + readableTeamColors[i] + " has " + numBalls + " balls<br>"
		}
		else if (numBalls > 0 && i == turn){
			toDisplay = toDisplay + "<mark>" + readableTeamColors[i] + " has " + numBalls + " balls</mark><br>"
		}
	}
	$(".gameState").html(toDisplay);
}

function wait(ms){
   var start = new Date().getTime();
   var end = start;
   while(end < start + ms) {
     end = new Date().getTime();
  }
}

function incrementTurn() {
	turn ++;
	if (turn > playerNum) {
		turn = 1;
	}
}
function launchBall(i,toward) {
	balls[i].vel = [launchingConstant*(toward[0]-balls[i].pos[0]), launchingConstant*(toward[1]-balls[i].pos[1])];
}

function turns() {
	// console.log(stage)
	switch(stage) {
		case "wait for stop":
			unhandledClick = false;
			if (allStopped()){
				stage = "select ball";
			}
			break;
		case "select ball":
			if (unhandledClick) {
				nearestBallIndex = selectNearestBall(turn);
				shouldDrawTracer = true;
				unhandledClick = false;
				stage = "launch ball";
			}
			break;
		case "launch ball":
			if (unhandledClick){
				unhandledClick = false;
				launchBall(nearestBallIndex, clickPos);
				shouldDrawTracer = false;
				stage = "wait for stop 2";
				incrementTurn();
			}
			break;
		case "wait for stop 2":
			if (allStopped()){
				stage = "check remaining players"
			}
			break;
		case "check remaining players":
			remainingPlayers = []
			for (var i=1; i<playerNum+1; i++){
				if (playerHasBalls(i)){
					remainingPlayers.push(i)
				}
			}
			if (remainingPlayers.length == 0){
				stage = "tie";
			}
			else if (remainingPlayers.length == 1){
				stage = "winner";
			}
			else if (remainingPlayers.length > 1){
				stage = "wait for stop";
			}
			break;
		case "winner":
			$('canvas').hide();
			$(".winnerText").show();
			$(".display").hide();
			$(".winnerText").html(readableTeamColors[remainingPlayers[0]] + " Wins!");
			stage = "start new game"
			break;
		case "tie":
			$('canvas').hide();
			$(".winnerText").show();
			$(".display").hide();
			$(".winnerText").html("Tie!");
			stage = "start new game"
			break;
		case "start new game":
			makeMap(mapSelected)
			clearInterval(runGame);
			wait(2000)
			initialize();
			$(".winnerText").hide();
			$('.main').show();
			break;

	}
}

function newBall(oldball) { // Makes a new object, not just a pointer to the old object
	var newBall = new ball([oldball.pos[0],oldball.pos[1]],[oldball.vel[0],oldball.vel[1]],oldball.radius,oldball.team,oldball.mass);
	return newBall;
}

function game() { // This is the main game code, it will be called repeatedly to run the game
	wallCollision();
	drawEverything();
	moveBalls();
	friction();
	ballCollision();
	ballToCircleWallCollision();
	ballToConverterCircleCollision();
	checkField();
	turns();
	displayGameData();
	// console.log(balls[0]);
}

function clearField() {
	walls = [];
	circleWalls = [];
	balls = [];
	fields = [];
	converterCircles = [];
}
function makeMap(map) {
	clearField();
	maps[map]["walls"].forEach(function(wall){
		walls.push(wall);
	});
	maps[map]["circleWalls"].forEach(function(circleWall){
		circleWalls.push(circleWall);
	});
	maps[map]["balls"].forEach(function(oldBall){
		balls.push(newBall(oldBall));
	});
	maps[map]["fields"].forEach(function(field){
		fields.push(field);
	});
	maps[map]["converterCircles"].forEach(function(converterCircle){
		converterCircles.push(converterCircle);
	});
	removeNonPlayerBalls();
}
