// scene_splitter.js (Node.js version)

// Load libraries
const fs = require('fs');
const d3 = require('d3-dsv');

// Read the CSV file
const inputFile = 'data/gravity_falls_transcripts.csv';
const outputFile = 'data/gravity_falls_scenes.csv';

fs.readFile(inputFile, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading input file:', err);
        return;
    }

    const parsed = d3.csvParse(data);
    console.log('Transcripts loaded:', parsed.length, 'lines');

    const scenes = [];
    let currentScene = new Set();
    let currentEpisode = parsed[0].episode;
    let sceneCounter = 1;

    parsed.forEach((row, idx) => {
        const speaker = row.character ? row.character.trim() : '';
        const episode = row.episode ? row.episode.trim() : '';

        if (episode !== currentEpisode) {
            if (currentScene.size > 0) {
                scenes.push({
                    scene_id: `${currentEpisode}_scene${sceneCounter}`,
                    episode: currentEpisode,
                    characters: Array.from(currentScene)
                });
                currentScene.clear();
                sceneCounter = 1;
            }
            currentEpisode = episode;
        }

        if (speaker.toLowerCase().includes('narration') || speaker.toLowerCase() === 'narrator') {
            if (currentScene.size > 0) {
                scenes.push({
                    scene_id: `${currentEpisode}_scene${sceneCounter}`,
                    episode: currentEpisode,
                    characters: Array.from(currentScene)
                });
                currentScene.clear();
                sceneCounter++;
            }
        } else if (speaker !== '') {
            currentScene.add(speaker);
        }

        if (idx === parsed.length - 1 && currentScene.size > 0) {
            scenes.push({
                scene_id: `${currentEpisode}_scene${sceneCounter}`,
                episode: currentEpisode,
                characters: Array.from(currentScene)
            });
        }
    });

    console.log('Scenes detected:', scenes.length);

    // Flatten the scenes
    const flatSceneData = [];
    scenes.forEach(scene => {
        scene.characters.forEach(character => {
            flatSceneData.push({
                scene_id: scene.scene_id,
                episode: scene.episode,
                character: character
            });
        });
    });

    // Write the output CSV
    const csvOutput = d3.csvFormat(flatSceneData);
    fs.writeFile(outputFile, csvOutput, err => {
        if (err) {
            console.error('Error writing output file:', err);
        } else {
            console.log('Scene split CSV written successfully to', outputFile);
        }
    });
});