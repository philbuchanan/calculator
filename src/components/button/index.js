import React from 'react';

import { classnames } from '../../utils';
import './index.scss';

export default ({
	isActive,
	isDangerous,
	isPrimary,
	isSecondary,
	isTertiary,
	isWide,
	onClick,
	children,
	...props
}) => {
	return (
		<button
			className={ classnames(
				'c-button',
				{
					'c-button--dangerous': !!isDangerous,
					'c-button--primary': !!isPrimary,
					'c-button--secondary': !!isSecondary,
					'c-button--tertiary': !!isTertiary,
					'c-button--wide': !!isWide,
					'is-active': !!isActive,
				}
			) }
			onClick={ onClick }
			{ ...props }
		>
			{ children }
		</button>
	);
};
