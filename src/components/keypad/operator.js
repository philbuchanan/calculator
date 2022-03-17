import React, { useCallback } from 'react';

import { Button } from '../../components';

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

	return (
		<Button
			className="c-keypad__button"
			isPrimary={ true }
			isActive={ activeOperator === value }
			onClick={ handleOnClick }
			keyboardShortcut={ value }
		>
			{ operators[value] }
		</Button>
	);
};
