// storing users' axes selections
function getXAxis() {
  let xAxis = document.getElementById("axisX").value;
  console.log(xAxis);
  return xAxis;
}

function getYAxis() {
  let yAxis = document.getElementById("axisY").value;
  console.log(yAxis);
  return yAxis;
}

getXAxis();
getYAxis();

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
      switch (getXAxis()) {
        case "popularity":
          return xScale(d.popularity);
          break;
        case "danceability":
          return xScale(d.danceability * 100);
          break;
        case "energy":
          return xScale(d.energy * 100);
          break;
        case "speechiness":
          return xScale(d.speechiness * 100);
          break;
        case "instrumentalness":
          return xScale(d.instrumentalness * 100);
          break;
        case "tempo":
          return xScale(d.tempo);
          break;
        case "loudness":
          return xScale(d.loudness * 100);
          break;
        case "acousticness":
          return xScale(d.acousticness * 100);
          break;
        case "liveness":
          return xScale(d.liveness * 100);
          break;
        case "valence":
          return xScale(d.valence * 100);
          break;
        default:
          break;
      }
    })
    .attr("cy", function (d) {
      switch (getYAxis()) {
        case "popularity":
          return yScale(d.popularity);
          break;
        case "danceability":
          return yScale(d.danceability * 100);
          break;
        case "energy":
          return yScale(d.energy * 100);
          break;
        case "speechiness":
          return yScale(d.speechiness * 100);
          break;
        case "instrumentalness":
          return yScale(d.instrumentalness * 100);
          break;
        case "tempo":
          return yScale(d.tempo);
          break;
        case "loudness":
          return yScale(d.loudness * 100);
          break;
        case "acousticness":
          return yScale(d.acousticness * 100);
          break;

        case "liveness":
          return xScale(d.liveness * 100);
          break;
        case "valence":
          return xScale(d.valence * 100);
          break;
        default:
          break;
      }
    })
    .attr("r", 2)
    .attr("transform", "translate(" + 100 + "," + 100 + ")")
    .style("fill", "palevioletred");
  // .on("mouseover", function (d) {
  //   d3.select(this).attr("r", 10).style("fill", "red");
  // })
  // .on("mouseout", function (d) {
  //   d3.select(this).attr("r", 10).style("fill", "black");
  // });
});
