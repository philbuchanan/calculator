/**
 * Copyright 2013-2016 Phil Buchanan
 *
 * A calculator iOS web application that supports brackets, backspace and saved
 * calculation history. The app uses HTML5 app caching so it will work offline.
 *
 * @version 4.0
 */



/**
 * Button Component
 */
Vue.component('btn', {
	template: '#btn',
	props: {
		label: {
			type: String,
			required: true
		},
		value: {
			type: [String, Number],
			required: true
		},
		activeBtn: {
			type: [String, Number]
		},
		type: {
			type: String,
			default: 'digit'
		}
	},
	computed: {
		classObject: function() {
			var classes = 'keypad-button'

			if (this.type !== 'digit') {
				classes += ' keypad-button--' + this.type
			}

			if (this.type === 'history' || this.type === 'equals') {
				classes += ' keypad-button--wide'
			}

			if (this.activeBtn == this.value) {
				classes += ' keypad-button--is-active'
			}

			return classes
		}
	},
	methods: {
		buttonClick: function() {
			this.$emit('click', this.value)
		}
	},
})



/**
 * Keypad Component
 */
Vue.component('keypad', {
	template: '#keypad',
	data: function() {
		return {
			input: [],
			last: null,
			activeBtn: null
		}
	},
	computed: {
		lastInputIndex: function() {
			return this.input.length - 1
		}
	},
	methods: {
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
			return /^\-?(0|0(?!\.)|([1-9]{1}\d*)|\.(?!\.)\d*)(\.\d*){0,1}$/.test(num)
		},



		/**
		 * Update a number in the input stack
		 *
		 * @param num The number to update
		 */
		updateNumber: function(num) {
			// Only update if the new number is valid
			if (this.isValidNum(num)) {
				Vue.set(this.input, this.lastInputIndex, num.toString())
			}
		},



		/**
		 * Append digit to equation
		 *
		 * @param digit int The digit to append
		 */
		appendDigit: function(digit) {
			switch(this.last) {
				case 'digit':
				case 'decimal':
					var newNum = this.input[this.lastInputIndex] + digit

					this.updateNumber(newNum)
					break
				default:
					this.input.push(digit.toString())
			}

			this.last = 'digit'
			this.activeBtn = null
		},



		/**
		 * Append a decimal to the current number
		 */
		appendDecimal: function() {
			switch(this.last) {
				case 'digit':
					this.updateNumber(this.input[this.lastInputIndex] + '.')
					this.last = 'decimal'
					break
				case null:
				case 'operator':
				case '(':
					this.input.push('0.')
					this.last = 'decimal'
					break
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
					this.input.pop()
					this.input.push(operator)
					this.activeBtn = operator
					break
				case 'digit':
				case ')':
					this.input.push(operator)
					this.last = 'operator'
					this.activeBtn = operator
					break
			}
		}
	}
})



/**
 * App Vue
 *
 * The main calculator application view.
 */
var app = new Vue({
	el: '#app'
})
