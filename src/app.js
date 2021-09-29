import React from 'react';
import { useEffect, useMemo, useReducer, useRef, useState } from 'react';

import { Display, Keypad, History } from './components';
import { useDebounceEffect, useLocalStorage } from './hooks';
import { compute } from './utils';
import './app.scss';

const App = () => {
	const [historyOpen, setHistoryOpen] = useState(false);
	const resultDisplay = useRef();
	const isComputedResult = useRef(false);

	const historyReducer = (state, action) => {
		if (action.type === 'add') {
			if (
				state.length > 0 &&
				state[0].result === action.value.result &&
				state[0].equ.join() === action.value.equ.join()
			) {
				return state;
			}

			let newHistory = [ action.value, ...state ];

			if (newHistory.length > 50) {
				newHistory.splice(50, newHistory.length - 50);
			}

			return newHistory;
		}
		else if (action.type === 'clear') {
			return [];
		}
		else {
			return state;
		}
	};

	const [history, setHistory] = useLocalStorage('history', []);
	const [historyState, dispatchHistory] = useReducer(historyReducer, history);

	useEffect(() => {
		if (history !== historyState) {
			setHistory(historyState);
		}
	}, [historyState]);

	const equationReducer = (state, action) => {
		let newState = [ ...state ];
		isComputedResult.current = false;

		if (action.type === 'add') {
			return [ ...state, action.value ];
		}
		else if (action.type === 'insert') {
			newState.splice(action.index, 0, action.value);
			return newState;
		}
		else if (action.type === 'replace') {
			newState[action.index] = action.value;
			return newState;
		}
		else if (action.type === 'remove') {
			newState.splice(action.index, 1);
			return newState;
		}
		else if (action.type === 'compute') {
			isComputedResult.current = true;

			dispatchHistory({
				type: 'add',
				value: {
					result: resultDisplay.current,
					equ: state,
				},
			});

			return [resultDisplay.current.toString()];
		}
		else if (action.type === 'clear') {
			resultDisplay.current = 0;
			return [];
		}
		else {
			return state;
		}
	};

	const [equation, setEquation] = useLocalStorage('equation', []);
	const [equationState, dispatch] = useReducer(equationReducer, equation);

	useDebounceEffect(() => {
		if (equation !== equationState) {
			setEquation(equationState);
		}
	}, 1000, [equationState]);

	const result = useMemo(() => {
		let computed = 0;

		if (equationState.length > 0) {
			computed = compute(equationState);

			if (computed !== null) {
				resultDisplay.current = computed;
			}
		}

		return computed;
	}, [equationState]);

	return (
		<div className="c-application">
			<Display
				result={ resultDisplay.current }
				equation={ equationState }
			/>
			<Keypad
				result={ result }
				equation={ equationState }
				isComputedResult={ isComputedResult.current }
				dispatch={ dispatch }
				onShowHistory={ () => setHistoryOpen(true) }
			/>
			<History
				history={ historyState }
				dispatch={ dispatchHistory }
				isOpen={ !!historyOpen }
				onHistoryItemClick={ (value) => {
					const equationString = equationState.join();

					switch(equationString[equationString.length - 1]) {
						case '(':
						case '+':
						case '-':
						case '*':
						case '/':
							dispatch({
								type: 'add',
								value: value,
							});

							setHistoryOpen(false);

							break;
					}
				} }
				onOpenHistory={ () => setHistoryOpen(true) }
				onCloseHistory={ () => setHistoryOpen(false) }
			/>
			<div className="c-spacer"></div>
		</div>
	);
};

export default App;
