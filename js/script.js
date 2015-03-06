/**
 * Copyright 2013 Phil Buchanan
 *
 * A calculator iOS web application that supports
 * brackets and saved history.
 *
 * @version 2.0
 */

"use strict";

function Calculator() {
	this.settings = {
		version: '2.5',
		history: 8,
		timerlen: 750,
		timer: null,
		fontsize: 46,
		url: 'http://ioscalc.com',
		decimals: 2
	};
	
	this.appstate = {
		input: 0,
		brackets: 0,
		last: null
	};
	
	this.addEventHandlers();
	
	// Restore previous app state
	this.loadAppState();
	this.loadHistory();
	
	this.updateDisplay();
}



/**
 * Retrieve the application state from local storage
 */
Calculator.prototype.loadAppState = function() {
	var json = localStorage.getItem('appState'),
		savedAppState;
	
	if (json !== null && json !== '') {
		savedAppState = JSON.parse(json);
		
		this.appstate.input = savedAppState.input;
		this.appstate.last = savedAppState.last;
		this.appstate.brackets = savedAppState.brackets;
	}
};



/**
 * Save the application state to local storage
 */
Calculator.prototype.saveAppState = function() {
	var json = JSON.stringify(this.appstate);
	
	localStorage.setItem('appState', json);
};



Calculator.prototype.buttonPress = function(button) {
	
};



Calculator.prototype.appendToEquation = function(value, clear) {
	
};



Calculator.prototype.invertNumber = function() {
	
};



Calculator.prototype.equate = function() {
	
};



Calculator.prototype.backspace = function() {
	
};



Calculator.prototype.clear = function() {
	
};



Calculator.prototype.isValidNum = function(num) {
	if (num[0] === '-') {
		num = num.substr(1, num.length);
	}
	
	if (num[0] === '0') {
		if (num.length === 1) { // if number is a sinlge digit it's valid
			return true;
		}
		else if (/^0{2,}/.test(num) || // test multiple leading 0s
			!/^0(?=\.)/.test(num)) {   // ensure leading 0 is followed by a decimal point
				return false;
		}
	}
	
	if (!/^\d*\.?\d*$/.test(num)) { // ensure only one decimal point
		return false;
	}
	
	return true;
};



/**
 * Parses the last full number from the input string (eg. -42.63)
 *
 * return A full number
 */
Calculator.prototype.getLastNum = function() {
	var str = this.appstate.input,
		arr;
	
	if (str.length > 0) {
		arr = str.match(/-?\d*\.?\d*$/);
		
		if (arr !== null) {
			return arr[0];
		}
	}
	
	return false;
};



Calculator.prototype.updateDisplay = function() {
	
};



Calculator.prototype.updateDisplayEquation = function(equation) {
	
};



Calculator.prototype.replaceOperators= function(str) {
	
};



Calculator.prototype.resizeFont = function() {
	
};



Calculator.prototype.addCommas = function() {
	
};



/**
 * Compute an equation string
 *
 * @param equation string The equation string to compute
 * return double The result of the computation, else null if it cannot be computed 
 */
Calculator.prototye.compute = function(equation) {
	var result,
		round = Math.pow(10, this.settings.decimals);
	
	try {
		result = eval(equation);
	}
	catch(err) {
		return null;
	}
	
	return Math.round(result * round) / round;
};



Calculator.addHistoryItem = function(item) {
	
};



/**
 * Load the calculator history from local storage
 */
Calculator.prototype.loadHistory = function() {
	var json = localStorage.getItem('history'),
		i;
	
	if (json !== null && json !== '') {
		this.history = JSON.parse(json);
	}
	else {
		this.history = [];
	}
	
	for (i = 0; i < this.history.length; i += 1) {
		this.appendItem(this.history[i]);
	}
};



/**
 * Handles all events
 */
Calculator.prototype.addEventHandlers = function() {
	var buttons = document.getElementById('keypad'),
		buttonModeStart = 'mousedown',
		buttonModeEnd =   'mouseup';
	
	if (('standalone' in window.navigator) && window.navigator.standalone) {
		buttonModeStart = 'touchstart';
		buttonModeEnd = 'touchend';
	}
};



// Is app installed?
if ((('standalone' in window.navigator) && window.navigator.standalone)) {

	document.ontouchstart = function(e) {
		return false;
	};
	
	// Initialize app
	var calculator = new Calculator();
	
	/*var history = new Slideout({
		'panel': document.getElementById('application'),
		'menu':  document.getElementById('history'),
		'padding': 256,
		'tolerance': 70
	});*/
}
else {
	document.body.setAttribute('class', 'install');
}