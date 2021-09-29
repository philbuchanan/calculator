export default function compute(equation, decimals = 2) {
	if (equation.length === 0) {
		return 0;
	}

	const equationString = equation.join('');
	const round = Math.pow(10, decimals);
	let result = null;

	try {
		result = eval(equationString);
	}
	catch(err) {
		return null;
	}

	return Math.round(result * round) / round;
}
