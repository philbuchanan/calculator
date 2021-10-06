import { compute, isValidNumber, invertNumber } from './utils';

function recalculateState(state) {
	let last = null;
	let activeOperator = null;
	let bracketsCount = 0;

	if (state.computedResult === undefined && state.eq.length > 0) {
		const lastItem = state.eq[state.eq.length - 1];

		if (lastItem.length > 1) {
			last = lastItem[lastItem.length - 1] === '.'
				? 'decimal' : 'digit';
		}
		else {
			switch(lastItem) {
				case '+':
				case '-':
				case '/':
				case '*':
					last = 'operator';
					activeOperator = lastItem;
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
					last = 'digit';
					break;
				case '(':
					last = '(';
					break;
				case ')':
					last = ')';
					break;
			}
		}

		state.eq.forEach((eqItem) => {
			if (eqItem === '(') {
				bracketsCount += 1;
			}
			else if (eqItem === ')') {
				bracketsCount -= 1;
			}
		});
	}

	return {
		...state,
		last,
		activeOperator,
		bracketsCount,
	};
}

function stateReducer(state, action) {
	const {
		eq,
		last,
		activeOperator,
		bracketsCount,
		computedResult,
	} = state;
	const lastIndex = eq.length > 0 ? eq.length - 1 : 0;

	const add = (value) => {
		const newState = { ...state };

		if (typeof value === 'object') {
			value.forEach(item => newState.eq.push(item));
		}
		else {
			newState.eq.push(value);
		}

		return newState;
	};

	const insert = (index, value) => {
		const newState = { ...state };

		newState.eq.splice(index, 0, value);

		return newState;
	};

	const replace = (index, value) => {
		const newState = { ...state };

		newState.eq[index] = value;

		return newState;
	};

	const remove = (index) => {
		const newState = { ...state };

		newState.eq.splice(index, 1);

		return newState;
	};

	const backspace = () => {
		if (eq.length === 0) {
			return state;
		}

		let newState = { ...state };

		if (eq[lastIndex].length > 1) {
			/**
			 * If the current input item is longer than 1 character, it must be
			 * a number.
			 */
			if (eq[lastIndex].length === 2 && /^-/.test(eq[lastIndex])) {
				/**
				 * If this is a negative, single digit number (e.g. `-6`),
				 * remove the negative symbol as well.
				 */
				newState = remove(lastIndex);
			}
			else if (eq[lastIndex] === '0.') {
				// If the current input item is '0.' remove the entire item
				newState = remove(lastIndex);
			}
			else {
				newState = replace(lastIndex, eq[lastIndex].substring(0, eq[lastIndex].length - 1));
			}
		}
		else {
			newState = remove(lastIndex);
		}

		return recalculateState(newState);
	};

	const getIndexOfLast = (item) => {
		const eq = [ ...state.eq ].reverse();

		for (let i = 0; i < eq.length; i += 1) {
			if (eq[i].indexOf(item) !== -1) {
				return eq.length - 1 - i;
			}
		}

		return undefined;
	};

	// If there is a preexisting computed value
	if (computedResult !== undefined) {
		switch(action.type) {
			case 'appendOperator':
				return {
					...add([
						computedResult.toString(),
						action.value,
					]),
					last: 'operator',
					activeOperator: action.value,
					computedResult: undefined,
				};
			case 'invertNumber':
				return {
					...state,
					computedResult: invertNumber(computedResult).toString(),
				};
			case 'appendOpenBracket':
				return {
					...add([
						'(',
						computedResult.toString(),
					]),
					last: 'digit',
					bracketsCount: 1,
					computedResult: undefined,
				};
		}
	}

	if (action.type === 'appendDigit') {
		switch(last) {
			case null:
			case 'operator':
			case '(':
				return {
					...add(action.value),
					last: 'digit',
					activeOperator: null,
					computedResult: undefined,
				};
			case 'digit':
			case 'decimal':
				const numberLength = eq[lastIndex].length;
				const lastDigit = eq[lastIndex][numberLength - 1];

				return {
					...replace(
						lastIndex,
						numberLength === 1 && lastDigit === '0'
							? action.value
							: eq[lastIndex] + action.value
					),
					last: 'digit',
				};
		}
	}
	else if (action.type === 'appendOperator') {
		if (activeOperator === action.value) {
			return state;
		}

		switch(last) {
			case 'operator':
				return {
					...replace(lastIndex, action.value),
					last: 'operator',
					activeOperator: action.value,
				};
			case 'digit':
			case ')':
			case 'history':
				return {
					...add(action.value),
					last: 'operator',
					activeOperator: action.value,
					computedResult: undefined,
				};
		}
	}
	else if (action.type === 'appendOpenBracket') {
		switch(last) {
			case null:
			case 'operator':
			case '(':
				return {
					...add('('),
					last: '(',
					activeOperator: null,
					bracketsCount: bracketsCount + 1,
					computedResult: undefined,
				};
			case 'digit':
			case 'decimal':
			case 'history':
				// Append the `(` to the beginning of the current number
				return {
					...insert(lastIndex, '('),
					bracketsCount: bracketsCount + 1,
				};
		}
	}
	else if (action.type === 'appendCloseBracket') {
		if (bracketsCount === 0) {
			return state;
		}

		switch(last) {
			case 'digit':
			case ')':
			case 'history':
				return {
					...add(')'),
					last: ')',
					bracketsCount: bracketsCount - 1,
				};
			case '(':
				return backspace();
		}
	}
	else if (action.type === 'backspace') {
		return backspace();
	}
	else if (action.type === 'appendDecimal') {
		switch(last) {
			case 'digit':
				const newNumber = eq[lastIndex] + '.';
				if (isValidNumber(newNumber)) {
					return {
						...replace(lastIndex, newNumber),
						last: 'decimal',
					};
				}
				break;
			case null:
			case 'operator':
			case '(':
				return {
					...add('0.'),
					last: 'decimal',
					activeOperator: null,
					computedResult: undefined,
				};
		}
	}
	else if (action.type === 'compute') {
		if (eq.length === 0) {
			return state;
		}

		const result = compute(eq, state.settings.decimals);

		let newState = { ...state };

		if (
			state.history.length === 0
			|| (
				state.history[0].result !== result
				&& state.history[0].eq.join() !== eq.join()
			)
		) {
			newState.history.splice(0, 0, {
				result,
				eq,
			});

			if (newState.history.length > state.settings.historySaveItems) {
				newState.history.splice(state.settings.historySaveItems, newState.history.length - state.settings.historySaveItems);
			}
		}

		newState.last = null;
		newState.activeOperator = null;
		newState.bracketsCount = 0;
		newState.computedResult = result;
		newState.eq = [];

		return newState;
	}
	else if (action.type === 'clear') {
		return {
			...state,
			last: null,
			activeOperator: null,
			bracketsCount: 0,
			computedResult: undefined,
			eq: [],
		};
	}
	else if (action.type === 'invertNumber') {
		if (
			!last
			|| last === 'operator'
			|| last === '('
			|| (eq.length === 1 && eq[0] == '0')
		) {
			return state;
		}
		else if (last === ')') {
			const lastOpenBracketIndex = getIndexOfLast('(');

			if (lastOpenBracketIndex === undefined) {
				return state;
			}

			const lastOpenBracket = state.eq[lastOpenBracketIndex];

			return {
				...replace(
					lastOpenBracketIndex,
					lastOpenBracket === '(' ? '-(' : '('
				)
			};
		}

		return replace(lastIndex, invertNumber(eq[lastIndex]).toString());
	}
	else if (action.type === 'appendHistoryItem') {
		switch (last) {
			case null:
			case 'operator':
			case '(':
				return {
					...add(action.value.toString()),
					last: 'history',
					activeOperator: null,
					computedResult: undefined,
				};
		}
	}
	else if (action.type === 'clearHistory') {
		return {
			...state,
			history: [],
		};
	}
	else if (action.type === 'updateSetting') {
		let newState = { ...state };

		switch(action.setting) {
			case 'decimals':
				newState.settings.decimals = action.value;
				break;
			case 'historySaveItems':
				newState.settings.historySaveItems = action.value;
				break;
			default:
				return state;
		}

		return newState;
	}

	return state;
}

const defaultState = {
	last: null,
	activeOperator: null,
	bracketsCount: 0,
	computedResult: undefined,
	eq: [],
	history: [],
	settings: {
		decimals: 2,
		historySaveItems: 50,
	},
};

export {
	stateReducer,
	defaultState,
}
