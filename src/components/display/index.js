import React from 'react';
import { useLayoutEffect, useState } from 'react';

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
					{ result }
				</div>
			</div>
			<div className="c-display__equation-wrapper">
				<div className="c-display__equation-body">
					{ equation.length > 0
						? equation.map((part, index) => {
							return (
								<span
									key={ index }
									className={ classnames(
										'c-display__eq-part',
										{
											'c-display__eq-part--operator': operators.hasOwnProperty(part),
											'c-display__eq-part--left-bracket': part === '(',
											'c-display__eq-part--right-bracket': part === ')',
										}
									) }
								>
									{ operators.hasOwnProperty(part)
										? operators[part]
										: addCommas(part)
									}
								</span>
							);
						}) : 0
					}
				</div>
			</div>
		</div>
	);
};
