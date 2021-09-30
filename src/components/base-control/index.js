import React from 'react';

import { classnames } from '../../utils';
import './index.scss';

export default ({
	id,
	label,
	className,
	children,
	...props
}) => {
	const onChangeEvent = (event) => {
		onChange(event.target.value);
	};

	return (
		<div className={ classnames('c-control', className) }>
			<label
				htmlFor={ id }
				className="c-control__label"
			>
				{ label }
			</label>
			{ children }
		</div>
	);
};
