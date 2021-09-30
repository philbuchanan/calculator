export default function addCommas(number) {
	if (!number || isNaN(number)) {
		return number;
	}

	const parts = number.toString().split('.');
	const regx = /(\d+)(\d{3})/;
	let integer = parts[0];
	let fraction = '';

	// Add commas to integer part
	while (regx.test(integer)) {
		integer = integer.replace(regx, '$1' + ',' + '$2');
	}

	// Add fractional part
	if (parts.length > 1) {
		fraction = '.' + parts[1];
	}

	return integer + fraction;
};
