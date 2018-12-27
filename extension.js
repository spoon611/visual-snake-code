// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

var editor;
var direction = 'up';
var oldTail;
var maxX;
var minX;
var maxY;
var minY;
var snake = [];
var endGame = false;
var line;
var foodX;
var foodY;
var foodExist = false;
var points = [
	{
		x: 10,
		y: 31
	}, {
		x: 11,
		y: 31
	}, {
		x: 12,
		y: 31
	}, {
		x: 13,
		y: 31
	}, {
		x: 14,
		y: 31
	}
];
//21*30 area from [1,1] to [61, 61] 
var startScreen = [
	'╔══════════════════════════════════════════════════════════════╗\n',
    '║                                                              ║\n',
    '║                                                              ║\n',
    '║                                                              ║\n',
    '║                                                              ║\n',
    '║                                                              ║\n',
    '║                                                              ║\n',
    '║                                                              ║\n',
    '║                                                              ║\n',
    '║                                                              ║\n',
    '║                              ██                              ║\n',
    '║                              ██                              ║\n',
    '║                              ██                              ║\n',
    '║                              ██                              ║\n',
    '║                              ██                              ║\n',
    '║                                                              ║\n',
    '║                                                              ║\n',
    '║                                                              ║\n',
    '║                                                              ║\n',
    '║                                                              ║\n',
    '║                                                              ║\n',
    '║                                                              ║\n',
    '╚══════════════════════════════════════════════════════════════╝\n'
];

function gameInit(ed) {
	for(var i = 0; i < startScreen.length; i++) {
		ed.insert(new vscode.Position(i, 0), startScreen[i]);
	}
	for(var x = 1; x <= 21; x++) {
		snake[x] = [];
		for(var y = 1; y <= 61; y = y + 2) {
			snake[x][y] = 0;
		}
	}
	for(let point of points) {
		snake[point.x][point.y] = 1;
	}
}

function keyInput(ed, doc) {
	line = doc.lineCount - 1;
	var command = doc.lineAt(line).text;
	var i = command.length - 1;
	if(direction != 'down' && command[i] == 'w') direction = 'up';
	else if(direction != 'right' && command[i] == 'a') direction = 'left';
	else if(direction != 'up' && command[i] == 's') direction = 'down';
	else if(direction != 'left' && command[i] == 'd') direction = 'right';
	//remove input char
	ed.replace(
		new vscode.Range(
			new vscode.Position(line, 0),
			new vscode.Position(line, 99999)
		), ""
	);
}

function createFood(ed) {
	if(foodExist) return;
	foodX = randomPos(1, 21);
	foodY = randomPos(1, 61);
	if(foodY % 2 == 0) foodY -= 1;
	if(snake[foodX][foodY] == 1) {
		createFood(ed);
	} else {
		ed.replace(
			new vscode.Range(
				new vscode.Position(foodX, foodY),
				new vscode.Position(foodX, foodY + 2)
			),'██'
		);
		foodExist = true;
	}
}

function gameRender() {
	if(!endGame) {
		editor.edit((ed) => {
			keyInput(ed, editor.document);
			createFood(ed);
			playerMove();
			screenRender(ed);
		}).then(() => setTimeout(gameRender, 200));
	} else {
		//TODO: end screen
	}
}

function screenRender(ed) {
	ed.replace(
		new vscode.Range(
			new vscode.Position(points[0].x, points[0].y),
			new vscode.Position(points[0].x, points[0].y + 2)
		),'██'
	);
	snake[points[0].x][points[0].y] = 1;
	
	ed.replace(
		new vscode.Range(
			new vscode.Position(oldTail.x, oldTail.y),
			new vscode.Position(oldTail.x, oldTail.y + 2)
		),'  '
	)
	snake[oldTail.x][oldTail.y] = 0;
}

function eatFood(head) {
	if(validatePos(head)) {
		if(head.x == foodX && head.y == foodY) {
			points.unshift(head);
			foodExist = false;
		} else {
			points.unshift(head);
			oldTail = points.pop();
		}
	}
}

function playerMove() {
	if(direction == 'right') {
		var head = {
			x: points[0].x,
			y: points[0].y + 2
		}
		eatFood(head);
	} else if(direction == 'up') {
		var head = {
			x: points[0].x - 1,
			y: points[0].y
		}
		eatFood(head);
	} else if(direction == 'left') {
		var head = {
			x: points[0].x,
			y: points[0].y - 2
		}
		eatFood(head);
	} else if(direction == 'down') {
		var head = {
			x: points[0].x + 1,
			y: points[0].y
		}
		eatFood(head);
	}
}

function randomPos(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function validatePos(head) {
	if(head.x < minX || head.x > maxX || head.y < minY || head.y > maxY || eatSelf(head)) {
		endGame = true;
		return false;
	} 
	return true;
}

function eatSelf(head) {
	if(snake[head.x][head.y] == 1) return true;
	return false;
}





// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "visual-snake-code" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('extension.vSnakeCode', function () {
		// The code you place here will be executed every time your command is executed
		minX = 1;
		minY = 1;
		maxX = 21;
		maxY = 61;
		editor = vscode.window.activeTextEditor;
		editor.edit((e) => gameInit(e)).then(gameRender);
		// Display a message box to the user
		vscode.window.showInformationMessage('Visual Snake Code!');
	});

	context.subscriptions.push(disposable);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
