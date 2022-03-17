import React, { useCallback } from 'react';

import { Button } from '../../components';

export default ({
	value,
	dispatch,
}) => {
	const handleOnClick = useCallback(() => dispatch({
		type: 'appendDigit',
		value: value.toString(),
	}), [value]);

	return (
		<Button
			className="c-keypad__button"
			onClick={ handleOnClick }
			keyboardShortcut={ value.toString() }
		>
			{ value }
		</Button>
	);
};
