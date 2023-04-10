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
    .attr("width", 575)
    .attr("height", 575),
  margin = 30,
  width = svg.attr("width") - margin,
  height = svg.attr("height") - margin;

// scaling functions
const xScale = d3
    .scaleLinear()
    .domain([0, 100])
    .range([0, width - margin]),
  yScale = d3
    .scaleLinear()
    .domain([0, 100])
    .range([height - margin, 0]);

// axes for scatterplot
const scatterplotAxes = svg
  .append("g")
  .attr("transform", `translate(${margin},${height})`)
  .call(d3.axisBottom(xScale));

scatterplotAxes
  .append("g")
  .attr("transform", `translate(0, ${-(height - margin)})`)
  .call(d3.axisLeft(yScale));

const SCATTER_PLOT_TOOLTIP = d3
  .select("#vis1")
  .append("div")
  .attr("class", "scatter-tooltip")
  .style("display", "none");

// initial playlist declaration
// a map where playlist name => songs in playlist
const playlists = new Map();

// get playlist user has selected
function getSelectedPlaylist() {
  const playlist = document.getElementById("playlistSelect").value;
  return playlist;
}

// adds a new empty playlist
function addPlaylist(name) {
  if (!playlists.has(name) && name !== "") {
    playlists.set(name, []);

    // adds playlist to playlist dropdown
    const dropdown = document.getElementById("playlistSelect");
    const option = document.createElement("option");
    option.value = name;
    option.text = name;
    dropdown.appendChild(option);
  }
}

// add a playlist using the text input
function addNewPlaylist() {
  const textInput = document.getElementById("newPlaylistName");
  if (!playlists.has(textInput.value) && textInput.value !== "") {
    addPlaylist(textInput.value);
    // add to dropdown in modal
    const dropdown = document.getElementById("addSongToPlaylist");
    const option = document.createElement("option");
    option.value = textInput.value;
    option.text = textInput.value;
    dropdown.appendChild(option);
    textInput.value = "";
  }
}

function addSongToPlaylist() {
  const playlist = document.getElementById("addSongToPlaylist").value;
  playlists.set(playlist, [...playlists.get(playlist), selectedSong]);

  drawBarChartBars();
  updateSongList();
}

// start with an empty liked songs playlist
addPlaylist("Liked Songs");

// disliked songs
const dislikedSongs = [];

// song the user clicked on most recently
let selectedSong = undefined;

function likeSong() {
  // add to liked songs playlist
  playlists.set("Liked Songs", [...playlists.get("Liked Songs"), selectedSong]);
  // rerender bar graph
  drawBarChartBars();
  // rerender song list
  updateSongList();
}

function dislikeSong() {
  // dislike
  dislikedSongs.push(selectedSong);
  // remove from viz
  d3.select(`#${formatId(selectedSong)}`).remove();
  // update displayed list of disliked
  updateDislikedList();
}

function dislikeSimilarSongs() {
  // find similar songs
  getSimilarSongs(selectedSong).then((similarSongs) => {
    const songsToDislike = similarSongs.filter((song) => {
      return (
        song.track_name !== selectedSong.track_name &&
        song.artist_name !== selectedSong.artist_name
      );
    });
    dislikedSongs.push(...songsToDislike);
    songsToDislike.forEach((song) => {
      d3.select(`#${formatId(song)}`).remove();
    });
    updateDislikedList();
  });
}

// update songs displayed in the current playlist
function updateSongList() {
  const selectedPlaylist = document.getElementById("playlistSelect").value;
  const songList = document.getElementById("song-list");
  while (songList.firstChild) {
    songList.removeChild(songList.firstChild);
  }
  playlists.get(selectedPlaylist).forEach((song) => {
    const div = document.createElement("div");
    div.innerHTML = `${song.track_name} by ${song.artist_name}`;
    songList.appendChild(div);
  });
}

// update disliked songs in HTML
function updateDislikedList() {
  const dislikeList = document.getElementById("dislike-list");
  while (dislikeList.firstChild) {
    dislikeList.removeChild(dislikeList.firstChild);
  }
  dislikedSongs.forEach((song) => {
    const div = document.createElement("div");
    div.innerHTML = `${song.track_name} by ${song.artist_name}`;
    dislikeList.appendChild(div);
  });
}

function handleScatterplotMouseover(event, d) {
  event.target.style.fill = "#b7d5d4";
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
      `<br/>${getScatterplotYAxis()}: ${yValue}` +
      "<br/>click to view song actions"
  )
    .style("left", event.pageX + 10 + "px")
    .style("top", event.pageY - 50 + "px");
}

function handleScatterplotMouseclick(event, d) {
  const SCATTER_PLOT_MODAL_HTML = document.getElementById("song-modal");
  SCATTER_PLOT_MODAL_HTML.style.display = "block";

  const songInfo = document.getElementById("song-info");
  songInfo.innerHTML = `Selected song: ${d.track_name} by ${d.artist_name}`;

  selectedSong = d;

  const addToPlaylist = document.getElementById("addSong");
  if (playlists.size > 1) {
    addToPlaylist.style.display = "block";
  } else {
    addToPlaylist.style.display = "none";
  }

  SCATTER_PLOT_TOOLTIP.style("display", "none");
}

// get a css id for a song
function formatId(d) {
  let id = "t" + d.track_name + d.artist_name;
  id = id.toLowerCase();
  id = id.replace(/\W/g, "");
  return id;
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
        data.filter((d) => {
          const num = Math.random();
          return num < 0.05 && !dislikedSongs.includes(d);
        })
      )
      .enter()
      .append("circle")
      .attr("cx", function (d) {
        return scalePoint(d, xScale, getScatterplotXAxis) + margin;
      })
      .attr("cy", function (d) {
        return scalePoint(d, yScale, getScatterplotYAxis) + margin;
      })
      .attr("r", 4)
      .style("fill", "#725e54")
      .attr("id", function (d) {
        return formatId(d);
      })
      .on("mouseover", handleScatterplotMouseover)
      .on("mouseleave", handleScatterplotMouseleave)
      .on("mousemove", handleScatterplotMousemove)
      .on("click", handleScatterplotMouseclick);
  });
}

// changing the axes will update the graph
function updateScatterplot() {
  drawScatterplotPoints();
}

// initial reading of the data
d3.csv("track_data.csv").then((data) => {
  // logging 10 lines of data
  for (let i = 0; i < 10; i++) {
    //console.log(data[i]);
  }

  // plot
  drawScatterplotPoints();
});

/**
 * Bar chart-relevant code
 */
const barChart = d3
    .select("#vis2")
    .append("svg")
    .attr("height", 400)
    .attr("width", 800),
  barChartMargin = 40,
  barChartWidth = barChart.attr("width") - barChartMargin,
  barChartHeight = barChart.attr("height") - barChartMargin;

barChart
  .append("text")
  .attr("transform", `translate(${barChartMargin},${barChartHeight} + 10)`)
  .attr("x", 350)
  .attr("y", 395)
  .attr("font-size", "15px")
  .text("Song Feature");

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
  event.target.style.fill = "#b7d5d4";
  BAR_CHART_TOOLTIP.style("display", "block");
}

function handleBarChartMouseleave(event, d) {
  event.target.style.fill = "#725e54";
  BAR_CHART_TOOLTIP.style("display", "none");
}

function handleBarChartMousemove(event, d) {
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
    const songs = playlists.get(getSelectedPlaylist());

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
  updateSongList();
}

// initial read of data
drawBarChartBars();

/**
 * Algorithm to find similar songs
 */

// any songs below this threshold is considered to be a similar song
const similarSongThreshold = 0.25;

// pass in a single song object
// return list of song objects similar to given song
async function getSimilarSongs(song) {
  const similarSongs = [];
  console.log("here");
  // needs await
  await d3.csv("track_data.csv").then((data) => {
    const distances = [];

    // iterating through all lines of data
    for (let i = 0; i < data.length; i++) {
      const distance = Math.sqrt(
        Math.pow(song.danceability - data[i].danceability, 2) +
          Math.pow(song.energy - data[i].energy, 2) +
          Math.pow(song.speechiness - data[i].speechiness, 2) +
          Math.pow(song.instrumentalness - data[i].instrumentalness, 2) +
          Math.pow(song.tempo - data[i].tempo, 2) +
          Math.pow(song.loudness - data[i].loudness, 2) +
          Math.pow(song.acousticness - data[i].acousticness, 2) +
          Math.pow(song.liveness - data[i].liveness, 2) +
          Math.pow(song.valence - data[i].valence, 2)
      );

      distances.push({
        song: data[i],
        distance: distance,
      });

      if (distance < similarSongThreshold) {
        similarSongs.push(data[i]);
      }
    }

    // for testing purposes, determining threshold
    // distances.sort((a, b) => a.distance - b.distance);
    // console.log(distances)
  });

  return similarSongs;
}

// testing, uncomment when necessary

// const testSong = {
//   track_name: "Rich Flex",
//   artist_name: "Drake",
//   popularity: 90,
//   danceability: 0.5742067553735927,
//   energy: 0.5215549524228026,
//   speechiness: 0.2554973821989529,
//   instrumentalness: 0,
//   tempo: 0.6958232431769341,
//   loudness: 0.7657296179598267,
//   acousticness: 0.05050032066824055,
//   liveness: 0.3526970954356846,
//   valence: 0.43089430894308944,
// };
// console.log(getSimilarSongs(testSong));
