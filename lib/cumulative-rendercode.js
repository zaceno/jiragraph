const [firstDay, baseDone] = SERIES.done[0]
const lastDay = dateToDay(END_DATE, START_DATE)
const dayDiff = lastDay - firstDay
const bottom = [
	[0, 0],
	[SERIES.done[SERIES.done.length - 1][0] - firstDay, 0],
]
const cdone = SERIES.done.map(([day, value]) => [day - firstDay, value - baseDone])
const cdoing = SERIES.doing.map(([day, value], index) => [day - firstDay, value + cdone[index][1]])
const ctodo = SERIES.todo.map(([day, value], index) => [day - firstDay, value + cdoing[index][1]])
const ymax = ctodo.reduce((max, [day, val]) => (val > max ? val : max), 0) * 1.1
const ctx = graph(document.querySelector("canvas"), {
	title: TITLE,
	xmax: dayDiff * 1.1,
	xtick: 5,
	xlabel: x => {
		const d = new Date(dayToDate(x + firstDay, START_DATE))
		return `${d.getDate()}/${d.getMonth() + 1}`
	},
	ymax,
	ytick: POINT_TICK || 10,
})
plotArea(ctx, ctodo, cdoing, "#77777733")
plotArea(ctx, cdoing, cdone, "#0000ff33")
plotArea(ctx, cdone, bottom, "#00ff0033")
plotLines(
	ctx,
	[
		[lastDay, ymax],
		[lastDay, 0],
	],
	1,
	"red"
)
plotLines(ctx, cdone, 2, "green")
plotLines(ctx, cdoing, 2, "blue")
plotLines(ctx, ctodo, 2, "#777777")
