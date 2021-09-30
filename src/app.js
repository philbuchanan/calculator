import React from 'react';
import { useEffect, useMemo, useReducer, useRef, useState } from 'react';

import { Display, Keypad, History, Settings } from './components';
import { useDebounceEffect, useLocalStorage } from './hooks';
import { compute } from './utils';
import './app.scss';

const App = () => {
	const [historyOpen, setHistoryOpen] = useState(false);
	const [settingsOpen, setSettingsOpen] = useState(false);
	const resultDisplay = useRef();
	const computedResult = useRef();

	const settingsReducer = (state, action) => {
		let newSettings = { ...state };

		if (action.type === 'update') {
			newSettings[action.setting] = action.value;
			return newSettings;
		}
		else {
			return state;
		}
	};

	const [settingsInitialState, setSettings] = useLocalStorage('settings', {
		decimals: 2,
		historySaveItems: 50,
	});
	const [settings, dispatchSettings] = useReducer(settingsReducer, settingsInitialState);

	useEffect(() => {
		if (settingsInitialState !== settings) {
			setSettings(settings);
		}
	}, [settings]);

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

			if (newHistory.length > settings.historySaveItems) {
				newHistory.splice(settings.historySaveItems, newHistory.length - settings.historySaveItems);
			}

			return newHistory;
		}
		else if (action.type === 'clear') {
			console.log('test');
			return [];
		}
		else {
			return state;
		}
	};

	const [historyInitialState, setHistory] = useLocalStorage('history', []);
	const [history, dispatchHistory] = useReducer(historyReducer, historyInitialState);

	useEffect(() => {
		if (historyInitialState !== history) {
			setHistory(history);
		}
	}, [history]);

	const equationReducer = (state, action) => {
		let newState = [ ...state ];
		computedResult.current = undefined;

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
			computedResult.current = resultDisplay.current;

			if (settings.historySaveItems > 0) {
				dispatchHistory({
					type: 'add',
					value: {
						result: resultDisplay.current,
						equ: state,
					},
				});
			}

			return [];
		}
		else if (action.type === 'clear') {
			resultDisplay.current = '0';
			return [];
		}
		else {
			return state;
		}
	};

	const [equationInitialState, setEquation] = useLocalStorage('equation', []);
	const [equation, dispatch] = useReducer(equationReducer, equationInitialState);

	useDebounceEffect(() => {
		if (equationInitialState !== equation) {
			setEquation(equation);
		}
	}, 1000, [equation]);

	const result = useMemo(() => {
		let computed = 0;

		if (equation.length > 0) {
			computed = compute(equation, settings.decimals);

			if (computed !== null) {
				resultDisplay.current = computed.toString();
			}
		}

		return computed;
	}, [equation]);

	return (
		<div className="c-application">
			<Display
				result={ resultDisplay.current }
				computedResult={ computedResult.current }
				equation={ equation }
			/>
			<Keypad
				result={ result }
				equation={ equation }
				computedResult={ computedResult.current }
				dispatch={ dispatch }
				settings={ settings }
				onShowHistory={ () => setHistoryOpen(true) }
				onShowSettings={ () => setSettingsOpen(true) }
			/>
			<History
				history={ history }
				equation={ equation }
				dispatch={ dispatch }
				isOpen={ !!historyOpen }
				onOpenHistory={ () => setHistoryOpen(true) }
				onCloseHistory={ () => setHistoryOpen(false) }
			/>
			<Settings
				settings={ settings }
				dispatchSettings={ dispatchSettings }
				history={ history }
				dispatchHistory={ dispatchHistory }
				isOpen={ !!settingsOpen }
				onOpenSettings={ () => setSettingsOpen(true) }
				onCloseSettings={ () => setSettingsOpen(false) }
			/>
			<div className="c-spacer"></div>
		</div>
	);
};

export default App;
