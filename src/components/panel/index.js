import React from 'react';

import { Button } from '../../components';
import { classnames } from '../../utils';
import './index.scss';

export default ({
	icon,
	title,
	onOpenPanel,
	onClosePanel,
	isOpen = false,
	children,
}) => {
	return (
		<div className={ classnames(
			'c-panel',
			{ 'is-open': isOpen }
		) }>
			<div className="c-panel__title-bar">
				<span className="c-panel__title">
					{ icon }
					{ title }
				</span>
				<Button
					isBare={ true }
					className="c-panel__close-button"
					aria-label="Close panel"
					onClick={ onClosePanel }
				>
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="currentcolor">
						<path fillRule="evenodd" d="M3.72 3.72a.75.75 0 011.06 0L8 6.94l3.22-3.22a.75.75 0 111.06 1.06L9.06 8l3.22 3.22a.75.75 0 11-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 01-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 010-1.06z"></path>
					</svg>
				</Button>
			</div>
			{ children }
		</div>
	);
};
