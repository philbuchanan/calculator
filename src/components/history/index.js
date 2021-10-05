import React from 'react';

import { Button, Equation, Panel, PanelBody } from '../../components';
import { addCommas, classnames } from '../../utils';
import './index.scss';

export default ({
	state,
	dispatch,
	onOpenHistory,
	onCloseHistory,
	isOpen = false,
}) => {
	const {
		history,
	} = state;

	return (
		<Panel
			icon={
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="currentcolor">
					<path fillRule="evenodd" d="M1.643 3.143L.427 1.927A.25.25 0 000 2.104V5.75c0 .138.112.25.25.25h3.646a.25.25 0 00.177-.427L2.715 4.215a6.5 6.5 0 11-1.18 4.458.75.75 0 10-1.493.154 8.001 8.001 0 101.6-5.684zM7.75 4a.75.75 0 01.75.75v2.992l2.028.812a.75.75 0 01-.557 1.392l-2.5-1A.75.75 0 017 8.25v-3.5A.75.75 0 017.75 4z"></path>
				</svg>
			}
			title="History"
			isOpen={ isOpen }
			onOpenPanel={ onOpenHistory }
			onClosePanel={ onCloseHistory }
		>
			<PanelBody isPadded={ false }>
				<ul className="c-history__list">
					{ history.map((item, index) => {
						return <li
							key={ index }
							className="c-history__list-item"
						>
							<Button
								isBare={ true }
								className="c-history__button"
								onClick={ () => {
									onCloseHistory();
									dispatch({
										type: 'appendDigit',
										value: item.result,
									});
								} }
							>
								<span className="c-history__result">
									{ addCommas(item.result) }
								</span>
								<Equation
									className="c-history__equation"
									equation={ item.eq }
								/>
							</Button>
						</li>
					}) }
				</ul>
			</PanelBody>
		</Panel>
	);
};
