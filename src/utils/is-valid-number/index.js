/**
 * Is the given number a valid number (e.g. -12.34)
 *
 * @param num double The number to test
 * return bool True if valid, else false
 *
 * Regex explanation:
 * ^              Match at start of string
 * \-?            Optional negative
 * 0|             Zero, or
 * 0(?!\.)|       Zero if followed by decimal, or
 * ([1-9]{1}\d*)| Exactly one 1-9 and zero or more digits, or
 * \.(?!\.)\d*    A decimal only if not followed by another decimal plus zero or
  *               more digits
 * (\.\d*){0,1}   Only one grouping of a decimal and zero or more digits
 * $              Match end of string
 */
export default function isValidNumber(number) {
	return /^\-?(0|0(?!\.)|([1-9]{1}\d*)|\.(?!\.)\d*)(\.\d*){0,1}$/.test(number);
}
