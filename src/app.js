import React from 'react';
import { useMemo, useReducer, useState } from 'react';

import { Display, Keypad, History, Settings } from './components';
import { useDebounceEffect, useLocalStorage } from './hooks';
import { compute } from './utils';

import { stateReducer, defaultState } from './state-reducer';
import './app.scss';

const App = () => {
	const [historyOpen, setHistoryOpen] = useState(false);
	const [settingsOpen, setSettingsOpen] = useState(false);

	const [initialState, saveState] = useLocalStorage('state', defaultState);
	const [state, dispatch] = useReducer(stateReducer, initialState);

	useDebounceEffect(() => {
		if (initialState !== state) {
			saveState(state);
		}
	}, 1000, [state]);

	const result = useMemo(() => {
		let computed = 0;

		if (state.eq.length > 0) {
			computed = compute(state.eq, state.settings.decimals);
		}

		return computed;
	}, [state.eq.join(), state.settings.decimals]);

	return (
		<div className="c-application">
			<Display
				result={ result }
				computedResult={ state.computedResult }
				equation={ state.eq }
			/>
			<Keypad
				state={ state }
				dispatch={ dispatch }
				onShowHistory={ () => setHistoryOpen(true) }
				onShowSettings={ () => setSettingsOpen(true) }
			/>
			<History
				state={ state }
				dispatch={ dispatch }
				isOpen={ historyOpen }
				onClose={ () => setHistoryOpen(false) }
			/>
			<Settings
				state={ state }
				dispatch={ dispatch }
				isOpen={ settingsOpen }
				onClose={ () => setSettingsOpen(false) }
			/>
			<div className="c-spacer"></div>
		</div>
	);
};

export default App;
