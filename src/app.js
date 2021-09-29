import React from 'react';
import { useEffect, useMemo, useReducer } from 'react';

import { Display, Keypad } from './components';
import { useDebounceEffect, useLocalStorage } from './hooks';
import { addCommas, compute } from './utils';
import './app.scss';

const App = () => {
	const equationReducer = (state, action) => {
		let newState = [ ...state ];

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
			return [];
		}
		else if (action.type === 'clear') {
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

	const result = useMemo(() => compute(equationState), [equationState]);

	return (
		<div className="c-application">
			<Display
				result={ result }
				equation={ equationState }
			/>
			<Keypad
				result={ result }
				equation={ equationState }
				dispatch={ dispatch }
				onShowHistory={ () => console.log('show history') }
			/>
			<div className="c-spacer"></div>
		</div>
	);
};

export default App;
