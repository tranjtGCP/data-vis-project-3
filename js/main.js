let reversed = false;

// Barchart 1
let barchart;
d3.csv(
  "data/num_lines_" + document.getElementById("linesEpisodes").value + ".csv"
)
  .then((data) => {
    data.forEach((d) => {
      d.name = d.name;
      d.num_lines = +d.num_lines;
    });

    // Sort data by population
    data.sort((a, b) => b.num_lines - a.num_lines);

    data = data.filter((d) => d.name !== "Narration");

    let test = document.getElementById("linesEpisodes").value;

    if (document.getElementById("linesEpisodes").value == "chars") {
      data = data.filter((d) => d.num_lines > 40);
    }

    // Initialize chart and then show it
    barchart = new Barchart({ parentElement: "#chart" }, data);
    barchart.updateVis();
  })
  .catch((error) => console.error(error));

// Rerender Barchart 1
function onLinesEpisodesChanged() {
  let newVal = document.getElementById("linesEpisodes").value;
  d3.csv("data/num_lines_" + newVal + ".csv")
    .then((data) => {
      data.forEach((d) => {
        d.name = d.name;
        d.num_lines = +d.num_lines;
      });

      // Sort data by population
      data.sort((a, b) => b.num_lines - a.num_lines);
      data = data.filter((d) => d.name !== "Narration");

      if (document.getElementById("linesEpisodes").value == "chars") {
        data = data.filter((d) => d.num_lines > 50);
      }

      // Initialize chart and then show it
      barchart.data = data;
      barchart.updateVis();
    })
    .catch((error) => console.error(error));
}

// Barchart 2
let barchart2;
d3.csv(
  "data/num_eps_" + document.getElementById("episodeCountSelect").value + ".csv"
)
  .then((data) => {
    data.forEach((d) => {
      d.name = d.name;
      d.num_lines = +d.num_lines;
    });

    // Sort data by population
    data.sort((a, b) => b.num_lines - a.num_lines);
    data = data.filter((d) => d.name !== "Narration");

    if (document.getElementById("episodeCountSelect").value == "chars") {
      data = data.filter((d) => d.num_lines > 5);
    }

    // Initialize chart and then show it
    barchart2 = new Barchart({ parentElement: "#chart2" }, data);
    barchart2.updateVis();
  })
  .catch((error) => console.error(error));

// Rerender Barchart 2
function onLinesEpisodes2Changed() {
  let newVal = document.getElementById("episodeCountSelect").value;
  d3.csv("data/num_eps_" + newVal + ".csv")
    .then((data) => {
      data.forEach((d) => {
        d.name = d.name;
        d.num_lines = +d.num_lines;
      });

      // Sort data by population
      data.sort((a, b) => b.num_lines - a.num_lines);

      data = data.filter((d) => d.name !== "Narration");

      if (document.getElementById("episodeCountSelect").value == "chars") {
        data = data.filter((d) => d.num_lines > 5);
      }

      // Initialize chart and then show it
      barchart2.data = data;
      barchart2.updateVis();
    })
    .catch((error) => console.error(error));
}

// Change sort order on bar charts
d3.select("#sorting").on("click", (d) => {
  barchart.config.reverseOrder = true;
  barchart.updateVis();
  barchart2.config.reverseOrder = true;
  barchart2.updateVis();
});

// Load and initialize word cloud data
d3.csv("data/gravity_falls_transcripts.csv")
  .then((data) => {
    initializeWordcloud(data); // Calls function from wordcloud.js
  })
  .catch((error) => console.error(error));

// Chord diagram
let chorddiagram;
d3.csv("data/gravity_falls_scenes.csv")
  .then((data) => {
    chorddiagram = new ChordDiagram({
      parentElement: "#chord",
      dataPath: "data/gravity_falls_scenes.csv",
    });
  })
  .catch((error) => console.error(error));

d3.select("#chordSeasonDropdown").on("change", () => {
  if (chorddiagram) {
    chorddiagram.updateVis();
  }
});

let data, stackedAreaChart;
// Line chart
d3.csv("data/num_lines_per_episode.csv")
  .then((_data) => {
    _data.forEach((d) => {
      d.character = d.character;
      d.episode = d.episode;
      d.num_lines = +d.num_lines;
    });

    data = _data;

    // Initialize and render chart
    stackedAreaChart = new StackedAreaChart(
      { parentElement: "#area-chart" },
      data
    );
    stackedAreaChart.updateVis();
  })
  .catch((error) => console.error(error));

// Change sort order on bar charts
d3.select("#sorting").on("click", (d) => {
  barchart.config.reverseOrder = true;
  barchart.updateVis();
  barchart2.config.reverseOrder = true;
  barchart2.updateVis();
});

// Shared Words Bar Chart
let sharedWords;
sharedWords = new SharedWords({ parentElement: "#sharedWordsChart", dataPath: "data/gravity_falls_transcripts.csv" });
