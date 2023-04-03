// storing users' axes selections
function getScatterplotXAxis() {
  const xAxis = document.getElementById("axisX").value;
  return xAxis;
}

function getScatterplotYAxis() {
  const yAxis = document.getElementById("axisY").value;
  return yAxis;
}

// plot the given data row onto the graph given a scale function and axis calculating function
function scalePoint(d, scaleFunction, axisFunction) {
  switch (axisFunction()) {
    case "popularity":
      return scaleFunction(d.popularity);
    case "danceability":
      return scaleFunction(d.danceability * 100);
    case "energy":
      return scaleFunction(d.energy * 100);
    case "speechiness":
      return scaleFunction(d.speechiness * 100);
    case "instrumentalness":
      return scaleFunction(d.instrumentalness * 100);
    case "tempo":
      return scaleFunction(d.tempo);
    case "loudness":
      return scaleFunction(d.loudness * 100);
    case "acousticness":
      return scaleFunction(d.acousticness * 100);
    case "liveness":
      return scaleFunction(d.liveness * 100);
    case "valence":
      return scaleFunction(d.valence * 100);
    default:
      break;
  }
}

// frame for scatterplot
const svg = d3
    .select("#vis1")
    .append("svg")
    .attr("width", 1000)
    .attr("height", 1000),
  margin = 200,
  width = svg.attr("width") - margin,
  height = svg.attr("height") - margin;

// scaling function
const xScale = d3.scaleLinear().domain([0, 100]).range([0, width]),
  yScale = d3.scaleLinear().domain([0, 100]).range([height, 0]);

// axes for scatterplot
const g = svg
  .append("g")
  .attr("transform", "translate(" + 100 + "," + 100 + ")");

g.append("g")
  .attr("transform", "translate(0," + height + ")")
  .call(d3.axisBottom(xScale));

g.append("g").call(d3.axisLeft(yScale));

const SCATTER_PLOT_TOOLTIP = d3
  .select("#vis1")
  .append("div")
  .attr("class", "scatter-tooltip")
  .style("display", "none");

function handleScatterplotMouseover(event, d) {
  event.target.style.fill = "#a7b0ca";
  SCATTER_PLOT_TOOLTIP.style("display", "block");
}

function handleScatterplotMouseleave(event, d) {
  event.target.style.fill = "#725e54";
  SCATTER_PLOT_TOOLTIP.style("display", "none");
}

function handleScatterplotMousemove(event, d) {
  let xValue = d[getScatterplotXAxis()];
  let yValue = d[getScatterplotYAxis()];
  if (getScatterplotXAxis() !== "popularity") {
    xValue = (xValue * 100).toFixed(2);
  }
  if (getScatterplotYAxis() !== "popularity") {
    yValue = (yValue * 100).toFixed(2);
  }

  SCATTER_PLOT_TOOLTIP.html(
    "track name: " +
      d.track_name +
      "<br/>artist name: " +
      d.artist_name +
      `<br/>${getScatterplotXAxis()}: ${xValue}` +
      `<br/>${getScatterplotYAxis()}: ${yValue}`
  )
    .style("left", event.pageX + 10 + "px")
    .style("top", event.pageY - 50 + "px");
}

// read csv and draw scatter plot points
function drawScatterplotPoints() {
  // remove any previous points
  svg.selectAll("circle").remove();

  // reading in data
  d3.csv("track_data.csv").then((data) => {
    // plot
    svg
      .append("g")
      .selectAll("dot")
      .data(
        data.filter((_) => {
          const num = Math.random();
          return num < 0.05;
        })
      )
      .enter()
      .append("circle")
      .attr("cx", function (d) {
        return scalePoint(d, xScale, getScatterplotXAxis);
      })
      .attr("cy", function (d) {
        return scalePoint(d, yScale, getScatterplotYAxis);
      })
      .attr("r", 4)
      .attr("transform", "translate(" + 100 + "," + 100 + ")")
      .style("fill", "#725e54")
      .on("mouseover", handleScatterplotMouseover)
      .on("mouseleave", handleScatterplotMouseleave)
      .on("mousemove", handleScatterplotMousemove);
  });
}

// changing the axes will update the graph
function updateScatterplot() {
  drawScatterplotPoints();
}

// initial reading of the data
d3.csv("track_data.csv").then((data) => {
  // logging 10 lines of data
  for (i = 0; i < 10; i++) {
    console.log(data[i]);
  }

  // plot
  drawScatterplotPoints();
});

// get playlist user has selected
function getPlaylist() {
  const playlist = document.getElementById("playlistSelect").value;
  return playlist;
}
// bar chart
const barChart = d3
    .select("#vis2")
    .append("svg")
    .attr("height", 400)
    .attr("width", 900),
  barChartMargin = 40,
  barChartWidth = barChart.attr("width") - barChartMargin,
  barChartHeight = barChart.attr("height") - barChartMargin;

// list of attributes to display in bar chart
const barChartAttributes = [
  "popularity",
  "danceability",
  "energy",
  "speechiness",
  "instrumentalness",
  "loudness",
  "acousticness",
  "liveness",
  "valence",
];

const scaleBarXAxis = d3
  .scaleBand()
  .domain(barChartAttributes)
  .range([0, barChartWidth - barChartMargin]);
const scaleBarYAxis = d3
  .scaleLinear()
  .domain([0, 100])
  .range([barChartHeight - barChartMargin, 0]);
// x axis
const barChartAxes = barChart
  .append("g")
  .attr("transform", `translate(${barChartMargin},${barChartHeight})`)
  .call(d3.axisBottom(scaleBarXAxis));
// y axis
barChartAxes
  .append("g")
  .attr("transform", `translate(0, ${-(barChartHeight - barChartMargin)})`)
  .call(d3.axisLeft(scaleBarYAxis));

// scale function for height of each bar
const barHeightScale = d3
  .scaleLinear()
  .domain([0, 100])
  .range([0, barChartHeight - barChartMargin]);

const BAR_CHART_TOOLTIP = d3
  .select("#vis2")
  .append("div")
  .attr("class", "bar-tooltip")
  .style("display", "none");

function handleBarChartMouseover(event, d) {
  event.target.style.fill = "#a7b0ca";
  BAR_CHART_TOOLTIP.style("display", "block");
}

function handleBarChartMouseleave(event, d) {
  event.target.style.fill = "#725e54";
  BAR_CHART_TOOLTIP.style("display", "none");
}

function handleBarChartMousemove(event, d) {
  // let xValue = d[getScatterplotXAxis()];
  // let yValue = d[getScatterplotYAxis()];
  // if (getScatterplotXAxis() !== "popularity") {
  //   xValue = (xValue * 100).toFixed(2);
  // }
  // if (getScatterplotYAxis() !== "popularity") {
  //   yValue = (yValue * 100).toFixed(2);
  // }

  BAR_CHART_TOOLTIP.html(`average ${event.target.id}: ${d.toFixed(2)}`)
    .style("left", event.pageX + 10 + "px")
    .style("top", event.pageY - 50 + "px");
}

// draw the bars on the bar chart
// reads from csv for now
function drawBarChartBars() {
  d3.csv("track_data.csv").then((data) => {
    // remove previous bars
    barChart.selectAll("rect").remove();

    // choose songs based on selected playlist
    // will be changed
    let songs = [];
    switch (getPlaylist()) {
      case "likedsongs":
        data.forEach((d, i) => {
          if (i % 150 === 0) {
            songs.push(d);
          }
        });
        break;
      case "chillvibes":
        songs = data.filter((d) => d.energy < 0.5);
        break;
      case "tswift":
        songs = data.filter((d) => d.artist_name.includes("Taylor Swift"));
        break;
      case "garbage":
        songs = data.filter((d) => d.artist_name.includes("AJR"));
    }

    // construct each bar height in the graph by calculating averages
    // function to calculate average
    function calcAverage(songs, attribute) {
      let avg = 0;
      songs.forEach((song) => {
        let songAttribute = Number(song[attribute]);
        if (attribute !== "popularity") {
          // popularity is from 0-100 while all others are 0-1
          songAttribute = songAttribute * 100;
        }
        avg += songAttribute;
      });
      avg /= songs.length;
      return avg;
    }
    // bars is just a list of numbers representing averages in each attribute
    // (which will be scaled to the height o each bar in the chart)
    const bars = [];
    barChartAttributes.forEach((attribute) => {
      bars.push(calcAverage(songs, attribute));
    });

    // draw bars
    barChart
      .append("g")
      .selectAll("rect")
      .data(bars)
      .enter()
      .append("rect")
      .attr("width", scaleBarXAxis.bandwidth())
      .attr("height", function (d) {
        return barHeightScale(d);
      })
      .attr("x", function (_, i) {
        return barChartMargin + scaleBarXAxis.bandwidth() * i;
      })
      .attr("y", function (d) {
        return barChartHeight - barHeightScale(d);
      })
      .attr("fill", "#725e54") // spotify green :)
      .attr("stroke", "black")
      .attr("id", function (_, i) {
        return barChartAttributes[i];
      })
      .on("mouseover", handleBarChartMouseover)
      .on("mouseleave", handleBarChartMouseleave)
      .on("mousemove", handleBarChartMousemove);
  });
}

// changing user playlist will update the graph
function updateBarChart() {
  drawBarChartBars();
}

// initial read of data
drawBarChartBars();
