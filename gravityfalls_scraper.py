import requests
from bs4 import BeautifulSoup
import csv
import time
from urllib.parse import unquote

# Episode links
episode_links = [
    "https://gravityfalls.fandom.com/wiki/Tourist_Trapped/Transcript",
    "https://gravityfalls.fandom.com/wiki/The_Legend_of_the_Gobblewonker/Transcript",
    "https://gravityfalls.fandom.com/wiki/Headhunters/Transcript",
    "https://gravityfalls.fandom.com/wiki/The_Hand_That_Rocks_the_Mabel/Transcript",
    "https://gravityfalls.fandom.com/wiki/The_Inconveniencing/Transcript",
    "https://gravityfalls.fandom.com/wiki/Dipper_vs._Manliness/Transcript",
    "https://gravityfalls.fandom.com/wiki/Double_Dipper/Transcript",
    "https://gravityfalls.fandom.com/wiki/Irrational_Treasure/Transcript",
    "https://gravityfalls.fandom.com/wiki/The_Time_Traveler%27s_Pig/Transcript",
    "https://gravityfalls.fandom.com/wiki/Fight_Fighters/Transcript",
    "https://gravityfalls.fandom.com/wiki/Little_Dipper/Transcript",
    "https://gravityfalls.fandom.com/wiki/Summerween/Transcript",
    "https://gravityfalls.fandom.com/wiki/Boss_Mabel/Transcript",
    "https://gravityfalls.fandom.com/wiki/Bottomless_Pit!/Transcript",
    "https://gravityfalls.fandom.com/wiki/The_Deep_End/Transcript",
    "https://gravityfalls.fandom.com/wiki/Carpet_Diem/Transcript",
    "https://gravityfalls.fandom.com/wiki/Boyz_Crazy/Transcript",
    "https://gravityfalls.fandom.com/wiki/Land_Before_Swine/Transcript",
    "https://gravityfalls.fandom.com/wiki/Dreamscaperers/Transcript",
    "https://gravityfalls.fandom.com/wiki/Gideon_Rises/Transcript",
    "https://gravityfalls.fandom.com/wiki/Scary-oke/Transcript",
    "https://gravityfalls.fandom.com/wiki/Into_the_Bunker/Transcript",
    "https://gravityfalls.fandom.com/wiki/The_Golf_War/Transcript",
    "https://gravityfalls.fandom.com/wiki/Sock_Opera/Transcript",
    "https://gravityfalls.fandom.com/wiki/Soos_and_the_Real_Girl/Transcript",
    "https://gravityfalls.fandom.com/wiki/Little_Gift_Shop_of_Horrors/Transcript",
    "https://gravityfalls.fandom.com/wiki/Society_of_the_Blind_Eye/Transcript",
    "https://gravityfalls.fandom.com/wiki/Blendin%27s_Game/Transcript",
    "https://gravityfalls.fandom.com/wiki/The_Love_God/Transcript",
    "https://gravityfalls.fandom.com/wiki/Northwest_Mansion_Mystery/Transcript",
    "https://gravityfalls.fandom.com/wiki/Not_What_He_Seems/Transcript",
    "https://gravityfalls.fandom.com/wiki/A_Tale_of_Two_Stans/Transcript",
    "https://gravityfalls.fandom.com/wiki/Dungeons,_Dungeons,_and_More_Dungeons/Transcript",
    "https://gravityfalls.fandom.com/wiki/The_Stanchurian_Candidate/Transcript",
    "https://gravityfalls.fandom.com/wiki/The_Last_Mabelcorn/Transcript",
    "https://gravityfalls.fandom.com/wiki/Roadside_Attraction/Transcript",
    "https://gravityfalls.fandom.com/wiki/Dipper_and_Mabel_vs._the_Future/Transcript",
    "https://gravityfalls.fandom.com/wiki/Weirdmageddon_Part_1/Transcript",
    "https://gravityfalls.fandom.com/wiki/Weirdmageddon_2:_Escape_From_Reality/Transcript",
    "https://gravityfalls.fandom.com/wiki/Weirdmageddon_3:_Take_Back_The_Falls/Transcript"
]

# Collect data
data = []

print(f"Found {len(episode_links)} episodes.")

for episode_link in episode_links:
    print(f"Scraping {episode_link}...")
    ep_response = requests.get(episode_link)
    ep_soup = BeautifulSoup(ep_response.text, 'html.parser')
    
    # Clean episode title
    episode_title = episode_link.split('/')[-2]
    episode_title = episode_title.replace('_', ' ')
    episode_title = unquote(episode_title)
    
    # Find the wikitable
    tables = ep_soup.find_all('table', class_='wikitable')

    for table in tables:
        rows = table.find_all('tr')
        for row in rows:
            th = row.find('th')
            td = row.find('td')
            if td:
                line = td.get_text(strip=True)
                if th:
                    character = th.get_text(strip=True)
                    if not character:
                        character = "Narration"
                else:
                    character = "Narration"

                if line:
                    data.append({
                        'episode': episode_title,
                        'character': character,
                        'line': line
                    })
    
    time.sleep(1)  # be polite to the server

# Write to CSV
with open('gravity_falls_transcripts.csv', 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=['episode', 'character', 'line'])
    writer.writeheader()
    writer.writerows(data)

print("Finished! Full transcripts saved to gravity_falls_transcripts.csv")