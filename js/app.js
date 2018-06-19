/**
 * Copyright 2013-2018 Phil Buchanan
 *
 * A calculator iOS web application that supports brackets, backspace and saved
 * calculation history. The app uses HTML5 app caching so it will work offline.
 *
 * Created using Vue.js v2.5.16.
 *
 * @version 4.0
 */



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
 * Filter: Add commas to a number string
 *
 * @param number double The number to add commas to
 * return string The new number string
 */
Vue.filter('addCommas', function(number) {
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
});



/**
 * Filter: Equation display
 */
Vue.filter('equation', function(equ) {
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
				output += this.addCommas(equ[i]);
		}
	}

	return output;
});



var HistoryComponent = {
	template: '#history-component',
	data: function() {
		return {
			dragging: false
		}
	},
	props: {
		history: {
			type: Array,
			required: true
		}
	},
	methods: {
		/**
		 * Emit an event with the result from a history item so it can be added
		 * to the current equation.
		 */
		emitHistoryValue: function(value) {
			if (!this.dragging) {
				this.$emit('append-history-value', value);
			}
		},



		/**
		 * If user is dragging
		 */
		setDragging: function(value) {
			this.dragging = value;
		}
	}
};



/**
 * App Vue
 *
 * The main calculator application view.
 */
var app = new Vue({
	el: '#app',
	components: {
		'history': HistoryComponent,
	},
	data: function() {
		return {
			settings: {
				decimals: 2,
				historySaveItems: 50
			},
			resultCache: 0,
			input: [],
			last: null,
			activeOperator: null,
			brackets: 0,
			historyIsOpen: false,
			history: []
		}
	},
	created: function() {
		this.restoreAppState();
		this.restoreHistoryState();
	},
	updated: function() {
		this.saveAppState();
	},
	computed: {
		/**
		 * Is the app installed on an iPhone home screen?
		 */
		isInstalled: function() {
			return true
			//return (window.navigator.hasOwnProperty('standalone') && window.navigator.standalone);
		},



		/**
		 * Display the result
		 */
		result: function() {
			var result = this.compute();

			if (isNaN(result)) {
				return 0;
			}
			else if (result !== null) {
				this.resultCache = result;

				return result;
			}

			return this.resultCache;
		},



		/**
		 * Display the equation
		 */
		equation: function() {
			if (this.input.length) {
				return this.input.join('');
			}

			return 0;
		},



		/**
		 * Adjust the font size of the display
		 */
		resultFontSize: function() {
			var resultString = this.result.toString();
			var size = 60;

			if (resultString.length > 18) {
				size = 25;
			}
			else if (resultString.length > 16) {
				size = 28;
			}
			else if (resultString.length > 15) {
				size = 30;
			}
			else if (resultString.length > 13) {
				size = 35;
			}
			else if (resultString.length > 11) {
				size = 40;
			}
			else if (resultString.length > 9) {
				size = 50;
			}

			return size;
		},



		/**
		 * Which operator is active
		 */
		isAddActive: function() {
			return this.activeOperator == '+';
		},
		isSubtractActive: function() {
			return this.activeOperator == '-';
		},
		isMultiplyActive: function() {
			return this.activeOperator == '*';
		},
		isDivideActive: function() {
			return this.activeOperator == '/';
		},



		/**
		 * Helper function to get the index of the last item in the input array
		 */
		lastInputIndex: function() {
			return this.input.length - 1
		}
	},
	methods: {
		/**
		 * Retrieve and restore the application state from local storage
		 */
		restoreAppState: function() {
			var appSave = localStorage.getItem('appState');
			var data;

			// Restore app state
			if (appSave !== null && appSave !== '') {
				data = JSON.parse(appSave);

				this.input          = data.input;
				this.last           = data.last;
				this.activeOperator = data.activeOperator;
				this.brackets       = data.brackets;
			}
		},



		/**
		 * Save the application state to local storage
		 */
		saveAppState: function() {
			var appState = {
				input:          this.input,
				last:           this.last,
				brackets:       this.brackets,
				activeOperator: this.activeOperator
			};

			localStorage.setItem('appState', JSON.stringify(appState));
		},



		/**
		 * Retrieve and restore the history state from local storage
		 */
		restoreHistoryState: function() {
			var history = localStorage.getItem('history');

			// Restore history array
			if (history !== null && history !== '') {
				this.history = JSON.parse(history);
			}
		},



		/**
		 * Save the history state to local storage
		 */
		saveHistoryState: function() {
			localStorage.setItem('history', JSON.stringify(this.history));
		},



		/**
		 * Compute the result based on the input stack
		 */
		compute: function() {
			var equation = this.input.join(''),
				result,
				round = Math.pow(10, this.settings.decimals);

			try {
				result = eval(equation);
			}
			catch(err) {
				return null;
			}

			return Math.round(result * round) / round;
		},



		/**
		 * Is the given number a valid number (e.g. -12.34)
		 *
		 * @param num double The number to test
		 * return bool True if valid, else false
		 */
		isValidNum: function(num) {
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
			return /^\-?(0|0(?!\.)|([1-9]{1}\d*)|\.(?!\.)\d*)(\.\d*){0,1}$/.test(num);
		},



		/**
		 * Update a number in the input stack
		 *
		 * @param num The number to update
		 */
		updateNumber: function(num) {
			// Only update if the new number is valid
			if (this.isValidNum(num)) {
				Vue.set(this.input, this.lastInputIndex, num.toString());
			}
		},



		/**
		 * Set the last input character
		 */
		setLast: function(inputChar) {
			switch(inputChar) {
				case 0:
				case 1:
				case 2:
				case 3:
				case 4:
				case 5:
				case 6:
				case 7:
				case 8:
				case 9:
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
					this.last = 'digit';
					break;
				case '.':
					this.last = 'decimal';
					break;
				case '+':
				case '-':
				case '*':
				case '/':
					this.last = 'operator';
					break;
				case '(':
					this.last = '(';
					break;
				case ')':
					this.last = ')';
					break;
				default:
					this.last = null;
			}

			if (this.last == 'operator') {
				this.activeOperator = inputChar;
			}
			else {
				this.activeOperator = null;
			}
		},



		/**
		 * Append digit to equation
		 *
		 * @param digit int The digit to append
		 */
		appendDigit: function(digit) {
			switch(this.last) {
				case null:
					this.input = [digit.toString()];
					this.setLast(digit);
					break;
				case 'digit':
				case 'decimal':
					// Uses `==` instead of `===` on purpose
					if (this.input[this.lastInputIndex] == '0') {
						this.updateNumber(digit);
					}
					else {
						this.updateNumber(this.input[this.lastInputIndex] + digit);
					}

					this.setLast(digit);
					break;
				case 'operator':
				case '(':
					this.input.push(digit.toString());
					this.setLast(digit);
					break;
			}
		},



		/**
		 * Append a decimal to the current number
		 */
		appendDecimal: function() {
			switch(this.last) {
				case 'digit':
					this.updateNumber(this.input[this.lastInputIndex] + '.');
					this.setLast('.');
					break;
				case 'operator':
				case '(':
					this.input.push('0.');
					this.setLast('.');
					break;
				case null:
					this.updateNumber('0.');
					this.setLast('.');
			}
		},



		/**
		 * Append operator to equation
		 *
		 * @param operator string The value of the operator
		 */
		appendOperator: function(operator) {
			switch(this.last) {
				case 'operator':
					this.input.pop();
					this.input.push(operator);
					this.setLast(operator);
					break;
				case 'digit':
				case ')':
				case null:
					this.input.push(operator);
					this.setLast(operator);
					break;
			}
		},



		/**
		 * Append opening bracket to equation
		 */
		appendOpenBracket: function() {
			switch(this.last) {
				case null:
					this.input.pop();
					// Let this flow through
				case 'operator':
				case '(':
					this.input.push('(');
					this.brackets += 1;
					this.setLast('(');
					break;
				case 'digit':
					// Append the `(` to the beginning of the current number
					this.input.splice(this.lastInputIndex, 0, '(');
					this.brackets += 1;
					break;
			}
		},



		/**
		 * Append close bracket to equation
		 */
		appendCloseBracket: function() {
			switch(this.last) {
				case 'digit':
				case ')':
					if (this.brackets > 0) {
						this.input.push(')');
						this.brackets -= 1;
						this.setLast(')');
					}
					break;
				case '(':
					this.backspace();
					break;
			}
		},



		/**
		 * Invert last number (from positive to negative and vise versa)
		 */
		invertNumber: function() {
			// If the input is only a zero, don't let users invert a number
			if (this.input.length === 1 && this.input[0] == '0') {
				return;
			}

			// If the number is prefixed with `-`
			if (/^-/.test(this.input[this.lastInputIndex])) {
				// Remove `-`
				this.updateNumber(this.input[this.lastInputIndex].slice(1));
			}
			else {
				if (this.input[this.lastInputIndex - 1] === '-') {
					// Switch previous operator to `+`
					Vue.set(this.input, this.lastInputIndex - 1, '+');
				}
				else if (this.input[this.lastInputIndex - 1] === '+') {
					// Switch previous operator to `-`
					Vue.set(this.input, this.lastInputIndex - 1, '-');
				}
				else {
					// Add `-` prefix to number
					this.updateNumber('-' + this.input[this.lastInputIndex]);
				}
			}
		},



		/**
		 * Called when the equals button is pressed
		 * Evaluates the current equation string.
		 */
		equate: function() {
			var result = this.compute();

			if (result !== null) {
				this.saveHistoryObject({
					result: result,
					equ: this.input
				});

				this.clearAll(result);
			}
		},



		/**
		 * Append a history item only if it isn't the last history item
		 */
		saveHistoryObject: function(obj) {
			var last = this.history[0] || {result: null, equ: []},
				currentLen = this.history.length,
				newLen = 0;

			// If the equations are not exactly the same
			if (obj.equ.join('') !== last.equ.join('')) {
				newLen = this.history.unshift(obj);

				if (newLen > this.settings.historySaveItems) {
					this.history.splice(this.settings.historySaveItems, newLen - currentLen);
				}

				this.saveHistoryState();
			}
		},



		/**
		 * Remove the last user input character
		 */
		backspace: function() {
			var equ;

			if (this.input.length === 1) {
				// Equation stack has only one item in it

				if (!this.last || this.input[0].length === 1) {
					// Nothing set for last input character OR the first item in the equation stack is only one character
					this.clearAll(null);
				}
				else {
					// If the current input item is longer than 1 character, it must be a number

					// If this is a negative, single digit number (e.g. `-6`), clear everything
					if (this.input[0].length === 2 && /^-/.test(this.input[0])) {
						this.clearAll(null);
					}
					else {
						this.updateNumber(this.input[0].substring(0, this.input[0].length - 1));
					}

					// Set the last input
					equ = this.input.join('');

					this.setLast(equ.charAt(equ.length - 1));
				}
			}
			else {
				// Equation stack has more than one item in it
				switch(this.last) {
					case 'digit':
					case 'decimal':
						var lastInputItem = this.input[this.lastInputIndex];

						if (lastInputItem.length > 1) {
							// If this is a negative, single digit number (e.g. `-6`), remove this item from input stack
							if (lastInputItem.length === 2 && /^-/.test(lastInputItem)) {
								this.input.pop();
							}
							else {
								this.updateNumber(lastInputItem.substring(0, lastInputItem.length - 1));
							}
						}
						else {
							this.input.pop();
						}
						break;
					case '(':
						this.brackets -= 1;
						this.input.pop();
						break;
					case ')':
						this.brackets += 1;
						this.input.pop();
						break;
					case 'operator':
						this.input.pop();
						break;
				}

				equ = this.input.join('');

				this.setLast(equ.charAt(equ.length - 1));
			}
		},



		/**
		 * Clear all input and reset the calcualtor
		 */
		clearAll: function(result) {
			if (result) {
				this.input = [result.toString()];
			}
			else {
				this.input = ['0'];
			}

			this.brackets = 0;
			this.setLast(null);
		},



		/**
		 * Show history
		 */
		openHistory: function() {
			this.historyIsOpen = true;
		},



		/**
		 * Hide history
		 */
		closeHistory: function() {
			this.historyIsOpen = false;
		},



		/**
		 * Append the result from a history item to the current equation
		 */
		appendHistoryValueToEquation: function(value) {
			var valueString = value.toString();

			switch(this.last) {
				case null:
					this.input = [valueString];
					this.setLast(valueString.charAt(valueString.length - 1));
					break;
				case 'operator':
				case '(':
					this.input.push(valueString);
					this.setLast(valueString.charAt(valueString.length - 1));
					break;
			}

			this.historyIsOpen = false;
		},



		/**
		 * Disable bounce scrolling on main application
		 */
		disableBounceScrolling: function(e) {
			e.preventDefault();
			e.stopPropagation();
		}
	}
});
