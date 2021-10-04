import React from 'react';
import { useEffect, useState } from 'react';

import { useCopyToClipboard } from '../../hooks';
import { classnames } from '../../utils';
import './index.scss';

export default ({
	value,
	className,
}) => {
	const [isCopied, setIsCopied] = useState(false);
	const [copiedText, copyToClipboard] = useCopyToClipboard();

	useEffect(() => {
		if (!!isCopied) {
			const timer = setTimeout(() => {
				setIsCopied(false);
			}, 2000);

			return () => {
				clearTimeout(timer);
			};
		}
	}, [isCopied]);

	return (
		<button
			className={ classnames('o-button-bare', 'c-copy-to-clipboard-button', className) }
			onClick={ () => {
				copyToClipboard(value);
				setIsCopied(true);
			} }
		>
			{ isCopied ? (
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="currentcolor">
					<path fillRule="evenodd" d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"></path>
				</svg>
			) : (
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="currentcolor">
					<path fillRule="evenodd" d="M5.75 1a.75.75 0 00-.75.75v3c0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75v-3a.75.75 0 00-.75-.75h-4.5zm.75 3V2.5h3V4h-3zm-2.874-.467a.75.75 0 00-.752-1.298A1.75 1.75 0 002 3.75v9.5c0 .966.784 1.75 1.75 1.75h8.5A1.75 1.75 0 0014 13.25v-9.5a1.75 1.75 0 00-.874-1.515.75.75 0 10-.752 1.298.25.25 0 01.126.217v9.5a.25.25 0 01-.25.25h-8.5a.25.25 0 01-.25-.25v-9.5a.25.25 0 01.126-.217z"></path>
				</svg>
			) }
			{ copiedText }
		</button>
	);
};
