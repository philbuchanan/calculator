import React from 'react';

import { addCommas, classnames } from '../../utils';
import './index.scss';

const operators = {
	'*': '×',
	'/': '÷',
	'+': '+',
	'-': '−',
};

export default ({
	equation,
	className,
}) => {
	return (
		<span className={ classnames(
			'c-equation',
			className
		) }>
			{ equation.length > 0
				? equation.map((part, index) => (
					<span
						key={ index }
						className={ classnames(
							'c-equation__part',
							{
								'c-equation__part--operator': operators.hasOwnProperty(part),
								'c-equation__part--left-bracket': part === '(',
								'c-equation__part--right-bracket': part === ')',
							}
						) }
					>
						{ operators.hasOwnProperty(part)
							? operators[part]
							: addCommas(part)
						}
					</span>
				))
				: <span className="c-equation__part">0</span>
			}
		</span>
	);
};
