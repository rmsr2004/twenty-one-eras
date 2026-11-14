# twenty one eras

A fan website about **twenty one pilots** where every album is an *era*.
Choosing an album changes the look of the whole page (colours, background,
accents), shows its cover spinning like a vinyl record, and lists its tracks
with 30-second previews.

Built for the Web Development course (MDM, University of Coimbra).

## Technologies

- HTML, CSS and vanilla JavaScript (ES modules), with no libraries and no build step
- [iTunes Search API](https://performance-partners.apple.com/search-api) for albums, artwork and previews

## Run locally

ES modules and `fetch` need a local server (opening the file directly won't work):

```bash
python3 -m http.server
```

Then open <http://localhost:8000>.

## Notes

- No lyrics are included, and album artwork is loaded from the API, not stored in this repository.
- Unofficial fan project, not affiliated with the band or their label.
