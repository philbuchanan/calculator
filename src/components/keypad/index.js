import React from 'react';
import { useMemo } from 'react';

import { Button } from '../../components';
import { useKeyPress } from '../../hooks';
import { isValidNumber } from '../../utils';
import './index.scss';

export default ({
	result,
	equation,
	isComputedResult,
	dispatch,
	onShowHistory,
}) => {
	const lastIndex = equation.length > 0 ? equation.length - 1 : 0;

	const [
		last,
		activeOperator,
		bracketsCount,
	] = useMemo(() => {
		let last = null;
		let activeOperator = null;
		let bracketsCount = 0;

		if (!isComputedResult && equation.length > 0) {
			const lastItem = equation[equation.length - 1];

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

			equation.forEach((eqItem) => {
				if (eqItem === '(') {
					bracketsCount += 1;
				}
				else if (eqItem === ')') {
					bracketsCount -= 1;
				}
			});
		}

		return [
			last,
			activeOperator,
			bracketsCount,
		];
	}, [equation]);

	const disableCompute = equation.length === 0 || result === null;
	const disableBackspace = equation.length === 0;
	const disableOperators = !last || last === 'decimal';
	const disableDigits = last === ')';
	const disableDecimal = last === ')' || last === 'decimal';
	const disableOpenBracket = last === ')';
	const disableCloseBracket = !last || last === 'operator' || last === 'decimal' || bracketsCount === 0;
	const disableInvert = !last || last === 'operator' || last === '(' || last === ')';

	const compute = () => {
		if (disableCompute) {
			return;
		}

		dispatch({type: 'compute'});
	};

	const clear = (result) => dispatch({type: 'clear'});

	const backspace = () => {
		if (disableBackspace) {
			return;
		}

		if (equation[lastIndex].length > 1) {
			/**
			 * If the current input item is longer than 1 character, it must
			 * be a number. If this is a negative, single digit number
			 * (e.g. `-6`), clear everything.
			 */
			if (equation[0].length === 2 && /^-/.test(equation[0])) {
				clear();
			}
			else {
				dispatch({
					type: 'replace',
					index: lastIndex,
					value: equation[lastIndex].substring(0, equation[lastIndex].length - 1),
				});
			}
		}
		else {
			dispatch({
				type: 'remove',
				index: lastIndex,
			});
		}
	};

	const appendDigit = (digit) => {
		if (disableDigits) {
			return;
		}

		if (isComputedResult) {
			dispatch({
				type: 'replace',
				index: 0,
				value: digit.toString(),
			});

			return;
		}

		switch(last) {
			case null:
			case 'operator':
			case '(':
				dispatch({
					type: 'add',
					value: digit.toString(),
				});
				break;
			case 'digit':
			case 'decimal':
				const newNumber = equation[lastIndex] + digit;
				/**
				 * We explicitly check if the number is valid, otherwise a user
				 * could add a double "0".
				 */
				if (isValidNumber(newNumber)) {
					dispatch({
						type: 'replace',
						index: lastIndex,
						value: newNumber,
					});
				}
				break;
		}
	};

	const appendDecimal = () => {
		if (disableDecimal) {
			return;
		}

		if (isComputedResult) {
			dispatch({
				type: 'replace',
				index: 0,
				value: '0.',
			});

			return;
		}

		switch(last) {
			case 'digit':
				const newNumber = equation[lastIndex] + '.';
				if (isValidNumber(newNumber)) {
					dispatch({
						type: 'replace',
						index: lastIndex,
						value: newNumber,
					});
				}
				break;
			case null:
			case 'operator':
			case '(':
				dispatch({
					type: 'add',
					value: '0.',
				});
				break;
		}
	};

	const appendOperator = (operator) => {
		if (disableOperators) {
			return;
		}

		switch(last) {
			case 'operator':
				dispatch({
					type: 'replace',
					index: equation.length - 1,
					value: operator,
				});
				break;
			case null:
			case 'digit':
			case ')':
				dispatch({
					type: 'add',
					value: operator,
				});
				break;
		}
	};

	const appendOpenBracket = () => {
		if (disableOpenBracket) {
			return;
		}

		if (isComputedResult) {
			dispatch({
				type: 'replace',
				index: 0,
				value: '(',
			});

			return;
		}

		switch(last) {
			case null:
			case 'operator':
			case '(':
				dispatch({
					type: 'add',
					value: '(',
				});
				break;
			case 'digit':
			case 'decimal':
				// Append the `(` to the beginning of the current number
				dispatch({
					type: 'insert',
					index: lastIndex,
					value: '(',
				});
				break;
		}
	};

	const appendCloseBracket = () => {
		if (disableCloseBracket) {
			return;
		}

		switch(last) {
			case 'digit':
			case ')':
				if (bracketsCount > 0) {
					dispatch({
						type: 'add',
						value: ')',
					});
				}
				break;
			case '(':
				backspace();
				break;
		}
	};

	const invertNumber = () => {
		if (disableInvert) {
			return;
		}

		// If the input is only a zero, don't let users invert a number
		if (equation.length === 1 && equation[0] == '0') {
			return;
		}

		// If the number is prefixed with `-`
		if (/^-/.test(equation[lastIndex])) {
			// Remove `-`
			dispatch({
				type: 'replace',
				index: lastIndex,
				value: equation[lastIndex].replace('-', ''),
			});
		}
		else {
			if (equation[lastIndex - 1] === '-') {
				// Switch previous operator to `+`
				dispatch({
					type: 'replace',
					index: lastIndex - 1,
					value: '+',
				});
			}
			else if (equation[lastIndex - 1] === '+') {
				// Switch previous operator to `-`
				dispatch({
					type: 'replace',
					index: lastIndex - 1,
					value: '-',
				});
			}
			else {
				// Add `-` prefix to number
				dispatch({
					type: 'replace',
					index: lastIndex,
					value: '-' + equation[lastIndex],
				});
			}
		}
	};

	useKeyPress('Escape', clear);
	useKeyPress('c', clear);
	useKeyPress('h', onShowHistory);
	useKeyPress('Backspace', backspace);
	useKeyPress('Enter', compute);
	useKeyPress('=', compute);
	useKeyPress('.', appendDecimal);
	useKeyPress('(', appendOpenBracket);
	useKeyPress(')', appendCloseBracket);
	useKeyPress('1', () => appendDigit(1));
	useKeyPress('2', () => appendDigit(2));
	useKeyPress('3', () => appendDigit(3));
	useKeyPress('4', () => appendDigit(4));
	useKeyPress('5', () => appendDigit(5));
	useKeyPress('6', () => appendDigit(6));
	useKeyPress('7', () => appendDigit(7));
	useKeyPress('8', () => appendDigit(8));
	useKeyPress('9', () => appendDigit(9));
	useKeyPress('0', () => appendDigit(0));
	useKeyPress('+', () => appendOperator('+'));
	useKeyPress('-', () => appendOperator('-'));
	useKeyPress('/', () => appendOperator('/'));
	useKeyPress('*', () => appendOperator('*'));

	return (
		<div className="c-keypad">
			<Button
				isDangerous={ true }
				isTertiary={ true }
				onClick={ clear }
			>
				c
			</Button>
			<Button
				isWide={ true }
				isTertiary={ true }
				onClick={ onShowHistory }
			>
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentcolor">
					<path d="M11.998 2.5A9.503 9.503 0 003.378 8H5.75a.75.75 0 010 1.5H2a1 1 0 01-1-1V4.75a.75.75 0 011.5 0v1.697A10.997 10.997 0 0111.998 1C18.074 1 23 5.925 23 12s-4.926 11-11.002 11C6.014 23 1.146 18.223 1 12.275a.75.75 0 011.5-.037 9.5 9.5 0 009.498 9.262c5.248 0 9.502-4.253 9.502-9.5s-4.254-9.5-9.502-9.5z"></path>
					<path d="M12.5 7.25a.75.75 0 00-1.5 0v5.5c0 .27.144.518.378.651l3.5 2a.75.75 0 00.744-1.302L12.5 12.315V7.25z"></path>
				</svg>
			</Button>
			<Button
				isTertiary={ true }
				onClick={ backspace }
				disabled={ disableBackspace }
			>
				<svg xmlns="http://www.w3.org/2000/svg" width="36" height="24" viewBox="0 0 36 24" fill="currentcolor">
					<path d="M33.88,24H10.63A2.13,2.13,0,0,1,9,23.27L.51,13.38a2.12,2.12,0,0,1,0-2.76L9,.73A2.12,2.12,0,0,1,10.63,0H33.88A2.12,2.12,0,0,1,36,2.12V21.88A2.12,2.12,0,0,1,33.88,24ZM10.63,1.41a.69.69,0,0,0-.53.25L1.58,11.54a.7.7,0,0,0,0,.92l8.52,9.88a.69.69,0,0,0,.53.25H33.88a.71.71,0,0,0,.71-.71V2.12a.71.71,0,0,0-.71-.71Z"/>
					<path d="M21.06,12l3.48-3.47a.76.76,0,1,0-1.07-1.07L20,10.94,16.53,7.46a.76.76,0,1,0-1.07,1.07L18.94,12l-3.48,3.47a.76.76,0,0,0,1.07,1.07L20,13.06l3.47,3.48a.76.76,0,0,0,1.07-1.07Z"/>
				</svg>
			</Button>
			<Button
				isSecondary={ true }
				onClick={ invertNumber }
				disabled={ disableInvert }
			>
				+/−
			</Button>
			<div className="c-keypad__brackets">
				<Button
					isSecondary={ true }
					onClick={ appendOpenBracket }
					disabled={ disableOpenBracket }
					style={ {width: bracketsCount === 0 ? '100%' : null} }
				>
					{ '(' }
				</Button>
				{ bracketsCount > 0 && (
					<Button
						isSecondary={ true }
						onClick={ appendCloseBracket }
						disabled={ disableCloseBracket }
					>
						{ ')' }
					</Button>
				) }
				{ bracketsCount > 0 && (
					<div className="c-keypad__brackets-count">
						{ bracketsCount }
					</div>
				) }
			</div>
			<Button
				isPrimary={ true }
				isActive={ activeOperator === '/' }
				onClick={ () => appendOperator('/') }
				disabled={ disableOperators || activeOperator === '/' }
			>
				÷
			</Button>
			<Button
				onClick={ () => appendDigit(7) }
				disabled={ disableDigits }
			>
				7
			</Button>
			<Button
				onClick={ () => appendDigit(8) }
				disabled={ disableDigits }
			>
				8
			</Button>
			<Button
				onClick={ () => appendDigit(9) }
				disabled={ disableDigits }
			>
				9
			</Button>
			<Button
				isPrimary={ true }
				isActive={ activeOperator === '*' }
				onClick={ () => appendOperator('*') }
				disabled={ disableOperators || activeOperator === '*' }
			>
				×
			</Button>
			<Button
				onClick={ () => appendDigit(4) }
				disabled={ disableDigits }
			>
				4
			</Button>
			<Button
				onClick={ () => appendDigit(5) }
				disabled={ disableDigits }
			>
				5
			</Button>
			<Button
				onClick={ () => appendDigit(6) }
				disabled={ disableDigits }
			>
				6
			</Button>
			<Button
				isPrimary={ true }
				onClick={ () => appendOperator('-') }
				isActive={ activeOperator === '-' }
				disabled={ disableOperators || activeOperator === '-' }
			>
				−
			</Button>
			<Button
				onClick={ () => appendDigit(1) }
				disabled={ disableDigits }
			>
				1
			</Button>
			<Button
				onClick={ () => appendDigit(2) }
				disabled={ disableDigits }
			>
				2
			</Button>
			<Button
				onClick={ () => appendDigit(3) }
				disabled={ disableDigits }
			>
				3
			</Button>
			<Button
				isPrimary={ true }
				onClick={ () => appendOperator('+') }
				isActive={ activeOperator === '+' }
				disabled={ disableOperators || activeOperator === '+' }
			>
				+
			</Button>
			<Button
				onClick={ () => appendDigit(0) }
				disabled={ disableDigits }
			>
				0
			</Button>
			<Button
				onClick={appendDecimal }
				disabled={ disableDecimal }
			>
				.
			</Button>
			<Button
				isPrimary={ true }
				isWide={ true }
				onClick={ compute }
				disabled={ disableCompute }
			>
				=
			</Button>
		</div>
	);
};
