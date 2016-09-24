/**
 * Copyright 2013-2016 Phil Buchanan
 *
 * A calculator iOS web application that supports brackets, backspace and saved
 * calculation history. The app uses HTML5 app caching so it will work offline.
 *
 * @version 4.0
 */



/**
 * App Vue
 *
 * The main calculator application view. Handles all aspects of the calculator
 * including keypad, display result and display equation.
 */
var app = new Vue({
	el: '#app',
	data: {
		input: [],
		last: ''
	},
	computed: {
		lastInputIndex: function() {
			return this.input.length - 1
		}
	},
	methods: {
		/**
		 * Append digit to equation
		 *
		 * @param digit int The digit to append
		 */
		appendDigit: function(digit) {
			switch(this.last) {
				case 'digit':
					var newDigit = parseInt(this.input[this.lastInputIndex].toString() + digit, 10)

					Vue.set(this.input, this.lastInputIndex, newDigit)
					break
				default:
					this.input.push(digit)
			}

			this.last = 'digit'
		}
	}
})
