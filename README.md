# Purpose:

For a period of time, graphically track progress of a project/team toward some target or goal, whose work-items are managed in Jira.

Requires node v 18 or later

# Usage:

## 1 Make a config file

Make your own copy of the config.mjs-example

> cp config.mjs-example my-project-config.mjs

Edit the file to your specific project. That includes naming the files produced, specifying the JQL query to use, the time period we're tracking for, and the mode of tracking (Kanban/Scrum) et c.

## 2 Run the script

> node run.mjs ./my-project-config.mjs

Three files are produced from this, named and located according to your specification
in the config file:

-   the series-file: a json file containing the time series of todo, doing and done points for each of the days that you run this script
-   the burndown.html file. A self contained html file that renders a burndown graph based on the current timeseries
-   the cumulative.html file. A self contained html file that renders a cumulative flow graph based on the current timeseries

## 3 Run the script again

In order to get value from this you should run the script daily, in order to have sufficient data in the time-series to draw conclusions from trends in the burndown and cumulative flow graphs.
