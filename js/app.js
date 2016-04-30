/**
 * Copyright 2013-2016 Phil Buchanan
 *
 * A calculator iOS web application that supports brackets, backspace and saved
 * calculation history. The app uses HTML5 app caching so it will work offline.
 *
 * @version 4.0
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
			console.log(this.input)

			return eval(this.input.join(''))
		},
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
					this.input.$set(this.lastInputIndex, parseInt(this.input[this.lastInputIndex].toString() + digit, 10))
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
		}
	}
})
