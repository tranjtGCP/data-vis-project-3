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

    let test = document.getElementById("linesEpisodes").value;

    // Initialize chart and then show it
    barchart = new Barchart({ parentElement: "#chart" }, data);
    barchart.updateVis();
  })
  .catch((error) => console.error(error));

// Load and initialize word cloud data
d3.csv("data/gravity_falls_transcripts.csv")
  .then((data) => {
    initializeWordcloud(data); // Calls function from wordcloud.js
  })
  .catch((error) => console.error(error));

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

      if (document.getElementById("linesEpisodes").value == "chars") {
        data = data.filter((d) => d.num_lines > 50);
      }

      // Initialize chart and then show it
      barchart.data = data;
      barchart.updateVis();
    })
    .catch((error) => console.error(error));
}

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

    if (document.getElementById("episodeCountSelect").value == "chars") {
      data = data.filter((d) => d.num_lines > 2);
    }

    // Initialize chart and then show it
    barchart2 = new Barchart({ parentElement: "#chart2" }, data);
    barchart2.updateVis();
  })
  .catch((error) => console.error(error));

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

      if (document.getElementById("episodeCountSelect").value == "chars") {
        data = data.filter((d) => d.num_lines > 2);
      }

      // Initialize chart and then show it
      barchart2.data = data;
      barchart2.updateVis();
    })
    .catch((error) => console.error(error));
}


/**
 * Event listener: change ordering
 */

var changeSortingOrder = d3.select("#change-sorting").on("click", function () {
  reverse = !reverse;
  updateVisualization();
});

d3.select("#sorting").on("click", (d) => {
  barchart.config.reverseOrder = true;
  barchart.updateVis();
});

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
