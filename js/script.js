// Copyright 2013 Phil Buchanan
//
// A calculator iOS web application that supports
// brackets and saved history.
// 
// @version 1.0

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
				this.appstate.last = savedAppState.last;
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
			
				// Digits
				if (/\d/.test(value)) {
				
					if (/[\d.(+*\-\/]/.test(last)) {
						if (this.isValidNum(this.lastNum() + value)) {
							this.append(value);
						}
					}
				
				}
				// Operators
				else if (/[+*\-\/]/.test(value)) {
				
					if (/[\d)]/.test(last)) {
						this.append(value);
					}
					else if (/[+*\-\/]/.test(last)) {
						this.backspace();
						this.append(value);
					}
				
				}
				// Decimal
				else if (value === '.') {
				
					if (/[\d(+*\-\/]/.test(last)) {
						if (this.isValidNum(this.lastNum() + value)) {
							this.append(value);
						}
					}
				
				}
				// Open bracket
				else if (value === '(') {
				
					if (/[(+*\-\/]/.test(last)) {
						this.append(value);
						this.appstate.brackets += 1;
					}
				
				}
				// Close bracket
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
		
			var str = this.appstate.input,
				lastNum = this.lastNum(),
				len,
				before;
			
			if (lastNum) {
			
				len = lastNum.length;
				before = str.charAt(str.length - len - 1);
				
				if (/[+*\-\/()]/.test(before) || before === '') {
				
					if (lastNum[0] === '-') {
						lastNum = lastNum.substr(1, len);
					}
					else {
						lastNum = '-' + lastNum;
					}
				
				}
				
				this.appstate.input = str.substr(0, str.length - len) + lastNum;
				
				display.update();
			
			}
		
		},
		
		equals: function() {
		
			var result = calc.compute(this.appstate.input);
			
			if (result !== null) {
				history.addItem(result);
				this.clear(result.toString());
			}
		
		},
		
		backspace: function() {
		
			var input = this.appstate.input,
				last = this.appstate.last;
			
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
		
		addTimer: function(callback) {
		
			settings.timer = setTimeout(function() {callback();}, settings.timerlen);
		
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
		
		},
		
		// Returns true if the number is valid (eg. -42.63)
		isValidNum: function(num) {
		
			if (num[0] === '-') {
				num = num.substr(1, num.length);
			}
			
			if (num[0] === '0') {
			
				if (/^0{2,}/.test(num) ||    // test multiple leading 0s
					!/^0(?=\.)/.test(num)) { // ensure leading 0 is followed by a decimal point
						return false;
				}
			
			}
			if (!/^\d*\.?\d*$/.test(num)) { // ensure only one decimal point
				return false;
			}
			
			return true;
		
		},
		
		// Parses the last full number from the input string (eg. -42.63)
		lastNum: function() {
		
			var str = this.appstate.input,
				arr;
			
			if (str.length > 0) {
			
				arr = str.match(/-?\d*\.?\d*$/);
				
				if (arr !== null) {
					return arr[0];
				}
			
			}
			
			return false;
		
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
			
			if (eq.length >= 19) {
				eq = '...' + eq.substr(eq.length - 18, 18);
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
			
			size = settings.fontsize;
			this.result.style.fontSize = size + 'px';
			displayWidth = parseInt(this.result.style.width, 10);
			textWidth = this.result.childNodes[0].offsetWidth;
			
			while (textWidth > displayWidth) {
				size -= 1;
				this.result.style.fontSize = size + 'px';
				textWidth = this.result.childNodes[0].offsetWidth;
				if (size === 10) {break;}
			}
		
		},
		
		addCommas: function(number) {
		
			var parts, x, y, regx;
			
			parts = number.toString().split('.');
			x = parts[0];
			if (parts.length > 1) {
				y = '.' + parts[1];
			}
			else {
				y = '';
			}
			regx = /(\d+)(\d{3})/;
			
			while (regx.test(x)) {
				x = x.replace(regx, '$1' + ',' + '$2');
			}
			
			return x + y;
		
		}
	
	},
	
	
	
	// History Object
	//
	// Handles all history related items.
	
	history = {
	
		history: [],
		
		addItem: function(value) {
		
			var i = this.history.length - 1,
				list = document.getElementById('list'),
				ele;
			
			if (value !== this.history[this.history.length - 1]) {
			
				while (this.history.length >= settings.history) {
					this.history.shift();
					ele = list.childNodes[i];
					ele.parentNode.removeChild(ele);
					i -= 1;
				}
				this.history.push(value);
				
				this.flashBtn();
				this.appendItem(value);
				this.save();
			
			}
		
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
			button.onclick = function() {_this.append(this.value);};
			button.ontouchstart = function() {_this.append(this.value);};
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
			
			this.close();
			display.update();
			app.saveAppState();
		
		},
		
		flashBtn: function() {
		
			var btn = document.getElementById('his'),
				str = btn.className;
			
			btn.className = str + ' flash';
			setTimeout(function() {btn.className = str;}, 200);
		
		},
		
		open: function() {
		
			document.getElementById('history').className = 'active';
		
		},
		
		close: function() {
		
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
		
		},
		
		clear: function() {
		
			var list = document.getElementById('list');
			
			while (list.hasChildNodes()) {
				list.removeChild(list.lastChild);
			}
			
			document.getElementById('history-help').style.display = 'block';
			
			this.history = [];
			this.save();
			this.close();
		
		}
	
	},
	
	
	
	events = {
	
		buttons: document.getElementById('keypad').childNodes,
		buttonModeStart: 'mousedown',
		buttonModeEnd: 'mouseup',
		
		addEventHandlers: function() {
		
			var i;
			
			if (('standalone' in window.navigator) && window.navigator.standalone) {
				this.buttonModeStart = 'touchstart';
				this.buttonModeEnd = 'touchend';
			}
			
			for (i = 0; i < this.buttons.length; i += 1) {
				this.buttons[i].addEventListener(
					this.buttonModeStart,
					this.buttonEvent.bind(this.buttons[i]),
					false
				);
			}
			
			document.getElementById('bs').addEventListener(
				this.buttonModeEnd,
				app.removeTimer,
				false
			);
			
			document.getElementById('history-close').addEventListener(
				this.buttonModeStart,
				function() {
					app.addTimer(history.clear.bind(history));
				},
				false
			);
			
			document.getElementById('history-close').addEventListener(
				this.buttonModeEnd,
				function() {
					app.removeTimer();
					history.close();
				},
				false
			);
			
			// Orientation changes
			window.onorientationchange = function() {
			
				var body = document.body;
				
				switch(window.orientation) {
					case 0:
						body.setAttribute('class', '');
						break;
					case 90:
					case -90:
						body.setAttribute('class', 'landscape');
						break;
				}
			
			};
		
		},
		
		buttonEvent: function() {
		
			if (this.value === '=') {
				app.equals();
			}
			else if (this.value === 'b') {
				app.addTimer(app.clear.bind(app));
				app.backspace();
			}
			else if (this.value === 'c') {
				app.clear();
			}
			else if (this.value === '+-') {
				app.invert();
			}
			else if (this.value === 'h') {
				history.open();
			}
			else {
				app.buttonPress(this.value);
			}
		
		}
		
	};
	
	
	
	// Initialize app
	// Add event handlers
	events.addEventHandlers();
	
	// Restore app state
	app.restoreAppState();

}());