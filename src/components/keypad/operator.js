import React, { useCallback } from 'react';

import { Button } from '../../components';
import { useKeyPress } from '../../hooks';

const operators = {
	'*': '×',
	'/': '÷',
	'+': '+',
	'-': '−',
};

export default ({
	value,
	activeOperator,
	dispatch,
}) => {
	const handleOnClick = useCallback(() => dispatch({
		type: 'appendOperator',
		value: value,
	}), [value]);

	useKeyPress(value, handleOnClick);

	return (
		<Button
			className="c-keypad__button"
			isPrimary={ true }
			isActive={ activeOperator === value }
			onClick={ handleOnClick }
		>
			{ operators[value] }
		</Button>
	);
};
