/**
 * Copyright 2013-2016 Phil Buchanan
 *
 * A calculator iOS web application that supports brackets, backspace and saved
 * calculation history. The app uses HTML5 app caching so it will work offline.
 *
 * @version 4.0
 */

/**
 * History Component
 *
 * Handles all aspects of the history list including adding items to it and
 * triggering events to push a history item into the equation.
 */
Vue.component('history', {
	template: '#history',
	data: function() {
		return {
			history: [],
			isVisible: false
		}
	},
	events: {
		/**
		 * Listen for event to open the history panel
		 */
		'open-history': function() {
			this.openHistoryPanel()
		},



		/**
		 * Listen for event to append a history item to the history list
		 *
		 * @param object item The result and equation item object
		 */
		'append-to-history': function(item) {
			this.history.unshift(item)
		}
	},
	methods: {
		/**
		 * Append a history item to the main equation
		 *
		 * @param int result The calculated result to append to the equation
		 */
		appendHistoryItemToEquation: function(result) {
			this.$dispatch('append-result', result)
			this.closeHistoryPanel()
		},



		/**
		 * Open the history panel
		 */
		openHistoryPanel: function() {
			this.isVisible = true
		},



		/**
		 * Close the history panel
		 */
		closeHistoryPanel: function() {
			this.isVisible = false
		}
	}
})



/**
 * App Vue
 *
 * The main calculator application view. Handles all aspects of the calculator
 * including keypad, display result and display equation.
 */
var app = new Vue({
	el: '#app',
	data: {
		input: [0],
		last: 'digit',
		brackets: 0
	},
	computed: {
		result: function() {
			return eval(this.input.join(''))
		},
		lastInputIndex: function() {
			return this.input.length - 1
		}
	},
	methods: {
		/**
		 * Show the history panel
		 */
		openHistory: function() {
			this.$broadcast('open-history')
		},



		/**
		 * Append digit to equation
		 *
		 * @param digit int The digit to append
		 */
		appendDigit: function(digit) {
			switch(this.last) {
				case 'digit':
					var newDigit = parseInt(this.input[this.lastInputIndex].toString() + digit, 10)

					this.input.$set(this.lastInputIndex, newDigit)
					break
				default:
					this.input.push(digit)
			}

			this.last = 'digit'
		},



		/**
		 * Append operator to equation
		 *
		 * @param operator string The value of the operator
		 */
		appendOperator: function(operator, event) {
			if (this.last === 'operator') {
				this.input.pop()
			}

			if (this.last === 'digit' || this.last === ')') {
				this.input.push(operator)
				this.last = 'operator'
			}
		},



		/**
		 * Append bracket to equation
		 *
		 * @param bracket string Left of right bracker
		 */
		appendBracket: function(bracket) {
			if (bracket === '(') {
				switch (this.last) {
					case 'operator':
						this.input.push('(')
						this.brackets += 1
						this.last = '('
						break
					case 'digit':
						this.input.splice(this.lastInputIndex, 0, '(')
						this.brackets += 1
						break
				}
			}
			else if (bracket === ')') {
				switch (this.last) {
					case ')':
					case 'digit':
						if (this.brackets > 0) {
							this.input.push(')')
							this.brackets -= 1
							this.last = ')'
						}
						break
				}
			}
		},



		/**
		 * Append a fully equated result item to the current equation
		 *
		 * @param int value The result value to append
		 */
		appendResult: function(value) {
			switch(this.last) {
				case 'operator':
				case '(':
					this.input.push(value)
					this.last = 'digit'
					break
			}
		},



		/**
		 * Complete an equation. Adds the current equation and result to the
		 * history and resets the display.
		 */
		equate: function() {
			this.$broadcast('append-to-history', {
				result: this.result,
				equation: this.input
			})

			this.reset(this.result)
		},



		/**
		 * Reset current equation and result
		 *
		 * @param [result] int Set as the starting value for the equation
		 */
		reset: function(result) {
			this.input = result ? [this.result] : [0]
			this.last = 'digit'
			this.brackets = 0
		}
	}
})
