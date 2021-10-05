import React, { useCallback } from 'react';

import { Button } from '../../components';
import { useKeyPress } from '../../hooks';

export default ({
	value,
	dispatch,
}) => {
	const handleOnClick = useCallback(() => dispatch({
		type: 'appendDigit',
		value: value.toString(),
	}), [value]);

	useKeyPress(value.toString(), handleOnClick);

	return (
		<Button
			className="c-keypad__button"
			onClick={ handleOnClick }
		>
			{ value }
		</Button>
	);
};
