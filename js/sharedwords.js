// sharedwords.js

class SharedWords {
    constructor({ parentElement, dataPath }) {
      this.parentElement = parentElement;
      this.dataPath = dataPath;
      this.characters = [
        "Dipper", "Mabel", "Grunkle Stan", "Soos", "Wendy",
        "Robbie", "Ford", "Gideon", "Grenda", "Candy", "Bill Cipher"
      ];
  
      this.characterMap = {
        "Dipper Pines": "Dipper",
        "Dipper": "Dipper",
        "Mabel Pines": "Mabel",
        "Mabel": "Mabel",
        "Stan Pines": "Grunkle Stan",
        "Grunkle Stan": "Grunkle Stan",
        "Soos Ramirez": "Soos",
        "Soos": "Soos",
        "Wendy Corduroy": "Wendy",
        "Wendy": "Wendy",
        "Robbie Valentino": "Robbie",
        "Robbie": "Robbie",
        "Gideon Gleeful": "Gideon",
        "Gideon": "Gideon",
        "Grenda Grendinator": "Grenda",
        "Grenda": "Grenda",
        "Candy Chiu": "Candy",
        "Candy": "Candy",
        "Bill Cipher": "Bill Cipher",
        "Bill": "Bill Cipher",
        "Ford Pines": "Ford",
        "Stanford Pines": "Ford",
        "Ford": "Ford"
      };
  
      this.stopwords = new Set([
        'the', 'and', 'if', 'was', 'a', 'an', 'in', 'of', 'to', 'it', 'on', 'for', 'is', 'with', 'at', 'by', 
        'this', 'that', 'i', 'you', 'he', 'she', 'we', 'they', 'them', 'as', 'but', 'be', 'have', 'has', 
        'had', 'not', 'are', 'from', 'or', 'so', 'what', 'about', 'would', 'could', 'should', 'my', 'your', 
        'their', 'our', 'me', 'him', 'her', 'do', 'does', 'did', 'been', 'his', 'its', 'here', 'youre', 'thats',
        'all','like', 'dont', 'then', 'can', 'were', 'out', 'just', 'get'
      ]);
  
      this.width = 800;
      this.height = 480;
  
      this.svg = d3.select(this.parentElement)
        .append("g")
        .attr("transform", "translate(50,50)");
  
      d3.csv(this.dataPath).then(data => {
        data.forEach(d => {
          d.character = this.characterMap[d.character] || d.character;
        });
        this.data = data;
        this.initDropdowns();
        this.updateVis();
      });
    }
  
    initDropdowns() {
      this.characters.forEach(char => {
        d3.select("#charA").append("option").attr("value", char).text(char);
        d3.select("#charB").append("option").attr("value", char).text(char);
      });
  
      d3.select("#charA").property("value", "Dipper");
      d3.select("#charB").property("value", "Mabel");
  
      d3.select("#charA").on("change", () => {
        this.disableSelectedCharacter();
        this.updateVis();
      });
      d3.select("#charB").on("change", () => {
        this.disableSelectedCharacter();
        this.updateVis();
      });
      d3.select("#sharedSeasonDropdown").on("change", () => this.updateVis());
  
      this.disableSelectedCharacter();
    }
  
    disableSelectedCharacter() {
      const selectedA = d3.select("#charA").property("value");
      d3.selectAll("#charB option").property("disabled", false);
      d3.select(`#charB option[value='${selectedA}']`).property("disabled", true);
  
      const selectedB = d3.select("#charB").property("value");
      d3.selectAll("#charA option").property("disabled", false);
      d3.select(`#charA option[value='${selectedB}']`).property("disabled", true);
    }
  
    updateVis() {
        const charA = d3.select("#charA").property("value");
        const charB = d3.select("#charB").property("value");
        const selectedSeason = d3.select("#sharedSeasonDropdown").property("value");
      
        this.svg.selectAll("*").remove();
      
        const scenes = d3.group(this.data, d => d.scene_id);
        const wordCountMap = new Map();
      
        scenes.forEach(scene => {
          const charactersInScene = new Set(scene.map(d => d.character));
          if (!(charactersInScene.has(charA) && charactersInScene.has(charB))) return;
      
          const linesA = [], linesB = [];
      
          scene.forEach(d => {
            if (selectedSeason !== "all" && this.getSeason(d.episode) !== selectedSeason) return;
            if (d.character === charA) linesA.push(d.line);
            if (d.character === charB) linesB.push(d.line);
          });
      
          const tokenizeAndCount = (lines) => {
            const counts = new Map();
            lines.forEach(line => {
              line.toLowerCase()
                  .replace(/[^a-zA-Z\s]/g, '')
                  .split(/\s+/)
                  .forEach(word => {
                    if (word.length > 2 && !this.stopwords.has(word)) {
                      counts.set(word, (counts.get(word) || 0) + 1);
                    }
                  });
            });
            return counts;
          };
      
          const countsA = tokenizeAndCount(linesA);
          const countsB = tokenizeAndCount(linesB);
      
          countsA.forEach((countA, word) => {
            if (countsB.has(word)) {
              const sharedCount = Math.min(countA, countsB.get(word));
              wordCountMap.set(word, (wordCountMap.get(word) || 0) + sharedCount);
            }
          });
        });

        wordCountMap.delete(charA.toLowerCase());
        wordCountMap.delete(charB.toLowerCase());
      
        const topWords = Array.from(wordCountMap.entries())
          .map(([word, count]) => ({ word, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 20);
      
        const x = d3.scaleBand()
          .domain(topWords.map(d => d.word))
          .range([0, this.width - 100])
          .padding(0.2);
      
        const y = d3.scaleLinear()
          .domain([0, d3.max(topWords, d => d.count) || 1])
          .range([this.height - 100, 0]);
      
        this.svg.append("g")
          .attr("transform", `translate(0,${this.height - 100})`)
          .call(d3.axisBottom(x))
          .selectAll("text")
          .attr("transform", "rotate(-45)")
          .style("text-anchor", "end");

        this.svg.append("text")
          .attr("x", (this.width - 100) / 2)
          .attr("y", this.height - 40)
          .style("text-anchor", "middle")
          .text("Shared Word");
      
        this.svg.append("g")
          .call(d3.axisLeft(y));

        this.svg.append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", -50)
          .attr("x", -this.height / 2)
          .attr("dy", "1em")
          .style("text-anchor", "middle")
          .text("Word Count");
      
        const bars = this.svg.selectAll(".bar")
          .data(topWords, d => d.word);
      
        bars.exit()
          .transition().duration(500)
          .attr("y", y(0))
          .attr("height", 0)
          .remove();
      
        bars.transition().duration(500)
          .attr("x", d => x(d.word))
          .attr("y", d => y(d.count))
          .attr("width", x.bandwidth())
          .attr("height", d => this.height - 100 - y(d.count));
      
        bars.enter().append("rect")
          .attr("class", "bar")
          .attr("x", d => x(d.word))
          .attr("y", y(0))
          .attr("width", x.bandwidth())
          .attr("height", 0)
          .attr("fill", "#69b3a2")
          .transition().duration(500)
          .attr("y", d => y(d.count))
          .attr("height", d => this.height - 100 - y(d.count));
      
        const tooltip = d3.select("#tooltip_sharedwords");
      
        this.svg.selectAll(".bar")
          .on("mouseover", function(event, d) {
            tooltip.style("visibility", "visible")
              .style("opacity", 1)
              .html(`<strong>Word:</strong> ${d.word}<br><strong>Count:</strong> ${d.count}`);
            d3.select(this).attr("fill", "#ff8800");
          })
          .on("mousemove", function(event) {
            tooltip.style("top", (event.pageY + 10) + "px")
                   .style("left", (event.pageX + 10) + "px");
          })
          .on("mouseleave", function() {
            tooltip.style("visibility", "hidden").style("opacity", 0);
            d3.select(this).attr("fill", "#69b3a2");
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