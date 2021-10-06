import React from 'react';

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
	className,
	children,
	...props
}) => {
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
			onTouchStart={ onClick }
			{ ...props }
		>
			{ children }
		</button>
	);
};
