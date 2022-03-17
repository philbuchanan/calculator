import React from 'react';

import { useKeyPress } from '../../hooks';
import { classnames } from '../../utils';
import './index.scss';

export default ({
	isBare = false,
	isActive,
	isDestructive,
	isPrimary,
	isSecondary,
	isTertiary,
	isWide,
	onClick,
	keyboardShortcut,
	className,
	children,
	...props
}) => {
	if (keyboardShortcut) {
		(Array.isArray(keyboardShortcut) ? keyboardShortcut : [keyboardShortcut]).forEach(shortcut => (
			useKeyPress(shortcut, onClick)
		));
	}

	return (
		<button
			className={ classnames(
				'o-button-bare',
				{
					'c-button': !isBare,
					'c-button--destructive': !!isDestructive,
					'c-button--primary': !!isPrimary,
					'c-button--secondary': !!isSecondary,
					'c-button--tertiary': !!isTertiary,
					'is-active': !!isActive,
				},
				className
			) }
			onClick={ onClick }
			{ ...props }
		>
			{ children }
		</button>
	);
};
