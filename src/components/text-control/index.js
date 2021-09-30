import React from 'react';

import { BaseControl } from '../../components';
import { classnames } from '../../utils';

export default ({
	id,
	label,
	value,
	className,
	onChange,
	...props
}) => {
	const onChangeEvent = (event) => {
		onChange(event.target.value);
	};

	return (
		<BaseControl
			className={ classnames('c-control--text', className) }
			id={ id }
			label={ label }
		>
			<input
				type="text"
				id={ id }
				name={ id }
				value={ value !== undefined ? value : '' }
				onChange={ onChangeEvent }
				{ ...props }
			/>
		</BaseControl>
	);
};
