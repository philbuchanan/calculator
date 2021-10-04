import { useState } from 'react';

export default function useCopyToClipboard() {
	const [copiedText, setCopiedText] = useState(null);

	const copy = (text) => {
		if (!navigator?.clipboard) {
			console.warn('Clipboard not supported');

			return false;
		}

		// Try to save to clipboard then save it in the state if worked
		try {
			navigator.clipboard.writeText(text);
			setCopiedText(text);

			return true;
		} catch (error) {
			console.warn('Copy failed', error);
			setCopiedText(null);

			return false;
		}
	}

	return [copiedText, copy];
}
