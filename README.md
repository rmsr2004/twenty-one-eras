# twenty one eras

A fan website about **twenty one pilots** where every album is an *era*.
Choosing an album changes the look of the whole page: its colours, its cover
spinning like a vinyl record, and its track list with 30-second previews.

Built for the Web Development course (MDM, University of Coimbra).

## Features

- **Era selector** – each studio album has its own colour theme, swapped with CSS variables and smooth transitions.
- **Vinyl cover** – the album art spins while a preview plays and stops when it pauses.
- **Track previews** – one shared audio player, so only one track plays at a time, with a progress bar
  and a volume slider (remembered between visits).
- **Ned tells the story** – click Ned, next to the record, and he explains what the album means in a speech bubble,
  typed letter by letter like in a game.
- **Favourites** – save tracks from any album; they are kept in `localStorage` between visits.
- **Loading and error states** – API responses are cached in `sessionStorage` to avoid repeated requests.
- **Accessible and responsive** – mobile-first layout, keyboard support, visible focus, ARIA labels,
  colour contrast checked for every era, and no animations when the system asks for reduced motion.

## How it is built

Plain HTML, CSS and JavaScript (ES modules). No libraries, no frameworks and no build step.

```
index.html       page structure, including our SVG drawing of Ned
server.js        local development server (Node.js, no dependencies)
Dockerfile       container image that runs server.js (plus docker-compose.yml)
css/style.css    layout, themes and animations
js/main.js       entry point: eras, theme switching and vinyl cover
js/tracks.js     track list, favourites view and sync with the player
js/favourites.js favourite tracks saved in localStorage
js/volume.js     volume slider
js/ned.js        Ned's speech bubble with the album story
js/player.js     the shared <audio> player
js/api.js        requests to the iTunes Search API (albums and tracks)
data/eras.json   our own content: description, colours and story of each era
```

Album data, artwork and previews come from the public
[iTunes Search API](https://performance-partners.apple.com/search-api) (no key needed).
The band's releases are filtered to keep only studio albums (no singles, EPs or live albums).
To change an era's description or colours, edit `data/eras.json`.

## Run locally

ES modules and `fetch` need a local server (opening the file directly won't work).
The project includes a small Node.js server with no dependencies:

```bash
node server.js
```

Then open <http://localhost:8000>. Use another port with `PORT=3000 node server.js`.
The server is only for local testing; GitHub Pages serves the published site.

### With Docker

```bash
docker compose up --build
```

Then open <http://localhost:8000>, and stop it with `Ctrl+C` (or `docker compose down`).
Without Compose: `docker build -t twenty-one-eras .` and `docker run --rm -p 8000:8000 twenty-one-eras`.

## Notes

- Ned's stories are our own short summaries of each album's themes, including common fan interpretations.
- No song lyrics are included, and album artwork is loaded from the API, not stored in this repository.
- Unofficial fan project, not affiliated with the band or their label.
