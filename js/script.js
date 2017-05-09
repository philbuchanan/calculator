/**
 * Copyright 2013-2017 Phil Buchanan
 *
 * A calculator iOS web application that supports brackets, backspace and saved
 * calculation history. The app uses HTML5 app caching so it will work offline.
 *
 * @version 3.3.3
 */

"use strict";

var devmode = false;

/**
 * Returns the contents of the first item of an array
 */
if (!Array.prototype.first) {
	Array.prototype.first = function() {
		return this[0];
	}
}



/**
 * Returns the contents of the last item of an array
 */
if (!Array.prototype.last) {
	Array.prototype.last = function() {
		return this[this.length - 1];
	}
}



/**
 * Replace the contents of the last item in an array
 *
 * @param value string The new string for the last array item
 */
if (!Array.prototype.replaceLast) {
	Array.prototype.replaceLast = function(value) {
		this[this.length - 1] = value;
	}
}



/**
 * Append a string to the string of the last item in an array
 *
 * @param value string The string to append
 */
if (!Array.prototype.appendToLast) {
	Array.prototype.appendToLast = function(value) {
		this[this.length - 1] += value;
	}
}



/**
 * The Calcualtor constructor function
 */
function Calculator() {
	this.settings = {
		version: '3.3.2',
		history: 50,
		fontsize: 60,
		decimals: 2
	};

	this.appstate = {
		input: ['0'],
		brackets: 0,
		last: null
	};

	this.history = [];

	this.timer = {
		timerlen: 750,
		timer: null
	};

	this.calculator   = document.getElementById('calculator');
	this.result       = document.getElementById('result');
	this.equation     = document.getElementById('equation');
	this.keypad       = document.getElementById('keypad');
	this.historyPanel = document.getElementById('history');
	this.historyList  = document.getElementById('history-list');
	this.historyClose = document.getElementById('history-close');

	this.dragging = false;
	this.addEventHandlers();

	// Restore previous app state
	this.restoreAppState();
	this.loadHistory();

	this.updateDisplay();
}



/**
 * Retrieve and restore the application state from local storage
 */
Calculator.prototype.restoreAppState = function() {
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



/**
 * Handles all events
 */
Calculator.prototype.addEventHandlers = function() {
	var buttonModeStart = 'mousedown',
		buttonModeEnd = 'mouseup';

	if (!devmode) {
		buttonModeStart = 'touchstart';
		buttonModeEnd = 'touchend';
	}

	// Disable bounce scrolling on main application
	document.getElementById('application').addEventListener(buttonModeStart, function(e) {
		e.preventDefault();
		e.stopPropagation();
	}, false);

	// Fix bounce scrolling of whole page at top and bottom of content
	document.getElementById('history-list-scroll').addEventListener('touchstart', function(e) {
		var startTopScroll = this.scrollTop;

		if (document.getElementById('history-list').offsetHeight <= this.offsetHeight) {
			e.preventDefault();
			e.stopPropagation();
		}
		else {
			if (startTopScroll <= 0) {
				this.scrollTop = 1;
			}

			if (startTopScroll + this.offsetHeight >= this.scrollHeight) {
				this.scrollTop = this.scrollHeight - this.offsetHeight - 1;
			}
		}
	}, false);

	// Keypad events
	document.getElementById('btn-backspace').addEventListener(buttonModeStart, function() {
		this.addTimer(this.backspaceLongPress.bind(this));
	}.bind(this), false);

	this.keypad.addEventListener(buttonModeEnd, function(event) {
		if (!this.dragging) {
			this.removeTimer();
			this.buttonEvent(event.target.value);
		}
	}.bind(this), false);

	// History list events
	this.historyList.addEventListener(buttonModeStart, function() {
		this.dragging = false;
	}.bind(this), false);

	this.historyList.addEventListener('touchmove', function() {
		this.dragging = true;
	}.bind(this), false);

	this.historyList.addEventListener(buttonModeEnd, function(event) {
		if (!this.dragging) {
			// Need this because of the <span> for the equation inside the button
			if (event.target.value) {
				this.appendHistoryItemToEquation(event.target.value);
			}
			else {
				this.appendHistoryItemToEquation(event.toElement.parentNode.value);
			}

			this.closeHistoryPanel();
		}
	}.bind(this), false);

	// History close events
	this.historyClose.addEventListener(buttonModeStart, function() {
		this.addTimer(this.clearHistory.bind(this));
	}.bind(this), false);

	this.historyClose.addEventListener(buttonModeEnd, function() {
		this.removeTimer();
		this.closeHistoryPanel();
		this.dragging = false;
	}.bind(this), false);
};



/**
 * The main function called when a button is pressed
 *
 * @param value string The value of the button pressed
 */
Calculator.prototype.buttonEvent = function(value) {
	switch (value) {
		case '0':
		case '1':
		case '2':
		case '3':
		case '4':
		case '5':
		case '6':
		case '7':
		case '8':
		case '9':
			this.appendDigitToEquation(value);
			break;
		case '+':
		case '*':
		case '-':
		case '/':
			this.appendOperatorToEquation(value);
			break;
		case '.':
			this.appendDecimalToEquation();
			break;
		case '(':
		case ')':
			this.appendBracketToEquation(value);
			break;
		case '=':
			this.equate();
			break;
		case 'b':
			this.backspace();
			break;
		case 'c':
			this.clearAll();
			break;
		case '+-':
			this.invertNumber();
			break;
		case 'h':
			this.openHistoryPanel();
			break;
	}
};



/**
 * Append digit to equation
 *
 * @param digit int The digit to append
 */
Calculator.prototype.appendDigitToEquation = function(digit) {
	var lastInput = this.appstate.last;

	switch (lastInput) {
		case null:
			this.appstate.input = [digit];
			this.appstate.last = digit;
			break;
		case '0':
		case '1':
		case '2':
		case '3':
		case '4':
		case '5':
		case '6':
		case '7':
		case '8':
		case '9':
		case '.':
			if (this.appstate.input.last() === '0') {
				this.appstate.input.replaceLast(digit);
			}
			else {
				this.appstate.input.appendToLast(digit);
			}
			this.appstate.last = digit;
			break;
		case '(':
		case '*':
		case '/':
		case '+':
		case '-':
			this.appstate.input.push(digit);
			this.appstate.last = digit;
			break;
	}

	this.updateDisplay();
};



/**
 * Append decimal to equation
 */
Calculator.prototype.appendDecimalToEquation = function() {
	var lastInput = this.appstate.last;

	switch (lastInput) {
		case null:
			this.appstate.input = ['0.'];
			this.appstate.last = '.';
			break;
		case '0':
		case '1':
		case '2':
		case '3':
		case '4':
		case '5':
		case '6':
		case '7':
		case '8':
		case '9':
			if (this.isValidNum(this.appstate.input.last() + '.')) {
				this.appstate.input.appendToLast('.');
				this.appstate.last = '.';
			}
			break;
		case '(':
		case '*':
		case '/':
		case '+':
		case '-':
			this.appstate.input.push('0.');
			this.appstate.last = '.';
			break;
	}

	this.updateDisplay();
};



/**
 * Append operator to equation
 *
 * @param operator string The value of the operator
 */
Calculator.prototype.appendOperatorToEquation = function(operator) {
	var lastInput = this.appstate.last;

	switch (lastInput) {
		case null:
		case '0':
		case '1':
		case '2':
		case '3':
		case '4':
		case '5':
		case '6':
		case '7':
		case '8':
		case '9':
		case ')':
			this.appstate.input.push(operator);
			this.appstate.last = operator;
			break;
		case '*':
		case '/':
		case '+':
		case '-':
			this.appstate.input.replaceLast(operator);
			this.appstate.last = operator;
			break;
	}

	this.updateDisplay();
};



/**
 * Append bracket to equation
 *
 * @param bracket string Left of right bracker
 */
Calculator.prototype.appendBracketToEquation = function(bracket) {
	var lastInput = this.appstate.last;

	if (bracket === '(') {
		switch (lastInput) {
			case null:
				this.appstate.input = ['('];
				this.appstate.brackets += 1;
				this.appstate.last = '(';
				break;
			case '*':
			case '/':
			case '+':
			case '-':
			case '(':
				this.appstate.input.push('(');
				this.appstate.brackets += 1;
				this.appstate.last = '(';
				break;
			case '0':
			case '1':
			case '2':
			case '3':
			case '4':
			case '5':
			case '6':
			case '7':
			case '8':
			case '9':
				this.appstate.input.splice(this.appstate.input.length - 1, 0, '(');
				this.appstate.brackets += 1;
				break;
		}
	}
	else if (bracket === ')') {
		switch (lastInput) {
			case '(':
				this.backspace();
				break;
			case ')':
			case '0':
			case '1':
			case '2':
			case '3':
			case '4':
			case '5':
			case '6':
			case '7':
			case '8':
			case '9':
				if (this.appstate.brackets > 0) {
					this.appstate.input.push(')');
					this.appstate.brackets -= 1;
					this.appstate.last = ')';
				}
				break;
		}
	}

	this.updateDisplay();
};



/**
 * Invert last number (from positive to negative and vise versa)
 */
Calculator.prototype.invertNumber = function() {
	var num;

	if (/[\d\.]/.test(this.appstate.last)) {
		num = this.appstate.input.last();

		if (num.substr(0, 1) === '-') {
			this.appstate.input.replaceLast(num.substr(1, num.length));
		}
		else if (this.appstate.input[this.appstate.input.length - 2] === '-') {
			this.appstate.input[this.appstate.input.length - 2] = '+';
		}
		else if (this.isValidNum('-' + num)) {
			this.appstate.input.replaceLast('-' + num);
		}

		this.updateDisplay();
	}
};



/**
 * Called when the equals button is pressed
 * Evaluates the current equation string.
 */
Calculator.prototype.equate = function() {
	var result = this.compute();

	if (result !== null) {
		this.addHistoryObj({
			'result': result,
			'equ': this.appstate.input
		});
		this.clearAll(result.toString());
	}
};



/**
 * Remove the last input character
 */
Calculator.prototype.backspace = function() {
	var string;

	if (this.appstate.input.length <= 1 && this.appstate.input.last().length <= 1) {
		this.clearAll();
	}
	else if (this.appstate.last === null) {
		this.clearAll();
	}
	else {
		switch(this.appstate.last) {
			case '0':
			case '1':
			case '2':
			case '3':
			case '4':
			case '5':
			case '6':
			case '7':
			case '8':
			case '9':
			case '.':
				if (this.appstate.input.last().length <= 1) {
					this.appstate.input.pop();
				}
				else {
					string = this.appstate.input.last();
					this.appstate.input.replaceLast(string.slice(0, string.length - 1));
				}
				break;
			case '(':
				this.appstate.brackets -= 1;
				this.appstate.input.pop();
				break;
			case ')':
				this.appstate.brackets += 1;
				this.appstate.input.pop();
				break;
			case '*':
			case '/':
			case '+':
			case '-':
				this.appstate.input.pop();
				break;
		}

		string = this.appstate.input.join('');
		this.appstate.last = string.charAt(string.length - 1);

		this.updateDisplay();
	}
};



/**
 * Called when backspace is long pressed
 */
Calculator.prototype.backspaceLongPress = function() {
	this.clearAll();
	this.flashButton('btn-clear');
};



/**
 * Activate button
 * Show which operator is currently activated on the keyboard.
 *
 * @param id string The DOM node ID to activate
 */
Calculator.prototype.activateButton = function(id) {
	var btn = document.getElementById(id);

	btn.classList.add('keypad-button--active');
};



/**
 * Deactivate button
 *
 * @param btn string The DOM node to deactivate
 */
Calculator.prototype.deactivateButton = function(btn) {
	btn.classList.remove('keypad-button--active');
};



/**
 * Clear the current state of the calculator
 *
 * @param result string The string to update the display with
 */
Calculator.prototype.clearAll = function(result) {
	if (result) {
		this.appstate.input = [result];
	}
	else {
		this.appstate.input = ['0'];
	}

	this.appstate.brackets = 0;
	this.appstate.last = null;

	this.updateDisplay();
};



/**
 * Is the given number a valid number (e.g. -12.34)
 *
 * @param num double The number to test
 * return bool True if valid, else false
 */
Calculator.prototype.isValidNum = function(num) {
	/**
	 * Regex eplainaition:
	 * ^              Match at start of string
	 * \-?            Optional negative
	 * 0|             Zero, or
	 * 0(?!\.)|       Zero if followed by decimal, or
	 * ([1-9]{1}\d*)| Exactly one 1-9 and zero or more digits, or
	 * \.(?!\.)\d*    A decimal only if not followed by another decimal plus zero or more digits
	 * (\.\d*){0,1}   Only one grouping of a decimal and zero or more digits
	 * $              Match end of string
	 */
	if (/^\-?(0|0(?!\.)|([1-9]{1}\d*)|\.(?!\.)\d*)(\.\d*){0,1}$/.test(num)) {
		return true;
	}

	return false;
};



/**
 * Update the calculator display
 */
Calculator.prototype.updateDisplay = function() {
	var result = this.compute(),
		activeBtn = document.querySelector('.keypad-button--active');

	// Update the result
	if (result !== null && !isNaN(result)) {
		if (result > 9E13) {
			this.result.innerHTML = '<span>' + result.toExponential(this.settings.decimals) + '</span>';
		}
		else {
			this.result.innerHTML = '<span>' + this.addCommas(result) + '</span>';
		}
		this.resizeFont();
	}

	// Show active operator
	if (activeBtn) {
		this.deactivateButton(activeBtn);
	}

	switch (this.appstate.last) {
		case '*':
			this.activateButton('btn-multiply');
			break;
		case '/':
			this.activateButton('btn-divide');
			break;
		case '+':
			this.activateButton('btn-add');
			break;
		case '-':
			this.activateButton('btn-subtract');
			break;
	}

	this.updateDisplayEquation();

	this.saveAppState();
};



/**
 * Updates the displays equation string
 * Directly manipulates the DOM.
 *
 * @param equation string The equation string
 */
Calculator.prototype.updateDisplayEquation = function() {
	var ele = document.getElementById('eq'),
		equ = this.appstate.input.slice(),
		width;

	ele.innerHTML = this.replaceOperators(equ);
	width = ele.offsetWidth;

	while (width > this.equation.offsetWidth - 24) {
		equ.splice(0, 1);
		ele.innerHTML = '...' + this.replaceOperators(equ);
		width = ele.offsetWidth;
	}
};



/**
 * Escape operators
 *
 * @param equ array The equation array to replace the operators in
 * return array An updated array with HTML escaped operators
 */
Calculator.prototype.escapeOperators = function(equ) {
	var output = [];

	equ.forEach(function(item) {
		switch(item) {
			case '*':
				output.push('&times;');
				break;
			case '/':
				output.push('&divide;');
				break;
			case '-':
				output.push('&minus;');
				break;
			default:
				output.push(item);
		}
	});

	return output;
}



/**
 * Replace operators with display strings
 *
 * @param equ array The equation array to replace the operators in
 * return string The new display HTML string
 */
Calculator.prototype.replaceOperators = function(equ) {
	var output = '', i;

	for (i = 0; i < equ.length; i += 1) {
		switch(equ[i]) {
			case '*':
				output += '<span class="equation-operator">&times;</span>';
				break;
			case '/':
				output += '<span class="equation-operator">&divide;</span>';
				break;
			case '+':
				output += '<span class="equation-operator">+</span>';
				break;
			case '-':
				output += '<span class="equation-operator">&minus;</span>';
				break;
			case '(':
				output += '<span class="left-bracket">(</span>';
				break;
			case ')':
				output += '<span class="right-bracket">)</span>';
				break;
			default:
				output += equ[i];
		}
	}

	return output;
}



/**
 * Resize the result font to fit within the width of it's container
 * Directly manipulates the DOM.
 */
Calculator.prototype.resizeFont = function() {
	var size = this.settings.fontsize;

	this.result.style.fontSize = size + 'px';

	while (this.result.childNodes[0].offsetWidth > window.innerWidth - 24) {
		size -= 1;
		this.result.style.fontSize = size + 'px';
	}
};



/**
 * Add commas to a number string
 *
 * @param number double The number to add commas to
 * return string The new number string
 */
Calculator.prototype.addCommas = function(number) {
	var parts = number.toString().split('.'),
		regx = /(\d+)(\d{3})/,
		integer = parts[0],
		fraction = '';

	// Add commas to integer part
	while (regx.test(integer)) {
		integer = integer.replace(regx, '$1' + ',' + '$2');
	}

	// Add fractional part
	if (parts.length > 1) {
		fraction = '.' + parts[1];
	}

	return integer + fraction;
};



/**
 * Compute an equation string
 *
 * @param equation string The equation string to compute
 * return double The result of the computation, else null if it cannot be computed
 */
Calculator.prototype.compute = function() {
	var equation = this.appstate.input.join(''),
		result,
		round = Math.pow(10, this.settings.decimals);

	try {
		result = eval(equation);
	}
	catch(err) {
		return null;
	}

	return Math.round(result * round) / round;
};



/**
 * Open history panel
 */
Calculator.prototype.openHistoryPanel = function() {
	this.calculator.classList.add('history--open');
};



/**
 * Open history panel
 */
Calculator.prototype.closeHistoryPanel = function() {
	this.calculator.classList.remove('history--open');
};



/**
 * Append a saved history item to the equation string
 *
 * @param value string The history item string to add to the equation
 */
Calculator.prototype.appendHistoryItemToEquation = function(value) {
	switch(this.appstate.last) {
		case null:
			this.appstate.input = [value];
			this.appstate.last = '1';
			break;
		case '*':
		case '/':
		case '+':
		case '-':
		case '(':
			this.appstate.input.push(value);
			this.appstate.last = '1';
			break;
	}

	this.updateDisplay();
};



/**
 * Add a history object to the history array
 *
 * @param obj object The history object to add
 */
Calculator.prototype.addHistoryObj = function(obj) {
	var last = this.history.first() || {result: null, equ: []},
		currentLen = this.history.length,
		newLen = 0;

	if (this.replaceOperators(obj.equ) !== this.replaceOperators(last.equ)) {
		newLen = this.history.unshift(obj);

		if (newLen > this.settings.history) {
			this.history.splice(this.settings.history, newLen - currentLen);
		}

		this.flashButton('btn-history');
		this.prependToHistoryList(obj);
		this.saveHistory();
	}
};



/**
 * Create history button DOM element
 * Includes <li>, <button> and <span> tags for result and equation display.
 *
 * @param obj object The history item object to add to the display
 * return DOM element The new history button item DOM element
 */
Calculator.prototype.createHistoryElement = function(obj) {
	var li     = document.createElement('li'),
		button = document.createElement('button'),
		span   = document.createElement('span');

	button.value = obj.result;
	button.className = 'history-button';
	button.innerText = this.addCommas(obj.result);

	span.className = 'history-button-equation';
	span.innerHTML = this.escapeOperators(obj.equ).join(' ');

	button.appendChild(span);
	li.appendChild(button);

	return li;
};



/**
 * Adds a history list item to the TOP of the history list in the UI
 *
 * @param obj object The history item to add to the bottom of the list
 */
Calculator.prototype.prependToHistoryList = function(obj) {
	var children = this.historyList.childNodes,
		ele = this.createHistoryElement(obj);

	this.historyList.insertBefore(ele, children[0]);
};



/**
 * Adds a history list item to the BOTTOM of the history list in the UI
 *
 * @param obj object The history item to add to the bottom of the list
 */
Calculator.prototype.appendToHistoryList = function(obj) {
	var ele = this.createHistoryElement(obj);

	this.historyList.appendChild(ele);
};



/**
 * Save the calculator history into local storage
 */
Calculator.prototype.saveHistory = function() {
	var json;

	json = JSON.stringify(this.history);
	localStorage.setItem('history', json);
};



/**
 * Load the calculator history from local storage and create the initial history
 * DOM list.
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
		this.appendToHistoryList(this.history[i]);
	}
};



/**
 * Clear the entire history
 */
Calculator.prototype.clearHistory = function() {
	this.historyList.innerHTML = '';
	this.history = [];
	this.saveHistory();
};



/**
 * Flash button
 *
 * @param id string The DOM node to flash
 */
Calculator.prototype.flashButton = function(id) {
	var btn = document.getElementById(id);

	btn.classList.add('flash');

	setTimeout(function() {
		btn.classList.remove('flash');
	}, 200);
};



/**
 * Add Timer
 *
 * @param callback function The function to call on timeout
 */
Calculator.prototype.addTimer = function(callback) {
	this.timer.timer = setTimeout(callback, this.timer.timerlen);
};



/**
 * Remove Timer
 */
Calculator.prototype.removeTimer = function() {
	clearTimeout(this.timer.timer);
};



// Is app installed?
if (('standalone' in window.navigator) && !window.navigator.standalone) {
	var calculator = new Calculator();
}
else {
	document.body.setAttribute('class', 'install');
}
