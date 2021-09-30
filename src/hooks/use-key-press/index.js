import { useEffect } from 'react';

export default function useKeyPress(targetKey, onPress) {
	useEffect(() => {
		// If pressed key is our target key then set to true
		function handler(event) {
			// Don’t call callback if the event targets an input element
			if (event.target.tagName !== 'INPUT' && event.key === targetKey) {
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
