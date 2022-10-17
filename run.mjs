import fs from "fs"
import { todayDay } from "./lib/days.mjs"

/**
 * @typedef Config
 * @prop {string} JIRA_API_URL
 * @prop {string} JIRA_AUTH_USER
 * @prop {string} JIRA_AUTH_PASS
 * @prop {string} JIRA_SPRINT_FIELD
 * @prop {string} JIRA_POINTS_FIELD
 * @prop {string} PERIOD_START_DATE
 * @prop {string} PERIOD_END_DATE
 * @prop {'kanban' | 'scrum'} BOARD_MODE
 * @prop {string} KANBAN_TODO_STATUS
 * @prop {string} SCRUM_TARGET_ISSUE_KEY
 * @prop {string} ISSUES_JQL
 * @prop {string[]} DONE_STATUSES
 * @prop {string} TIMESERIES_DATA_FILE
 * @prop {string} BURNDOWN_GRAPH_TITLE
 * @prop {string} BURNDOWN_OUTPUT_FILE
 * @prop {string} CUMULATIVE_GRAPH_TITLE
 * @prop {string} CUMULATIVE_OUTPUT_FILE
 * @prop {string} GRAPH_POINT_TICK
 */

const setEventOnSeries = (series, time, value) => [...series.filter(e => e[0] !== time), [time, value]]

const scrumFilter = (issues, targetIssueKey, sprintField) => {
	const targetIssueIndex = issues.findIndex(issue => issue.key === targetIssueKey)
	return issues.filter((issue, index) => {
		const isRanked = index < targetIssueIndex
		const isDone = issue.fields.status.statusCategory.name === "Done"
		const isInSprint =
			!!issue.fields[sprintField] &&
			issue.fields[sprintField].reduce(
				(acc, str) => acc || !!str.match(/state=FUTURE/) || !!str.match(/state=ACTIVE/),
				false
			)
		return isRanked || isDone || isInSprint
	})
}

const kanbanFilter = (issues, todoStatus) =>
	issues.filter(issue => {
		const done = issue.fields.status.statusCategory.name === "Done"
		const doing = issue.fields.status.statusCategory.name === "In Progress"
		const todo = issue.fields.status.name === todoStatus
		return done || doing || todo
	})

async function run() {
	const config = /**@type{Config}*/ (await import(process.argv[2]))
	const authToken = Buffer.from(`${config.JIRA_AUTH_USER}:${config.JIRA_AUTH_PASS}`).toString("base64")
	const authHeader = { Authorization: `Basic ${authToken}` }
	const dateFilter = `(status was not in (${config.DONE_STATUSES.join(", ")}) on ${
		config.PERIOD_START_DATE
	} OR createdDate > ${config.PERIOD_START_DATE})`
	const jql = `${config.ISSUES_JQL} AND ${dateFilter} ORDER BY Rank ASC`
	console.log("FETCHING", jql)
	const queryUrl = `${config.JIRA_API_URL}/search?maxResults=-1&jql=${encodeURIComponent(jql)}`
	const issues = await fetch(queryUrl, { headers: authHeader })
		.then(x => x.json())
		.then(x => x.issues)
	const filteredIssues =
		config.BOARD_MODE === "kanban"
			? kanbanFilter(issues, config.KANBAN_TODO_STATUS)
			: scrumFilter(issues, config.SCRUM_TARGET_ISSUE_KEY, config.JIRA_SPRINT_FIELD)
	console.log("RESULTING ISSUES", issues.length, "FILTERED TO:", filteredIssues.length)

	const points = { todo: 0, doing: 0, done: 0 }
	filteredIssues.forEach(issue => {
		let p = issue.fields[config.JIRA_POINTS_FIELD] || 0
		let s = issue.fields.status.statusCategory.name
		if (s == "To Do") points.todo += p
		if (s == "In Progress") points.doing += p
		if (s == "Done") points.done += p
	})
	const D = todayDay(config.PERIOD_START_DATE)
	let series
	try {
		series = JSON.parse(fs.readFileSync(config.TIMESERIES_DATA_FILE))
	} catch (e) {
		series = { todo: [], doing: [], done: [] }
	}
	console.log("READING EXISTING SERIES FROM", config.TIMESERIES_DATA_FILE)

	series.todo = setEventOnSeries(series.todo, D, points.todo)
	series.doing = setEventOnSeries(series.doing, D, points.doing)
	series.done = setEventOnSeries(series.done, D, points.done)

	console.log("TODAY:", D, "POINTS:", JSON.stringify(points))
	console.log("WRITING UPDATED SERIES", config.TIMESERIES_DATA_FILE)
	fs.writeFileSync(config.TIMESERIES_DATA_FILE, JSON.stringify(series))

	const baseHTML = fs
		.readFileSync("lib/html.tpl", "utf-8")
		.replace(
			"%%%INCLUDES%%%",
			`
${fs.readFileSync("./lib/days.mjs")}
${fs.readFileSync("./lib/graph.mjs")}`
		)
		.replace("%%%START_DATE%%%", config.PERIOD_START_DATE)
		.replace("%%%END_DATE%%%", config.PERIOD_END_DATE)
		.replace("%%%SERIES%%%", JSON.stringify(series))
		.replace("%%%POINT_TICK%%%", config.GRAPH_POINT_TICK)

	console.log("WRITING BURNDOWN FILE", config.BURNDOWN_OUTPUT_FILE)

	fs.writeFileSync(
		config.BURNDOWN_OUTPUT_FILE,
		baseHTML
			.replace("%%%TITLE%%%", config.BURNDOWN_GRAPH_TITLE)
			.replace("%%%RENDERCODE%%%", fs.readFileSync("./lib/burndown-rendercode.js", "utf-8"))
	)

	console.log("WRITING CUMULATIVE FILE", config.CUMULATIVE_OUTPUT_FILE)

	fs.writeFileSync(
		config.CUMULATIVE_OUTPUT_FILE,
		baseHTML
			.replace("%%%TITLE%%%", config.CUMULATIVE_GRAPH_TITLE)
			.replace("%%%RENDERCODE%%%", fs.readFileSync("./lib/cumulative-rendercode.js", "utf-8"))
	)
}

run()
