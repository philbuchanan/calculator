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
					<svg xmlns="http://www.w3.org/2000/svg" width="48" height="45" viewBox="0 0 48 45">
						<line x1="22" y1="17" x2="33" y2="28" fill="none" stroke="#fff" strokeMiterlimit="10" strokeWidth="1.5"/>
						<line x1="22" y1="28" x2="33" y2="17" fill="none" stroke="#fff" strokeMiterlimit="10" strokeWidth="1.5"/>
					</svg>
				</Button>
			</div>
			<div className="c-panel__list-scroll">
				{ children }
			</div>
		</div>
	);
};
