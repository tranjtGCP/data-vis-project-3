function initializeWordcloud(data) {
    const stopwords = new Set([
        'the', 'and', 'if', 'was', 'a', 'an', 'in', 'of', 'to', 'it', 'on', 'for', 'is', 'with', 'at', 'by', 
        'this', 'that', 'i', 'you', 'he', 'she', 'we', 'they', 'them', 'as', 'but', 'be', 'have', 'has', 
        'had', 'not', 'are', 'from', 'or', 'so', 'what', 'about', 'would', 'could', 'should', 'my', 'your', 
        'their', 'our', 'me', 'him', 'her', 'do', 'does', 'did', 'been', 'his', 'its', 'here', 'youre', 'thats',
        'all','like', 'dont', 'then'
    ]);

    const characterMap = {
        "Dipper": "Dipper Pines",
        "Dipper Pines": "Dipper Pines",
        "Mabel": "Mabel Pines",
        "Mabel Pines": "Mabel Pines",
        "Stan": "Grunkle Stan",
        "Stan Pines": "Grunkle Stan",
        "Grunkle Stan": "Grunkle Stan",
        "Soos": "Soos",
        "Soos Ramirez": "Soos",
        "Wendy": "Wendy Corduroy",
        "Wendy Corduroy": "Wendy Corduroy",
        "Robbie": "Robbie Valentino",
        "Robbie Valentino": "Robbie Valentino",
        "Ford Pines": "Ford",
        "Stanford Pines": "Ford",
        "Ford": "Ford",
        "Grenda": "Grenda Grendinator",
        "Grenda Grendinator": "Grenda Grendinator",
        "Candy": "Candy Chiu",
        "Candy Chiu": "Candy Chiu",
        "Gideon": "Gideon Gleeful",
        "Gideon Gleeful": "Gideon Gleeful",
        "Sheriff Blubs": "Sheriff Blubs",
        "Blubs": "Sheriff Blubs",
        "Deputy Durland": "Deputy Durland",
        "Durland": "Deputy Durland",
        "Toby Determined": "Toby Determined",
        "Toby": "Toby Determined",
        "Bill": "Bill Cipher",
        "Bill Cipher": "Bill Cipher",
        "Pacifica": "Pacifica Northwest",
        "Pacifica Northwest": "Pacifica Northwest",
        "Old Man McGucket": "Old Man McGucket",
        "McGucket": "Old Man McGucket",
        "Blendin": "Blendin Blandin",
        "Blendin Blandin": "Blendin Blandin"
    };

    const episodeSeasons = {
        "Tourist Trapped": "1",
        "The Legend of the Gobblewonker": "1",
        "Headhunters": "1",
        "The Hand That Rocks the Mabel": "1",
        "The Inconveniencing": "1",
        "Dipper vs. Manliness": "1",
        "Double Dipper": "1",
        "Irrational Treasure": "1",
        "The Time Traveler's Pig": "1",
        "Fight Fighters": "1",
        "Little Dipper": "1",
        "Summerween": "1",
        "Boss Mabel": "1",
        "Bottomless Pit!": "1",
        "The Deep End": "1",
        "Carpet Diem": "1",
        "Boyz Crazy": "1",
        "Land Before Swine": "1",
        "Dreamscaperers": "1",
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
        "Weirdmageddon 3: Take Back The Falls": "2"
    };

    // Normalize character names
    data.forEach(d => {
        if (characterMap[d.character]) {
            d.character = characterMap[d.character];
        }
    });

    // Remove Narration lines
    data = data.filter(d => d.character !== "Narration");

    const width = 800;
    const height = 600;
    let allWordData = data;

    const allowedCharacters = [
        "Mabel Pines",
        "Dipper Pines",
        "Wendy Corduroy",
        "Grunkle Stan",
        "Soos",
        "Robbie Valentino",
        "Ford",
        "Grenda Grendinator",
        "Candy Chiu",
        "Gideon Gleeful",
        "Sheriff Blubs",
        "Deputy Durland",
        "Toby Determined",
        "Bill Cipher",
        "Pacifica Northwest",
        "Old Man McGucket",
        "Blendin Blandin",
    ];

    // Build Character Dropdown
    const characterSelect = d3.select("#characterDropdown");
    allowedCharacters.forEach(char => {
        characterSelect.append("option")
            .attr("value", char)
            .text(char);
    });
    characterSelect.property("value", "Dipper Pines"); // Default character

    // Event Listeners
    characterSelect.on("change", updateWordCloud);
    d3.select("#seasonDropdown").on("change", updateWordCloud);
    d3.select("#modeDropdown").on("change", updateWordCloud);

    updateWordCloud(); // Initial draw

    function updateWordCloud() {
        const selectedCharacter = d3.select("#characterDropdown").property("value");
        const selectedSeason = d3.select("#seasonDropdown").property("value");
        const selectedMode = d3.select("#modeDropdown").property("value");
    
        const svg = d3.select("#wordcloud");
        const width = 800;
        const height = 600;
    
        // Fully clear old word cloud
        svg.selectAll("*").remove();
    
        // Filter data
        let filtered = allWordData.filter(d => d.character === selectedCharacter);
    
        if (selectedSeason !== "all") {
            filtered = filtered.filter(d => {
                const season = episodeSeasons[d.episode.trim()];
                return season === selectedSeason;
            });
        }
    
        // Tokenize words cleanly
        let words = [];
        filtered.forEach(d => {
            let line = d.line;
            line = line.replace(/^\([a-zA-Z\s]+\)\s*/, ''); // Remove (Narrating:), etc
            line = line.toLowerCase();
            line = line.replace(/[^a-zA-Z\s]/g, ' '); // Replace punctuation with space
            const lineWords = line.split(/\s+/).filter(w => w.length > 2 && !stopwords.has(w));
            words.push(...lineWords);
        });
    
        // Build words or phrases
        let combined;
        if (selectedMode === "words") {
            combined = words;
        } else {
            const bigrams = [];
            const trigrams = [];
            for (let i = 0; i < words.length - 1; i++) {
                bigrams.push(words[i] + " " + words[i+1]);
            }
            for (let i = 0; i < words.length - 2; i++) {
                trigrams.push(words[i] + " " + words[i+1] + " " + words[i+2]);
            }
            combined = bigrams.concat(trigrams);
        }
    
        // Count words/phrases
        const wordFreqFull = d3.rollups(combined, v => v.length, d => d)
            .map(([text, trueCount]) => ({ text, trueCount }))
            .sort((a, b) => d3.descending(a.trueCount, b.trueCount));
    
        const maxFreq = d3.max(wordFreqFull, d => d.trueCount);
    
        // Prepare for cloud layout
        const wordFreq = wordFreqFull.slice(0, 100).map(d => ({
            text: d.text,
            trueCount: d.trueCount,
            size: (d.trueCount / maxFreq) * 80 + 10 // Font size scaling
        }));
    
        // Generate cloud
        const layout = d3.layout.cloud()
            .size([width, height])
            .words(wordFreq)
            .padding(5)
            .rotate(() => ~~(Math.random() * 2) * 90)
            .fontSize(d => d.size)
            .on("end", draw);
    
        layout.start();
    
        function draw(words) {
            const group = svg.append("g")
                .attr("transform", `translate(${width / 2},${height / 2})`)
                .style("opacity", 0);
    
            const tooltip = d3.select("#tooltip_wordcloud");
    
            group.selectAll("text")
                .data(words)
                .enter()
                .append("text")
                .style("font-size", d => d.size + "px")
                .style("fill", () => d3.schemeCategory10[Math.floor(Math.random() * 10)])
                .attr("text-anchor", "middle")
                .attr("transform", d => `translate(${d.x},${d.y}) rotate(${d.rotate})`)
                .text(d => d.text)
                .on("mouseover", function(event, d) {
                    tooltip.style("visibility", "visible")
                           .style("opacity", 1)
                           .html(`<strong>${selectedMode === "words" ? "Word" : "Phrase"}:</strong> ${d.text}<br><strong>Count:</strong> ${d.trueCount}`);
    
                    d3.select(this)
                      .attr("stroke", "black")
                      .attr("stroke-width", 2);
                })
                .on("mousemove", (event) => {
                    tooltip.style("top", (event.pageY + 10) + "px")
                           .style("left", (event.pageX + 10) + "px");
                })
                .on("mouseleave", function(event, d) {
                    tooltip.style("visibility", "hidden")
                           .style("opacity", 0);
    
                    d3.select(this)
                      .attr("stroke", "none")
                      .attr("stroke-width", 0);
                });
    
            // Fade in new cloud
            group.transition()
                .duration(500)
                .style("opacity", 1);
        }
    }
}