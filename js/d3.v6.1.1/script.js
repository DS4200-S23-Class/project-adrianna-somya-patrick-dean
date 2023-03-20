// storing users' axes selections
function getXAxis() {
  let xAxis = document.getElementById("axisX").value;
  console.log(xAxis);
  return xAxis;
}

function getYAxis() {
  let yAxis = document.getElementById("axisY").value;
  // console.log(yAxis);
  return yAxis;
}

// changing the axes will update the graph
function updateGraph() {
  svg.selectAll("circle").remove();

  // reading in data
  return d3.csv("track_data.csv").then((data) => {
    // plot
    svg
      .append("g")
      .selectAll("dot")
      .filter((d) => {
        let num = Math.random();
        return num < 0.05;
      })
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", function (d) {
        return plot(d, xScale, getXAxis);
      })
      .attr("cy", function (d) {
        return plot(d, yScale, getYAxis);
      })
      .attr("r", 2)
      .attr("transform", "translate(" + 100 + "," + 100 + ")")
      .style("fill", "palevioletred");
  });
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
let svg = d3
    .select("#vis1")
    .append("svg")
    .attr("width", 1000)
    .attr("height", 1000),
  margin = 200,
  width = svg.attr("width") - margin,
  height = svg.attr("height") - margin;

// scaling function
let xScale = d3.scaleLinear().domain([0, 100]).range([0, width]),
  yScale = d3.scaleLinear().domain([0, 100]).range([height, 0]);

// axes for scatterplot
let g = svg.append("g").attr("transform", "translate(" + 100 + "," + 100 + ")");

g.append("g")
  .attr("transform", "translate(0," + height + ")")
  .call(d3.axisBottom(xScale));

g.append("g").call(d3.axisLeft(yScale));

// reading in the data
d3.csv("track_data.csv").then((data) => {
  // plot

  svg
    .append("g")
    .selectAll("dot")
    .filter((d) => {
      let num = Math.random();
      return num < 0.05;
    })
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", function (d) {
      return plot(d, xScale, getXAxis);
    })
    .attr("cy", function (d) {
      return plot(d, yScale, getYAxis);
    })
    .attr("r", 2)
    .attr("transform", "translate(" + 100 + "," + 100 + ")")
    .style("fill", "palevioletred");
});
