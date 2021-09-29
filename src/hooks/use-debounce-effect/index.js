import { useCallback, useEffect } from 'react';

export default function useDebounceEffect(effect, delay, deps) {
	const callback = useCallback(effect, deps);

	useEffect(() => {
		const handler = setTimeout(() => {
			callback();
		}, delay);

		return () => {
			clearTimeout(handler);
		};
	}, [callback, delay]);
};
