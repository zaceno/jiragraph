/*
Injected functions: graph, plotLines, dayToDate
Injected variables: SERIES, TITLE, START_DATE, END_DATE, POINT_TICK
*/

//Find the latest point scope,
const length = SERIES.todo.length

//find the current scope:
const scope = SERIES.todo[length - 1][1] + SERIES.doing[length - 1][1] + SERIES.done[length - 1][1]

const firstDay = SERIES.todo[0][0]
const lastDay = dateToDay(END_DATE, START_DATE)
const dayDiff = lastDay - firstDay

//transform done series to burndown series:
const burndown = SERIES.done.map(([day, done]) => [day - firstDay, scope - done])
const maxPoints = burndown[0][1]
const idealline = [
	[0, maxPoints],
	[dayDiff, 0],
]
const ctx = graph(document.querySelector("canvas"), {
	pagebg: "black",
	graphbg: "blue",
	color: "white",
	title: TITLE,
	xmax: dayDiff * 1.1,
	xtick: 5,
	ymax: maxPoints * 1.1,
	ytick: POINT_TICK,
	ylabel: y => y,
	xlabel: x => {
		let isoDate = dayToDate(x + firstDay, START_DATE)
		let d = new Date(isoDate)
		let m = d.getMonth()
		let dd = d.getDate()
		return `${dd}/${m + 1}`
	},
})
plotLines(ctx, burndown, 8, "red")
plotLines(ctx, idealline, 1, "#55aaff")
