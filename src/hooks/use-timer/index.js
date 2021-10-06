import { useEffect, useRef } from 'react';

export default function useTimer(duration, callback) {
	const timeout = useRef(null);

	const start = () => {
		timeout.current = setTimeout(() => {
			callback();
		}, duration);
	};

	useEffect(() => {
		return () => clearTimeout(timeout.current);
	}, [timeout]);

	return start;
}
