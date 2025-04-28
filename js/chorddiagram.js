// chorddiagram.js

const characterMap = {
    "Dipper": "Dipper",
    "Dipper Pines": "Dipper",
    "Mabel": "Mabel",
    "Mabel Pines": "Mabel",
    "Stan": "Grunkle Stan",
    "Stan Pines": "Grunkle Stan",
    "Grunkle Stan": "Grunkle Stan",
    "Soos": "Soos",
    "Soos Ramirez": "Soos",
    "Wendy": "Wendy",
    "Wendy Corduroy": "Wendy",
    "Robbie": "Robbie",
    "Robbie Valentino": "Robbie",
    "Ford": "Ford",
    "Stanford Pines": "Ford",
    "Ford Pines": "Ford",
    "Grenda": "Grenda",
    "Grenda Grendinator": "Grenda",
    "Candy": "Candy",
    "Candy Chiu": "Candy",
    "Gideon": "Gideon",
    "Gideon Gleeful": "Gideon",
    "Bill": "Bill Cipher",
    "Bill Cipher": "Bill Cipher"
};

class ChordDiagram {
    constructor({ parentElement, dataPath }) {
        this.parentElement = parentElement;
        this.dataPath = dataPath;
        this.mainCharacters = [
            "Dipper",
            "Mabel",
            "Grunkle Stan",
            "Wendy",
            "Soos",
            "Robbie",
            "Ford",
            "Grenda",
            "Candy",
            "Bill Cipher",
            "Gideon"
        ];
        this.initVis();
    }

    initVis() {
        this.width = 800;
        this.height = 800;
        this.innerRadius = Math.min(this.width, this.height) * 0.35;
        this.outerRadius = this.innerRadius * 1.1;

        this.svg = d3.select(this.parentElement)
            .append("svg")
            .attr("width", this.width)
            .attr("height", this.height)
            .append("g")
            .attr("transform", `translate(${this.width / 2}, ${this.height / 2})`);

        this.color = d3.scaleOrdinal(d3.schemeCategory10);

        d3.csv(this.dataPath).then(data => {
            this.data = data;
            this.updateVis();
        });
    }

    updateVis() {
        const selectedSeason = d3.select('#chordSeasonDropdown').property('value');

        const scenes = d3.group(this.data, d => d.scene_id);

        const matrix = {};
        this.mainCharacters.forEach(c1 => {
            matrix[c1] = {};
            this.mainCharacters.forEach(c2 => {
                matrix[c1][c2] = 0;
            });
        });

        scenes.forEach(entries => {
            const season = this.getSeason(entries[0].episode);
            if (selectedSeason !== "all" && season !== selectedSeason) return;

            const characters = entries
                .map(d => characterMap[d.character] || d.character)
                .filter(c => this.mainCharacters.includes(c));

            for (let i = 0; i < characters.length; i++) {
                for (let j = 0; j < characters.length; j++) {
                    if (i !== j) {
                        matrix[characters[i]][characters[j]] += 1;
                    }
                }
            }
        });

        const matrixArray = this.mainCharacters.map(c1 =>
            this.mainCharacters.map(c2 => matrix[c1][c2])
        );

        this.svg.selectAll("*").remove();

        const tooltip = d3.select("#tooltip_chord");

        const chord = d3.chord()
            .padAngle(0.05)
            .sortSubgroups(d3.descending)
            (matrixArray);

        const arc = d3.arc()
            .innerRadius(this.innerRadius)
            .outerRadius(this.outerRadius);

        const ribbon = d3.ribbon()
            .radius(this.innerRadius);

        const group = this.svg.append("g")
            .selectAll("g")
            .data(chord.groups)
            .enter().append("g");

        group.append("path")
            .style("fill", d => this.color(d.index))
            .style("stroke", d => d3.rgb(this.color(d.index)).darker())
            .attr("d", arc);

        group.select("path")
            .on("mouseover", (event, d) => {
                const characterIndex = d.index;
            
                let totalConnections = 0;
                let uniqueConnections = new Set();
                let topConnection = null;
                let topConnectionValue = 0;
            
                chord.filter(r => r.source.index !== r.target.index).forEach(r => {
                if (r.source.index === characterIndex || r.target.index === characterIndex) {
                    totalConnections += r.source.index === characterIndex ? r.source.value : r.target.value;
                    uniqueConnections.add(r.source.index === characterIndex ? r.target.index : r.source.index);
            
                    const otherCharacter = r.source.index === characterIndex ? r.target.index : r.source.index;
                    const value = r.source.index === characterIndex ? r.source.value : r.target.value;
            
                    if (value > topConnectionValue) {
                    topConnectionValue = value;
                    topConnection = this.mainCharacters[otherCharacter];
                    }
                }
                });
            
                tooltip.style("visibility", "visible")
                .html(`
                    <strong>${this.mainCharacters[characterIndex]}</strong><br>
                    Connections: ${uniqueConnections.size}<br>
                    Total Shared Scenes: ${totalConnections}<br>
                    Top Connection: ${topConnection} (${topConnectionValue} scenes)
                `);
            
                ribbonsSelection
                .style("opacity", r => 
                    (r.source.index === characterIndex || r.target.index === characterIndex) ? 0.8 : 0.1
                );
            })
            .on("mousemove", (event) => {
              tooltip
                .style("top", (event.pageY + 10) + "px")
                .style("left", (event.pageX + 10) + "px");
            })
            .on("mouseleave", () => {
              tooltip.style("visibility", "hidden");
          
              ribbonsSelection
                .style("opacity", 0.8);
            });

        group.append("text")
            .each(d => { d.angle = (d.startAngle + d.endAngle) / 2; })
            .attr("dy", ".35em")
            .attr("transform", d => `
                rotate(${(d.angle * 180 / Math.PI - 90)})
                translate(${this.outerRadius + 10})
                ${d.angle > Math.PI ? "rotate(180)" : ""}`)
            .style("text-anchor", d => d.angle > Math.PI ? "end" : null)
            .text(d => this.mainCharacters[d.index]);

        const ribbonsGroup = this.svg.append("g").attr("fill", "none");

        const ribbons = ribbonsGroup.selectAll("path")
            .data(chord.filter(d => d.source.index !== d.target.index)) // Filter self loop chords
            .enter()
            .append("path")
            .attr("d", ribbon)
            .style("fill", d => this.color(d.target.index))
            .style("stroke", d => d3.rgb(this.color(d.target.index)).darker())
            .style("opacity", 0) // Start invisible
            .transition()
            .duration(800)
            .style("opacity", 0.8); // Fade in smoothly

        const ribbonsSelection = ribbonsGroup.selectAll("path");

        ribbonsSelection
            .on("mouseover", (event, d) => {
                tooltip.style("visibility", "visible")
                    .html(`<strong>${this.mainCharacters[d.source.index]}</strong> → <strong>${this.mainCharacters[d.target.index]}</strong><br>Scenes together: <strong>${d.source.value}</strong>`);

                ribbonsSelection.style("opacity", 0.1);
                d3.select(event.currentTarget)
                    .style("opacity", 1)
                    .attr("stroke", "black")
                    .attr("stroke-width", 2);
            })
            .on("mousemove", (event) => {
                tooltip
                    .style("top", (event.pageY + 10) + "px")
                    .style("left", (event.pageX + 10) + "px");
            })
            .on("mouseleave", () => {
                tooltip.style("visibility", "hidden");

                ribbonsSelection.style("opacity", 0.8)
                    .attr("stroke", d => d3.rgb(this.color(d.target.index)).darker())
                    .attr("stroke-width", 1);
            });
    }

    getSeason(episodeTitle) {
        const season1 = new Set([
            "Tourist Trapped", "The Legend of the Gobblewonker", "Headhunters", "The Hand That Rocks the Mabel",
            "The Inconveniencing", "Dipper vs. Manliness", "Double Dipper", "Irrational Treasure",
            "The Time Traveler's Pig", "Fight Fighters", "Little Dipper", "Summerween", "Boss Mabel",
            "Bottomless Pit!", "The Deep End", "Carpet Diem", "Boyz Crazy", "Land Before Swine",
            "Dreamscaperers", "Gideon Rises"
        ]);
        return season1.has(episodeTitle) ? "1" : "2";
    }
}
  