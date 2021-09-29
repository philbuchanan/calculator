import React from 'react';

import { Button, Equation } from '../../components';
import { addCommas, classnames } from '../../utils';
import './index.scss';

export default ({
	history,
	dispatch,
	onOpenHistory,
	onCloseHistory,
	onHistoryItemClick,
	isOpen = false,
}) => {
	return (
		<div className={ classnames(
			'c-history',
			{ 'is-open': isOpen }
		) }>
			<div className="c-history__title-bar">
				<span className="c-history__title">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="currentcolor">
						<path fillRule="evenodd" d="M1.643 3.143L.427 1.927A.25.25 0 000 2.104V5.75c0 .138.112.25.25.25h3.646a.25.25 0 00.177-.427L2.715 4.215a6.5 6.5 0 11-1.18 4.458.75.75 0 10-1.493.154 8.001 8.001 0 101.6-5.684zM7.75 4a.75.75 0 01.75.75v2.992l2.028.812a.75.75 0 01-.557 1.392l-2.5-1A.75.75 0 017 8.25v-3.5A.75.75 0 017.75 4z"></path>
					</svg>
					History
				</span>
				<Button
					isBare={ true }
					className="c-history__close-button"
					aria-label="Close history"
					onClick={ onCloseHistory }
				>
					<svg xmlns="http://www.w3.org/2000/svg" width="48" height="45" viewBox="0 0 48 45">
						<line x1="22" y1="17" x2="33" y2="28" fill="none" stroke="#fff" strokeMiterlimit="10" strokeWidth="1.5"/>
						<line x1="22" y1="28" x2="33" y2="17" fill="none" stroke="#fff" strokeMiterlimit="10" strokeWidth="1.5"/>
					</svg>
				</Button>
			</div>
			<div className="c-history__list-scroll">
				<ul className="c-history__list">
					{ history.map((item, index) => {
						return <li
							key={ index }
							className="c-history__list-item"
						>
							<Button
								isBare={ true }
								className="c-history__button"
								onClick={ () => onHistoryItemClick(item.result.toString()) }
							>
									<span className="c-history__result">
										{ addCommas(item.result) }
									</span>
									<Equation
										className="c-history__equation"
										equation={ item.equ }
									/>
							</Button>
						</li>
					}) }
				</ul>
			</div>
		</div>
	);
};
