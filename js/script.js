// Copyright 2013 Phil Buchanan
//
// A calculator iOS web application that supports
// brackets and saved history.
// 
// @version 0.1

document.ontouchstart = function(e) {
	'use strict';
	e.preventDefault();
};

(function() {
	'use strict';
	
	var settings = {
		decimals: 4,
		history: 7,
		timerlen: 750,
		timer: null,
		fontsize: 46
	},
	
	// App Object
	//
	// Handle all the core application functions
	// including app state saving and retrieval and
	// event handling functions.
	
	app = {
	
		appstate: {
			input: 0,
			brackets: 0,
			last: null
		},
		
		restoreAppState: function() {
		
			this.loadAppState();
			display.update();
			history.load();
		
		},
		
		saveAppState: function() {
		
			var json = JSON.stringify(this.appstate);
			localStorage.setItem('appState', json);
		
		},
		
		loadAppState: function() {
		
			var savedAppState, json;
			
			if (localStorage.getItem('appState')) {
			
				json = localStorage.getItem('appState');
				savedAppState = JSON.parse(json);
				
				this.appstate.input = savedAppState.input;
				this.appstate.start = savedAppState.start;
				this.appstate.brackets = savedAppState.brackets;
			
			}
		
		},
		
		buttonPress: function(value) {
		
			var last = this.appstate.last;
			
			
			
			if (last === null) {
			
				if (/[\d(]/.test(value)) {
					if (value === '(') {
						this.appstate.brackets += 1;
					}
					this.append(value, true);
				}
				else {
					if (value !== ')') {
						this.append(value);
					}
				}
			
			}
			else {
			
				if (/\d/.test(value)) {
				
					if (/[\d.(+*\-\/]/.test(last)) {
						this.append(value);
					}
				
				}
				else if (/[+*\-\/]/.test(value)) {
				
					if (/[\d)]/.test(last)) {
						this.append(value);
					}
					else if (/[+*\-\/]/.test(last)) {
						this.backspace();
						this.append(value);
					}
				
				}
				else if (value === '.') {
				
					if (/[\d(+*\-\/]/.test(last)) {
						this.append(value);
					}
				
				}
				else if (value === '(') {
				
					if (/[(+*\-\/]/.test(last)) {
						this.append(value);
						this.appstate.brackets += 1;
					}
				
				}
				else if (value === ')') {
				
					if (last === '(') {
						this.backspace();
					}
					else if (/\d/.test(last) && this.appstate.brackets > 0) {
						this.append(value);
						this.appstate.brackets -= 1;
					}
				
				}
			
			}
		
		},
		
		append: function(value, clear) {
		
			if (clear) {
				this.appstate.input = value;
			}
			else {
				this.appstate.input += value;	
			}
			this.appstate.last = value;
			
			display.update();
		
		},
		
		invert: function() {
		
			var arr = this.appstate.input.split('').reverse(),
				i = 0;
			
			while (/[\d.]/.test(arr[i])) {
				i += 1;
			}
			
			if (/[+*\/]/.test(arr[i + 1])) {
				arr.splice(i, 1);
			}
			else if (arr[i] === '-') {}
			else if (i === arr.length - 1) {
				arr.splice(i, 1);
			}
			else {
				arr.splice(i, 0, '-');
			}
			this.appstate.input = arr.reverse().join('');
			
			display.update();
		
		},
		
		equals: function() {
		
			var result = calc.compute(this.appstate.input);
			
			if (result !== null) {
				history.addItem(result);
				this.clear(result);
			}
		
		},
		
		backspace: function() {
		
			var input = this.appstate.input,
				last = this.appstate.last,
				_this = this;
			
			settings.timer = setTimeout(function() {_this.clear();}, settings.timerlen);
			
			if (last === '(') {
				this.appstate.brackets -= 1;
			}
			else if (last === ')') {
				this.appstate.brackets += 1;
			}
			
			if (input.length > 1 && last !== null) {
				this.appstate.input = input.slice(0, input.length - 1);
				this.appstate.last = input.charAt(input.length - 2);
				display.update();
			}
			else {
				this.clear();
			}
		
		},
		
		removeTimer: function() {
		
			clearTimeout(settings.timer);
		
		},
		
		clear: function(result) {
		
			if (result) {
				this.appstate.input = result;
			}
			else {
				this.appstate.input = 0;
			}
			this.appstate.brackets = 0;
			this.appstate.last = null;
			
			display.update();
		
		}
	
	},
	
	
	
	// Calculate
	//
	// Functions for calculating the result based on
	// the input string.
	
	calc = {
	
		compute: function(string) {
		
			var result,
				round = Math.pow(10, settings.decimals);
			
			try {
				result = eval(string);
			}
			catch(err) {
				return null;
			}
			
			return Math.round(result * round) / round;
		
		}
	
	},
	
	
	
	// Display Object
	//
	// Handles all app display functions including
	// output display, equation display and text
	// rendering.
	
	display = {
	
		result: document.getElementById('result'),
		equation: document.getElementById('equation'),
		
		update: function() {
		
			var eq = app.appstate.input.toString(),
				result = calc.compute(eq);
			
			if (result !== null && !isNaN(result)) {
				if (result > 9E13) {
					this.result.innerHTML = '<span>' + result.toExponential(settings.decimals) + '</span>';
				}
				else {
					this.result.innerHTML = '<span>' + this.addCommas(result) + '<span>';
				}
				this.resizeFont();
			}
			
			eq = eq.replace(/\//g, '<span>&divide;</span>');
			eq = eq.replace(/\*/g, '<span>&times;</span>');
			eq = eq.replace(/\+/g, '<span>+</span>');
			eq = eq.replace(/\-/g, '<span>-</span>');
			eq = eq.replace(/\(/g, '<span class="left-bracket">(</span>');
			eq = eq.replace(/\)/g, '<span class="right-bracket">)</span>');
			
			this.equation.innerHTML = eq;
			
			app.saveAppState();
		
		},
		
		resizeFont: function() {
		
			var size, displayWidth, textWidth;
			
			result.style.fontSize = settings.fontsize + 'px';
			size = settings.fontsize;
			displayWidth = parseInt(result.style.width, 10);
			textWidth = result.childNodes[0].offsetWidth;
			
			while (textWidth > displayWidth) {
				size -= 1;
				result.style.fontSize = size + 'px';
				textWidth = result.childNodes[0].offsetWidth;
				if (size === 10) {break;}
			}
		
		},
		
		addCommas: function(number) {
		
			var x, x1, x2, rgx;
			
			number += '';
			x = number.split('.');
			x1 = x[0];
			x2 = x.length > 1 ? '.' + x[1] : '';
			rgx = /(\d+)(\d{3})/;
			
			while (rgx.test(x1)) {
				x1 = x1.replace(rgx, '$1' + ',' + '$2');
			}
			
			return x1 + x2;
		
		}
	
	},
	
	
	
	// History Object
	//
	// Handles all history related items.
	
	history = {
	
		history: [],
		
		addItem: function(value) {
		
			var i = this.history.length,
				list = document.getElementById('list'),
				ele;
			
			while (this.history.length >= settings.history) {
				this.history.shift();
				i -= 1; // The last element in the list is the helper text
				ele = list.childNodes[i];
				ele.parentNode.removeChild(ele);
			}
			this.history.push(value);
			
			this.appendItem(value);
			this.save();
		
		},
		
		appendItem: function(value) {
		
			var li,
				button,
				list = document.getElementById('list'),
				children = list.childNodes,
				_this = this;
			
			document.getElementById('history-help').style.display = 'none';
			
			li = document.createElement('li');
			button = document.createElement('button');
			button.value = value;
			button.innerText = value;
			button.onclick = function() {_this.append(this.value)};
			button.ontouchstart = function() {_this.append(this.value)};
			li.appendChild(button);
			
			list.insertBefore(li, children[0]);
		
		},
		
		append: function(value) {
		
			if (app.appstate.last === null) {
				app.appstate.input = value;
			}
			else if (/[(+*\-\/]/.test(app.appstate.last)) {
				app.appstate.input += value;
				app.appstate.last = 1;
			}
			
			this.hideList();
			display.update();
			app.saveAppState();
		
		},
		
		showList: function() {
		
			document.getElementById('history').className = 'active';
		
		},
		
		hideList: function() {
		
			document.getElementById('history').className = '';
		
		},
		
		save: function() {
		
			var json;
			
			json = JSON.stringify(this.history);
			localStorage.setItem('history', json);
		
		},
		
		load: function() {
		
			var json = localStorage.getItem('history'),
				i;
			
			if (json !== null && json !== '') {this.history = JSON.parse(json);}
			else {this.history = [];}
			
			for (i = 0; i < this.history.length; i += 1) {
				this.appendItem(this.history[i]);
			}
		
		}
	
	},
	
	
	
	// Set up the button handlers
	buttons = document.getElementById('keypad').childNodes,
	buttonModeStart = 'mousedown',
	buttonModeEnd = 'mouseup',
	i;
	
	if (('standalone' in window.navigator) && window.navigator.standalone) {
		buttonModeStart = 'touchstart';
		buttonModeEnd = 'touchend';
	}
	
	for (i = 0; i < buttons.length; i += 1) {
		buttons[i].addEventListener(
			buttonModeStart,
			function() {
				if (this.value === '=') {
					app.equals();
				}
				else if (this.value === 'b') {
					app.backspace();
				}
				else if (this.value === 'c') {
					app.clear();
				}
				else if (this.value === '+-') {
					app.invert();
				}
				else if (this.value === 'h') {
					history.showList();
				}
				else {
					app.buttonPress(this.value);
				}
			}.bind(buttons[i]),
			false
		);
	}
	
	document.getElementById('bs').addEventListener(
		buttonModeEnd,
		app.removeTimer,
		false
	);
	
	document.getElementById('history-close').addEventListener(
		buttonModeStart,
		history.hideList,
		false
	);
	
	// Restore app state
	app.restoreAppState();

}());