import React from 'react';

import { Button } from '../../components';
import { classnames } from '../../utils';

export default ({
	className,
	children,
	...props
}) => {
	return (
		<Button
			className={ classnames('c-keypad__button', className) }
			{ ...props }
		>
			{ children }
		</Button>
	);
};
