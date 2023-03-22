// storing users' axes selections
function getXAxis() {
  const xAxis = document.getElementById("axisX").value;
  return xAxis;
}

function getYAxis() {
  const yAxis = document.getElementById("axisY").value;
  return yAxis;
}

// plot the given data row onto the graph given a scale function and axis calculating function
function plot(d, scaleFunction, axisFunction) {
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

const TOOLTIP = d3
  .select("#vis1")
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

function handleMouseover(event, d) {
  event.target.style.fill = "#1DB954";
  TOOLTIP.style("opacity", 1);
}

function handleMouseleave(event, d) {
  event.target.style.fill = "palevioletred";
  TOOLTIP.style("opacity", 0);
}

function handleMousemove(event, d) {
  let xValue = d[getXAxis()];
  let yValue = d[getYAxis()];
  if (getXAxis() !== "popularity" && getXAxis() !== "tempo") {
    xValue = (xValue * 100).toFixed(2);
  }
  if (getYAxis() !== "popularity" && getYAxis() !== "tempo") {
    yValue = (yValue * 100).toFixed(2);
  }

  TOOLTIP.html(
    "track name: " +
      d.track_name +
      "<br/>artist name: " +
      d.artist_name +
      `<br/>${getXAxis()}: ${xValue}` +
      `<br/>${getYAxis()}: ${yValue}`
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
        return plot(d, xScale, getXAxis);
      })
      .attr("cy", function (d) {
        return plot(d, yScale, getYAxis);
      })
      .attr("r", 4)
      .attr("transform", "translate(" + 100 + "," + 100 + ")")
      .style("fill", "palevioletred")
      .on("mouseover", handleMouseover)
      .on("mouseleave", handleMouseleave)
      .on("mousemove", handleMousemove);
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
const attributes = [
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
  .domain(attributes)
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
          songAttribute = songAttribute * 100;
        }
        avg += songAttribute;
      });
      avg /= songs.length;
      return avg;
    }
    // bars is just a list of numbers representing averages in each attribute
    const bars = [];
    attributes.forEach((attribute) => {
      bars.push(calcAverage(songs, attribute));
    });

    // scale function for height of each bar
    const barHeightScale = d3
      .scaleLinear()
      .domain([0, 100])
      .range([0, barChartHeight - barChartMargin]);

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
      .attr("fill", "#1DB954") // spotify green :)
      .attr("stroke", "black");
  });
}

// changing user playlist will update the graph
function updateBarChart() {
  drawBarChartBars();
}

// initial read of data
drawBarChartBars();
