import React from 'react';
import { useEffect, useMemo, useReducer, useRef } from 'react';

import { Display, Keypad } from './components';
import { useDebounceEffect, useLocalStorage } from './hooks';
import { compute } from './utils';
import './app.scss';

const App = () => {
	const resultDisplay = useRef();
	const isComputedResult = useRef(false);

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

	const [history, setHistory] = useLocalStorage('history', []);
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
				onShowHistory={ () => console.log('show history') }
			/>
			<div className="c-spacer"></div>
		</div>
	);
};

export default App;
