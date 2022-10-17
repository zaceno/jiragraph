/*

This module translates each weekday from a given start date into a
consecutive day-number. Or a day-number back into a date.

*/

const MILLIS_PER_DAY = 1000 * 60 * 60 * 24

/**
 * @param {string} date - ISO date format string YYYY-MM-DD
 * @param {string} dayZero - ISO date format string YYYY-MM-DD
 */
export const dateToDay = (date, dayZero) => {
	const tt = new Date(date).getTime()
	let current = new Date(dayZero).getTime()
	let weekdays = 0
	while (current !== tt) {
		let mod = tt > current ? 1 : -1
		current = current + mod * MILLIS_PER_DAY
		let wd = new Date(current).getDay()
		if (wd > 0 && wd < 6) weekdays = weekdays + mod
	}
	return weekdays
}

/**
 * @param {number} day - ISO date format string YYYY-MM-DD
 * @param {string} dayZero - ISO date format string YYYY-MM-DD
 */
export const dayToDate = (day, dayZero) => {
	let currentday = 0
	let currentmillis = new Date(dayZero).getTime()
	while (currentday !== day) {
		let mod = currentday < day ? 1 : -1
		currentmillis = currentmillis + mod * MILLIS_PER_DAY
		let wd = new Date(currentmillis).getDay()
		if (wd > 0 && wd < 6) currentday = currentday + mod
	}
	return new Date(currentmillis)
}

/**
 * @param {string} dayZero - ISO date format string YYYY-MM-DD
 */
export const todayDay = dayZero => {
	const tt = new Date(new Date().toISOString().substring(0, 10)).getTime()
	let current = new Date(dayZero).getTime()
	let weekdays = 0
	while (current !== tt) {
		let mod = tt > current ? 1 : -1
		current = current + mod * MILLIS_PER_DAY
		let wd = new Date(current).getDay()
		if (wd > 0 && wd < 6) weekdays = weekdays + mod
	}
	return weekdays
}
