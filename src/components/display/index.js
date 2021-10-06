import React, { useEffect, useLayoutEffect, useState } from 'react';

import { Button, Equation } from '../../components';
import { addCommas } from '../../utils';
import './index.scss';

const operators = {
	'*': '×',
	'/': '÷',
	'+': '+',
	'-': '−',
};

export default ({
	state,
	dispatch,
	result,
}) => {
	const {
		computedResult,
		eq,
		history,
	} = state;

	const [cachedResult, setCachedResult] = useState(0);
	const [resultFontSize, setResultFontSize] = useState(60);

	const resultDisplay = computedResult !== undefined
		? computedResult.toString()
		: cachedResult.toString();

	const historyIndex =
		history.length > 1 &&
		(
			computedResult !== undefined ||
			history[0].result == eq[0]
		) ? 1 : 0;

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
		if (computedResult === undefined && result !== undefined) {
			setCachedResult(result);
		}
	}, [computedResult, result]);

	return (
		<div className="c-display">
			{ history.length > 0 && (
				<div className="c-display__previous-wrapper">
					<Button
						className="c-display__previous-body"
						isBare={ true }
						onClick={ () => dispatch({
							type: 'appendHistoryItem',
							value: history[historyIndex].result,
						}) }
					>
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="currentcolor">
							<path d="M2.5 7.25a4.75 4.75 0 019.5 0 .75.75 0 001.5 0 6.25 6.25 0 10-6.25 6.25H12v2.146c0 .223.27.335.427.177l2.896-2.896a.25.25 0 000-.354l-2.896-2.896a.25.25 0 00-.427.177V12H7.25A4.75 4.75 0 012.5 7.25z"></path>
						</svg>
						{ addCommas(history[historyIndex].result) }
					</Button>
				</div>
			) }
			<div className="c-display__result-wrapper">
				<div className="c-display__result-body" style={ {fontSize: resultFontSize + 'px'} }>
					{ addCommas(resultDisplay) }
				</div>
			</div>
			<div className="c-display__equation-wrapper">
				<Equation
					className="c-display__equation-body"
					equation={ computedResult !== undefined
						? [computedResult] : eq
					}
				/>
			</div>
		</div>
	);
};
