import React from 'react';

import { classnames } from '../../utils';
import './index.scss';

export default ({
	isPadded = true,
	className,
	children,
}) => {
	return (
		<div className={ classnames(
			'c-panel-body',
			{
				'is-padded': !!isPadded,
			},
			className
		) }>
			{ children }
		</div>
	);
};
