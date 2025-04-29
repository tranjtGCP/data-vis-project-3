const characterMapBar = {
  Dipper: "Dipper Pines",
  "Dipper Pines": "Dipper Pines",
  "Dipper and Mabel": "Dipper Pines",
  Mabel: "Mabel Pines",
  "Mabel Pines": "Mabel Pines",
  Stan: "Grunkle Stan",
  "Stan Pines": "Grunkle Stan",
  "Grunkle Stan": "Grunkle Stan",
  Soos: "Soos",
  "Soos Ramirez": "Soos",
  Wendy: "Wendy Corduroy",
  "Wendy Corduroy": "Wendy Corduroy",
  Robbie: "Robbie Valentino",
  "Robbie Valentino": "Robbie Valentino",
  "Ford Pines": "Ford",
  "Stanford Pines": "Ford",
  Ford: "Ford",
  Grenda: "Grenda Grendinator",
  "Grenda Grendinator": "Grenda Grendinator",
  Candy: "Candy Chiu",
  "Candy Chiu": "Candy Chiu",
  Gideon: "Gideon Gleeful",
  "Gideon Gleeful": "Gideon Gleeful",
  "Sheriff Blubs": "Sheriff Blubs",
  Blubs: "Sheriff Blubs",
  "Deputy Durland": "Deputy Durland",
  Durland: "Deputy Durland",
  "Toby Determined": "Toby Determined",
  Toby: "Toby Determined",
  Bill: "Bill Cipher",
  "Bill Cipher": "Bill Cipher",
  Pacifica: "Pacifica Northwest",
  "Pacifica Northwest": "Pacifica Northwest",
  "Old Man McGucket": "Old Man McGucket",
  McGucket: "Old Man McGucket",
  Blendin: "Blendin Blandin",
  "Blendin Blandin": "Blendin Blandin",
};

const episodeSeasons = {
  "Tourist Trapped": "1",
  "The Legend of the Gobblewonker": "1",
  Headhunters: "1",
  "The Hand That Rocks the Mabel": "1",
  "The Inconveniencing": "1",
  "Dipper vs. Manliness": "1",
  "Double Dipper": "1",
  "Irrational Treasure": "1",
  "The Time Traveler's Pig": "1",
  "Fight Fighters": "1",
  "Little Dipper": "1",
  Summerween: "1",
  "Boss Mabel": "1",
  "Bottomless Pit!": "1",
  "The Deep End": "1",
  "Carpet Diem": "1",
  "Boyz Crazy": "1",
  "Land Before Swine": "1",
  Dreamscaperers: "1",
  "Gideon Rises": "1",
  "Scary-oke": "2",
  "Into the Bunker": "2",
  "The Golf War": "2",
  "Sock Opera": "2",
  "Soos and the Real Girl": "2",
  "Little Gift Shop of Horrors": "2",
  "Society of the Blind Eye": "2",
  "Blendin's Game": "2",
  "The Love God": "2",
  "Northwest Mansion Mystery": "2",
  "Not What He Seems": "2",
  "A Tale of Two Stans": "2",
  "Dungeons, Dungeons, and More Dungeons": "2",
  "The Stanchurian Candidate": "2",
  "The Last Mabelcorn": "2",
  "Roadside Attraction": "2",
  "Dipper and Mabel vs. the Future": "2",
  "Weirdmageddon Part 1": "2",
  "Weirdmageddon 2: Escape From Reality": "2",
  "Weirdmageddon 3: Take Back The Falls": "2",
};

class Barchart {
  /**
   * Class constructor with basic chart configuration
   * @param {Object}
   * @param {Array}
   */
  constructor(_config, _data) {
    // Configuration object with defaults
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 1110,
      containerHeight: _config.containerHeight || 400,
      margin: _config.margin || { top: 10, right: 50, bottom: 150, left: 80 },
      reverseOrder: _config.reverseOrder || false,
      tooltipPadding: _config.tooltipPadding || 15,
    };
    this.data = _data;
    this.initVis();
  }

  /**
   * Initialize scales/axes and append static elements, such as axis titles
   */
  initVis() {
    let vis = this;

    vis.data.forEach((d) => {
      if (characterMap[d.name]) {
        d.name = characterMapBar[d.name];
      }
    });

    // Calculate inner chart size. Margin specifies the space around the actual chart.
    vis.width =
      vis.config.containerWidth -
      vis.config.margin.left -
      vis.config.margin.right;
    vis.height =
      vis.config.containerHeight -
      vis.config.margin.top -
      vis.config.margin.bottom;

    // Initialize scales and axes
    // Important: we flip array elements in the y output range to position the rectangles correctly
    vis.yScale = d3.scaleLinear().range([vis.height, 0]);

    vis.xScale = d3.scaleBand().range([0, vis.width]).paddingInner(0.2);

    vis.xAxis = d3.axisBottom(vis.xScale).tickSizeOuter(0);

    vis.yAxis = d3.axisLeft(vis.yScale).ticks(6).tickSizeOuter(0); // Format y-axis ticks as millions

    // Define size of SVG drawing area
    vis.svg = d3
      .select(vis.config.parentElement)
      .attr("width", vis.config.containerWidth)
      .attr("height", vis.config.containerHeight);

    // SVG Group containing the actual chart; D3 margin convention
    vis.chart = vis.svg
      .append("g")
      .attr(
        "transform",
        `translate(${vis.config.margin.left},${vis.config.margin.top})`
      );

    // Append empty x-axis group and move it to the bottom of the chart
    vis.xAxisG = vis.chart
      .append("g")
      .attr("class", "axis x-axis")
      .attr("transform", `translate(0,${vis.height})`);
    
    vis.chart
      .append("text")
      .attr(
        "transform",
        "translate(" + vis.width / 2 + "," + vis.height / 0.70 + ")"
      )
      .style("text-anchor", "middle")
      .style("font-size", "15px")
      .style("fill", "black")
      .attr("dy", "1em")
      .text("Character");

    // Append y-axis group
    vis.yAxisG = vis.chart.append("g").attr("class", "axis y-axis");

    vis.yAxisLabel = vis.svg
      .append("text")
      .style("font-size", "15")
      .attr("class", "axis-title")
      .attr("text-anchor", "start")
      .attr("transform", "rotate(-90)")
      .attr("x", -vis.config.containerHeight / 2 + 80)
      .attr("y", 20)
      .text("Count");

  }

  /**
   * Prepare data and scales before we render it
   */
  updateVis() {
    let vis = this;

    vis.data.forEach((d) => {
      if (characterMap[d.name]) {
        d.name = characterMap[d.name];
      }
    });

    if (vis.config.reverseOrder) {
      vis.data.reverse();
    }

    // Specificy x- and y-accessor functions
    vis.xValue = (d) => d.name;
    vis.yValue = (d) => d.num_lines;

    // Set the scale input domains
    vis.xScale.domain(vis.data.map(vis.xValue));
    vis.yScale.domain([0, d3.max(vis.data, vis.yValue)]);

    vis.renderVis();
  }

  /**
   * Bind data to visual elements
   */
  renderVis() {
    let vis = this;

    // Add rectangles
    let bars = vis.chart
      .selectAll(".bar")
      .data(vis.data, vis.xValue)
      .join("rect");

    bars
      .style("opacity", 0.5)
      .transition()
      .duration(1000)
      .style("opacity", 1)
      .attr("class", "bar")
      .attr("x", (d) => vis.xScale(vis.xValue(d)))
      .attr("width", vis.xScale.bandwidth())
      .attr("height", (d) => vis.height - vis.yScale(vis.yValue(d)))
      .attr("y", (d) => vis.yScale(vis.yValue(d)));

    // Tooltip event listeners
    bars
      .on("mouseover", (event, d) => {
        d3.select("#tooltip")
          .style("opacity", 1)
          // Format number with million and thousand separator
          .html(
            `<p>${
              d.name
            }</p><div class="tooltip-label">Count: </div>${d3.format(",")(
              d.num_lines
            )}`
          );
      })
      .on("mousemove", (event) => {
        d3.select("#tooltip")
          .style("left", event.pageX + vis.config.tooltipPadding + "px")
          .style("top", event.pageY + vis.config.tooltipPadding + "px");
      })
      .on("mouseleave", () => {
        d3.select("#tooltip").style("opacity", 0);
      });

    // Update axes
    vis.xAxisG
      .transition()
      .duration(10)
      .call(vis.xAxis)
      .selectAll("text")
      .style("text-anchor", "start")
      .style("margin", "100rem")
      .attr("dx", "0.5%")
      .attr("dy", ".150em")
      .attr("transform", "rotate(90)");

    vis.yAxisG.call(vis.yAxis);
  }
}
