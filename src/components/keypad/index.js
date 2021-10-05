import React from 'react';
import { useMemo } from 'react';

import { Button } from '../../components';
import { useKeyPress } from '../../hooks';
import { classnames, isValidNumber } from '../../utils';
import './index.scss';

export default ({
	result,
	computedResult,
	equation,
	dispatch,
	settings,
	onShowHistory,
	onShowSettings,
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

		if (computedResult === undefined && equation.length > 0) {
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
	const disableOperators = computedResult === undefined && (!last || last === 'decimal');
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
			 * be a number.
			 */
			if (equation[lastIndex].length === 2 && /^-/.test(equation[lastIndex])) {
				/**
				 * If this is a negative, single digit number (e.g. `-6`),
				 * remove the negative symbol as well.
				 */
				dispatch({
					type: 'remove',
					index: lastIndex,
				});
			}
			else if (equation[lastIndex] === '0.') {
				// If the current input item is '0.' remove the entire item
				dispatch({
					type: 'remove',
					index: lastIndex,
				});
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

		if (computedResult !== undefined) {
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

		if (computedResult !== undefined) {
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

		if (computedResult !== undefined) {
			dispatch({
				type: 'add',
				value: [
					computedResult.toString(),
					operator,
				],
			});
		}
		else {
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
		}
	};

	const appendOpenBracket = () => {
		if (disableOpenBracket) {
			return;
		}

		if (computedResult !== undefined) {
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
				className="c-keypad__button"
				isDestructive={ true }
				isTertiary={ true }
				onClick={ clear }
			>
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentcolor">
					<path fillRule="evenodd" d="M16 1.75V3h5.25a.75.75 0 010 1.5H2.75a.75.75 0 010-1.5H8V1.75C8 .784 8.784 0 9.75 0h4.5C15.216 0 16 .784 16 1.75zm-6.5 0a.25.25 0 01.25-.25h4.5a.25.25 0 01.25.25V3h-5V1.75z"></path>
					<path d="M4.997 6.178a.75.75 0 10-1.493.144L4.916 20.92a1.75 1.75 0 001.742 1.58h10.684a1.75 1.75 0 001.742-1.581l1.413-14.597a.75.75 0 00-1.494-.144l-1.412 14.596a.25.25 0 01-.249.226H6.658a.25.25 0 01-.249-.226L4.997 6.178z"></path>
					<path d="M9.206 7.501a.75.75 0 01.793.705l.5 8.5A.75.75 0 119 16.794l-.5-8.5a.75.75 0 01.705-.793zm6.293.793A.75.75 0 1014 8.206l-.5 8.5a.75.75 0 001.498.088l.5-8.5z"></path>
				</svg>
			</Button>
			{ settings.historySaveItems > 0 && (
				<Button
					className="c-keypad__button"
					isTertiary={ true }
					onClick={ onShowHistory }
				>
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentcolor">
						<path d="M11.998 2.5A9.503 9.503 0 003.378 8H5.75a.75.75 0 010 1.5H2a1 1 0 01-1-1V4.75a.75.75 0 011.5 0v1.697A10.997 10.997 0 0111.998 1C18.074 1 23 5.925 23 12s-4.926 11-11.002 11C6.014 23 1.146 18.223 1 12.275a.75.75 0 011.5-.037 9.5 9.5 0 009.498 9.262c5.248 0 9.502-4.253 9.502-9.5s-4.254-9.5-9.502-9.5z"></path>
						<path d="M12.5 7.25a.75.75 0 00-1.5 0v5.5c0 .27.144.518.378.651l3.5 2a.75.75 0 00.744-1.302L12.5 12.315V7.25z"></path>
					</svg>
				</Button>
			) }
			<Button
				className="c-keypad__button"
				isTertiary={ true }
				onClick={ onShowSettings }
				className={ classnames(
					'c-keypad__button',
					{
						'c-keypad__button--half': settings.historySaveItems === 0
					}
				) }
			>
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentcolor">
					<path fillRule="evenodd" d="M16 12a4 4 0 11-8 0 4 4 0 018 0zm-1.5 0a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
					<path fillRule="evenodd" d="M12 1c-.268 0-.534.01-.797.028-.763.055-1.345.617-1.512 1.304l-.352 1.45c-.02.078-.09.172-.225.22a8.45 8.45 0 00-.728.303c-.13.06-.246.044-.315.002l-1.274-.776c-.604-.368-1.412-.354-1.99.147-.403.348-.78.726-1.129 1.128-.5.579-.515 1.387-.147 1.99l.776 1.275c.042.069.059.185-.002.315-.112.237-.213.48-.302.728-.05.135-.143.206-.221.225l-1.45.352c-.687.167-1.249.749-1.304 1.512a11.149 11.149 0 000 1.594c.055.763.617 1.345 1.304 1.512l1.45.352c.078.02.172.09.22.225.09.248.191.491.303.729.06.129.044.245.002.314l-.776 1.274c-.368.604-.354 1.412.147 1.99.348.403.726.78 1.128 1.129.579.5 1.387.515 1.99.147l1.275-.776c.069-.042.185-.059.315.002.237.112.48.213.728.302.135.05.206.143.225.221l.352 1.45c.167.687.749 1.249 1.512 1.303a11.125 11.125 0 001.594 0c.763-.054 1.345-.616 1.512-1.303l.352-1.45c.02-.078.09-.172.225-.22.248-.09.491-.191.729-.303.129-.06.245-.044.314-.002l1.274.776c.604.368 1.412.354 1.99-.147.403-.348.78-.726 1.129-1.128.5-.579.515-1.387.147-1.99l-.776-1.275c-.042-.069-.059-.185.002-.315.112-.237.213-.48.302-.728.05-.135.143-.206.221-.225l1.45-.352c.687-.167 1.249-.749 1.303-1.512a11.125 11.125 0 000-1.594c-.054-.763-.616-1.345-1.303-1.512l-1.45-.352c-.078-.02-.172-.09-.22-.225a8.469 8.469 0 00-.303-.728c-.06-.13-.044-.246-.002-.315l.776-1.274c.368-.604.354-1.412-.147-1.99-.348-.403-.726-.78-1.128-1.129-.579-.5-1.387-.515-1.99-.147l-1.275.776c-.069.042-.185.059-.315-.002a8.465 8.465 0 00-.728-.302c-.135-.05-.206-.143-.225-.221l-.352-1.45c-.167-.687-.749-1.249-1.512-1.304A11.149 11.149 0 0012 1zm-.69 1.525a9.648 9.648 0 011.38 0c.055.004.135.05.162.16l.351 1.45c.153.628.626 1.08 1.173 1.278.205.074.405.157.6.249a1.832 1.832 0 001.733-.074l1.275-.776c.097-.06.186-.036.228 0 .348.302.674.628.976.976.036.042.06.13 0 .228l-.776 1.274a1.832 1.832 0 00-.074 1.734c.092.195.175.395.248.6.198.547.652 1.02 1.278 1.172l1.45.353c.111.026.157.106.161.161a9.653 9.653 0 010 1.38c-.004.055-.05.135-.16.162l-1.45.351a1.833 1.833 0 00-1.278 1.173 6.926 6.926 0 01-.25.6 1.832 1.832 0 00.075 1.733l.776 1.275c.06.097.036.186 0 .228a9.555 9.555 0 01-.976.976c-.042.036-.13.06-.228 0l-1.275-.776a1.832 1.832 0 00-1.733-.074 6.926 6.926 0 01-.6.248 1.833 1.833 0 00-1.172 1.278l-.353 1.45c-.026.111-.106.157-.161.161a9.653 9.653 0 01-1.38 0c-.055-.004-.135-.05-.162-.16l-.351-1.45a1.833 1.833 0 00-1.173-1.278 6.928 6.928 0 01-.6-.25 1.832 1.832 0 00-1.734.075l-1.274.776c-.097.06-.186.036-.228 0a9.56 9.56 0 01-.976-.976c-.036-.042-.06-.13 0-.228l.776-1.275a1.832 1.832 0 00.074-1.733 6.948 6.948 0 01-.249-.6 1.833 1.833 0 00-1.277-1.172l-1.45-.353c-.111-.026-.157-.106-.161-.161a9.648 9.648 0 010-1.38c.004-.055.05-.135.16-.162l1.45-.351a1.833 1.833 0 001.278-1.173 6.95 6.95 0 01.249-.6 1.832 1.832 0 00-.074-1.734l-.776-1.274c-.06-.097-.036-.186 0-.228.302-.348.628-.674.976-.976.042-.036.13-.06.228 0l1.274.776a1.832 1.832 0 001.734.074 6.95 6.95 0 01.6-.249 1.833 1.833 0 001.172-1.277l.353-1.45c.026-.111.106-.157.161-.161z"></path>
				</svg>
			</Button>
			<Button
				className="c-keypad__button"
				isTertiary={ true }
				onClick={ backspace }
			>
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentcolor">
					<path fillRule="evenodd" d="M10.78 19.03a.75.75 0 01-1.06 0l-6.25-6.25a.75.75 0 010-1.06l6.25-6.25a.75.75 0 111.06 1.06L5.81 11.5h14.44a.75.75 0 010 1.5H5.81l4.97 4.97a.75.75 0 010 1.06z"></path>
				</svg>
			</Button>
			<Button
				className="c-keypad__button"
				isSecondary={ true }
				onClick={ invertNumber }
			>
				+/−
			</Button>
			<div className="c-keypad__brackets">
				<Button
					className="c-keypad__button"
					isSecondary={ true }
					onClick={ appendOpenBracket }
					style={ {width: bracketsCount === 0 ? '100%' : null} }
				>
					{ '(' }
				</Button>
				{ bracketsCount > 0 && (
					<Button
						className="c-keypad__button"
						isSecondary={ true }
						onClick={ appendCloseBracket }
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
				className="c-keypad__button"
				isPrimary={ true }
				isActive={ activeOperator === '/' }
				onClick={ () => appendOperator('/') }
			>
				÷
			</Button>
			<Button
				className="c-keypad__button"
				onClick={ () => appendDigit(7) }
			>
				7
			</Button>
			<Button
				className="c-keypad__button"
				onClick={ () => appendDigit(8) }
			>
				8
			</Button>
			<Button
				className="c-keypad__button"
				onClick={ () => appendDigit(9) }
			>
				9
			</Button>
			<Button
				className="c-keypad__button"
				isPrimary={ true }
				isActive={ activeOperator === '*' }
				onClick={ () => appendOperator('*') }
			>
				×
			</Button>
			<Button
				className="c-keypad__button"
				onClick={ () => appendDigit(4) }
			>
				4
			</Button>
			<Button
				className="c-keypad__button"
				onClick={ () => appendDigit(5) }
			>
				5
			</Button>
			<Button
				className="c-keypad__button"
				onClick={ () => appendDigit(6) }
			>
				6
			</Button>
			<Button
				className="c-keypad__button"
				isPrimary={ true }
				onClick={ () => appendOperator('-') }
				isActive={ activeOperator === '-' }
			>
				−
			</Button>
			<Button
				className="c-keypad__button"
				onClick={ () => appendDigit(1) }
			>
				1
			</Button>
			<Button
				className="c-keypad__button"
				onClick={ () => appendDigit(2) }
			>
				2
			</Button>
			<Button
				className="c-keypad__button"
				onClick={ () => appendDigit(3) }
			>
				3
			</Button>
			<Button
				className="c-keypad__button"
				isPrimary={ true }
				onClick={ () => appendOperator('+') }
				isActive={ activeOperator === '+' }
			>
				+
			</Button>
			<Button
				className="c-keypad__button"
				onClick={ () => appendDigit(0) }
			>
				0
			</Button>
			<Button
				className="c-keypad__button"
				onClick={appendDecimal }
			>
				.
			</Button>
			<Button
				className="c-keypad__button c-keypad__button--half"
				isPrimary={ true }
				onClick={ compute }
			>
				=
			</Button>
		</div>
	);
};
