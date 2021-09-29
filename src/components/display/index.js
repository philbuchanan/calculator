import React from 'react';
import { useLayoutEffect, useState } from 'react';

import { Equation } from '../../components';
import { addCommas, classnames } from '../../utils';
import './index.scss';

const operators = {
	'*': '×',
	'/': '÷',
	'+': '+',
	'-': '−',
};

export default ({
	result,
	equation,
}) => {
	const [resultFontSize, setResultFontSize] = useState(60);

	useLayoutEffect(() => {
		let size = 60;

		if (result) {
			const resultString = result.toString();

			if (resultString.length > 18) {
				size = 25;
			}
			else if (resultString.length > 16) {
				size = 28;
			}
			else if (resultString.length > 15) {
				size = 30;
			}
			else if (resultString.length > 13) {
				size = 35;
			}
			else if (resultString.length > 11) {
				size = 40;
			}
			else if (resultString.length > 9) {
				size = 50;
			}

			setResultFontSize(size);
		}
	}, [result ? result.length : 0]);

	return (
		<div className="c-display">
			<div className="c-display__result-wrapper">
				<div className="c-display__result-body" style={ {fontSize: resultFontSize + 'px'} }>
					{ result === undefined ? 0 : addCommas(result) }
				</div>
			</div>
			<div className="c-display__equation-wrapper">
				<Equation
					className="c-display__equation-body"
					equation={ equation }
				/>
			</div>
		</div>
	);
};
