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

	const [settings, setSettings] = useLocalStorage('settings', {
		decimals: 2,
		historySaveItems: 50,
	});
	const [settingsState, dispatchSettings] = useReducer(settingsReducer, settings);

	useEffect(() => {
		if (settings !== settingsState) {
			setSettings(settingsState);
		}
	}, [settingsState]);

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

			if (newHistory.length > settingsState.historySaveItems) {
				newHistory.splice(settingsState.historySaveItems, newHistory.length - settingsState.historySaveItems);
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

	const [history, setHistory] = useLocalStorage('history', []);
	const [historyState, dispatchHistory] = useReducer(historyReducer, history);

	useEffect(() => {
		if (history !== historyState) {
			setHistory(historyState);
		}
	}, [historyState]);

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

			if (settingsState.historySaveItems > 0) {
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
			computed = compute(equationState, settingsState.decimals);

			if (computed !== null) {
				resultDisplay.current = computed.toString();
			}
		}

		return computed;
	}, [equationState]);

	return (
		<div className="c-application">
			<Display
				result={ resultDisplay.current }
				computedResult={ computedResult.current }
				equation={ equationState }
			/>
			<Keypad
				result={ result }
				equation={ equationState }
				computedResult={ computedResult.current }
				dispatch={ dispatch }
				settings={ settingsState }
				onShowHistory={ () => setHistoryOpen(true) }
				onShowSettings={ () => setSettingsOpen(true) }
			/>
			<History
				history={ historyState }
				equation={ equationState }
				dispatch={ dispatch }
				isOpen={ !!historyOpen }
				onOpenHistory={ () => setHistoryOpen(true) }
				onCloseHistory={ () => setHistoryOpen(false) }
			/>
			<Settings
				settings={ settingsState }
				dispatchSettings={ dispatchSettings }
				history={ historyState }
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
