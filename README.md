# Noor's Speelgoed - Web Games

Een verzameling kindvriendelijke spelletjes voor Noor.

- **Doelgroep:** peuter / kleuter die nog niet leest: alles werkt met plaatjes, tikken en gesproken tekst
- **Apparaat:** iPad, liggend, als app op het beginscherm (PWA)
- **Techniek:** gewone HTML, CSS en JavaScript, geen frameworks en geen build-stap
- **Offline:** werkt offline na het eerste bezoek (service worker)

## Spelletjes

De homepage (`index.html`) toont bovenaan het **Prinsessenkasteel** en daaronder vier groepen
(de lijst staat in `GAMES` en `THEMES` in `index.html`):

| Groep | Spelletjes |
|---|---|
| 🐾 Dieren | flip (kat verzorgen), kleurensorteren, draakjes, boerderij, zaklamp |
| 🎵 Muziek en maken | piano, muziektuin, kleuren (kleurplaten), kleurenmixen, mixen, pizza |
| 🏡 Thuis | poetsen, kamer, aankleden, bellen, kiekeboe, bommetjes |
| 🧩 Puzzelen | memory, letters, cijfers, plaatjefout, sokken, zoekenvind |

Het **Prinsessenkasteel** (`games/prinses.html`) is veruit het grootste spel: een kasteel met vier
verdiepingen, buiten, onder water, een dorp, een dierentuin, de wolken, de ruimte en een piratenbaai.
Zie [games/prinses/README.md](games/prinses/README.md) voor de opbouw.

## Structuur

```
index.html            homepage met alle spelletjes + "Updates zoeken"
manifest.json         PWA-manifest
sw.js                 service worker (PRECACHE_URLS = alles wat offline moet werken)
games/shared.css|js   gedeelde stijl en hulpjes (terugknop, geluid, spraak)
games/<spel>.html     één bestand per los spel
games/prinses/        code van het prinsessenkasteel (js/, css/)
kleurplaten/          SVG-kleurplaten (index.json wordt gebouwd door build-kleurplaten.sh)
scripts/              controles en de smoketest (zie hieronder)
```

## Ontwikkelen

Start een lokale server in de projectmap (bijv. `npx serve .`) en open `index.html`.
Op localhost slaat de service worker zichzelf over, dus je ziet altijd de nieuwste bestanden.

Controles (draaien ook in GitHub Actions vóór elke deploy; een fout houdt de deploy tegen).
Eenmalig installeren:

```bash
npm install && npx playwright install chromium
```

Daarna:

```bash
npm test
```

Dat doet drie dingen:
- `scripts/check-assets.mjs`: staat elk bestand in `sw.js` (offline) en in `prinses.html`, en zijn er geen dubbele globale namen?
- `eslint`: tikfouten en onbekende namen in de JavaScript
- `scripts/smoke.mjs`: opent elk spel, loopt in het kasteel door elke kamer van elke wereld, tikt alles aan,
  opent en sluit elke activiteit en faalt bij elke JavaScript-fout (`--only=dorp` voor één wereld)

## Deploy

Elke push naar `main` wordt via GitHub Actions naar GitHub Pages gezet. `bump-release-id.sh` geeft
elke deploy een nieuwe `RELEASE_ID`, zodat de service worker een verse cache vult.
