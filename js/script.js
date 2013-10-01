// Copyright 2013 Phil Buchanan
//
// A calculator iOS web application that supports
// brackets and saved history.
// 
// @version 1.3.0

(function() {
	'use strict';
	
	var settings = {
	
		devmode: false,
		version: '1.3.0',
		history: 7,
		timerlen: 750,
		timer: null,
		fontsize: 46,
		url: 'http://ioscalc.com',
		
		user: {
			decimals: 2
		},
		
		saveUserSettings: function() {
		
			var json = JSON.stringify(this.user);
			localStorage.setItem('userSettings', json);
		
		},
		
		loadUserSettings: function() {
		
			var json;
			
			if (localStorage.getItem('userSettings')) {
			
				json = localStorage.getItem('userSettings');
				this.user = JSON.parse(json);
			
			}
		
		},
		
		set: function(setting, value) {
		
			settings.user[setting] = value;
			settings.saveUserSettings();
			display.update();
		
		},
		
		// Version check. Is a less than than b?
		ltVersion: function(a, b) {
		
			var i;
			
			a = a.split('.');
			b = b.split('.');
			
			for (i = 0; i < a.length; i += 1) {
				if (b.length === i) {
					return false;
				}
				
				if (a[i] === b[i]) {
					continue;
				}
				else if (a[i] > b[i]) {
					return false;
				}
				else {
					return true;
				}
			}
			
			if (a.length !== b.length) {
				return true;
			}
		
			return false;
		
		}
	
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
			last: null,
			landscape: false
		},
		
		restoreAppState: function() {
		
			//settings.loadUserSettings();
			this.loadAppState();
			settings.loadUserSettings();
			this.init();
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
		
		init: function() {
		
			if (typeof settings.user.version === 'undefined') {
				settings.user.version = '0.0.1';
			}
			
			// Reset history for version 1.3.0
			if (settings.ltVersion(settings.user.version, '1.3.0')) {
				history.clear();
			}
			
			settings.user.version = settings.version;
			settings.saveUserSettings();
		
		},
		
		buttonPress: function(value) {
		
			var digit = this.appstate.last,
				number = this.lastNum();
			
			if (digit === null) {
			
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
				
					if (/[\d.(+*\-\/]/.test(digit)) {
						if (digit === '0' && number.length === 1) {
							this.append(value, true);
						}
						else if (this.isValidNum(number + value)) {
							this.append(value);
						}
					}
				
				}
				// Operators
				else if (/[+*\-\/]/.test(value)) {
				
					if (/[\d)]/.test(digit)) {
						this.append(value);
					}
					else if (/[+*\-\/]/.test(digit)) {
						this.backspace();
						this.append(value);
					}
				
				}
				// Decimal
				else if (value === '.') {
				
					if (/[\d(+*\-\/]/.test(digit)) {
						if (this.isValidNum(number + value)) {
							this.append(value);
						}
					}
				
				}
				// Open bracket
				else if (value === '(') {
				
					if (digit === '0' && number.length === 1) {
						this.append(value, true);
					}
					else if (/[(+*\-\/]/.test(digit)) {
						this.append(value);
						this.appstate.brackets += 1;
					}
				
				}
				// Close bracket
				else if (value === ')') {
				
					if (digit === '(') {
						this.backspace();
					}
					else if (/\d/.test(digit) && this.appstate.brackets > 0) {
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
		
			var result = calc.compute(this.appstate.input),
				historyItem = {};
			
			if (result !== null) {
				historyItem.result = result;
				historyItem.equ = this.appstate.input;
				history.addItem(historyItem);
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
				round = Math.pow(10, settings.user.decimals);
			
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
					this.result.innerHTML = '<span>' + result.toExponential(settings.user.decimals) + '</span>';
				}
				else {
					this.result.innerHTML = '<span>' + this.addCommas(result) + '<span>';
				}
				this.resizeFont();
			}
			
			if (app.appstate.landscape) {
				if (eq.length >= 31) {
					eq = '...' + eq.substr(eq.length - 30, 30);
				}
			}
			else {
				if (eq.length >= 19) {
					eq = '...' + eq.substr(eq.length - 18, 18);
				}
			}
			
			eq = this.replaceOperators(eq);
			
			this.equation.innerHTML = eq;
			
			app.saveAppState();
		
		},
		
		replaceOperators: function(str) {
		
			str = str.replace(/\//g, '<span>&divide;</span>');
			str = str.replace(/\*/g, '<span>&times;</span>');
			str = str.replace(/\+/g, '<span>+</span>');
			str = str.replace(/\-/g, '<span>-</span>');
			str = str.replace(/\(/g, '<span class="left-bracket">(</span>');
			str = str.replace(/\)/g, '<span class="right-bracket">)</span>');
			
			return str;
		
		},
		
		resizeFont: function() {
		
			var size, displayWidth, textWidth;
			
			size = settings.fontsize;
			this.result.style.fontSize = size + 'px';
			displayWidth = window.innerWidth - 24;
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
		
		addItem: function(historyItem) {
		
			var i = this.history.length - 1,
				list = document.getElementById('list'),
				ele;
			
			if (typeof this.history[i] !== 'object' ||
				historyItem.result !== this.history[i].result) {
			
				while (this.history.length >= settings.history) {
					this.history.shift();
					ele = list.childNodes[i];
					ele.parentNode.removeChild(ele);
					i -= 1;
				}
				this.history.push(historyItem);
				
				this.flashBtn();
				this.appendItem(historyItem);
				this.save();
			
			}
		
		},
		
		appendItem: function(historyItem) {
		
			var li,
				button,
				span,
				list = document.getElementById('list'),
				children = list.childNodes,
				_this = this;
			
			document.getElementById('history-help').style.display = 'none';
			
			li = document.createElement('li');
			button = document.createElement('button');
			button.value = historyItem.result;
			button.innerText = display.addCommas(historyItem.result);
			span = document.createElement('span');
			span.className = 'equ';
			span.innerHTML = display.replaceOperators(historyItem.equ);
			button.appendChild(span);
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
			}
			app.appstate.last = value.charAt(value.length - 1);
			
			setTimeout(this.close, 150);
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
						app.appstate.landscape = false;
						body.setAttribute('class', '');
						break;
					case 90:
					case -90:
						app.appstate.landscape = true;
						body.setAttribute('class', 'landscape');
						break;
				}
				
				display.update();
			
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
	
	
	
	// Is app installed?
	if ((('standalone' in window.navigator) && window.navigator.standalone) || settings.devmode) {
	
		document.ontouchstart = function(e) {
			e.preventDefault();
		};
		
		// Initialize app
		// Add event handlers
		events.addEventHandlers();
		
		// Restore app state
		app.restoreAppState();
	
	}
	else {
		document.body.setAttribute('class', 'install');
	}

}());