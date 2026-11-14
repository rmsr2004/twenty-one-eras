# twenty one eras

A fan website about **twenty one pilots** where every album is an *era*.
Choosing an album changes the look of the whole page: its colours, its cover
spinning like a vinyl record, and its track list with 30-second previews.

Built for the Web Development course (MDM, University of Coimbra).

## Features

- **Era selector** – each studio album has its own colour theme, swapped with CSS variables and smooth transitions.
- **Vinyl cover** – the album art spins while a preview plays and stops when it pauses.
- **Track previews** – one shared audio player, so only one track plays at a time, with a progress bar.
- **Favourites** – save tracks from any album; they are kept in `localStorage` between visits.
- **Loading and error states** – API responses are cached in `sessionStorage` to avoid repeated requests.
- **Accessible and responsive** – mobile-first layout, keyboard support, visible focus, ARIA labels,
  colour contrast checked for every era, and no animations when the system asks for reduced motion.

## How it is built

Plain HTML, CSS and JavaScript (ES modules). No libraries, no frameworks and no build step.

```
index.html       page structure
css/style.css    layout, themes and animations
js/api.js        requests to the iTunes Search API (albums and tracks)
js/player.js     the shared <audio> player
js/main.js       interface: eras, themes, track list and favourites
data/eras.json   our own content: description and colours of each era
```

Album data, artwork and previews come from the public
[iTunes Search API](https://performance-partners.apple.com/search-api) (no key needed).
The band's releases are filtered to keep only studio albums (no singles, EPs or live albums).
To change an era's description or colours, edit `data/eras.json`.

## Run locally

ES modules and `fetch` need a local server (opening the file directly won't work):

```bash
python3 -m http.server
```

Then open <http://localhost:8000>.

## Notes

- No song lyrics are included, and album artwork is loaded from the API, not stored in this repository.
- Unofficial fan project, not affiliated with the band or their label.
