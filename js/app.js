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
		isOperator: {
			type: Boolean,
			default: false
		},
		activeBtn: {
			type: [String, Number]
		}
	},
	computed: {
		isActive: function() {
			return this.activeBtn == this.value;
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
			last: '',
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
			this.activeBtn = null
		},



		/**
		 * Append operator to equation
		 *
		 * @param operator string The value of the operator
		 */
		appendOperator: function(operator) {
			if (this.last === 'operator') {
				this.input.pop()
				this.input.push(operator)
				this.activeBtn = operator
			}

			if (this.last === 'digit' || this.last === ')') {
				this.input.push(operator)
				this.last = 'operator'
				this.activeBtn = operator
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
