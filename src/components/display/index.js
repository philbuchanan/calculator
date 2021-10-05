import React from 'react';
import { useEffect, useLayoutEffect, useState } from 'react';

import { Equation } from '../../components';
import { addCommas } from '../../utils';
import './index.scss';

const operators = {
	'*': '×',
	'/': '÷',
	'+': '+',
	'-': '−',
};

export default ({
	result,
	computedResult,
	equation,
}) => {
	const [cachedResult, setCachedResult] = useState(0);
	const [resultFontSize, setResultFontSize] = useState(60);

	const resultDisplay = computedResult !== undefined
		? computedResult.toString()
		: cachedResult.toString();

	useLayoutEffect(() => {
		let size = 60;

		const length = resultDisplay.length;

		if (length > 18) {
			size = 25;
		}
		else if (length > 16) {
			size = 28;
		}
		else if (length > 15) {
			size = 30;
		}
		else if (length > 13) {
			size = 35;
		}
		else if (length > 11) {
			size = 40;
		}
		else if (length > 9) {
			size = 50;
		}

		if (resultFontSize !== size) {
			setResultFontSize(size);
		}
	}, [resultDisplay.length]);

	useEffect(() => {
		if (result !== undefined) {
			setCachedResult(result);
		}
	}, [result]);

	return (
		<div className="c-display">
			<div className="c-display__result-wrapper">
				<div className="c-display__result-body" style={ {fontSize: resultFontSize + 'px'} }>
					{ addCommas(resultDisplay) }
				</div>
			</div>
			<div className="c-display__equation-wrapper">
				<Equation
					className="c-display__equation-body"
					equation={ computedResult !== undefined
						? [computedResult]
						: equation
					}
				/>
			</div>
		</div>
	);
};
