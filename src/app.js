import React, { useMemo, useReducer } from 'react';

import { Display, Keypad, History, Settings } from './components';
import { useDebounceEffect, useLocalStorage, useToggle } from './hooks';
import { compute } from './utils';

import { stateReducer, defaultState } from './state-reducer';
import './app.scss';

const App = () => {
	const [historyOpen, toggleHistory] = useToggle(false);
	const [settingsOpen, toggleSettings] = useToggle(false);

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
				state={ state }
				dispatch={ dispatch }
				result={ result }
			/>
			<Keypad
				state={ state }
				dispatch={ dispatch }
				onToggleHistory={ () => toggleHistory() }
				onToggleSettings={ () => toggleSettings() }
			/>
			<History
				state={ state }
				dispatch={ dispatch }
				isOpen={ historyOpen }
				onClose={ () => toggleHistory() }
			/>
			<Settings
				state={ state }
				dispatch={ dispatch }
				isOpen={ settingsOpen }
				onClose={ () => toggleSettings() }
			/>
			<div className="c-spacer"></div>
		</div>
	);
};

export default App;
