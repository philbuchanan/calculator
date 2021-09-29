import { useEffect } from 'react';

export default function useKeyPress(targetKey, onPress) {
	useEffect(() => {
		// If pressed key is our target key then set to true
		function handler({key}) {
			if (key === targetKey) {
				onPress();
			}
		}

		// Add event listener
		window.addEventListener('keydown', handler);

		// Remove event listener on cleanup
		return () => {
			window.removeEventListener('keydown', handler);
		};
	});
}
