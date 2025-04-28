d3.csv(
  "data/num_lines_" + document.getElementById("linesEpisodes").value + ".csv"
)
  .then((data) => {
    data.forEach((d) => {
      d.name = d.name;
      d.num_eps = +d.num_eps;
    });

    // Sort data by population
    data.sort((a, b) => b.population - a.population);

    // Initialize chart and then show it
    barchart = new Barchart({ parentElement: "#chart" }, data);
    barchart.updateVis();
  })
  .catch((error) => console.error(error));

let barchart;
function onLinesEpisodesChanged() {
  let newVal = document.getElementById("linesEpisodes").value;

  d3.csv(
    "data/num_lines_" + newVal + ".csv"
  )
    .then((data) => {
      data.forEach((d) => {
        d.name = d.name;
        d.num_eps = +d.num_eps;
      });

      // Sort data by population
      data.sort((a, b) => b.population - a.population);

      // Initialize chart and then show it
      barchart.data = data;
      barchart.updateVis();
    })
    .catch((error) => console.error(error));
}

// let barchart2;
// d3.csv('data/num_lines_vipChars.csv')
//   .then(data => {
//     data.forEach(d => {
//       d.name = d.name;
//       d.num_eps = +d.num_eps;
//     });

//     // Sort data by population
//     data.sort((a,b) => b.population - a.population);
    
//     // Initialize chart and then show it
//     barchart2 = new Barchart({ parentElement: '#chart2'}, data);
//     barchart2.updateVis();
//   })
//   .catch(error => console.error(error));


/**
 * Event listener: change ordering
 */

var changeSortingOrder = d3.select("#change-sorting").on("click", function() {
    reverse = !reverse;
    updateVisualization();
});


d3.select('#sorting').on('click', d => {
  barchart.config.reverseOrder = true;
  barchart.updateVis();
})