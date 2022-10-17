function strokePixels(ctx, n) {
	ctx.save()
	ctx.setTransform(1, 0, 0, 1, 0, 0)
	ctx.lineWidth = n
	ctx.stroke()
	ctx.restore()
}

const DEFAULTS = {
	pagebg: "white",
	graphbg: "white",
	color: "black",
	xmax: 10,
	ymax: 10,
	xtick: 1,
	ytick: 1,
	xlabel: x => x,
	ylabel: x => x,
	title: "graph",
}

export function graph(canvas, axesConfig = {}) {
	axesConfig = { ...DEFAULTS, ...axesConfig }
	let { width, height } = canvas.getBoundingClientRect()
	canvas.width = width
	canvas.height = height
	const ctx = canvas.getContext("2d")

	//fill entire backdrop
	ctx.font = "18px monospace"
	ctx.fillStyle = axesConfig.pagebg
	ctx.lineWidth = 3
	ctx.strokeStyle = axesConfig.color
	ctx.fillRect(0, 0, width, height)

	//print the title
	ctx.save()
	ctx.font = "25px monospace"
	ctx.fillStyle = axesConfig.color
	ctx.textAlign = "center"
	ctx.fillText(axesConfig.title, width * 0.5, 0.07 * height)
	ctx.restore()

	//prepare graphing area within full area
	ctx.translate(width * 0.07, height * 0.12)
	ctx.scale(0.88, 0.8)
	ctx.fillStyle = axesConfig.graphbg
	ctx.fillRect(0, 0, width, height)
	ctx.scale(width / axesConfig.xmax, -height / axesConfig.ymax)
	ctx.translate(0, -axesConfig.ymax)

	//draw the axes
	ctx.beginPath()
	ctx.moveTo(0, axesConfig.ymax)
	ctx.lineTo(0, 0)
	ctx.lineTo(axesConfig.xmax, 0)
	strokePixels(ctx, 2)

	ctx.save()
	for (let x = axesConfig.xtick; x < axesConfig.xmax; x += axesConfig.xtick) {
		ctx.translate(axesConfig.xtick, 0)
		ctx.beginPath()
		ctx.moveTo(0, axesConfig.ymax)
		ctx.lineTo(0, 0)
		strokePixels(ctx, 0.5)

		ctx.save()
		let { e, f } = ctx.getTransform()
		ctx.setTransform(1, 0, 0, 1, e, f)
		ctx.fillStyle = axesConfig.color
		ctx.textAlign = "center"
		ctx.fillText(axesConfig.xlabel(x), 0, 20)
		ctx.restore()
	}
	ctx.restore()

	ctx.save()
	for (let y = axesConfig.ytick; y < axesConfig.ymax; y += axesConfig.ytick) {
		ctx.translate(0, axesConfig.ytick)
		ctx.beginPath()
		ctx.moveTo(0, 0)
		ctx.lineTo(axesConfig.xmax, 0)
		strokePixels(ctx, 0.5)

		ctx.save()
		let { e, f } = ctx.getTransform()
		ctx.setTransform(1, 0, 0, 1, e, f)
		ctx.fillStyle = axesConfig.color
		ctx.textAlign = "right"
		ctx.fillText(axesConfig.ylabel(y), -10, 5)
		ctx.restore()
	}
	ctx.restore()

	return ctx
}

export const plotLines = (ctx, series, size, color) => {
	ctx.save()
	ctx.beginPath()
	ctx.moveTo(series[0][0], series[0][1])
	series.slice(1).forEach(([x, y]) => {
		ctx.lineTo(x, y)
	})
	ctx.strokeStyle = color
	strokePixels(ctx, size)
	ctx.restore()
}

export const plotArea = (ctx, seriesA, seriesB, color) => {
	ctx.save()
	ctx.beginPath()
	ctx.moveTo(seriesA[0][0], seriesA[0][1])
	for (let i = 1; i < seriesA.length; i++) {
		ctx.lineTo(seriesA[i][0], seriesA[i][1])
	}
	for (let i = seriesB.length - 1; i >= 0; i--) {
		ctx.lineTo(seriesB[i][0], seriesB[i][1])
	}
	ctx.closePath()
	ctx.fillStyle = color
	ctx.fill()
	ctx.restore()
}
