import { useCallback, useState } from 'react';

export default function useTimer(initialState = false) {
	const [state, setState] = useState(initialState);
	const toggle = useCallback(() => setState(state => !state), []);

	return [state, toggle];
}
